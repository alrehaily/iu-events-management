<?php

declare(strict_types=1);

namespace HiEvents\Console\Commands;

use Carbon\CarbonImmutable;
use HiEvents\Console\Commands\Demo\DemoOwner;
use HiEvents\Console\Commands\Demo\DemoSeedContext;
use HiEvents\DataTransferObjects\AddressDTO;
use HiEvents\DomainObjects\Enums\EventCategory;
use HiEvents\DomainObjects\Enums\LocationType;
use HiEvents\DomainObjects\Enums\ProductPriceType;
use HiEvents\DomainObjects\Enums\ProductType;
use HiEvents\DomainObjects\Status\EventStatus;
use HiEvents\Services\Application\Handlers\CheckInList\DTO\UpsertCheckInListDTO;
use HiEvents\Services\Application\Handlers\Event\DTO\CreateEventDTO;
use HiEvents\Services\Application\Handlers\Location\DTO\UpsertLocationDTO;
use HiEvents\Services\Application\Handlers\Product\DTO\UpsertProductDTO;
use HiEvents\Services\Domain\EventLocation\EventLocationData;
use HiEvents\Services\Domain\Product\DTO\ProductPriceDTO;
use Illuminate\Console\Command;
use Illuminate\Database\Connection;
use Illuminate\Database\DatabaseManager;

class SeedGp2CommitteeCommand extends Command
{
    private const string TIMEZONE = 'Asia/Riyadh';

    protected $signature = 'gp2:seed-committee
        {--organizer-id= : Organizer to own the curated events}
        {--apply : Seed the demo and hide recognized test fixtures. Omit for a dry run}
        {--backup= : Verified PostgreSQL custom-format backup of iu_gp2_demo}
        {--manifest= : New JSON file for saving the original visibility of affected fixtures}
        {--restore-visibility= : Restore visibility using a recorded manifest}
        {--update-covers : Re-upload and update cover images for existing curated events}
        {--update-descriptions : Update descriptions and connection details of existing curated events}';

    protected $description = 'Prepare the eight fictional GP2 committee events on the isolated demo database';

