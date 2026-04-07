<?php
// Test Binderbyte API directly
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$bbKey = config('services.binderbyte.api_key');
$bbBase = rtrim(config('services.binderbyte.base_url'), '/');

echo "=== Testing Binderbyte Provinces ===\n";
$client = Illuminate\Support\Facades\Http::timeout(15)->withoutVerifying();
$resp = $client->get($bbBase . '/wilayah/provinsi', ['api_key' => $bbKey]);

echo "Status: " . $resp->status() . "\n";
echo "Body: " . $resp->body() . "\n\n";

if ($resp->ok()) {
    $data = $resp->json();
    echo "JSON decoded:\n";
    print_r($data);
    
    echo "\n\nData array:\n";
    $list = $data['value'] ?? [];
    echo "Count: " . count($list) . "\n";
    if (count($list) > 0) {
        echo "First item: ";
        print_r($list[0]);
    }
}
