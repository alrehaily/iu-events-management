<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use HiEvents\Models\AccountConfiguration;
use HiEvents\Models\AttendeeCertificate;
use HiEvents\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class AttendeeAuthAndFeaturesTest extends TestCase
{
    use RefreshDatabase;

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

    public function test_attendee_registration_and_login_flow(): void
    {
        $registerPayload = [
            'first_name' => 'أحمد',
            'last_name' => 'المدني',
            'email' => 'ahmad.almadani@example.com',
            'password' => 'password123',
        ];

        // 1. Register attendee
        $registerResponse = $this->postJson('/public/attendee/register', $registerPayload);
        $registerResponse->assertStatus(201);
        $registerResponse->assertJsonStructure([
            'token',
            'user' => ['id', 'first_name', 'last_name', 'email', 'role'],
            'message',
        ]);
        $token = $registerResponse->json('token');
        $this->assertNotEmpty($token);

        // 2. Duplicate registration blocked
        $duplicateResponse = $this->postJson('/public/attendee/register', $registerPayload);
        $duplicateResponse->assertStatus(409);

        // 3. Login attendee
        $loginResponse = $this->postJson('/public/attendee/login', [
            'email' => 'ahmad.almadani@example.com',
            'password' => 'password123',
        ]);
        $loginResponse->assertStatus(200);
        $loginResponse->assertJsonStructure(['token', 'user']);

        // 4. Invalid credentials rejected
        $badLogin = $this->postJson('/public/attendee/login', [
            'email' => 'ahmad.almadani@example.com',
            'password' => 'wrongpassword',
        ]);
        $badLogin->assertStatus(401);

        // 5. GET /public/attendee/me with bearer token
        $meResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/public/attendee/me');
        $meResponse->assertStatus(200);
        $this->assertSame('ahmad.almadani@example.com', $meResponse->json('user.email'));

        // 6. Logout and verify unauthenticated access is rejected with 401
        auth('api')->logout();
        $this->flushHeaders();
        $unauthResponse = $this->getJson('/public/attendee/me');
        $unauthResponse->assertStatus(401);
    }

    public function test_attendee_cannot_access_organizer_endpoints(): void
    {
        $registerResponse = $this->postJson('/public/attendee/register', [
            'first_name' => 'خالد',
            'last_name' => 'سالم',
            'email' => 'khaled.salem@external.org',
            'password' => 'password123',
        ]);
        $token = $registerResponse->json('token');

        // Attendee has no organizer account, so accessing /users/me or /events should not authorize organizer actions
        $organizerAttempt = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/events');
        $this->assertTrue(in_array($organizerAttempt->status(), [401, 403, 404, 500]));
    }

    public function test_public_events_endpoint(): void
    {
        $response = $this->getJson('/public/events?per_page=5');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'meta',
        ]);
    }

    public function test_certificate_verification_endpoint(): void
    {
        // 1. Non-existent certificate code fails verification
        $invalidResponse = $this->getJson('/public/certificates/verify/NON-EXISTENT-CODE');
        $invalidResponse->assertStatus(404);
        $this->assertFalse($invalidResponse->json('valid'));

        // 2. Create an organizer, event, order, and attendee via DB
        $user = User::factory()->withAccount()->create();
        $account = $user->accounts()->first();

        $organizerId = DB::table('organizers')->insertGetId([
            'account_id' => $account->id,
            'name' => 'كلية الحاسب الآلي',
            'email' => 'cs@iu.edu.sa',
            'currency' => 'SAR',
            'timezone' => 'Asia/Riyadh',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $eventId = DB::table('events')->insertGetId([
            'title' => 'ملتقى الذكاء الاصطناعي السنوي',
            'account_id' => $account->id,
            'user_id' => $user->id,
            'organizer_id' => $organizerId,
            'currency' => 'SAR',
            'timezone' => 'Asia/Riyadh',
            'status' => 'LIVE',
            'short_id' => 'evt_' . uniqid(),
            'is_certificate_eligible' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $productId = DB::table('products')->insertGetId([
            'event_id' => $eventId,
            'title' => 'تذكرة عامة',
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

        $orderId = DB::table('orders')->insertGetId([
            'short_id' => 'ord_' . uniqid(),
            'public_id' => Str::uuid()->toString(),
            'event_id' => $eventId,
            'first_name' => 'سعد',
            'last_name' => 'الغامدي',
            'email' => 'saad.ghamdi@iu.edu.sa',
            'status' => 'COMPLETED',
            'currency' => 'SAR',
            'total_gross' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $attendeeId = DB::table('attendees')->insertGetId([
            'short_id' => 'att_' . uniqid(),
            'public_id' => Str::uuid()->toString(),
            'order_id' => $orderId,
            'event_id' => $eventId,
            'product_id' => $productId,
            'product_price_id' => $priceId,
            'first_name' => 'سعد',
            'last_name' => 'الغامدي',
            'email' => 'saad.ghamdi@iu.edu.sa',
            'status' => 'ACTIVE',
            'checked_in_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $certCode = 'IU-CERT-' . strtoupper(Str::random(8));
        AttendeeCertificate::create([
            'attendee_id' => $attendeeId,
            'event_id' => $eventId,
            'certificate_code' => $certCode,
            'issued_at' => now(),
        ]);

        // 3. Verify valid certificate
        $validResponse = $this->getJson('/public/certificates/verify/' . $certCode);
        $validResponse->assertStatus(200);
        $this->assertTrue($validResponse->json('valid'));
        $this->assertSame($certCode, $validResponse->json('certificate_code'));
        $this->assertSame('الجامعة الإسلامية بالمدينة المنورة', $validResponse->json('issuer'));
        $this->assertSame('ملتقى الذكاء الاصطناعي السنوي', $validResponse->json('event_title'));
        $this->assertSame('سعد الغامدي', $validResponse->json('attendee_name'));
    }

    public function test_attendee_can_only_view_and_cancel_their_own_registrations(): void
    {
        // 1. Create two users
        $user1 = User::factory()->create(['email' => 'user1@iu.edu.sa']);
        $token1 = auth('api')->tokenById($user1->id);

        $user2 = User::factory()->create(['email' => 'user2@iu.edu.sa']);
        $token2 = auth('api')->tokenById($user2->id);

        auth()->forgetGuards();

        $admin = User::factory()->withAccount()->create();
        $account = $admin->accounts()->first();
        $organizerId = DB::table('organizers')->insertGetId([
            'account_id' => $account->id,
            'name' => 'كلية الهندسة',
            'email' => 'eng@iu.edu.sa',
            'currency' => 'SAR',
            'timezone' => 'Asia/Riyadh',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $eventId = DB::table('events')->insertGetId([
            'title' => 'مؤتمر الهندسة الصناعية',
            'account_id' => $account->id,
            'user_id' => $admin->id,
            'organizer_id' => $organizerId,
            'currency' => 'SAR',
            'timezone' => 'Asia/Riyadh',
            'status' => 'LIVE',
            'short_id' => 'evt_' . uniqid(),
            'start_date' => now()->addDays(5)->toDateTimeString(),
            'end_date' => now()->addDays(6)->toDateTimeString(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $order1ShortId = 'ord_' . uniqid();
        $order1Id = DB::table('orders')->insertGetId([
            'short_id' => $order1ShortId,
            'public_id' => Str::uuid()->toString(),
            'event_id' => $eventId,
            'first_name' => 'User',
            'last_name' => 'One',
            'email' => 'user1@iu.edu.sa',
            'status' => 'COMPLETED',
            'currency' => 'SAR',
            'total_gross' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $productId = DB::table('products')->insertGetId([
            'event_id' => $eventId,
            'title' => 'تذكرة مؤتمر',
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

        DB::table('attendees')->insertGetId([
            'short_id' => 'att_' . uniqid(),
            'public_id' => Str::uuid()->toString(),
            'order_id' => $order1Id,
            'event_id' => $eventId,
            'product_id' => $productId,
            'product_price_id' => $priceId,
            'first_name' => 'User',
            'last_name' => 'One',
            'email' => 'user1@iu.edu.sa',
            'status' => 'ACTIVE',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. User 1 can view their registrations
        $listResponse = $this->actingAs($user1, 'api')
            ->withToken($token1)
            ->getJson('/public/attendee/registrations');
        $listResponse->assertStatus(200);
        $this->assertCount(1, $listResponse->json('registrations'));
        $this->assertSame($order1ShortId, $listResponse->json('registrations.0.short_id'));

        // 3. User 2 cannot view User 1's registrations
        $user2List = $this->actingAs($user2, 'api')
            ->withToken($token2)
            ->getJson('/public/attendee/registrations');
        $user2List->assertStatus(200);
        $this->assertCount(0, $user2List->json('registrations'));

        // 4. User 2 attempts to cancel User 1's registration -> MUST BE FORBIDDEN
        $unauthorizedCancel = $this->actingAs($user2, 'api')
            ->withToken($token2)
            ->postJson('/public/attendee/registrations/' . $order1ShortId . '/cancel');
        $unauthorizedCancel->assertStatus(403);

        // 5. User 1 cancels their own registration -> SUCCESS
        $authorizedCancel = $this->actingAs($user1, 'api')
            ->withToken($token1)
            ->postJson('/public/attendee/registrations/' . $order1ShortId . '/cancel');
        $authorizedCancel->assertStatus(200);

        // 6. Verify order status is CANCELLED in DB
        $updatedOrder = DB::table('orders')->where('id', $order1Id)->first();
        $this->assertSame('CANCELLED', $updatedOrder->status);
    }

    public function test_attendee_cannot_cancel_past_event_registration(): void
    {
        $user = User::factory()->create(['email' => 'past.user@iu.edu.sa']);
        $token = auth('api')->tokenById($user->id);
        auth()->forgetGuards();

        $admin = User::factory()->withAccount()->create();
        $account = $admin->accounts()->first();
        $organizerId = DB::table('organizers')->insertGetId([
            'account_id' => $account->id,
            'name' => 'شؤون الطلاب',
            'email' => 'affairs@iu.edu.sa',
            'currency' => 'SAR',
            'timezone' => 'Asia/Riyadh',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $pastEventId = DB::table('events')->insertGetId([
            'title' => 'فعالية منتهية سابقة',
            'account_id' => $account->id,
            'user_id' => $admin->id,
            'organizer_id' => $organizerId,
            'currency' => 'SAR',
            'timezone' => 'Asia/Riyadh',
            'status' => 'LIVE',
            'short_id' => 'evt_' . uniqid(),
            'start_date' => now()->subDays(5)->toDateTimeString(),
            'end_date' => now()->subDays(4)->toDateTimeString(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $orderShortId = 'ord_' . uniqid();
        $orderId = DB::table('orders')->insertGetId([
            'short_id' => $orderShortId,
            'public_id' => Str::uuid()->toString(),
            'event_id' => $pastEventId,
            'first_name' => 'Past',
            'last_name' => 'User',
            'email' => 'past.user@iu.edu.sa',
            'status' => 'COMPLETED',
            'currency' => 'SAR',
            'total_gross' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Attempting to cancel a past event registration must fail with 422
        $cancelResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/public/attendee/registrations/' . $orderShortId . '/cancel');
        $cancelResponse->assertStatus(422);
    }
}

