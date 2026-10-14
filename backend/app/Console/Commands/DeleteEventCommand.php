<?php

declare(strict_types=1);

namespace HiEvents\Console\Commands;

use HiEvents\Models\Event;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DeleteEventCommand extends Command
{
    protected $signature = 'events:delete
        {id : The ID of the event to delete}
        {--force : Permanently delete the event from the database (force delete)}
        {--yes : Skip confirmation prompt}';

    protected $description = 'Delete an event by its ID';

    public function handle(): int
    {
        $id = (int) $this->argument('id');
        $force = (bool) $this->option('force');

        $event = $force
            ? Event::withTrashed()->find($id)
            : Event::find($id);

        if (! $event) {
            $this->error("Event with ID {$id} not found.");

            return self::FAILURE;
        }

        $ordersCount = DB::table('orders')->where('event_id', $id)->count();
        if ($ordersCount > 0 && ! $force) {
            $this->warn("⚠️  Event has {$ordersCount} associated order(s).");
            if (! $this->option('yes') && ! $this->confirm('Do you still want to delete this event?')) {
                $this->info('Operation cancelled.');

                return self::SUCCESS;
            }
        } elseif (! $this->option('yes')) {
            $action = $force ? 'PERMANENTLY delete' : 'delete';
            if (! $this->confirm("Are you sure you want to {$action} event [#{$event->id}] '{$event->title}'?")) {
                $this->info('Operation cancelled.');

                return self::SUCCESS;
            }
        }

        if ($force) {
            $event->forceDelete();
            $this->info("✓ Event [#{$id}] '{$event->title}' has been permanently deleted from the database.");
        } else {
            $event->delete();
            $this->info("✓ Event [#{$id}] '{$event->title}' has been deleted (soft delete).");
        }

        return self::SUCCESS;
    }
}
