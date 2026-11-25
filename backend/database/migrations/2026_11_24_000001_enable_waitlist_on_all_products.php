<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The waitlist is now always on, so turn it on for tickets created before that rule.
     */
    public function up(): void
    {
        DB::table('products')
            ->where(function ($query) {
                $query->whereNull('waitlist_enabled')->orWhere('waitlist_enabled', false);
            })
            ->update(['waitlist_enabled' => true]);
    }

    /**
     * Each ticket's earlier setting is not kept, so there is nothing to restore.
     */
    public function down(): void
    {
    }
};
