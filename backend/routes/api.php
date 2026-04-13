<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\MidtransController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ShippingController;
use App\Http\Controllers\CustomOrderController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\RajaOngkirController;
use App\Http\Controllers\TailorCustomOrderController;

// Public product endpoints
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Public categories endpoint
Route::get('/categories', [CategoryController::class, 'index']);

// Checkout: create order and get snap token (customer must be logged in)
Route::middleware('auth:sanctum')->post('/checkout', [CheckoutController::class, 'create']);

// Midtrans notification
Route::post('/midtrans/notification', [MidtransController::class, 'notification']);
// Fallback: refresh order status from Midtrans
Route::post('/midtrans/refresh', [MidtransController::class, 'refresh']);

// Shipping options (RajaOngkir)
Route::post('/shipping/options', [ShippingController::class, 'options']);
Route::get('/shipping/provinces', [ShippingController::class, 'provinces']);
Route::get('/shipping/cities', [ShippingController::class, 'cities']);
Route::get('/shipping/track', [ShippingController::class, 'track']);

// RajaOngkir API - New shipping calculation endpoints
Route::get('/rajaongkir/provinces', [RajaOngkirController::class, 'getProvinces']);
Route::get('/rajaongkir/cities', [RajaOngkirController::class, 'getCities']);
Route::get('/rajaongkir/subdistricts', [RajaOngkirController::class, 'getSubdistricts']);
Route::post('/rajaongkir/calculate-cost', [RajaOngkirController::class, 'calculateCost']);
Route::get('/rajaongkir/calculate-cost', [RajaOngkirController::class, 'calculateCost']);
Route::get('/rajaongkir/couriers', [RajaOngkirController::class, 'getCouriers']);
Route::get('/rajaongkir/track-delivery', [RajaOngkirController::class, 'trackDelivery']);
Route::get('/rajaongkir/search-destination', [RajaOngkirController::class, 'searchDestination']);
Route::get('/rajaongkir/test-komerce', [RajaOngkirController::class, 'testKomerceApi']);

// Auth
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Custom Orders - Customer endpoints
Route::middleware('auth:sanctum')->group(function(){
    Route::post('/custom-orders', [CustomOrderController::class, 'store']);
    Route::get('/custom-orders/my-orders', [CustomOrderController::class, 'myOrders']);
    Route::get('/custom-orders/{id}', [CustomOrderController::class, 'show']);
    // Regular Orders - Customer endpoints
    Route::get('/orders/my', [OrderController::class, 'myOrders']);
});

// Admin routes - protected by sanctum and is_admin middleware
Route::middleware(['auth:sanctum','is_admin'])->group(function(){
    Route::apiResource('admin/products', ProductController::class);
    Route::post('admin/products/{id}/image', [ProductController::class, 'uploadImage']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/admin/orders', [OrderController::class, 'index']);
    Route::get('/admin/orders/{id}', [OrderController::class, 'show']);
    Route::patch('/admin/orders/{id}', [OrderController::class, 'update']);
    
    // Categories - Admin endpoints
    Route::apiResource('admin/categories', CategoryController::class);
    
    // Custom Orders - Admin endpoints
    Route::get('/admin/custom-orders', [CustomOrderController::class, 'index']);
    Route::patch('/admin/custom-orders/{id}', [CustomOrderController::class, 'update']);
    Route::delete('/admin/custom-orders/{id}', [CustomOrderController::class, 'destroy']);

    // Email Logs - Admin endpoints
    Route::get('/admin/email-logs', [\App\Http\Controllers\EmailLogController::class, 'index']);
    Route::get('/admin/email-logs/{id}', [\App\Http\Controllers\EmailLogController::class, 'show']);
});

// Tailor routes - protected by sanctum and is_tailor middleware
Route::middleware(['auth:sanctum','is_tailor'])->group(function(){
    Route::get('/tailor/custom-orders', [TailorCustomOrderController::class, 'index']);
    Route::post('/tailor/custom-orders/{id}/accept', [TailorCustomOrderController::class, 'accept']);
    Route::post('/tailor/custom-orders/{id}/reject', [TailorCustomOrderController::class, 'reject']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});
