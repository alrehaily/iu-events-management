<?php

declare(strict_types=1);

namespace Tests\Unit\Services\Application\Handlers\User;

use HiEvents\Repository\Interfaces\UserRepositoryInterface;
use HiEvents\Services\Application\Handlers\User\UpdateAttendeeNameHandler;
use Mockery;
use Tests\TestCase;

class UpdateAttendeeNameHandlerTest extends TestCase
{
    public function testUpdatesOnlyTheAuthenticatedUsersName(): void
    {
        $users = Mockery::mock(UserRepositoryInterface::class);
        $users->shouldReceive('updateWhere')->once()->with(
            ['first_name' => 'Demo', 'last_name' => 'Participant'],
            ['id' => 17],
        )->andReturn(1);

        (new UpdateAttendeeNameHandler($users))->handle(17, 'Demo', 'Participant');

        $this->addToAssertionCount(1);
    }
}
