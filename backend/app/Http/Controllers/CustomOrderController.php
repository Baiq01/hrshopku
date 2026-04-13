<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CustomOrder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CustomOrderController extends Controller
{
    // Customer: Create custom order request
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'customer_name' => 'required|string|max:255',
                'customer_phone' => 'required|string|max:20',
                'customer_email' => 'nullable|email|max:255',
                'size' => 'nullable|string|max:50',
                'color' => 'nullable|string|max:50',
                'fabric_type' => 'nullable|string|max:100',
                'measurements' => 'nullable|json',
                'design_notes' => 'nullable|string',
                'reference_image' => 'nullable|image|max:2048', // 2MB max
                'quantity' => 'nullable|integer|min:1',
            ]);

            // Parse measurements if it's JSON string
            if (isset($validated['measurements'])) {
                if (is_string($validated['measurements'])) {
                    $validated['measurements'] = json_decode($validated['measurements'], true);
                }
            }

            // Handle image upload
            if ($request->hasFile('reference_image')) {
                $path = $request->file('reference_image')->store('custom-orders', 'public');
                $validated['reference_image'] = $path;
            }

            // Add user_id if authenticated
            $validated['user_id'] = $request->user()?->id;
            $validated['status'] = 'pending';
            
            // Set default quantity if not provided
            if (!isset($validated['quantity'])) {
                $validated['quantity'] = 1;
            }

            $customOrder = CustomOrder::create($validated);

            return response()->json([
                'message' => 'Permintaan custom order berhasil dikirim',
                'data' => $customOrder
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Custom order store error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal menyimpan custom order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Customer: Get their own custom orders
    public function myOrders(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $orders = CustomOrder::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    // Customer: Get single custom order detail
    public function show($id, Request $request)
    {
        $customOrder = CustomOrder::with(['user', 'respondedBy', 'tailor'])->findOrFail($id);

        // Check if user owns this order (or is admin)
        $user = $request->user();
        if (!$user || ($customOrder->user_id !== $user->id && !$user->is_admin)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($customOrder);
    }

    // Admin: List all custom orders with filters
    public function index(Request $request)
    {
        $query = CustomOrder::with(['user', 'respondedBy', 'tailor']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($orders);
    }

    // Admin: Update custom order (approve/reject/update status)
    public function update(Request $request, $id)
    {
        $customOrder = CustomOrder::findOrFail($id);

        $validated = $request->validate([
            'status' => 'nullable|in:pending,approved,rejected,in_production,shipped,completed,canceled',
            'admin_notes' => 'nullable|string',
            'estimated_price' => 'nullable|numeric|min:0',
            'tracking_number' => 'nullable|string|max:100',
            'shipping_courier' => 'nullable|string|max:50',
        ]);

        // Track who responded
        if (isset($validated['status']) && in_array($validated['status'], ['approved', 'rejected'])) {
            $validated['responded_by'] = $request->user()->id;
            $validated['responded_at'] = now();
        }
        
        // Track when shipped
        if (isset($validated['status']) && $validated['status'] === 'shipped' && !$customOrder->shipped_at) {
            $validated['shipped_at'] = now();
        }

        $customOrder->update($validated);

        return response()->json([
            'message' => 'Custom order berhasil diupdate',
            'data' => $customOrder->load(['user', 'respondedBy'])
        ]);
    }

    // Admin: Delete custom order
    public function destroy($id)
    {
        $customOrder = CustomOrder::findOrFail($id);

        // Delete image if exists
        if ($customOrder->reference_image) {
            Storage::disk('public')->delete($customOrder->reference_image);
        }

        $customOrder->delete();

        return response()->json(['message' => 'Custom order berhasil dihapus']);
    }
}
