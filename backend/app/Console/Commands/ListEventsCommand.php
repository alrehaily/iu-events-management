<?php

declare(strict_types=1);

namespace HiEvents\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ListEventsCommand extends Command
{
    protected $signature = 'events:list
        {--all : Include deleted (soft-deleted) events}
        {--search= : Filter events by title}';

    protected $description = 'List all events in the database with their IDs and key details';

    public function handle(): int
    {
        $query = DB::table('events')
            ->leftJoin('organizers', 'events.organizer_id', '=', 'organizers.id')
            ->select([
                'events.id',
                'events.title',
                'events.status',
                'events.start_date',
                'organizers.name as organizer_name',
                'events.created_at',
                'events.deleted_at',
            ])
            ->orderBy('events.id', 'desc');

        if (! $this->option('all')) {
            $query->whereNull('events.deleted_at');
        }

        if ($search = $this->option('search')) {
            $query->where('events.title', 'like', "%{$search}%");
        }

        $events = $query->get();

        if ($events->isEmpty()) {
            $this->warn('No events found.');

            return self::SUCCESS;
        }

        $eventIds = $events->pluck('id')->all();

        $ordersCounts = DB::table('orders')
            ->whereIn('event_id', $eventIds)
            ->groupBy('event_id')
            ->selectRaw('event_id, count(*) as count')
            ->pluck('count', 'event_id')
            ->all();

        $attendeesCounts = DB::table('attendees')
            ->whereIn('event_id', $eventIds)
            ->groupBy('event_id')
            ->selectRaw('event_id, count(*) as count')
            ->pluck('count', 'event_id')
            ->all();

        $headers = ['ID', 'Title', 'Status', 'Organizer', 'Start Date', 'Orders', 'Attendees', 'Created At'];

        $rows = $events->map(function ($event) use ($ordersCounts, $attendeesCounts) {
            $status = $event->deleted_at !== null ? 'DELETED' : $event->status;

            return [
                $event->id,
                $event->title,
                $status,
                $event->organizer_name ?? 'N/A',
                $event->start_date ?? 'N/A',
                $ordersCounts[$event->id] ?? 0,
                $attendeesCounts[$event->id] ?? 0,
                $event->created_at ?? 'N/A',
            ];
        })->toArray();

        $this->newLine();
        $this->info("Found {$events->count()} event(s):");
        $this->table($headers, $rows);
        $this->newLine();

        return self::SUCCESS;
    }
}
