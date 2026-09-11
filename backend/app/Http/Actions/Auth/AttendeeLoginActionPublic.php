<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Auth;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class AttendeeLoginActionPublic extends BaseAction
{
    public function __invoke(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(
                message: $validator->errors()->first(),
                statusCode: Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        $email = strtolower($request->input('email'));
        $password = $request->input('password');

        $token = auth('api')->attempt([
            'email' => $email,
            'password' => $password,
        ]);

        if (! $token) {
            return $this->errorResponse(
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
                statusCode: Response::HTTP_UNAUTHORIZED,
            );
        }

        /** @var User $user */
        $user = auth('api')->user();

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'role' => 'ATTENDEE',
            ],
            'message' => 'تم تسجيل الدخول بنجاح.',
        ]);
    }
}
