<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Auth;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\Request\User\UpdateAttendeeNameRequest;
use HiEvents\Services\Application\Handlers\User\UpdateAttendeeNameHandler;
use Illuminate\Http\JsonResponse;

class UpdateAttendeeNameActionPublic extends BaseAction
{
    public function __construct(private readonly UpdateAttendeeNameHandler $updateName) {}

    public function __invoke(UpdateAttendeeNameRequest $request): JsonResponse
    {
        $this->updateName->handle(
            $this->getAuthenticatedUser()->getId(),
            $request->validated('first_name'),
            $request->validated('last_name'),
        );

        return $this->jsonResponse(['message' => __('Profile updated successfully.')]);
    }
}
