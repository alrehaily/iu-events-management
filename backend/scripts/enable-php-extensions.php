<?php
/**
 * Automatically enables required PHP extensions in php.ini on Windows.
 */

$loadedIni = php_ini_loaded_file();
$phpDir = dirname(PHP_BINARY);

if (!$loadedIni) {
    $targetIni = $phpDir . DIRECTORY_SEPARATOR . 'php.ini';
    if (!file_exists($targetIni)) {
        if (file_exists($phpDir . DIRECTORY_SEPARATOR . 'php.ini-development')) {
            copy($phpDir . DIRECTORY_SEPARATOR . 'php.ini-development', $targetIni);
            $loadedIni = $targetIni;
        } elseif (file_exists($phpDir . DIRECTORY_SEPARATOR . 'php.ini-production')) {
            copy($phpDir . DIRECTORY_SEPARATOR . 'php.ini-production', $targetIni);
            $loadedIni = $targetIni;
        }
    } else {
        $loadedIni = $targetIni;
    }
}

if (!$loadedIni || !file_exists($loadedIni)) {
    echo "  [WARNING] Could not locate php.ini to configure automatically.\n";
    exit(0);
}

$contents = file_get_contents($loadedIni);
$original = $contents;

// Clean up any errant xmlwriter extension line since xmlwriter is built-in in PHP 8
$contents = preg_replace('/^extension\s*=\s*xmlwriter\s*$/m', '', $contents);

// Enable extension_dir = "ext"
$contents = preg_replace('/^;?\s*extension_dir\s*=\s*"ext"/m', 'extension_dir = "ext"', $contents);

// Required external DLL extensions for Windows
$extensions = [
    'curl',
    'fileinfo',
    'gd',
    'intl',
    'mbstring',
    'openssl',
    'pdo_pgsql',
    'sodium',
    'zip',
];

foreach ($extensions as $ext) {
    // Pattern to match commented out extension line
    $pattern = '/^;\s*(extension\s*=\s*' . preg_quote($ext, '/') . ')/m';
    if (preg_match($pattern, $contents)) {
        $contents = preg_replace($pattern, '$1', $contents);
    } elseif (!preg_match('/^extension\s*=\s*' . preg_quote($ext, '/') . '/m', $contents)) {
        // If not present at all, append it
        $contents .= "\nextension={$ext}\n";
    }
}

if ($contents !== $original) {
    if (@file_put_contents($loadedIni, $contents) !== false) {
        echo "  [OK] php.ini updated with required extensions: {$loadedIni}\n";
    } else {
        echo "  [WARNING] Unable to write to php.ini. Please edit manually if needed.\n";
    }
} else {
    echo "  [OK] php.ini extensions are verified.\n";
}

exit(0);
