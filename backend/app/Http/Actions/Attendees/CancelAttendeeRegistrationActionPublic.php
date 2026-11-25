<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Attendees;

use HiEvents\DomainObjects\Generated\OrderDomainObjectAbstract;
use HiEvents\DomainObjects\Status\OrderStatus;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Models\Order;
use HiEvents\Models\User;
use HiEvents\Repository\Interfaces\OrderRepositoryInterface;
use HiEvents\Services\Domain\Order\OrderCancelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CancelAttendeeRegistrationActionPublic extends BaseAction
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly OrderCancelService $orderCancelService,
    ) {}

    public function __invoke(string $orderShortId, Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = auth('api')->user();

        if (! $user) {
            return $this->errorResponse(
                message: 'يرجى تسجيل الدخول أولاً لإلغاء الحجز.',
                statusCode: Response::HTTP_UNAUTHORIZED,
            );
        }

        $order = Order::where('short_id', $orderShortId)
            ->with(['attendees', 'event'])
            ->first();

        if (! $order) {
            return $this->errorResponse(
                message: __('Order not found'),
                statusCode: Response::HTTP_NOT_FOUND,
            );
        }

        // Strict server-side ownership verification
        if (strtolower((string)$order->email) !== strtolower((string)$user->email)) {
            return $this->errorResponse(
                message: 'ليس لديك صلاحية لإلغاء هذا الحجز.',
                statusCode: Response::HTTP_FORBIDDEN,
            );
        }

        // Event cancellation deadline enforcement
        if ($order->event && $order->event->end_date && strtotime((string)$order->event->end_date) < time()) {
            return $this->errorResponse(
                message: 'لا يمكن إلغاء الحجز لفعالية انتهت بالفعل.',
                statusCode: Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        if ($order->status === OrderStatus::CANCELLED->name) {
            return response()->json([
                'message' => 'هذا الحجز ملغى بالفعل.',
                'order_status' => $order->status,
            ]);
        }

        // Use the standard cancellation so the seat is returned, stats are updated,
        // the waitlist is offered the free seat and the cancellation email is sent.
        $orderDomainObject = $this->orderRepository->findFirstWhere([
            OrderDomainObjectAbstract::ID => $order->id,
        ]);
        $this->orderCancelService->cancelOrder($orderDomainObject);

        return response()->json([
            'message' => 'تم إلغاء التسجيل والتذكرة بنجاح.',
            'order_status' => OrderStatus::CANCELLED->name,
        ]);
    }
}
