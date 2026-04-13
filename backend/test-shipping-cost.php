<?php
// Test shipping cost calculation with Parepare as origin
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Configuration ===\n";
echo "Origin City ID: " . config('services.shipping.origin_city_id') . "\n";
echo "Default Weight: " . config('services.shipping.default_weight_gram') . " gram\n\n";

// Test shipping options endpoint
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
// Example: from Parepare (73.72) to Jakarta (31.71)
$request = Illuminate\Http\Request::create('/api/shipping/options', 'POST', [], [], [], [], json_encode([
    'destination_city_id' => '31.71', // Jakarta
    'courier' => 'jne',
    'items' => [
        ['product_id' => 1, 'quantity' => 2],
    ]
]));
$request->headers->set('Content-Type', 'application/json');

echo "=== Testing Shipping Cost ===\n";
echo "From: Parepare (73.72)\n";
echo "To: Jakarta (31.71)\n";
echo "Courier: JNE\n";
echo "Items: 2 pcs\n\n";

$response = $kernel->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Response:\n";
echo json_encode(json_decode($response->getContent()), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";

$kernel->terminate($request, $response);
