<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Attendees;

use HiEvents\DomainObjects\Status\AttendeeStatus;
use HiEvents\DomainObjects\Status\OrderStatus;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Models\Attendee;
use HiEvents\Models\AttendeeCertificate;
use HiEvents\Models\AttendeeCheckIn;
use HiEvents\Models\User;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class GetAttendeeCertificateActionPublic extends BaseAction
{
    public function __invoke(string $attendeeIdentifier): JsonResponse
    {
        /** @var User|null $user */
        $user = auth('api')->user();

        if (! $user) {
            return $this->errorResponse(
                message: __('Sign in to check eligibility and request an attendance certificate.'),
                statusCode: Response::HTTP_UNAUTHORIZED
            );
        }

        $attendee = Attendee::where('public_id', $attendeeIdentifier)
            ->orWhere('short_id', $attendeeIdentifier)
            ->with(['order.event', 'product'])
            ->first();

        if (! $attendee) {
            return $this->errorResponse(
                message: __('Attendee not found'),
                statusCode: Response::HTTP_NOT_FOUND
            );
        }

        // Enforce server-side ownership: attendee email must match authenticated user
        $attendeeEmail = strtolower((string) $attendee->email);
        $orderEmail = strtolower((string) ($attendee->order?->email ?? ''));
        $userEmail = strtolower((string) $user->email);

        if ($attendeeEmail !== $userEmail && $orderEmail !== $userEmail) {
            return $this->errorResponse(
                message: __('You are not allowed to view or request this certificate.'),
                statusCode: Response::HTTP_FORBIDDEN
            );
        }

        $event = $attendee->order?->event;
        if (! $event) {
            return $this->errorResponse(
                message: __('Event not found'),
                statusCode: Response::HTTP_NOT_FOUND
            );
        }

        // Check if event is eligible for certificates
        if (! $event->is_certificate_eligible) {
            return response()->json([
                'eligible' => false,
                'message' => __('This event does not offer attendance certificates.'),
                'checked_in' => false,
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Check registration status
        if ($attendee->status === AttendeeStatus::CANCELLED->name || $attendee->order?->status === OrderStatus::CANCELLED->name) {
            return response()->json([
                'eligible' => false,
                'message' => __('This booking is cancelled and cannot receive an attendance certificate.'),
                'checked_in' => false,
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Check authoritative check-in in database
        $checkIn = AttendeeCheckIn::where('attendee_id', $attendee->id)
            ->whereNull('deleted_at')
            ->latest()
            ->first();

        $isCheckedIn = $checkIn !== null || $attendee->checked_in_at !== null;

        if (! $isCheckedIn) {
            return response()->json([
                'eligible' => false,
                'message' => __('Attendance must be recorded before a certificate can be issued.'),
                'checked_in' => false,
                'attendee_name' => trim($attendee->first_name . ' ' . $attendee->last_name),
                'event_title' => $event->title,
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Persistent certificate: retrieve or create in database
        $certificate = AttendeeCertificate::where('attendee_id', $attendee->id)->first();
        if (! $certificate) {
            $hash = strtoupper(substr(hash('sha256', $attendee->id . '_' . $attendee->public_id . '_' . microtime(true)), 0, 10));
            $certCode = 'IU-CERT-' . $hash;

            $certificate = new AttendeeCertificate();
            $certificate->certificate_code = $certCode;
            $certificate->attendee_id = $attendee->id;
            $certificate->event_id = $event->id;
            $certificate->issued_at = now();
            $certificate->save();
        }

        return response()->json([
            'eligible' => true,
            'certificate_code' => $certificate->certificate_code,
            'attendee_name' => trim($attendee->first_name . ' ' . $attendee->last_name),
            'attendee_email' => $attendee->email,
            'event_title' => $event->title,
            'event_date' => $event->start_date ? date('Y-m-d', strtotime((string)$event->start_date)) : date('Y-m-d'),
            'location' => $event->location ?? __('Islamic University of Madinah'),
            'issued_at' => $certificate->issued_at ? date('c', strtotime((string)$certificate->issued_at)) : now()->toIso8601String(),
            'issuer' => __('Islamic University of Madinah'),
            'checked_in' => true,
            'verification_url' => url("/public/certificates/verify/{$certificate->certificate_code}"),
        ]);
    }
}