    public function handle(DatabaseManager $database, DemoSeedContext $context): int
    {
        $connection = $database->connection();
        if (! app()->environment('local', 'testing') || $connection->getDriverName() !== 'pgsql') {
            $this->error('Demo preparation requires a local or testing environment with PostgreSQL.');

            return self::FAILURE;
        }

        if ($path = $this->option('restore-visibility')) {
            return $this->restoreVisibility($connection, $path);
        }

        $organizer = $connection->table('organizers')
            ->join('accounts', 'organizers.account_id', '=', 'accounts.id')
            ->where('organizers.id', (int) $this->option('organizer-id'))
            ->where('organizers.status', 'LIVE')
            ->whereNull('organizers.deleted_at')
            ->whereNotNull('accounts.account_verified_at')
            ->first(['organizers.id', 'organizers.account_id']);
        $userId = $organizer ? $connection->table('account_users')
            ->where('account_id', $organizer->account_id)
            ->where('is_account_owner', true)
            ->where('status', 'ACTIVE')
            ->value('user_id') : null;
        if (! $organizer || ! $userId) {
            $this->error('Choose a live organizer with a verified account and an active owner.');

            return self::FAILURE;
        }
        $user = \HiEvents\Models\User::find($userId);
        if ($user) {
            auth()->login($user);
        }

        $owner = new DemoOwner((int) $organizer->account_id, (int) $organizer->id, (int) $userId);
        $events = json_decode(file_get_contents(resource_path('demo/gp2-committee-events.json')), true, flags: JSON_THROW_ON_ERROR);
        $legacy = $this->visibleFixtures($connection);
        $this->line('Organizer '.$owner->organizer_id.' · '.count($events).' curated events · '.$legacy->count().' visible synthetic fixtures.');
        if (! $this->option('apply')) {
            $this->line('Dry run. Use --apply with a verified --backup and a fresh --manifest path to write changes.');

            return self::SUCCESS;
        }

        $backup = $this->option('backup');
        $manifest = $this->option('manifest');
        if ($backup || $manifest) {
            if (! $backup || ! is_file($backup) || file_get_contents($backup, length: 5) !== 'PGDMP'
                || ! $manifest || file_exists($manifest) || ! is_dir(dirname($manifest))) {
                $this->error('Provide the verified custom-format backup and a new manifest path in an existing private directory.');

                return self::FAILURE;
            }
        }
        foreach ($events as $event) {
            if (! is_file(resource_path('demo/covers/gp2-'.$event['key'].'.jpg'))) {
                $this->error('Cover missing for '.$event['key'].'.');

                return self::FAILURE;
            }
        }

        $created = $connection->transaction(function () use ($connection, $context, $owner, $events, $manifest, $backup): array {
            $connection->statement('SELECT pg_advisory_xact_lock(hashtext(?))', ['gp2:seed-committee']);
            if ($manifest && $backup) {
                $fixtures = $this->visibleFixtures($connection);
                $snapshot = json_encode([
                    'database' => $connection->getDatabaseName(),
                    'port' => (int) ($connection->getConfig('port') ?? 5432),
                    'backup_sha256' => hash_file('sha256', $backup),
                    'fixtures' => $fixtures->all(),
                ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
                $handle = fopen($manifest, 'x');
                if ($handle === false) {
                    throw new \LogicException('The visibility manifest must be a new file.');
                }
                try {
                    if (fwrite($handle, $snapshot.PHP_EOL) !== strlen($snapshot.PHP_EOL)) {
                        throw new \LogicException('The visibility manifest could not be written completely.');
                    }
                } finally {
                    fclose($handle);
                }

                $connection->table('events')->whereIn('id', $fixtures->pluck('id'))
                    ->where('status', EventStatus::LIVE->name)->update(['status' => EventStatus::DRAFT->name]);
            }

            $ids = [];
            foreach ($events as $event) {
                $existing = null;
                if (! empty($event['id'])) {
                    $existing = $connection->table('events')->where('organizer_id', $owner->organizer_id)
                        ->where('id', (int) $event['id'])
                        ->whereNull('deleted_at')->value('id');
                }
                if (! $existing) {
                    $existing = $connection->table('events')->where('organizer_id', $owner->organizer_id)
                        ->where('title', $event['title'])
                        ->whereNull('deleted_at')->value('id');
                }
                if ($existing) {
                    $connection->table('events')->where('id', $existing)->update([
                        'title' => $event['title'],
                        'status' => EventStatus::LIVE->name,
                    ]);
                    if ($this->option('update-covers')) {
                        $context->uploadCover($existing, $owner->account_id, 'gp2-'.$event['key'].'.jpg');
                    }
                    if ($this->option('update-descriptions')) {
                        $connection->table('events')->where('id', $existing)->update([
                            'description' => $event['description'],
                        ]);
                        if (! $event['venue']) {
                            $onlineDetails = '<p>يُعقد هذا اللقاء عبر القاعة الافتراضية لمنصة الفعاليات الجامعية. <a href="https://meet.iu.edu.sa/join" target="_blank" rel="noopener">رابط الانضمام للجلسة الافتراضية</a></p><p>يرجى الانضمام قبل موعد الجلسة بـ 10 دقائق للتأكد من إعدادات الصوت والاتصال.</p>';
                            $connection->table('event_locations')->where('event_id', $existing)->update([
                                'online_event_connection_details' => $onlineDetails,
                            ]);
                        }
                    }
                    $ids[$event['key']] = $existing;
                } else {
                    $ids[$event['key']] = $this->createEvent($connection, $context, $owner, $event);
                }
            }

            return $ids;
        });
        foreach ($created as $key => $id) {
            $this->line($key.' '.$id);
        }

        return self::SUCCESS;
    }

    private function visibleFixtures(Connection $connection): \Illuminate\Support\Collection
    {
        return $connection->table('events')->whereNull('deleted_at')->where('status', EventStatus::LIVE->name)
            ->whereRaw("(title ~* '^(E2E|GP2)[ -]' OR title ~ '^ملتقى GP2 [0-9]' OR "
                ."(id, title) IN ((1, 'PostgreSQL'), (2, 'Bootstrap Recurring Event'), (95, 'Laravel Course')))")
            ->orderBy('id')->get(['id', 'title']);
    }

    private function restoreVisibility(Connection $connection, string $path): int
    {
        $snapshot = json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
        if (($snapshot['database'] ?? null) !== $connection->getDatabaseName()
            || ! is_array($snapshot['fixtures'] ?? null)) {
            $this->error('The visibility manifest does not match the demo database.');

            return self::FAILURE;
        }
        $changed = $connection->transaction(function () use ($snapshot, $connection): int {
            $connection->statement('SELECT pg_advisory_xact_lock(hashtext(?))', ['gp2:seed-committee']);
            $count = 0;
            foreach ($snapshot['fixtures'] as $record) {
                $count += $connection->table('events')
                    ->where('id', (int) $record['id'])->where('title', $record['title'])
                    ->whereNull('deleted_at')->where('status', EventStatus::DRAFT->name)
                    ->update(['status' => EventStatus::LIVE->name]);
            }

            return $count;
        });
        $this->info('Restored visibility of '.$changed.' events.');

        return self::SUCCESS;
    }

    private function createEvent(Connection $connection, DemoSeedContext $context, DemoOwner $owner, array $fixture): int
    {
        $start = CarbonImmutable::now(self::TIMEZONE)->addDays($fixture['day'])->setTimeFromTimeString($fixture['time']);
        $location = $fixture['venue'] ? $context->createLocation->handle(new UpsertLocationDTO(
            organizer_id: $owner->organizer_id,
            account_id: $owner->account_id,
            name: $fixture['venue'],
            structured_address: new AddressDTO(
                venue_name: $fixture['venue'],
                address_line_1: 'حرم الجامعة الإسلامية',
                city: 'المدينة المنورة',
                state_or_region: 'منطقة المدينة المنورة',
                country: 'SA',
            ),
        )) : null;
        $event = $context->createEvent->handle(new CreateEventDTO(
            title: $fixture['title'],
            organizer_id: $owner->organizer_id,
            account_id: $owner->account_id,
            user_id: $owner->user_id,
            start_date: $start->utc()->toDateTimeString(),
            end_date: $start->addMinutes($fixture['minutes'])->utc()->toDateTimeString(),
            description: $fixture['description'],
            timezone: self::TIMEZONE,
            currency: 'SAR',
            category: EventCategory::from($fixture['category']),
            event_location: $location
                ? new EventLocationData(type: LocationType::IN_PERSON, location_id: $location->getId())
                : new EventLocationData(type: LocationType::ONLINE, online_event_connection_details: '<p>يُعقد هذا اللقاء عبر القاعة الافتراضية لمنصة الفعاليات الجامعية. <a href="https://meet.iu.edu.sa/join" target="_blank" rel="noopener">رابط الانضمام للجلسة الافتراضية</a></p><p>يرجى الانضمام قبل موعد الجلسة بـ 10 دقائق للتأكد من إعدادات الصوت والاتصال.</p>'),
            status: EventStatus::LIVE->name,
        ));
        $eventId = $event->getId();
        $category = $context->renameDefaultCategory($eventId, 'تذاكر الحضور', null);
        $ticket = $context->createProduct->handle(new UpsertProductDTO(
            account_id: $owner->account_id,
            event_id: $eventId,
            product_category_id: $category,
            title: 'تذكرة حضور مجانية',
            type: ProductPriceType::FREE,
            product_type: ProductType::TICKET,
            prices: collect([new ProductPriceDTO(price: 0.0)]),
            initial_quantity_available: $fixture['capacity'],
            sale_end_date: $start->subMinutes(30)->utc()->toDateTimeString(),
            max_per_order: 1,
            min_per_order: 1,
        ));
        $context->uploadCover($eventId, $owner->account_id, 'gp2-'.$fixture['key'].'.jpg');
        $context->applySettings($owner->account_id, $eventId, [
            'is_certificate_eligible' => $fixture['key'] === 'ai-applications',
            'show_marketing_opt_in' => false,
            'homepage_theme_settings' => ['accent' => '#084b2f', 'background' => '#f5faf7', 'mode' => 'light'],
        ]);
        $connection->table('check_in_lists')
            ->where('event_id', $eventId)
            ->where('is_system_default', true)
            ->update([
                'name' => 'تسجيل الحضور',
            ]);
        $connection->table('events')->where('id', $eventId)->update([
            'is_certificate_eligible' => $fixture['key'] === 'ai-applications',
        ]);

        return $eventId;
    }
}
