<?php

require __DIR__ . '/../backend/vendor/autoload.php';

$app = require __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use HiEvents\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'student@iu.edu.sa';
$existing = User::whereRaw('LOWER(email) = ?', [$email])->first();

if ($existing) {
    echo "Student already exists (ID: {$existing->id})\n";
    exit(0);
}

$user = new User();
$user->first_name = 'سعود';
$user->last_name = 'الحربي';
$user->email = $email;
$user->password = Hash::make('Password123456!');
$user->timezone = 'Asia/Riyadh';
$user->locale = 'ar';
$user->save();

echo "Student created successfully (ID: {$user->id})\n";
