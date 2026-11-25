<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\Event;

use HiEvents\DomainObjects\Enums\LocationType;
use HiEvents\Models\Event;

/**
 * Date and place of an event as attendees should see them.
 *
 * Event dates now live on occurrences and the venue on the event location,
 * so the old `start_date` / `location` columns on the event are often empty.
 */
class EventDisplayInfo
{
    public static function startDate(Event $event, ?int $occurrenceId = null): ?string
    {
        $occurrences = $event->event_occurrences();

        $occurrence = $occurrenceId !== null
            ? (clone $occurrences)->where('id', $occurrenceId)->first()
            : null;

        $occurrence ??= $occurrences->orderBy('start_date')->first();

        $date = $occurrence?->start_date ?? $event->start_date;

        return $date ? (string) $date : null;
    }

    public static function endDate(Event $event, ?int $occurrenceId = null): ?string
    {
        $occurrences = $event->event_occurrences();

        $occurrence = $occurrenceId !== null
            ? (clone $occurrences)->where('id', $occurrenceId)->first()
            : null;

        $occurrence ??= $occurrences->orderBy('start_date')->first();

        $date = $occurrence?->end_date ?? $event->end_date;

        return $date ? (string) $date : null;
    }

    public static function location(Event $event): ?string
    {
        // Lazy loading is turned off in this app, so load the venue explicitly.
        $event->loadMissing('event_location.location');
        $eventLocation = $event->event_location;

        if ($eventLocation?->type === LocationType::ONLINE->name) {
            return 'عبر الإنترنت';
        }

        $location = $eventLocation?->location;
        $address = $location?->structured_address;
        if (is_string($address)) {
            $address = json_decode($address, true);
        }

        $name = $location?->name ?: ($address['venue_name'] ?? null);

        return $name ?: ($event->location ?? null);
    }
}
