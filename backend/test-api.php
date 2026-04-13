<?php
// Simple test script to check shipping API
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Test provinces endpoint
$request = Illuminate\Http\Request::create('/api/shipping/provinces', 'GET');
$response = $kernel->handle($request);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: " . substr($response->getContent(), 0, 500) . "...\n";

$kernel->terminate($request, $response);
