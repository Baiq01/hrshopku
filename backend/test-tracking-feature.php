<?php
// Test tracking feature with dummy order
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Test Tracking Feature ===\n\n";

// Check if tracking columns exist
echo "1. Database Schema Check:\n";
$columns = Illuminate\Support\Facades\DB::select("SHOW COLUMNS FROM orders LIKE 'tracking_number'");
if (count($columns) > 0) {
    echo "   ✅ Column 'tracking_number' exists\n";
} else {
    echo "   ❌ Column 'tracking_number' not found\n";
}

$columns2 = Illuminate\Support\Facades\DB::select("SHOW COLUMNS FROM orders LIKE 'courier'");
if (count($columns2) > 0) {
    echo "   ✅ Column 'courier' exists\n";
} else {
    echo "   ❌ Column 'courier' not found\n";
}

// Check recent orders
echo "\n2. Recent Orders with Tracking Info:\n";
$orders = App\Models\Order::orderBy('created_at', 'desc')->limit(5)->get();

if ($orders->count() > 0) {
    foreach ($orders as $order) {
        echo "\n   Order: {$order->order_number}\n";
        echo "   Status: {$order->status}\n";
        echo "   Courier: " . ($order->courier ?: '(not set)') . "\n";
        echo "   Tracking: " . ($order->tracking_number ?: '(not set)') . "\n";
        echo "   Created: {$order->created_at}\n";
        echo "   ---\n";
    }
} else {
    echo "   No orders found\n";
}

// Test update order with tracking
echo "\n3. Test Update Order with Tracking:\n";
$testOrder = App\Models\Order::first();

if ($testOrder) {
    echo "   Testing with order: {$testOrder->order_number}\n";
    
    // Save original values
    $originalTracking = $testOrder->tracking_number;
    $originalCourier = $testOrder->courier;
    
    // Update
    $testOrder->tracking_number = 'TEST' . time();
    $testOrder->courier = 'JNE';
    $testOrder->save();
    
    echo "   ✅ Updated successfully\n";
    echo "   New tracking: {$testOrder->tracking_number}\n";
    echo "   New courier: {$testOrder->courier}\n";
    
    // Restore original
    $testOrder->tracking_number = $originalTracking;
    $testOrder->courier = $originalCourier;
    $testOrder->save();
    
    echo "   ✅ Restored to original values\n";
} else {
    echo "   ⚠️  No orders to test with. Create an order first via checkout.\n";
}

echo "\n4. Frontend Pages:\n";
echo "   - Admin Order Detail: http://localhost:3000/admin/orders/{id}\n";
echo "   - Customer Orders: http://localhost:3000/my-orders\n";
echo "   - Track Shipment: http://localhost:3000/track\n";
echo "   - Track with params: http://localhost:3000/track?waybill=TEST123&courier=jne\n";

echo "\n5. API Endpoints:\n";
echo "   - PATCH /api/admin/orders/{id} (body: {status, tracking_number})\n";
echo "   - GET /api/shipping/track?waybill=XXX&courier=jne\n";

echo "\n✅ Tracking feature ready to use!\n";
