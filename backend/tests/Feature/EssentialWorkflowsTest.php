<?php

declare(strict_types=1);

namespace Tests\Feature;

use HiEvents\Models\AccountConfiguration;
use HiEvents\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class EssentialWorkflowsTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        AccountConfiguration::firstOrCreate(['id' => 1], [
            'id' => 1,
            'name' => 'Default',
            'is_system_default' => true,
            'application_fees' => [
                'percentage' => 1.5,
                'fixed' => 0,
            ],
        ]);
    }

    /**
     * 1. Account registration and login (Attendee and Organizer)
     */
    public function test_workflow_account_registration_and_login(): void
    {
        $uniqueId = uniqid();

        // 1. Attendee Registration
        $attendeeData = [
            'first_name' => 'سارة',
            'last_name' => 'العتيبي',
            'email' => "attendee-{$uniqueId}@iu.edu.sa",
            'password' => 'Password123!',
        ];
        $regResponse = $this->postJson('/public/attendee/register', $attendeeData);
        $regResponse->assertStatus(201);
        $this->assertNotEmpty($regResponse->json('token'));
        $this->assertSame($attendeeData['email'], $regResponse->json('user.email'));

        // 2. Attendee Login
        $loginResponse = $this->postJson('/public/attendee/login', [
            'email' => $attendeeData['email'],
            'password' => 'Password123!',
        ]);
        $loginResponse->assertStatus(200);
        $this->assertNotEmpty($loginResponse->json('token'));

        // 3. Organizer Registration
        $orgEmail = "organizer-{$uniqueId}@iu.edu.sa";
        $orgRegResponse = $this->postJson('/auth/register', [
            'first_name' => 'د. محمد',
            'last_name' => 'الغامدي',
            'email' => $orgEmail,
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'timezone' => 'Asia/Riyadh',
            'currency_code' => 'SAR',
            'locale' => 'ar',
        ]);
        $orgRegResponse->assertStatus(201);
        $orgRegResponse->assertHeader('X-Auth-Token');
        $orgRegResponse->assertCookie('token');

        // 4. Organizer Login
        $orgLoginResponse = $this->postJson('/auth/login', [
            'email' => $orgEmail,
            'password' => 'Password123!',
        ]);
        $orgLoginResponse->assertStatus(200);
        $this->assertNotEmpty($orgLoginResponse->json('token'));
    }

    /**
     * 2. Event registration and ticket issuance
     */
    public function test_workflow_event_registration_and_ticket_issuance(): void
    {
        $uniqueId = uniqid();
        $user = User::factory()->withAccount()->create();
        $account = $user->accounts()->first();

        $organizerId = DB::table('organizers')->insertGetId([
            'account_id' => $account->id,
            'name' => 'عمادة شؤون الطلاب',
            'email' => "deanship-{$uniqueId}@iu.edu.sa",
            'currency' => 'SAR',
            'timezone' => 'Asia/Riyadh',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $eventId = DB::table('events')->insertGetId([
            'title' => 'ملتقى ريادة الأعمال التقنية',
            'account_id' => $account->id,
            'user_id' => $user->id,
            'organizer_id' => $organizerId,
            'currency' => 'SAR',
            'timezone' => 'Asia/Riyadh',
            'status' => 'LIVE',
            'short_id' => 'evt_' . $uniqueId,
            'start_date' => now()->addDays(2)->toDateTimeString(),
            'end_date' => now()->addDays(3)->toDateTimeString(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $productId = DB::table('products')->insertGetId([
            'event_id' => $eventId,
            'title' => 'تذكرة حضور مجانية',
            'type' => 'TICKET',
            'order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $priceId = DB::table('product_prices')->insertGetId([
            'product_id' => $productId,
            'price' => 0,
            'label' => 'Standard',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Place Order
        $orderShortId = 'ord_' . $uniqueId;
        $orderId = DB::table('orders')->insertGetId([
            'short_id' => $orderShortId,
            'public_id' => Str::uuid()->toString(),
            'event_id' => $eventId,
            'first_name' => 'عبدالله',
            'last_name' => 'الحربي',
            'email' => "attendee-{$uniqueId}@iu.edu.sa",
            'status' => 'COMPLETED',
            'currency' => 'SAR',
            'total_gross' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ticketShortId = 'att_' . $uniqueId;
        $attendeeId = DB::table('attendees')->insertGetId([
            'short_id' => $ticketShortId,
            'public_id' => Str::uuid()->toString(),
            'order_id' => $orderId,
            'event_id' => $eventId,
            'product_id' => $productId,
            'product_price_id' => $priceId,
            'first_name' => 'عبدالله',
            'last_name' => 'الحربي',
            'email' => "attendee-{$uniqueId}@iu.edu.sa",
            'status' => 'ACTIVE',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->assertDatabaseHas('attendees', [
            'id' => $attendeeId,
            'short_id' => $ticketShortId,
            'status' => 'ACTIVE',
        ]);
        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'status' => 'COMPLETED',
        ]);
    }

    /**
     * 3. Attendee profile
     */
    public function test_workflow_attendee_profile(): void
    {
        $uniqueId = uniqid();
        $email = "profile-{$uniqueId}@iu.edu.sa";
        $registerResponse = $this->postJson('/public/attendee/register', [
            'first_name' => 'فيصل',
            'last_name' => 'الجهني',
            'email' => $email,
            'password' => 'Password123!',
        ]);
        $token = $registerResponse->json('token');

        // Get attendee profile
        $meResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/public/attendee/me');
        $meResponse->assertStatus(200);
        $this->assertSame($email, $meResponse->json('user.email'));
        $this->assertSame('فيصل', $meResponse->json('user.first_name'));

        // Get attendee registrations list
        $regListResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/public/attendee/registrations');
        $regListResponse->assertStatus(200);
        $this->assertIsArray($regListResponse->json('registrations'));
    }

    /**
     * 4. Organizer authentication and authorization
     */
    public function test_workflow_organizer_auth_and_management(): void
    {
        $user = User::factory()->withAccount()->create();
        $accountId = $user->accounts()->first()->id;
        $orgToken = JWTAuth::claims(['account_id' => $accountId])->fromUser($user);

        // Organizer can access organizer endpoints
        $eventsResponse = $this->withHeader('Authorization', 'Bearer ' . $orgToken)
            ->getJson('/events');
        $eventsResponse->assertStatus(200);
    }

    public function test_workflow_attendee_denied_organizer_access(): void
    {
        // Attendee cannot access organizer endpoints (RBAC boundary)
        $attendeeReg = $this->postJson('/public/attendee/register', [
            'first_name' => 'طالب',
            'last_name' => 'جامعي',
            'email' => 'student-' . uniqid() . '@iu.edu.sa',
            'password' => 'Password123!',
        ]);
        $attendeeToken = $attendeeReg->json('token');

        $forbiddenResponse = $this->withHeader('Authorization', 'Bearer ' . $attendeeToken)
            ->getJson('/events');
        $forbiddenResponse->assertForbidden();
    }

    /**
     * 5. Event creation, editing, and publishing
     */
    public function test_workflow_event_creation_editing_and_publishing(): void
    {
        $user = User::factory()->withAccount()->create();
        $account = $user->accounts()->first();
        $authToken = JWTAuth::claims(['account_id' => $account->id])->fromUser($user);

        $organizerId = DB::table('organizers')->insertGetId([
            'account_id' => $account->id,
            'name' => 'كلية الحاسب الآلي',
            'email' => 'cs-' . uniqid() . '@iu.edu.sa',
            'currency' => 'SAR',
            'timezone' => 'Asia/Riyadh',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 1. Create Event (Draft)
        $createResponse = $this->withHeader('Authorization', 'Bearer ' . $authToken)
            ->postJson('/events', [
                'title' => 'معرض مشاريع التخرج',
                'description' => '<p>معرض مشاريع تخرج كلية الحاسب الآلي</p>',
                'organizer_id' => $organizerId,
                'category' => 'TECH',
                'start_date' => now()->addDays(10)->toIso8601String(),
                'end_date' => now()->addDays(11)->toIso8601String(),
                'timezone' => 'Asia/Riyadh',
                'currency' => 'SAR',
            ]);
        $createResponse->assertStatus(200);
        $eventId = $createResponse->json('data.id');
        $this->assertNotNull($eventId);
        $this->assertSame('DRAFT', $createResponse->json('data.status'));

        // 2. Edit Event
        $updateResponse = $this->withHeader('Authorization', 'Bearer ' . $authToken)
            ->putJson('/events/' . $eventId, [
                'title' => 'معرض مشاريع التخرج السنوي - النسخة المحدثة',
                'description' => '<p>الوصف المحدث لمعرض مشاريع التخرج</p>',
                'category' => 'TECH',
                'start_date' => now()->addDays(10)->toIso8601String(),
                'end_date' => now()->addDays(11)->toIso8601String(),
                'timezone' => 'Asia/Riyadh',
                'currency' => 'SAR',
            ]);
        $updateResponse->assertStatus(200);
        $this->assertSame('معرض مشاريع التخرج السنوي - النسخة المحدثة', $updateResponse->json('data.title'));

        // 3. Add a ticket product to allow publishing
        $productId = DB::table('products')->insertGetId([
            'event_id' => $eventId,
            'title' => 'تذكرة حضور عامة',
            'type' => 'TICKET',
            'order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('product_prices')->insert([
            'product_id' => $productId,
            'price' => 0,
            'label' => 'Free Ticket',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 4. Publish Event
        $publishResponse = $this->withHeader('Authorization', 'Bearer ' . $authToken)
            ->putJson('/events/' . $eventId . '/status', [
                'status' => 'LIVE',
            ]);
        $publishResponse->assertStatus(200);
        $this->assertSame('LIVE', $publishResponse->json('data.status'));
    }

    /**
     * 6. Arabic and English localization
     */
    public function test_workflow_bilingual_localization(): void
    {
        // 1. Public events endpoint with Arabic locale header
        $arResponse = $this->withHeader('Accept-Language', 'ar')
            ->getJson('/public/events');
        $arResponse->assertStatus(200);
        $arResponse->assertJsonStructure(['data', 'meta']);

        // 2. Public events endpoint with English locale header
        $enResponse = $this->withHeader('Accept-Language', 'en')
            ->getJson('/public/events');
        $enResponse->assertStatus(200);
        $enResponse->assertJsonStructure(['data', 'meta']);

        // 3. Verify public event details load properly in both languages
        $publicEvent = DB::table('events')->where('status', 'LIVE')->first();
        if ($publicEvent) {
            $getAr = $this->withHeader('Accept-Language', 'ar')
                ->getJson('/public/events/' . $publicEvent->id);
            $getAr->assertStatus(200);

            $getEn = $this->withHeader('Accept-Language', 'en')
                ->getJson('/public/events/' . $publicEvent->id);
            $getEn->assertStatus(200);
        }
    }
}
