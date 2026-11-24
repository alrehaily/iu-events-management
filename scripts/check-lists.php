<?php

require __DIR__ . '/../backend/vendor/autoload.php';

$app = require __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== CHECK IN LISTS ===\n";
$lists = DB::table('check_in_lists')->get();
foreach ($lists as $l) {
    echo "ID: {$l->id} | Event: {$l->event_id} | Name: {$l->name} | Default: " . ($l->is_system_default ? 'YES' : 'NO') . "\n";
}

echo "\n=== ATTENDEE CHECK INS ===\n";
$checkins = DB::table('attendee_check_ins')->get();
foreach ($checkins as $c) {
    echo json_encode($c, JSON_UNESCAPED_UNICODE) . "\n";
}

echo "\n=== PRODUCT CHECK IN LISTS ===\n";
$pcil = DB::table('product_check_in_lists')->get();
foreach ($pcil as $p) {
    echo json_encode($p, JSON_UNESCAPED_UNICODE) . "\n";
}
