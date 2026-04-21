<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\MidtransNotification;

class MidtransController extends Controller
{
    public function notification(Request $request)
    {
        $payload = $request->all();

        // Midtrans sends signature_key - validate it using server key
        $serverKey = config('services.midtrans.server_key');
        $orderId = $payload['order_id'] ?? null;
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? ($payload['gross_amount'] ?? '');
        $signatureKey = $payload['signature_key'] ?? '';

        if (!$orderId || !$signatureKey) {
            Log::warning('Midtrans notification missing order_id or signature', $payload);
            return response()->json(['ok'=>false,'reason'=>'missing_fields'],400);
        }

        // compute expected signature: sha512(order_id + status_code + gross_amount + server_key)
        $expected = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
        if (!hash_equals($expected, $signatureKey)) {
            Log::warning('Midtrans signature mismatch', ['expected'=>$expected,'received'=>$signatureKey]);
            return response()->json(['ok'=>false,'reason'=>'invalid_signature'],403);
        }

        // Idempotency: if we've already recorded a notification with same signature_key or transaction_id, ignore
        $existing = null;
        if ($signatureKey) {
            $existing = MidtransNotification::where('signature_key', $signatureKey)->first();
        }
        if (!$existing && isset($payload['transaction_id'])) {
            $existing = MidtransNotification::where('transaction_id', $payload['transaction_id'])->first();
        }
        if ($existing) {
            Log::info('Duplicate Midtrans notification ignored', ['signature'=>$signatureKey, 'transaction_id'=>$payload['transaction_id'] ?? null]);
            return response()->json(['ok'=>true,'skipped'=>'duplicate']);
        }

        // persist the incoming notification for audit
        $notif = MidtransNotification::create([
            'transaction_id' => $payload['transaction_id'] ?? null,
            'order_number' => $orderId,
            'signature_key' => $signatureKey,
            'payload' => json_encode($payload),
        ]);

        $order = Order::where('order_number', $orderId)->first();
        if (!$order) {
            Log::warning('Order not found for midtrans notification', ['order_id'=>$orderId]);
            // mark notification as processed but reference missing order
            $notif->processed_at = now();
            $notif->save();
            return response()->json(['ok'=>false],404);
        }

        $transactionStatus = $payload['transaction_status'] ?? null;
        // Normalize statuses
        $newStatus = $transactionStatus ?: null;
        if (!$newStatus && isset($payload['status_code'])) {
            // fallback: interpret status_code 200 as capture/settlement
            $newStatus = ($payload['status_code'] == '200') ? 'capture' : $order->status;
        }

        // If payment succeeded (capture or settlement), update stock inside DB transaction
        if (in_array($newStatus, ['capture','settlement'])) {
            DB::beginTransaction();
            try {
                // Only decrement once: check if order already marked as paid/capture/settlement
                if (!in_array($order->status, ['capture','settlement','paid'])) {
                    $items = $order->items ?? [];
                    foreach ($items as $it) {
                        $productId = $it['product_id'] ?? null;
                        $qty = isset($it['quantity']) ? (int)$it['quantity'] : 0;
                        if (!$productId || $qty <= 0) continue;
                        $product = Product::find($productId);
                        if (!$product) continue;
                        // decrement stock but avoid negative numbers
                        $newStock = max(0, $product->stock - $qty);
                        $product->stock = $newStock;
                        $product->save();
                    }
                }

                // update order status and save transaction id if available
                $order->status = $newStatus;
                if (isset($payload['transaction_id'])) {
                    $order->midtrans_transaction_id = $payload['transaction_id'];
                }
                $order->save();
                $notif->processed_at = now();
                $notif->save();

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error processing midtrans notification: '.$e->getMessage());
                return response()->json(['ok'=>false,'reason'=>'processing_error'],500);
            }
        } else {
            // other statuses: just update order status
            $order->status = $newStatus ?? $order->status;
            if (isset($payload['transaction_id'])) {
                $order->midtrans_transaction_id = $payload['transaction_id'];
            }
            $order->save();
        }

        return response()->json(['ok'=>true]);
    }

    // Optional fallback: query Midtrans status and update order (useful when webhook can't reach local dev)
    public function refresh(Request $request)
    {
        $orderId = $request->input('order_id') ?: $request->input('order_number');
        if (!$orderId) {
            return response()->json(['error'=>'order_id required'], 422);
        }
        $order = Order::where('order_number', $orderId)->first();
        if (!$order) return response()->json(['error'=>'order not found'], 404);

        $serverKey = config('services.midtrans.server_key');
        $isProd = config('services.midtrans.is_production');
        $base = $isProd ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com';
        $url = $base.'/v2/'.$orderId.'/status';

        $http = \Illuminate\Support\Facades\Http::withBasicAuth($serverKey, '');
        if (!config('services.midtrans.verify_ssl', true)) {
            $http = $http->withOptions(['verify' => false]);
        }
        $resp = $http->get($url);
        if ($resp->failed()) {
            return response()->json(['error'=>'midtrans status failed','details'=>$resp->body()], 502);
        }
        $payload = $resp->json();

        $transactionStatus = $payload['transaction_status'] ?? null;
        $newStatus = $transactionStatus ?: $order->status;
        $order->status = $newStatus;
        if (isset($payload['transaction_id'])) {
            $order->midtrans_transaction_id = $payload['transaction_id'];
        }
        $order->save();

        return response()->json(['order'=>$order,'midtrans'=>$payload]);
    }
}

