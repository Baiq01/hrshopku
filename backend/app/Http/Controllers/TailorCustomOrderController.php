<?php

namespace App\Http\Controllers;

use App\Models\CustomOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TailorCustomOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = CustomOrder::with(['user', 'tailor'])
            ->orderBy('created_at', 'desc');

        // Filter berdasarkan status penjahit
        if ($request->has('status')) {
            $query->where('tailor_status', $request->status);
        } else {
            // Default: tampilkan yang pending
            $query->where('tailor_status', 'pending');
        }

        $customOrders = $query->paginate(15);

        return response()->json($customOrders);
    }

    public function accept(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $customOrder = CustomOrder::findOrFail($id);

        if ($customOrder->tailor_status !== 'pending') {
            return response()->json(['message' => 'Custom order sudah diproses'], 400);
        }

        $customOrder->update([
            'tailor_id' => $request->user()->id,
            'tailor_status' => 'accepted',
            'tailor_notes' => $request->notes,
            'tailor_responded_at' => now(),
        ]);

        return response()->json([
            'message' => 'Custom order berhasil diterima',
            'custom_order' => $customOrder->load(['user', 'tailor'])
        ]);
    }

    public function reject(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $customOrder = CustomOrder::findOrFail($id);

        if ($customOrder->tailor_status !== 'pending') {
            return response()->json(['message' => 'Custom order sudah diproses'], 400);
        }

        $customOrder->update([
            'tailor_id' => $request->user()->id,
            'tailor_status' => 'rejected',
            'tailor_notes' => $request->notes,
            'tailor_responded_at' => now(),
        ]);

        return response()->json([
            'message' => 'Custom order berhasil ditolak',
            'custom_order' => $customOrder->load(['user', 'tailor'])
        ]);
    }
}
