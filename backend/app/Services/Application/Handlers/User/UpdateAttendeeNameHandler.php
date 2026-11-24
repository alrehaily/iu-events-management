<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\User;

use HiEvents\Repository\Interfaces\UserRepositoryInterface;

readonly class UpdateAttendeeNameHandler
{
    public function __construct(private UserRepositoryInterface $users) {}

    public function handle(int $userId, string $firstName, string $lastName): void
    {
        $this->users->updateWhere(
            ['first_name' => $firstName, 'last_name' => $lastName],
            ['id' => $userId],
        );
    }
}
