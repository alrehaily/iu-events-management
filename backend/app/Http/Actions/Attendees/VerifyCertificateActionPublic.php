<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Attendees;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Models\AttendeeCertificate;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class VerifyCertificateActionPublic extends BaseAction
{
    public function __invoke(string $certificateCode): JsonResponse
    {
        $certificate = AttendeeCertificate::where('certificate_code', trim($certificateCode))
            ->with(['attendee', 'event'])
            ->first();

        if (! $certificate) {
            return response()->json([
                'valid' => false,
                'message' => 'الشهادة غير معتمدة أو غير موجودة في سجلات الجامعة الإسلامية.',
            ], Response::HTTP_NOT_FOUND);
        }

        $attendee = $certificate->attendee;
        $event = $certificate->event;

        return response()->json([
            'valid' => true,
            'certificate_code' => $certificate->certificate_code,
            'attendee_name' => $attendee ? trim($attendee->first_name . ' ' . $attendee->last_name) : 'المشارك',
            'event_title' => $event?->title ?? 'فعالية في الجامعة الإسلامية',
            'event_date' => $event?->start_date ? date('Y-m-d', strtotime((string)$event->start_date)) : '',
            'issued_at' => $certificate->issued_at ? date('c', strtotime((string)$certificate->issued_at)) : '',
            'issuer' => 'الجامعة الإسلامية بالمدينة المنورة',
            'verified' => true,
        ]);
    }
}
