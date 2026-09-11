<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendee_certificates', function (Blueprint $table) {
            $table->id();
            $table->string('certificate_code', 64)->unique();
            $table->foreignId('attendee_id')->constrained('attendees')->onDelete('cascade');
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->timestamp('issued_at');
            $table->timestamps();

            $table->unique('attendee_id');
            $table->index('certificate_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendee_certificates');
    }
};
