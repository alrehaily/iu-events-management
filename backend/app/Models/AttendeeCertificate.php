<?php

declare(strict_types=1);

namespace HiEvents\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendeeCertificate extends BaseModel
{
    protected function getFillableFields(): array
    {
        return [
            'certificate_code',
            'attendee_id',
            'event_id',
            'issued_at',
        ];
    }

    public function attendee(): BelongsTo
    {
        return $this->belongsTo(Attendee::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
