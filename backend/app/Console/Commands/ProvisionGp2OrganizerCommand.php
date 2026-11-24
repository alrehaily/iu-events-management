<?php

declare(strict_types=1);

namespace HiEvents\Console\Commands;

use HiEvents\Repository\Interfaces\UserRepositoryInterface;
use HiEvents\Services\Application\Handlers\Account\CreateAccountHandler;
use HiEvents\Services\Application\Handlers\Account\DTO\CreateAccountDTO;
use HiEvents\Services\Application\Handlers\Organizer\CreateOrganizerHandler;
use HiEvents\Services\Application\Handlers\Organizer\DTO\CreateOrganizerDTO;
use Illuminate\Console\Command;
use Illuminate\Database\DatabaseManager;
use Illuminate\Support\Facades\Validator;

class ProvisionGp2OrganizerCommand extends Command
{
    protected $signature = 'gp2:provision-organizer
        {email}
        {--first-name=}
        {--last-name=}
        {--organizer= : Also create an organizer with this display name}
        {--locale=ar}
        {--password-stdin : Read a single password line from standard input}';

    protected $description = 'Provision a new organizer account on the isolated GP2 demo database';

    public function handle(
        DatabaseManager $database,
        UserRepositoryInterface $users,
        CreateAccountHandler $createAccount,
        CreateOrganizerHandler $createOrganizer,
    ): int {
        $connection = $database->connection();
        if (! app()->environment('local', 'testing') || $connection->getDriverName() !== 'pgsql') {
            $this->error('Provisioning requires a local or testing environment with PostgreSQL.');

            return self::FAILURE;
        }

        $email = strtolower(trim($this->argument('email')));
        $password = $this->option('password-stdin')
            ? rtrim((string) fgets(STDIN), "\r\n")
            : $this->secret('Password');
        $input = Validator::make([
            'email' => $email,
            'first_name' => trim((string) $this->option('first-name')),
            'last_name' => trim((string) $this->option('last-name')),
            'organizer' => $this->option('organizer'),
            'locale' => $this->option('locale'),
            'password' => $password,
        ], [
            'email' => 'required|email|max:255',
            'first_name' => 'required|string|max:40',
            'last_name' => 'required|string|max:40',
            'organizer' => 'nullable|string|max:150',
            'locale' => 'required|in:ar,en',
            'password' => 'required|string|min:12',
        ])->validate();

        if ($users->findFirstWhere(['email' => $email])) {
            $this->error('This email already belongs to an existing account. Choose a separate organizer email.');

            return self::FAILURE;
        }

        config(['app.disable_registration' => false]);
        $connection->transaction(function () use ($input, $createAccount, $createOrganizer): void {
            $account = $createAccount->handle(new CreateAccountDTO(
                email: $input['email'],
                password: $input['password'],
                first_name: $input['first_name'],
                last_name: $input['last_name'],
                locale: $input['locale'],
                timezone: 'Asia/Riyadh',
                currency_code: 'SAR',
            ));
            if ($input['organizer']) {
                $createOrganizer->handle(new CreateOrganizerDTO(
                    name: $input['organizer'],
                    email: $input['email'],
                    account_id: $account->getId(),
                    timezone: 'Asia/Riyadh',
                    currency: 'SAR',
                ));
            }
        });

        $this->info('Organizer account provisioned.');

        return self::SUCCESS;
    }
}
