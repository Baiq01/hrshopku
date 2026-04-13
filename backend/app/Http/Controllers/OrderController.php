<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;

class OrderController extends Controller
{
    // Customer: list own orders
    public function myOrders(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $orders = Order::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    // Admin: list orders with pagination
    public function index(Request $request)
    {
        $orders = Order::with('user:id,name,email')
            ->orderBy('created_at','desc')
            ->paginate(15);
        return response()->json($orders);
    }

    // Admin: show single order
    public function show($id)
    {
        $o = Order::with('user:id,name,email')->findOrFail($id);
        return response()->json($o);
    }

    // Admin: update order status
    public function update(Request $request, $id)
    {
        $o = Order::findOrFail($id);
        $status = $request->input('status');
        $trackingNumber = $request->input('tracking_number');
        
        if ($status) {
            $allowed = ['pending','paid','processing','shipped','canceled'];
            if (!in_array($status, $allowed, true)) {
                return response()->json([
                    'error' => 'Invalid status',
                    'allowed' => $allowed,
                ], 422);
            }
            $o->status = $status;
        }
        
        // Update tracking number if provided
        if ($trackingNumber !== null) {
            $o->tracking_number = $trackingNumber;
        }
        
        $o->save();
        return response()->json($o);
    }
}
