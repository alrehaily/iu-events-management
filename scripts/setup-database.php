<?php
// scripts/setup-database.php
// Autonomous database detector and initializer for IU Events

$port = $argv[1] ?? 5432;
$user = $argv[2] ?? 'postgres';
$currentPwd = $argv[3] ?? '';
$targetDb = $argv[4] ?? 'iu_events';

if ($currentPwd === 'YOUR_ACTUAL_PASSWORD') {
    $currentPwd = '';
}

$candidates = array_values(array_unique([
    $currentPwd,
    '',
    'postgres',
    'root',
    '123456',
    'password'
]));

$workingPwd = null;
$pdo = null;

// 1. Try to connect to targetDb or postgres
foreach ($candidates as $pwd) {
    try {
        $pdo = new PDO("pgsql:host=127.0.0.1;port={$port};dbname=postgres", $user, $pwd, [
            PDO::ATTR_TIMEOUT => 2,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        $workingPwd = $pwd;
        break;
    } catch (Exception $e) {
        // Try direct targetDb
        try {
            $pdo = new PDO("pgsql:host=127.0.0.1;port={$port};dbname={$targetDb}", $user, $pwd, [
                PDO::ATTR_TIMEOUT => 2,
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            $workingPwd = $pwd;
            break;
        } catch (Exception $e2) {
            // continue
        }
    }
}

if ($workingPwd === null) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Could not connect to PostgreSQL with default credentials. Please set DB_PASSWORD in backend/.env.'
    ]);
    exit(1);
}

// 2. Ensure target database exists
$dbCreated = false;
try {
    $targetPdo = new PDO("pgsql:host=127.0.0.1;port={$port};dbname={$targetDb}", $user, $workingPwd, [
        PDO::ATTR_TIMEOUT => 3,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (Exception $e) {
    // Database doesn't exist, create it
    try {
        $adminPdo = new PDO("pgsql:host=127.0.0.1;port={$port};dbname=postgres", $user, $workingPwd, [
            PDO::ATTR_TIMEOUT => 3,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        $adminPdo->exec("CREATE DATABASE \"{$targetDb}\"");
        $dbCreated = true;
    } catch (Exception $e2) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to create database: ' . $e2->getMessage()
        ]);
        exit(1);
    }
}

echo json_encode([
    'status' => 'ok',
    'password' => $workingPwd,
    'db_created' => $dbCreated,
    'message' => $dbCreated ? "Database '{$targetDb}' created." : "Database '{$targetDb}' ready."
]);
exit(0);
