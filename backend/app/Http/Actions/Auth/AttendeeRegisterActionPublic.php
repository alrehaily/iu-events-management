<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Auth;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class AttendeeRegisterActionPublic extends BaseAction
{
    public function __invoke(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(
                message: $validator->errors()->first(),
                statusCode: Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        $email = strtolower($request->input('email'));

        $existingUser = User::whereRaw('LOWER(email) = ?', [$email])->first();
        if ($existingUser) {
            return $this->errorResponse(
                message: 'البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول.',
                statusCode: Response::HTTP_CONFLICT,
            );
        }

        $user = new User();
        $user->first_name = $request->input('first_name');
        $user->last_name = $request->input('last_name');
        $user->email = $email;
        $user->password = Hash::make($request->input('password'));
        $user->timezone = 'Asia/Riyadh';
        $user->save();

        $token = auth('api')->login($user);

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'role' => 'ATTENDEE',
            ],
            'message' => 'تم إنشاء حساب الطالب/المشارك بنجاح.',
        ], Response::HTTP_CREATED);
    }
}
