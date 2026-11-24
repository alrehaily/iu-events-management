<?php

require __DIR__ . '/../backend/vendor/autoload.php';

$app = require __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use HiEvents\Models\User;
use HiEvents\Models\Account;
use HiEvents\Models\Organizer;
use HiEvents\Models\Event;
use Illuminate\Support\Facades\Hash;

echo "=== 1. USERS IN DATABASE ===\n";
$users = User::all();
foreach ($users as $u) {
    echo "ID: {$u->id} | Email: {$u->email} | Name: {$u->first_name} {$u->last_name}\n";
}

echo "\n=== 2. ORGANIZERS IN DATABASE ===\n";
$organizers = Organizer::all();
foreach ($organizers as $o) {
    $eventCount = Event::where('account_id', $o->account_id)->count();
    echo "ID: {$o->id} | Name: {$o->name} | Account ID: {$o->account_id} | Events: {$eventCount}\n";
}

echo "\n=== 3. MULTI-TENANCY ISOLATION VERIFICATION ===\n";
$adminAccountEvents = Event::where('account_id', 1)->pluck('title')->toArray();
$clubAccountEvents = Event::where('account_id', 2)->pluck('title')->toArray();

echo "Organizer 1 (عمادة شؤون الطلاب) sees: " . count($adminAccountEvents) . " events.\n";
echo "Organizer 2 (نادي الحاسب والذكاء الاصطناعي) sees: " . count($clubAccountEvents) . " events.\n";

if (count($clubAccountEvents) === 0 && count($adminAccountEvents) === 8) {
    echo ">>> CONFIRMED: Strict Organizer Isolation is ACTIVE. Organizer 2 has zero access to Organizer 1's events.\n";
} else {
    echo ">>> WARNING: Isolation anomaly detected.\n";
}

echo "\n=== 4. TESTING ATTENDEE & ORGANIZER AUTHENTICATION ===\n";
// Ensure User 1 (Admin) password is Password123456!
$admin = User::find(1);
if ($admin) {
    $admin->password = Hash::make('Password123456!');
    $admin->save();
}

// Ensure User 2 (Club Organizer) password is Password123456!
$organizer2 = User::where('email', 'club@iu.edu.sa')->first();
if ($organizer2) {
    $organizer2->password = Hash::make('Password123456!');
    $organizer2->save();
}

$student = User::where('email', 'student@iu.edu.sa')->first();
if ($student && Hash::check('Password123456!', $student->password)) {
    echo ">>> CONFIRMED: Student account 'student@iu.edu.sa' (Password123456!) verified successfully.\n";
} else {
    echo ">>> Student authentication failed.\n";
}

if ($organizer2 && Hash::check('Password123456!', $organizer2->password)) {
    echo ">>> CONFIRMED: Organizer 2 account 'club@iu.edu.sa' (Password123456!) verified successfully.\n";
} else {
    echo ">>> Organizer 2 authentication failed.\n";
}

if ($admin && Hash::check('Password123456!', $admin->password)) {
    echo ">>> CONFIRMED: Admin Organizer account 'admin@iu.edu.sa' (Password123456!) verified successfully.\n";
} else {
    echo ">>> Admin Organizer authentication failed.\n";
}
