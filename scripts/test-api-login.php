<?php

require __DIR__ . '/../backend/vendor/autoload.php';

$app = require __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// 1. Test Attendee Auth Login via auth('api')->attempt()
$attendeeToken = auth('api')->attempt([
    'email' => 'student@iu.edu.sa',
    'password' => 'Password123456!',
]);

if ($attendeeToken) {
    echo "1. Attendee API Token generated successfully: " . substr($attendeeToken, 0, 20) . "...\n";
} else {
    echo "1. Attendee API Token FAILED\n";
}

// 2. Test Organizer Auth Login via auth('api')->attempt()
$organizerToken = auth('api')->attempt([
    'email' => 'club@iu.edu.sa',
    'password' => 'Password123456!',
]);

if ($organizerToken) {
    echo "2. Organizer 2 API Token generated successfully: " . substr($organizerToken, 0, 20) . "...\n";
} else {
    echo "2. Organizer 2 API Token FAILED\n";
}

// 3. Test Admin Organizer Login
$adminToken = auth('api')->attempt([
    'email' => 'admin@iu.edu.sa',
    'password' => 'Password123456!',
]);

if ($adminToken) {
    echo "3. Admin Organizer API Token generated successfully: " . substr($adminToken, 0, 20) . "...\n";
} else {
    echo "3. Admin Organizer API Token FAILED\n";
}
