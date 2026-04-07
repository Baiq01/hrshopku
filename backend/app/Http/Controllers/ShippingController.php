<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ShippingController extends Controller
{
    public function provinces()
    {
        // 1) Try RajaOngkir (Next v3) first if configured
        $rajaKey = config('services.rajaongkir.api_key');
        $rajaBase = rtrim(config('services.rajaongkir.base_url', 'https://api.rajaongkir.com/next/v3'), '/');
        if ($rajaKey) {
            try {
                $client = Http::timeout(15)->withHeaders(['key' => $rajaKey]);
                if (!config('services.rajaongkir.verify_ssl')) {
                    $client = $client->withoutVerifying();
                }
                $resp = $client->get($rajaBase . '/province');
                if ($resp->ok()) {
                    $data = $resp->json();
                    $list = $data['rajaongkir']['results'] ?? [];
                    $mapped = array_map(function($p){
                        return [
                            'province_id' => $p['province_id'] ?? null,
                            'province' => $p['province'] ?? null,
                        ];
                    }, $list);
                    return response()->json($mapped);
                }
            } catch (\Throwable $e) {
                // continue to next provider
            }
        }

        // 2) Try Binderbyte provinces
        $bbKey = config('services.binderbyte.api_key');
        $bbBase = rtrim(config('services.binderbyte.base_url', 'https://api.binderbyte.com'), '/');
        if ($bbKey) {
            try {
                $client = Http::timeout(15);
                if (!config('services.binderbyte.verify_ssl')) {
                    $client = $client->withoutVerifying();
                }
                $resp = $client->get($bbBase . '/wilayah/provinsi', [
                    'api_key' => $bbKey,
                ]);
                if ($resp->ok()) {
                    $data = $resp->json();
                    $list = $data['value'] ?? $data['data'] ?? [];
                    $mapped = array_map(function($p){
                        $pid = $p['id'] ?? ($p['province_id'] ?? null);
                        $pname = $p['name'] ?? ($p['province'] ?? null);
                        return [
                            'province_id' => (string)$pid,
                            'province' => $pname,
                        ];
                    }, $list);
                    return response()->json($mapped);
                }
            } catch (\Throwable $e) {
                // continue to fallback
            }
        }

        // 3) Fallback to EMSIFA provinces (public dataset)
        try {
            $client = Http::timeout(15);
            if (!config('services.binderbyte.verify_ssl')) {
                $client = $client->withoutVerifying();
            }
            $f = $client->get('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
            if ($f->ok()) {
                $list = $f->json();
                $mapped = array_map(function($p){
                    return [
                        'province_id' => (string)($p['id'] ?? ''),
                        'province' => $p['name'] ?? null,
                    ];
                }, $list ?? []);
                return response()->json($mapped);
            }
        } catch (\Throwable $e) {}

        return response()->json(['error' => 'providers unavailable'], 502);
    }

    public function cities(Request $request)
    {
        $province = $request->query('province');

        // 1) Try RajaOngkir (Next v3) first if configured
        $rajaKey = config('services.rajaongkir.api_key');
        $rajaBase = rtrim(config('services.rajaongkir.base_url', 'https://api.rajaongkir.com/next/v3'), '/');
        if ($rajaKey && $province) {
            try {
                $client = Http::timeout(15)->withHeaders(['key' => $rajaKey]);
                if (!config('services.rajaongkir.verify_ssl')) {
                    $client = $client->withoutVerifying();
                }
                $url = $rajaBase . '/city?province=' . urlencode($province);
                $resp = $client->get($url);
                if ($resp->ok()) {
                    $data = $resp->json();
                    $list = $data['rajaongkir']['results'] ?? [];
                    $mapped = array_map(function($c){
                        return [
                            'city_id' => $c['city_id'] ?? null,
                            'city_name' => ($c['type'] ?? '') . ' ' . ($c['city_name'] ?? ''),
                            'type' => $c['type'] ?? null,
                            'postal_code' => $c['postal_code'] ?? null,
                            'province_id' => $c['province_id'] ?? null,
                            'province' => $c['province'] ?? null,
                        ];
                    }, $list);
                    return response()->json($mapped);
                }
            } catch (\Throwable $e) {
                // continue to next provider
            }
        }

        // 2) Try Binderbyte cities (kabupaten)
        $bbKey = config('services.binderbyte.api_key');
        $bbBase = rtrim(config('services.binderbyte.base_url', 'https://api.binderbyte.com'), '/');
        if ($bbKey && $province) {
            try {
                $client = Http::timeout(15);
                if (!config('services.binderbyte.verify_ssl')) {
                    $client = $client->withoutVerifying();
                }
                $resp = $client->get($bbBase . '/wilayah/kabupaten', [
                    'api_key' => $bbKey,
                    'id_provinsi' => $province,
                ]);
                if ($resp->ok()) {
                    $data = $resp->json();
                    $list = $data['value'] ?? $data['data'] ?? [];
                    $mapped = array_map(function($c) use ($province){
                        $cid = $c['id'] ?? ($c['city_id'] ?? null);
                        $cname = $c['name'] ?? ($c['city_name'] ?? '');
                        return [
                            'city_id' => (string)$cid,
                            'city_name' => $cname,
                            'type' => $c['type'] ?? null,
                            'postal_code' => $c['postal_code'] ?? null,
                            'province_id' => (string)$province,
                            'province' => $c['province'] ?? null,
                        ];
                    }, $list);
                    return response()->json($mapped);
                }
            } catch (\Throwable $e) {
                // continue to fallbacks
            }
        }

        // 3) EMSIFA fallback for cities (regencies)
        try {
            if (!$province) {
                return response()->json(['error' => 'province required'], 400);
            }
            $client = Http::timeout(15);
            if (!config('services.binderbyte.verify_ssl')) {
                $client = $client->withoutVerifying();
            }
            $f = $client->get('https://www.emsifa.com/api-wilayah-indonesia/api/regencies/'.urlencode($province).'.json');
            if ($f->ok()) {
                $list = $f->json();
                $mapped = array_map(function($c){
                    return [
                        'city_id' => (string)($c['id'] ?? ''),
                        'city_name' => $c['name'] ?? null,
                        'type' => null,
                        'postal_code' => null,
                        'province_id' => null,
                        'province' => null,
                    ];
                }, $list ?? []);
                return response()->json($mapped);
            }
        } catch (\Throwable $e) {}

        return response()->json(['error' => 'providers unavailable'], 502);
    }
    public function options(Request $request)
    {
        $destination = $request->input('destination_city_id');
        $courier = strtolower($request->input('courier', 'jne'));
        $items = $request->input('items', []);

        if (!$destination) {
            return response()->json(['error' => 'destination_city_id required'], 400);
        }
        if (!in_array($courier, ['jne','tiki','pos'])) {
            return response()->json(['error' => 'courier must be one of jne,tiki,pos'], 400);
        }

        $defaultWeight = (int)config('services.shipping.default_weight_gram', 500);

        // compute weight in grams (simple: sum qty * defaultWeight)
        $totalQty = 0;
        foreach ($items as $it) {
            $qty = (int)($it['quantity'] ?? 0);
            $totalQty += max(0, $qty);
        }
        if ($totalQty <= 0) $totalQty = 1;
        $weight = $totalQty * $defaultWeight;

        // 1) Try RajaOngkir (Next v3) cost API first if configured
        $rajaKey = config('services.rajaongkir.api_key');
        $rajaBase = rtrim(config('services.rajaongkir.base_url', 'https://api.rajaongkir.com/next/v3'), '/');
        $origin = config('services.shipping.origin_city_id');
        
        if ($rajaKey && $origin) {
            try {
                $client = Http::timeout(15)->withHeaders(['key' => $rajaKey]);
                if (!config('services.rajaongkir.verify_ssl')) {
                    $client = $client->withoutVerifying();
                }
                $resp = $client->asForm()->post($rajaBase . '/cost', [
                    'origin' => $origin,
                    'destination' => $destination,
                    'weight' => $weight,
                    'courier' => $courier,
                ]);
                if ($resp->ok()) {
                    $data = $resp->json();
                    $results = $data['rajaongkir']['results'][0] ?? null;
                    if ($results) {
                        $costs = $results['costs'] ?? [];
                        $mapped = array_map(function($c) use ($courier){
                            $cost = $c['cost'][0] ?? ['value'=>0,'etd'=>null];
                            return [
                                'courier' => strtoupper($courier),
                                'service' => $c['service'] ?? '',
                                'description' => $c['description'] ?? '',
                                'cost' => $cost['value'] ?? 0,
                                'etd' => $cost['etd'] ?? null,
                            ];
                        }, $costs);

                        return response()->json([
                            'origin_city_id' => (int)$origin,
                            'destination_city_id' => (int)$destination,
                            'courier' => strtoupper($courier),
                            'weight_gram' => $weight,
                            'options' => $mapped,
                        ]);
                    }
                }
            } catch (\Throwable $e) {
                // continue to fallback estimator
            }
        }

        // 2) Fallback: Calculate estimated cost using configured rates
        $rates = config('services.shipping.rates');
        $rate = $rates[$courier] ?? ['base' => 30000, 'perkg' => 10000];
        $inc = max(0, (int)ceil($weight / 1000) - 1);
        $costVal = (int)($rate['base'] ?? 30000) + $inc * (int)($rate['perkg'] ?? 10000);
        $option = [
            'courier' => strtoupper($courier),
            'service' => 'REG',
            'description' => 'Estimated shipping (configurable rates)',
            'cost' => $costVal,
            'etd' => '2-4',
        ];

        return response()->json([
            'origin_city_id' => (int)($origin ?: 0),
            'destination_city_id' => (int)$destination,
            'courier' => strtoupper($courier),
            'weight_gram' => $weight,
            'options' => [$option],
            'note' => 'Calculated using local estimator. Adjust rates in config/services.php (services.shipping.rates) or .env.',
        ]);
    }

    /**
     * Track shipping with Komerce tracking API (primary) or Binderbyte (fallback)
     * GET /api/shipping/track?waybill=RESI123&courier=jne&phone=12345
     */
    public function track(Request $request)
    {
        $waybill = $request->query('waybill') ?: $request->query('resi');
        $courier = strtolower($request->query('courier', 'jne'));
        $lastPhone = $request->query('phone') ?: $request->query('last_phone_number'); // For JNE

        if (!$waybill) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor resi (waybill) wajib diisi'
            ], 400);
        }

        // Try Komerce API first
        $komerceResult = $this->trackWithKomerce($waybill, $courier, $lastPhone);
        if ($komerceResult['success']) {
            return response()->json($komerceResult);
        }

        // Fallback to Binderbyte if Komerce fails
        $binderbyteResult = $this->trackWithBinderbyte($waybill, $courier);
        if ($binderbyteResult['success']) {
            return response()->json($binderbyteResult);
        }

        // Both failed
        return response()->json([
            'success' => false,
            'message' => 'Nomor resi tidak ditemukan. Pastikan nomor resi dan kurir sudah benar.',
            'courier' => strtoupper($courier),
            'waybill' => $waybill,
        ], 404);
    }

    /**
     * Track with Komerce API
     */
    private function trackWithKomerce($waybill, $courier, $lastPhone = null)
    {
        $apiKey = config('services.komerce.delivery_api_key') ?: config('services.komerce.api_key');
        
        if (!$apiKey) {
            return ['success' => false, 'message' => 'Komerce API key not configured'];
        }

        try {
            $client = Http::timeout(15)->withHeaders([
                'x-api-key' => $apiKey,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ]);

            // Map courier codes to Komerce format
            $courierMap = [
                'jne' => 'jne',
                'jnt' => 'jnt',
                'j&t' => 'jnt',
                'sicepat' => 'sicepat',
                'anteraja' => 'anteraja',
                'ninja' => 'ninja',
                'lion' => 'lion',
                'idexpress' => 'idexpress',
                'id express' => 'idexpress',
                'sap' => 'sap',
                'pos' => 'pos',
                'tiki' => 'tiki',
                'wahana' => 'wahana',
                'rpx' => 'rpx',
                'jet' => 'jet',
                'rex' => 'rex',
                'spx' => 'spx',
                'shopee' => 'spx',
            ];

            $mappedCourier = $courierMap[$courier] ?? $courier;

            // Build request body
            $body = [
                'awb' => $waybill,
                'courier' => $mappedCourier,
            ];

            // JNE requires last 5 digits of phone number
            if ($mappedCourier === 'jne' && $lastPhone) {
                $body['last_phone_number'] = substr($lastPhone, -5);
            }

            // Komerce tracking endpoint
            $resp = $client->post('https://rajaongkir.komerce.id/api/v1/track/waybill', $body);

            if ($resp->ok()) {
                $data = $resp->json();
                
                if (isset($data['data']) && $data['data']) {
                    $trackData = $data['data'];
                    
                    // Parse Komerce response format
                    return [
                        'success' => true,
                        'source' => 'komerce',
                        'courier' => strtoupper($courier),
                        'waybill' => $waybill,
                        'data' => $trackData,
                        'summary' => [
                            'status' => $trackData['delivery_status']['status'] ?? $trackData['status'] ?? '-',
                            'desc' => $trackData['delivery_status']['pod_status'] ?? '',
                            'service' => $trackData['summary']['service'] ?? $trackData['service'] ?? '-',
                            'origin' => $trackData['summary']['origin'] ?? $trackData['shipper_city'] ?? '-',
                            'destination' => $trackData['summary']['destination'] ?? $trackData['receiver_city'] ?? '-',
                            'shipper_name' => $trackData['summary']['shipper_name'] ?? $trackData['shipper_name'] ?? '-',
                            'receiver_name' => $trackData['summary']['receiver_name'] ?? $trackData['receiver_name'] ?? '-',
                            'weight' => $trackData['summary']['weight'] ?? null,
                        ],
                        'history' => $trackData['manifest'] ?? $trackData['history'] ?? [],
                    ];
                }
            }

            Log::info('Komerce tracking response', ['status' => $resp->status(), 'body' => $resp->body()]);

        } catch (\Throwable $e) {
            Log::warning('Komerce tracking error', ['error' => $e->getMessage()]);
        }

        return ['success' => false, 'message' => 'Komerce tracking failed'];
    }

    /**
     * Track with Binderbyte API (fallback)
     */
    private function trackWithBinderbyte($waybill, $courier)
    {
        $bbKey = config('services.binderbyte.api_key');
        $bbBase = rtrim(config('services.binderbyte.base_url', 'https://api.binderbyte.com'), '/');

        if (!$bbKey) {
            return ['success' => false, 'message' => 'Binderbyte API not configured'];
        }

        try {
            $client = Http::timeout(15);
            if (!config('services.binderbyte.verify_ssl')) {
                $client = $client->withoutVerifying();
            }

            $resp = $client->get($bbBase . '/track', [
                'api_key' => $bbKey,
                'courier' => $courier,
                'awb' => $waybill,
            ]);

            if ($resp->ok()) {
                $data = $resp->json();
                
                if (isset($data['data']) && $data['data']) {
                    return [
                        'success' => true,
                        'source' => 'binderbyte',
                        'courier' => strtoupper($courier),
                        'waybill' => $waybill,
                        'data' => $data['data'],
                        'summary' => $data['data']['summary'] ?? null,
                        'detail' => $data['data']['detail'] ?? [],
                        'history' => $data['data']['history'] ?? [],
                    ];
                }
            }

        } catch (\Throwable $e) {
            Log::warning('Binderbyte tracking error', ['error' => $e->getMessage()]);
        }

        return ['success' => false, 'message' => 'Binderbyte tracking failed'];
    }
}
