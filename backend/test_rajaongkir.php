<?php

// Test RajaOngkir API directly
$apiKey = 'XGl4XnNKe83d8dd135a3bf6dSqOsOgDY';
$baseUrl = 'https://rajaongkir.komerce.id/api/v1';

// Test 1: Get Provinces
echo "Testing: Get Provinces\n";
echo "======================\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$baseUrl/province?province_id=");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "key: $apiKey"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
if ($error) {
    echo "Error: $error\n";
}
echo "Response:\n";
echo substr($response, 0, 500) . "\n\n";

// Test 2: Calculate Cost Example
echo "\nTesting: Calculate Domestic Cost\n";
echo "==================================\n";

$data = [
    'origin' => [
        'subdistrict_id' => 5505 // Example: Jakarta
    ],
    'destination' => [
        'subdistrict_id' => 6234 // Example: Bandung
    ],
    'weight' => 1000,
    'courier' => 'jne'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$baseUrl/calculate/domestic-cost");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "key: $apiKey",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
if ($error) {
    echo "Error: $error\n";
}
echo "Response:\n";
echo substr($response, 0, 1000) . "\n";
