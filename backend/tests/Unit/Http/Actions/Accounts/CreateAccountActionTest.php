<?php

declare(strict_types=1);

namespace Tests\Unit\Http\Actions\Accounts;

use HiEvents\Http\Actions\Accounts\CreateAccountAction;
use HiEvents\Http\Request\Account\CreateAccountRequest;
use HiEvents\Services\Application\Handlers\Account\CreateAccountHandler;
use HiEvents\Services\Application\Handlers\Auth\LoginHandler;
use HiEvents\Services\Application\Locale\LocaleService;
use Illuminate\Database\Connection;
use Illuminate\Database\DatabaseManager;
use Mockery;
use Tests\TestCase;

class CreateAccountActionTest extends TestCase
{
    public function test_public_organizer_registration_is_disabled_on_the_demo_database(): void
    {
        $loginHandler = app(LoginHandler::class);
        $database = Mockery::mock(DatabaseManager::class);
        $database->shouldReceive('connection')->once()->andReturn(new Connection(null, 'iu_gp2_demo'));
        $this->instance(DatabaseManager::class, $database);

        $accountHandler = Mockery::mock(CreateAccountHandler::class);
        $accountHandler->shouldNotReceive('handle');

        $action = new CreateAccountAction($accountHandler, $loginHandler, Mockery::mock(LocaleService::class));
        $response = $action(new CreateAccountRequest);

        $this->assertSame(403, $response->getStatusCode());
    }
}
