<?php
// Debug config and test API connections
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Configuration Check ===\n\n";

echo "RajaOngkir Config:\n";
echo "  API Key: " . (config('services.rajaongkir.api_key') ?: '(empty)') . "\n";
echo "  Base URL: " . (config('services.rajaongkir.base_url') ?: '(empty)') . "\n";
echo "  Verify SSL: " . (config('services.rajaongkir.verify_ssl') ? 'true' : 'false') . "\n\n";

echo "Binderbyte Config:\n";
echo "  API Key: " . (config('services.binderbyte.api_key') ?: '(empty)') . "\n";
echo "  Base URL: " . (config('services.binderbyte.base_url') ?: '(empty)') . "\n";
echo "  Verify SSL: " . (config('services.binderbyte.verify_ssl') ? 'true' : 'false') . "\n\n";

echo "=== Testing RajaOngkir Connection ===\n";
$rajaKey = config('services.rajaongkir.api_key');
$rajaBase = rtrim(config('services.rajaongkir.base_url', 'https://rajaongkir.komerce.id/api/v1'), '/');
if ($rajaKey) {
    try {
        $client = Illuminate\Support\Facades\Http::timeout(15)->withHeaders(['key' => $rajaKey]);
        if (!config('services.rajaongkir.verify_ssl')) {
            $client = $client->withoutVerifying();
        }
        $url = $rajaBase . '/province';
        echo "URL: $url\n";
        $resp = $client->get($url);
        echo "Status: " . $resp->status() . "\n";
        echo "Response: " . substr($resp->body(), 0, 300) . "...\n\n";
    } catch (\Throwable $e) {
        echo "ERROR: " . $e->getMessage() . "\n\n";
    }
} else {
    echo "RajaOngkir API key not configured\n\n";
}

echo "=== Testing Binderbyte Connection ===\n";
$bbKey = config('services.binderbyte.api_key');
$bbBase = rtrim(config('services.binderbyte.base_url', 'https://api.binderbyte.com'), '/');
if ($bbKey) {
    try {
        $client = Illuminate\Support\Facades\Http::timeout(15);
        if (!config('services.binderbyte.verify_ssl')) {
            $client = $client->withoutVerifying();
        }
        $url = $bbBase . '/wilayah/provinsi?api_key=' . $bbKey;
        echo "URL: $url\n";
        $resp = $client->get($url);
        echo "Status: " . $resp->status() . "\n";
        echo "Response: " . substr($resp->body(), 0, 300) . "...\n\n";
    } catch (\Throwable $e) {
        echo "ERROR: " . $e->getMessage() . "\n\n";
    }
} else {
    echo "Binderbyte API key not configured\n\n";
}

echo "=== Testing EMSIFA Fallback ===\n";
try {
    $client = Illuminate\Support\Facades\Http::timeout(15)->withoutVerifying();
    $url = 'https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json';
    echo "URL: $url\n";
    $resp = $client->get($url);
    echo "Status: " . $resp->status() . "\n";
    echo "Response: " . substr($resp->body(), 0, 300) . "...\n\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n\n";
}
