<?php
// Test tracking API with Binderbyte
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Test Tracking API ===\n\n";

// Example resi numbers (ganti dengan resi real untuk test)
$testCases = [
    ['courier' => 'jne', 'waybill' => 'JP1234567890'],
    ['courier' => 'jnt', 'waybill' => 'JT1234567890'],
    ['courier' => 'sicepat', 'waybill' => 'SC1234567890'],
];

$bbKey = config('services.binderbyte.api_key');
$bbBase = rtrim(config('services.binderbyte.base_url'), '/');

echo "Binderbyte Config:\n";
echo "  API Key: " . ($bbKey ? substr($bbKey, 0, 20) . '...' : '(empty)') . "\n";
echo "  Base URL: $bbBase\n\n";

echo "CATATAN: Nomor resi di atas adalah contoh.\n";
echo "Untuk test tracking yang sebenarnya, gunakan nomor resi asli dari pengiriman.\n\n";

echo "=== Contoh Request ===\n";
foreach ($testCases as $test) {
    $url = $bbBase . '/track?api_key=' . $bbKey . '&courier=' . $test['courier'] . '&awb=' . $test['waybill'];
    echo "\nKurir: " . strtoupper($test['courier']) . "\n";
    echo "Resi: {$test['waybill']}\n";
    echo "URL: " . substr($url, 0, 80) . "...\n";
}

echo "\n=== Test Tracking via Endpoint ===\n";
// Test via Laravel endpoint
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::create('/api/shipping/track?waybill=TEST123&courier=jne', 'GET');
$response = $kernel->handle($request);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Response: " . substr($response->getContent(), 0, 300) . "...\n";

$kernel->terminate($request, $response);

echo "\n=== Cara Menggunakan ===\n";
echo "1. Frontend: Buka http://localhost:3000/track\n";
echo "2. API: GET http://127.0.0.1:20000/api/shipping/track?waybill=RESI123&courier=jne\n";
echo "\nKurir yang didukung:\n";
echo "  - jne (JNE)\n";
echo "  - jnt (J&T Express)\n";
echo "  - tiki (TIKI)\n";
echo "  - pos (POS Indonesia)\n";
echo "  - sicepat (SiCepat)\n";
echo "  - anteraja (AnterAja)\n";
echo "  - ninja (Ninja Xpress)\n";
echo "  - lion (Lion Parcel)\n";
echo "  - idexpress (ID Express)\n";
echo "  - spx (Shopee Express)\n";
