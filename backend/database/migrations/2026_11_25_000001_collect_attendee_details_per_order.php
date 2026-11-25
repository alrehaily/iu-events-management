<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Each order is one ticket, so the person who books is the attendee:
     * collect details once per order on every event and organizer default.
     */
    public function up(): void
    {
        DB::table('event_settings')
            ->where('attendee_details_collection_method', '!=', 'PER_ORDER')
            ->update(['attendee_details_collection_method' => 'PER_ORDER']);

        DB::table('organizer_settings')
            ->where(function ($query) {
                $query->whereNull('default_attendee_details_collection_method')
                    ->orWhere('default_attendee_details_collection_method', '!=', 'PER_ORDER');
            })
            ->update(['default_attendee_details_collection_method' => 'PER_ORDER']);
    }

    /**
     * Earlier values are not kept, so there is nothing to restore.
     */
    public function down(): void
    {
    }
};
