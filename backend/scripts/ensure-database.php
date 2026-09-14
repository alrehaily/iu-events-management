<?php
/**
 * Ensures the PostgreSQL database exists before migrations run.
 * Reads connection settings directly from backend/.env.
 */

$envPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';

if (!file_exists($envPath)) {
    fwrite(STDERR, "  [ERROR] backend/.env not found at: {$envPath}\n");
    exit(1);
}

// Parse simple KEY=VALUE pairs from .env
$lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$env = [];

foreach ($lines as $line) {
    $line = trim($line);
    if ($line === '' || str_starts_with($line, '#')) {
        continue;
    }

    $parts = explode('=', $line, 2);
    if (count($parts) === 2) {
        $key = trim($parts[0]);
        $val = trim($parts[1]);

        // Strip surrounding single or double quotes
        if ((str_starts_with($val, '"') && str_ends_with($val, '"')) ||
            (str_starts_with($val, "'") && str_ends_with($val, "'"))) {
            $val = substr($val, 1, -1);
        }

        $env[$key] = $val;
    }
}

$host = $env['DB_HOST'] ?? '127.0.0.1';
$port = $env['DB_PORT'] ?? '5432';
$user = $env['DB_USERNAME'] ?? 'postgres';
$pass = $env['DB_PASSWORD'] ?? '';
$database = $env['DB_DATABASE'] ?? 'backend';

echo "  Testing connection to PostgreSQL server ({$host}:{$port})...\n";

try {
    // Connect to PostgreSQL system database (postgres) to check/create target database
    $dsn = "pgsql:host={$host};port={$port};dbname=postgres";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5,
    ]);

    // Check if the target database already exists
    $stmt = $pdo->prepare("SELECT 1 FROM pg_database WHERE datname = :dbname");
    $stmt->execute([':dbname' => $database]);

    if (!$stmt->fetch()) {
        echo "  Database '{$database}' does not exist. Creating it now...\n";
        $escapedDb = '"' . str_replace('"', '""', $database) . '"';
        $pdo->exec("CREATE DATABASE {$escapedDb}");
        echo "  [OK] Database '{$database}' created successfully.\n";
    } else {
        echo "  [OK] Database '{$database}' exists and is ready.\n";
    }

    exit(0);
} catch (PDOException $e) {
    fwrite(STDERR, "  [ERROR] PostgreSQL error: " . $e->getMessage() . "\n");
    exit(1);
}
