<?php

require __DIR__ . '/../backend/vendor/autoload.php';

$app = require __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    // 1. Get all events
    $events = DB::table('events')->pluck('id');

    foreach ($events as $eventId) {
        $defaultList = DB::table('check_in_lists')
            ->where('event_id', $eventId)
            ->where('is_system_default', true)
            ->first();

        $customList = DB::table('check_in_lists')
            ->where('event_id', $eventId)
            ->where('is_system_default', false)
            ->where('name', 'تسجيل الحضور')
            ->first();

        if ($defaultList) {
            // Rename default check-in to Arabic
            DB::table('check_in_lists')
                ->where('id', $defaultList->id)
                ->update(['name' => 'تسجيل الحضور']);

            if ($customList) {
                // For any attendee already checked into default list, remove duplicate check-in on custom list
                $alreadyInDefault = DB::table('attendee_check_ins')
                    ->where('check_in_list_id', $defaultList->id)
                    ->pluck('attendee_id')
                    ->toArray();

                if (!empty($alreadyInDefault)) {
                    DB::table('attendee_check_ins')
                        ->where('check_in_list_id', $customList->id)
                        ->whereIn('attendee_id', $alreadyInDefault)
                        ->delete();
                }

                // Point remaining check-ins from custom list to default list
                DB::table('attendee_check_ins')
                    ->where('check_in_list_id', $customList->id)
                    ->update(['check_in_list_id' => $defaultList->id]);

                // Delete product associations for custom list
                DB::table('product_check_in_lists')
                    ->where('check_in_list_id', $customList->id)
                    ->delete();

                // Delete the duplicate custom list
                DB::table('check_in_lists')
                    ->where('id', $customList->id)
                    ->delete();
            }
        }
    }
});

echo "Unified check-in lists successfully!\n";
