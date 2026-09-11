<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Attendees;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Models\AttendeeCertificate;
use HiEvents\Models\Order;
use HiEvents\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class GetAttendeeRegistrationsActionPublic extends BaseAction
{
    public function __invoke(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = auth('api')->user();

        if (! $user) {
            return $this->errorResponse(
                message: 'يرجى تسجيل الدخول أولاً للوصول إلى حجوزاتك وتذاكرك.',
                statusCode: Response::HTTP_UNAUTHORIZED,
            );
        }

        $email = strtolower((string) $user->email);

        $orders = Order::whereRaw('LOWER(email) = ?', [$email])
            ->with([
                'event',
                'attendees.check_ins',
                'attendees.product',
                'order_items',
            ])
            ->orderByDesc('id')
            ->get();

        $registrations = $orders->map(function (Order $order) {
            $event = $order->event;
            $attendees = $order->attendees->map(function ($attendee) use ($event) {
                $checkIn = $attendee->check_ins->whereNull('deleted_at')->first();
                $isCheckedIn = $checkIn !== null || $attendee->checked_in_at !== null;
                $isCertEligible = (bool) ($event?->is_certificate_eligible ?? false) && $isCheckedIn;

                $persistedCert = AttendeeCertificate::where('attendee_id', $attendee->id)->first();

                return [
                    'id' => $attendee->id,
                    'short_id' => $attendee->short_id,
                    'public_id' => $attendee->public_id,
                    'first_name' => $attendee->first_name,
                    'last_name' => $attendee->last_name,
                    'email' => $attendee->email,
                    'status' => $attendee->status,
                    'product_title' => $attendee->product?->title ?? 'تذكرة دخول',
                    'checked_in' => $isCheckedIn,
                    'checked_in_at' => $checkIn?->created_at ?? $attendee->checked_in_at,
                    'is_certificate_eligible' => $isCertEligible,
                    'certificate_code' => $persistedCert?->certificate_code,
                    'certificate_url' => $isCertEligible ? "/public/attendees/{$attendee->public_id}/certificate" : null,
                ];
            });

            return [
                'order_id' => $order->id,
                'short_id' => $order->short_id,
                'status' => $order->status,
                'total_gross' => (float) $order->total_gross,
                'currency' => $order->currency,
                'created_at' => $order->created_at?->toIso8601String(),
                'event' => $event ? [
                    'id' => $event->id,
                    'title' => $event->title,
                    'start_date' => $event->start_date,
                    'end_date' => $event->end_date,
                    'location' => $event->location,
                    'short_id' => $event->short_id,
                    'status' => $event->status,
                    'is_certificate_eligible' => (bool) ($event->is_certificate_eligible ?? false),
                ] : null,
                'attendees' => $attendees,
            ];
        });

        return response()->json([
            'registrations' => $registrations,
        ]);
    }
}
