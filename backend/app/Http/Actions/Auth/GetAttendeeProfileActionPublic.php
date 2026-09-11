<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Auth;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class GetAttendeeProfileActionPublic extends BaseAction
{
    public function __invoke(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = auth('api')->user();

        if (! $user) {
            return $this->errorResponse(
                message: 'يرجى تسجيل الدخول أولاً للمتابعة.',
                statusCode: Response::HTTP_UNAUTHORIZED,
            );
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'role' => 'ATTENDEE',
            ],
        ]);
    }
}
