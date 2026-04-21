<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderConfirmationMail;

class CheckoutController extends Controller
{
    public function create(Request $request)
    {
        // basic input
        $items    = $request->input('items', []);
        $customer = $request->input('customer', []);
        $shipping = $request->input('shipping', []);

        if (empty($items)) {
            return response()->json(['error' => 'No items'], 400);
        }

        // ===============================
        // HITUNG ULANG TOTAL PRODUK (AMAN)
        // ===============================
        $total = 0;
        $orderItems = [];
        foreach ($items as $it) {
            $p = Product::find($it['product_id'] ?? null);
            if (!$p) continue;

            $qty = max(1, (int)($it['quantity'] ?? 1));
            $size = isset($it['size']) ? strtoupper(trim($it['size'])) : null;

            $price = (int) $p->price;

            if ($size) {
                $variant = $p->variants()->where('size', $size)->first();
                if ($variant && !is_null($variant->price)) {
                    $price = (int) $variant->price;
                }
            }

            $orderItems[] = [
                'product_id' => $p->id,
                'name'       => $p->name,
                'price'      => $price,
                'quantity'   => $qty,
                'size'       => $size
            ];

            $total += $price * $qty;
        }

        // =====================================
        // 🔥 PAKAI ONGKIR & TOTAL DARI FRONTEND
        // =====================================
        $shippingCostFrontend = (int) ($shipping['cost'] ?? 0);
        $grandTotalFrontend   = (int) ($request->input('grand_total') ?? 0);

        if ($shippingCostFrontend <= 0 || $grandTotalFrontend <= 0) {
            return response()->json([
                'error' => 'Invalid shipping cost or total'
            ], 400);
        }

        // final total (frontend is source of truth)
        $shippingCost = $shippingCostFrontend;
        $grandTotal   = $grandTotalFrontend;

        // ===============================
        // SIMPAN ORDER
        // ===============================
        $order = Order::create([
            'order_number'       => 'HR' . time() . Str::random(4),
            'total_amount'       => $grandTotal,
            'items'              => $orderItems,
            'status'             => 'pending',
            'user_id'            => optional($request->user())->id,
            'customer_name'      => $customer['name'] ?? null,
            'customer_phone'     => $customer['phone'] ?? null,
            'shipping_address'   => $shipping['address'] ?? null,
            'shipping_city'      => $shipping['city'] ?? null,
            'shipping_province'  => $shipping['province'] ?? null,
            'shipping_postal_code'=> $shipping['postal_code'] ?? null,
            'shipping_method'    => $shipping['service'] ?? null,
            'shipping_cost'      => $shippingCost,
            'courier'            => strtoupper($shipping['courier'] ?? ''),
        ]);

        // ===============================
        // MIDTRANS PAYLOAD (FIXED)
        // ===============================
        $payload = [
            'transaction_details' => [
                'order_id'     => $order->order_number,
                'gross_amount' => $grandTotal
            ],
            'item_details' => array_map(function ($it) {
                return [
                    'id'       => $it['product_id'],
                    'price'    => $it['price'],
                    'quantity' => $it['quantity'],
                    'name'     => $it['name']
                ];
            }, $orderItems)
        ];

        // tambahkan ongkir sebagai item
        $payload['item_details'][] = [
            'id'       => 'SHIPPING',
            'price'    => $shippingCost,
            'quantity' => 1,
            'name'     => 'Ongkir (' . ($shipping['courier'] ?? '-') . ' ' . ($shipping['service'] ?? '-') . ')'
        ];

        // ===============================
        // REQUEST SNAP MIDTRANS
        // ===============================
        $serverKey = config('services.midtrans.server_key');
        $isProd    = config('services.midtrans.is_production');

        $endpoint = $isProd
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        $resp = Http::withBasicAuth($serverKey, '')
            ->withOptions(['verify' => false])
            ->post($endpoint, $payload);

        if ($resp->failed()) {
            return response()->json([
                'error'   => 'Midtrans error',
                'details'=> $resp->body()
            ], 500);
        }

        $body = $resp->json();
        $order->midtrans_token = $body['token'] ?? null;
        $order->save();

        return response()->json([
            'order'      => $order,
            'snap_token' => $order->midtrans_token
        ]);
    }
}
