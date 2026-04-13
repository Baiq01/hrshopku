<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RajaOngkirController extends Controller
{
    private $apiKey;
    private $deliveryApiKey;
    private $baseUrl;
    private $binderbyteKey;
    private $binderbyteUrl;

    public function __construct()
    {
        $this->apiKey = env('RAJAONGKIR_API_KEY');
        $this->deliveryApiKey = env('RAJAONGKIR_DELIVERY_API_KEY');
        $this->baseUrl = env('RAJAONGKIR_BASE_URL', 'https://api-sandbox.collaborator.komerce.id');
        $this->binderbyteKey = env('BINDERBYTE_API_KEY');
        $this->binderbyteUrl = env('BINDERBYTE_BASE_URL');
    }

    /**
     * Get list of provinces
     * TESTING: Using Komerce Search Destination API
     */
    public function getProvinces()
    {
        // Return static provinces untuk test
        // Karena Komerce tidak punya endpoint khusus provinsi
        $provinces = [
            ['province_id' => '11', 'province_name' => 'ACEH'],
            ['province_id' => '12', 'province_name' => 'SUMATERA UTARA'],
            ['province_id' => '13', 'province_name' => 'SUMATERA BARAT'],
            ['province_id' => '14', 'province_name' => 'RIAU'],
            ['province_id' => '15', 'province_name' => 'JAMBI'],
            ['province_id' => '16', 'province_name' => 'SUMATERA SELATAN'],
            ['province_id' => '17', 'province_name' => 'BENGKULU'],
            ['province_id' => '18', 'province_name' => 'LAMPUNG'],
            ['province_id' => '19', 'province_name' => 'KEPULAUAN BANGKA BELITUNG'],
            ['province_id' => '21', 'province_name' => 'KEPULAUAN RIAU'],
            ['province_id' => '31', 'province_name' => 'DKI JAKARTA'],
            ['province_id' => '32', 'province_name' => 'JAWA BARAT'],
            ['province_id' => '33', 'province_name' => 'JAWA TENGAH'],
            ['province_id' => '34', 'province_name' => 'DI YOGYAKARTA'],
            ['province_id' => '35', 'province_name' => 'JAWA TIMUR'],
            ['province_id' => '36', 'province_name' => 'BANTEN'],
            ['province_id' => '51', 'province_name' => 'BALI'],
            ['province_id' => '52', 'province_name' => 'NUSA TENGGARA BARAT'],
            ['province_id' => '53', 'province_name' => 'NUSA TENGGARA TIMUR'],
            ['province_id' => '61', 'province_name' => 'KALIMANTAN BARAT'],
            ['province_id' => '62', 'province_name' => 'KALIMANTAN TENGAH'],
            ['province_id' => '63', 'province_name' => 'KALIMANTAN SELATAN'],
            ['province_id' => '64', 'province_name' => 'KALIMANTAN TIMUR'],
            ['province_id' => '65', 'province_name' => 'KALIMANTAN UTARA'],
            ['province_id' => '71', 'province_name' => 'SULAWESI UTARA'],
            ['province_id' => '72', 'province_name' => 'SULAWESI TENGAH'],
            ['province_id' => '73', 'province_name' => 'SULAWESI SELATAN'],
            ['province_id' => '74', 'province_name' => 'SULAWESI TENGGARA'],
            ['province_id' => '75', 'province_name' => 'GORONTALO'],
            ['province_id' => '76', 'province_name' => 'SULAWESI BARAT'],
            ['province_id' => '81', 'province_name' => 'MALUKU'],
            ['province_id' => '82', 'province_name' => 'MALUKU UTARA'],
            ['province_id' => '91', 'province_name' => 'PAPUA BARAT'],
            ['province_id' => '94', 'province_name' => 'PAPUA'],
        ];
        
        return response()->json([
            'success' => true,
            'data' => [
                'meta' => ['code' => 200, 'status' => 'success'],
                'data' => $provinces
            ]
        ]);
    }

    /**
     * Get cities by province ID
     * TESTING: Using Komerce Search Destination API
     */
    public function getCities(Request $request)
    {
        $provinceId = $request->input('province_id');

        if (!$provinceId) {
            return response()->json([
                'success' => false,
                'message' => 'Province ID is required'
            ], 400);
        }

        try {
            // Use Komerce Search API to find cities
            $url = "{$this->baseUrl}/tariff/api/v1/destination/search";
            
            // Get province name to search
            $provinceNames = [
                '11' => 'Aceh', '12' => 'Sumatera Utara', '13' => 'Sumatera Barat',
                '14' => 'Riau', '15' => 'Jambi', '16' => 'Sumatera Selatan',
                '17' => 'Bengkulu', '18' => 'Lampung', '19' => 'Bangka',
                '21' => 'Kepulauan Riau', '31' => 'Jakarta', '32' => 'Jawa Barat',
                '33' => 'Jawa Tengah', '34' => 'Yogyakarta', '35' => 'Jawa Timur',
                '36' => 'Banten', '51' => 'Bali', '52' => 'Nusa Tenggara Barat',
                '53' => 'Nusa Tenggara Timur', '61' => 'Kalimantan Barat',
                '62' => 'Kalimantan Tengah', '63' => 'Kalimantan Selatan',
                '64' => 'Kalimantan Timur', '65' => 'Kalimantan Utara',
                '71' => 'Sulawesi Utara', '72' => 'Sulawesi Tengah',
                '73' => 'Sulawesi Selatan', '74' => 'Sulawesi Tenggara',
                '75' => 'Gorontalo', '76' => 'Sulawesi Barat',
                '81' => 'Maluku', '82' => 'Maluku Utara',
                '91' => 'Papua Barat', '94' => 'Papua',
            ];
            
            $keyword = $provinceNames[$provinceId] ?? 'Jakarta';
            
            $response = Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                'x-api-key' => $this->deliveryApiKey, // Use delivery key (works!)
                'Accept' => 'application/json',
            ])->get($url, [
                'keyword' => $keyword
            ]);

            Log::info('Komerce Get Cities', [
                'province_id' => $provinceId,
                'keyword' => $keyword,
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $data = $result['data'] ?? [];
                
                // Group by city and create unique cities
                $citiesMap = [];
                foreach ($data as $item) {
                    $cityName = $item['city'] ?? '';
                    if (!isset($citiesMap[$cityName]) && !empty($cityName)) {
                        $citiesMap[$cityName] = [
                            'city_id' => $item['destination_id'] ?? $item['id'] ?? count($citiesMap),
                            'province_id' => $provinceId,
                            'city_name' => $cityName,
                            'type' => strpos(strtolower($cityName), 'kota') !== false ? 'Kota' : 'Kabupaten',
                            'postal_code' => $item['zip_code'] ?? ''
                        ];
                    }
                }
                
                return response()->json([
                    'success' => true,
                    'data' => [
                        'meta' => ['code' => 200, 'status' => 'success'],
                        'data' => array_values($citiesMap)
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch cities from Komerce',
                'error' => $response->json()
            ], 400);

        } catch (\Exception $e) {
            Log::error('Get Cities Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching cities',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get subdistricts by city ID
     * TESTING: Using Komerce Search Destination API
     */
    public function getSubdistricts(Request $request)
    {
        $cityId = $request->input('city_id');

        if (!$cityId) {
            return response()->json([
                'success' => false,
                'message' => 'City ID is required'
            ], 400);
        }

        try {
            // Use Komerce Search API to find subdistricts
            // The city_id from Komerce is actually the destination_id
            $url = "{$this->baseUrl}/tariff/api/v1/destination/search";
            
            // Search with the city id as keyword to get related areas
            $response = Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                'x-api-key' => $this->deliveryApiKey, // Use delivery key (works!)
                'Accept' => 'application/json',
            ])->get($url, [
                'keyword' => $cityId // Use city_id as keyword
            ]);

            Log::info('Komerce Get Subdistricts', [
                'city_id' => $cityId,
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $data = $result['data'] ?? [];
                
                // Transform to subdistricts format
                $subdistricts = [];
                foreach ($data as $item) {
                    $subdistricts[] = [
                        'subdistrict_id' => $item['destination_id'] ?? $item['id'],
                        'city_id' => $cityId,
                        'subdistrict_name' => $item['subdistrict'] ?? $item['label'] ?? '',
                        'destination_id' => $item['destination_id'] ?? null, // Komerce ID for shipping
                        'zip_code' => $item['zip_code'] ?? ''
                    ];
                }
                
                return response()->json([
                    'success' => true,
                    'data' => [
                        'meta' => ['code' => 200, 'status' => 'success'],
                        'data' => $subdistricts
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch subdistricts from Komerce',
                'error' => $response->json()
            ], 400);

        } catch (\Exception $e) {
            Log::error('Get Subdistricts Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching subdistricts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate shipping cost
     * Using Komerce Delivery API for real shipping rates
     * Docs: https://komerceapi.readme.io/reference/calculate-destination
     */
    public function calculateCost(Request $request)
    {
        // Accept both old format (origin_subdistrict_id) and new format (origin_id)
        $originId = $request->input('origin_id') ?? $request->input('origin_subdistrict_id');
        $destinationId = $request->input('destination_id') ?? $request->input('destination_subdistrict_id');
        $weight = $request->input('weight');
        $courier = $request->input('courier');

        if (!$originId || !$destinationId || !$weight) {
            return response()->json([
                'success' => false,
                'message' => 'Origin, destination, dan weight wajib diisi'
            ], 400);
        }

        try {
            // Weight in KG (API expects kg, frontend sends grams)
            $weightGram = (float)$weight;
            $weightKg = $weightGram >= 100 ? round($weightGram / 1000, 2) : $weightGram;
            if ($weightKg < 0.1) $weightKg = 0.5; // minimum 500g
            
            $courierLower = $courier ? strtolower($courier) : null;
            
            // Item value (required by Komerce API) - use from request or default
            $itemValue = $request->input('item_value', 100000); // Default 100k
            
            // Build query params for GET request
            $queryParams = [
                'shipper_destination_id' => $originId,
                'receiver_destination_id' => $destinationId,
                'weight' => $weightKg,
                'item_value' => $itemValue, // Required by Komerce
            ];
            
            // Komerce Calculate API endpoint (GET method)
            $url = "{$this->baseUrl}/tariff/api/v1/calculate";
            
            $response = Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                'x-api-key' => $this->deliveryApiKey, // Use delivery key (works!)
                'Accept' => 'application/json',
            ])->get($url, $queryParams);

            Log::info('Komerce Calculate Request', [
                'url' => $url,
                'params' => $queryParams,
                'response_status' => $response->status(),
                'response_body' => $response->json()
            ]);

            if ($response->successful()) {
                $result = $response->json();
                
                // Komerce response format: data.calculate_reguler[], data.calculate_cargo[], data.calculate_instant[]
                $calculateReguler = $result['data']['calculate_reguler'] ?? [];
                $calculateCargo = $result['data']['calculate_cargo'] ?? [];
                $calculateInstant = $result['data']['calculate_instant'] ?? [];
                
                // Merge all services
                $allRawServices = array_merge($calculateReguler, $calculateCargo, $calculateInstant);
                
                if (!empty($allRawServices)) {
                    $allServices = [];
                    
                    foreach ($allRawServices as $service) {
                        $courierCode = strtolower($service['shipping_name'] ?? '');
                        
                        // Filter by courier if specified
                        if ($courierLower && $courierCode !== $courierLower) {
                            continue;
                        }
                        
                        $allServices[] = [
                            'courier' => strtoupper($service['shipping_name'] ?? ''),
                            'courier_logo' => null,
                            'service_name' => $service['service_name'] ?? 'REG',
                            'service_display' => $service['service_name'] ?? 'Regular',
                            'description' => 'Layanan ' . ($service['service_name'] ?? 'Regular'),
                            'cost' => (int)($service['shipping_cost'] ?? 0),
                            'etd' => $service['etd'] ?? '2-4 hari',
                            'is_cod' => $service['is_cod'] ?? false,
                            'shipping_cashback' => $service['shipping_cashback'] ?? 0,
                        ];
                    }

                    if (!empty($allServices)) {
                        return response()->json([
                            'success' => true,
                            'data' => [
                                'meta' => ['code' => 200, 'status' => 'success'],
                                'data' => [
                                    'origin_id' => $originId,
                                    'destination_id' => $destinationId,
                                    'weight_kg' => $weightKg,
                                    'services' => $allServices
                                ]
                            ]
                        ]);
                    }
                }
            }

            // Fallback to local estimation if API fails
            Log::warning('Komerce API failed or empty, using fallback estimation', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return $this->calculateCostFallbackSimple($originId, $destinationId, $weight, $courier);

        } catch (\Exception $e) {
            Log::error('Calculate Cost Error: ' . $e->getMessage());
            // Fallback to local estimation on error
            return $this->calculateCostFallbackSimple($originId, $destinationId, $weight, $courier);
        }
    }

    /**
     * Simple fallback for shipping cost when API fails
     */
    private function calculateCostFallbackSimple($originId, $destinationId, $weight, $courier)
    {
        $weightKg = ceil((float)$weight / 1000);
        if ($weightKg < 1) $weightKg = 1;
        
        $courierLower = strtolower($courier ?? 'jne');
        
        // Simple rate calculation
        $rates = [
            'jne' => ['base' => 15000, 'per_kg' => 5000],
            'tiki' => ['base' => 14000, 'per_kg' => 4500],
            'pos' => ['base' => 12000, 'per_kg' => 4000],
            'jnt' => ['base' => 13000, 'per_kg' => 4500],
            'sicepat' => ['base' => 14000, 'per_kg' => 4500],
            'anteraja' => ['base' => 13000, 'per_kg' => 4000],
        ];
        
        $rate = $rates[$courierLower] ?? $rates['jne'];
        $cost = $rate['base'] + ($weightKg * $rate['per_kg']);
        
        $services = [
            [
                'courier' => strtoupper($courier ?? 'JNE'),
                'service_name' => 'REG',
                'service_display' => 'Regular',
                'description' => 'Layanan Regular (estimasi)',
                'cost' => $cost,
                'etd' => '3-5 Hari',
            ]
        ];
        
        return response()->json([
            'success' => true,
            'data' => [
                'meta' => ['code' => 200, 'status' => 'success'],
                'data' => [
                    'origin_id' => $originId,
                    'destination_id' => $destinationId,
                    'weight_kg' => $weightKg,
                    'services' => $services,
                    'is_fallback' => true
                ]
            ]
        ]);
    }

    /**
     * Search destination by keyword (city, district, subdistrict, postal code)
     * Docs: https://komerceapi.readme.io/reference/search-destination
     */
    public function searchDestination(Request $request)
    {
        $keyword = $request->input('keyword');
        
        if (!$keyword || strlen($keyword) < 3) {
            return response()->json([
                'success' => false,
                'message' => 'Keyword minimal 3 karakter'
            ], 400);
        }

        try {
            $url = "{$this->baseUrl}/tariff/api/v1/destination/search";
            
            $response = Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                'x-api-key' => $this->deliveryApiKey, // Use delivery key (works!)
                'Accept' => 'application/json',
            ])->get($url, [
                'keyword' => $keyword
            ]);

            Log::info('Komerce Search Destination', [
                'keyword' => $keyword,
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            if ($response->successful()) {
                $result = $response->json();
                return response()->json([
                    'success' => true,
                    'data' => $result['data'] ?? []
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Gagal mencari lokasi',
                'error' => $response->json()
            ], 400);

        } catch (\Exception $e) {
            Log::error('Search Destination Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error mencari lokasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fallback shipping cost calculation using local estimation
     */
    private function calculateCostFallback(Request $request)
    {
        $request->validate([
            'origin_subdistrict_id' => 'required',
            'destination_subdistrict_id' => 'required',
            'weight' => 'required|numeric|min:1',
            'courier' => 'required|string'
        ]);

        try {
            // Get city codes from subdistrict IDs
            $originCityCode = substr($request->origin_subdistrict_id, 0, 5); // e.g., 73.72
            $destCityCode = substr($request->destination_subdistrict_id, 0, 5);
            
            // Get coordinates for origin and destination
            $originCoords = $this->getCityCoordinates($originCityCode);
            $destCoords = $this->getCityCoordinates($destCityCode);
            
            // Calculate real distance in kilometers
            $distanceKm = $this->calculateDistance(
                $originCoords['lat'], 
                $originCoords['lon'], 
                $destCoords['lat'], 
                $destCoords['lon']
            );
            
            // Get accessibility factor (pulau, pedalaman, infrastruktur)
            $accessibility = $this->getAccessibilityFactor($destCityCode);
            
            // Weight calculation with progressive rates
            $weight = (int)$request->weight;
            $weightKg = ceil($weight / 1000);
            $courier = strtolower($request->courier);
            
            // Courier base rates (per km) - adjusted to realistic pricing
            $courierRates = [
                'jne' => ['per_km' => 35, 'base' => 8000, 'min' => 9000],
                'tiki' => ['per_km' => 32, 'base' => 7500, 'min' => 8500],
                'pos' => ['per_km' => 28, 'base' => 6500, 'min' => 7500],
                'jnt' => ['per_km' => 30, 'base' => 7000, 'min' => 8000],
                'sicepat' => ['per_km' => 30, 'base' => 7000, 'min' => 8000],
                'anteraja' => ['per_km' => 28, 'base' => 6500, 'min' => 7500],
            ];
            
            $rate = $courierRates[$courier] ?? $courierRates['jne'];
            
            // Calculate base cost: (distance * per_km) + base
            $distanceCost = $distanceKm * $rate['per_km'];
            $baseCost = $rate['base'] + $distanceCost;
            
            // Apply weight multiplier (progressive)
            if ($weightKg <= 1) {
                $weightMultiplier = 1.0;
            } elseif ($weightKg <= 5) {
                $weightMultiplier = 1.0 + (($weightKg - 1) * 0.7); // 70% per kg
            } elseif ($weightKg <= 10) {
                $weightMultiplier = 3.8 + (($weightKg - 5) * 0.5); // 50% per kg
            } else {
                $weightMultiplier = 6.3 + (($weightKg - 10) * 0.4); // 40% per kg (bulk discount)
            }
            
            // Apply accessibility factor (1.0 - 2.5x)
            $totalCost = $baseCost * $weightMultiplier * $accessibility;
            
            // Ensure minimum cost
            $regCost = max(floor($totalCost), $rate['min']);
            $okeCost = floor($regCost * 0.70); // OKE is 30% cheaper
            $yesCost = floor($regCost * 1.65); // YES is 65% more expensive
            
            // Calculate ETD based on real distance
            $baseEtd = ceil($distanceKm / 350); // Assume 350km per day
            
            // Build services array
            $services = [];
            
            if (in_array($courier, ['jne', 'tiki', 'pos'])) {
                $services[] = [
                    'service_name' => 'REG',
                    'service_display' => 'Regular',
                    'description' => 'Layanan Regular',
                    'cost' => $regCost,
                    'etd' => $this->formatEtd($baseEtd, $baseEtd + 2),
                    'distance_km' => round($distanceKm, 1)
                ];
                
                if ($courier === 'jne') {
                    $services[] = [
                        'service_name' => 'YES',
                        'service_display' => 'Yakin Esok Sampai',
                        'description' => 'Yakin Esok Sampai',
                        'cost' => $yesCost,
                        'etd' => $this->formatEtd(max(1, $baseEtd - 1), max(2, $baseEtd)),
                        'distance_km' => round($distanceKm, 1)
                    ];
                    $services[] = [
                        'service_name' => 'OKE',
                        'service_display' => 'Ongkos Kirim Ekonomis',
                        'description' => 'Ongkos Kirim Ekonomis',
                        'cost' => $okeCost,
                        'etd' => $this->formatEtd($baseEtd + 1, $baseEtd + 4),
                        'distance_km' => round($distanceKm, 1)
                    ];
                }
            } else {
                $services[] = [
                    'service_name' => 'REG',
                    'service_display' => 'Regular',
                    'description' => 'Layanan Regular',
                    'cost' => $regCost,
                    'etd' => $this->formatEtd($baseEtd, $baseEtd + 2),
                    'distance_km' => round($distanceKm, 1)
                ];
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'meta' => ['code' => 200, 'status' => 'success'],
                    'data' => [
                        'origin' => [
                            'subdistrict_id' => $request->origin_subdistrict_id,
                            'city_code' => $originCityCode
                        ],
                        'destination' => [
                            'subdistrict_id' => $request->destination_subdistrict_id,
                            'city_code' => $destCityCode
                        ],
                        'distance_info' => [
                            'distance_km' => round($distanceKm, 1),
                            'accessibility_factor' => $accessibility
                        ],
                        'services' => $services
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Calculate Cost Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error calculating shipping cost',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Calculate distance between two coordinates using Haversine formula
     * Returns distance in kilometers
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // Earth radius in kilometers
        
        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);
        
        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;
        
        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos($latFrom) * cos($latTo) *
             sin($lonDelta / 2) * sin($lonDelta / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadius * $c;
    }
    
    /**
     * Get coordinates for a city based on city code
     * Returns ['lat' => float, 'lon' => float]
     */
    private function getCityCoordinates($cityCode)
    {
        // Major cities coordinates (kota-kota besar Indonesia)
        $coordinates = [
            // Sulawesi Selatan
            '73.71' => ['lat' => -5.1477, 'lon' => 119.4327, 'name' => 'Makassar'],
            '73.72' => ['lat' => -4.0170, 'lon' => 119.6254, 'name' => 'Parepare'],
            '73.02' => ['lat' => -3.6817, 'lon' => 119.7443, 'name' => 'Luwu'],
            '73.08' => ['lat' => -5.5593, 'lon' => 120.3241, 'name' => 'Bone'],
            
            // DKI Jakarta
            '31.71' => ['lat' => -6.2088, 'lon' => 106.8456, 'name' => 'Jakarta Pusat'],
            '31.72' => ['lat' => -6.1745, 'lon' => 106.8227, 'name' => 'Jakarta Utara'],
            '31.73' => ['lat' => -6.2615, 'lon' => 106.7811, 'name' => 'Jakarta Barat'],
            '31.74' => ['lat' => -6.2649, 'lon' => 106.8467, 'name' => 'Jakarta Selatan'],
            '31.75' => ['lat' => -6.2250, 'lon' => 106.9004, 'name' => 'Jakarta Timur'],
            
            // Jawa Barat
            '32.73' => ['lat' => -6.9175, 'lon' => 107.6191, 'name' => 'Bandung'],
            '32.01' => ['lat' => -6.8650, 'lon' => 108.5477, 'name' => 'Cirebon'],
            '32.16' => ['lat' => -6.7364, 'lon' => 108.5520, 'name' => 'Indramayu'],
            '32.75' => ['lat' => -6.6013, 'lon' => 106.8000, 'name' => 'Bogor'],
            
            // Jawa Tengah
            '33.74' => ['lat' => -7.0051, 'lon' => 110.4381, 'name' => 'Semarang'],
            '33.71' => ['lat' => -7.5755, 'lon' => 110.8243, 'name' => 'Surakarta'],
            '33.29' => ['lat' => -6.8667, 'lon' => 109.1333, 'name' => 'Pekalongan'],
            
            // Jawa Timur
            '35.78' => ['lat' => -7.2575, 'lon' => 112.7521, 'name' => 'Surabaya'],
            '35.79' => ['lat' => -7.9797, 'lon' => 112.6304, 'name' => 'Malang'],
            '35.73' => ['lat' => -6.1754, 'lon' => 106.8272, 'name' => 'Kediri'],
            
            // Bali
            '51.71' => ['lat' => -8.6705, 'lon' => 115.2126, 'name' => 'Denpasar'],
            
            // Sumatra Utara
            '12.71' => ['lat' => 3.5952, 'lon' => 98.6722, 'name' => 'Medan'],
            
            // Sumatra Barat
            '13.71' => ['lat' => -0.9471, 'lon' => 100.4172, 'name' => 'Padang'],
            
            // Sumatra Selatan
            '16.71' => ['lat' => -2.9760, 'lon' => 104.7754, 'name' => 'Palembang'],
            
            // Kalimantan Timur
            '64.71' => ['lat' => -0.5022, 'lon' => 117.1536, 'name' => 'Samarinda'],
            '64.72' => ['lat' => 0.5387, 'lon' => 117.1367, 'name' => 'Balikpapan'],
            
            // Papua
            '94.71' => ['lat' => -2.5920, 'lon' => 140.6685, 'name' => 'Jayapura'],
        ];
        
        // If exact city found, return it
        if (isset($coordinates[$cityCode])) {
            return $coordinates[$cityCode];
        }
        
        // Otherwise, estimate based on province (first 2 digits)
        $provinceCode = substr($cityCode, 0, 2);
        $provinceEstimates = [
            '11' => ['lat' => 5.5483, 'lon' => 95.3238, 'name' => 'Aceh'], // Banda Aceh
            '12' => ['lat' => 3.5952, 'lon' => 98.6722, 'name' => 'Sumut'], // Medan
            '13' => ['lat' => -0.9471, 'lon' => 100.4172, 'name' => 'Sumbar'], // Padang
            '14' => ['lat' => 0.5071, 'lon' => 101.4478, 'name' => 'Riau'], // Pekanbaru
            '15' => ['lat' => -0.5897, 'lon' => 100.3675, 'name' => 'Jambi'], // Jambi
            '16' => ['lat' => -2.9760, 'lon' => 104.7754, 'name' => 'Sumsel'], // Palembang
            '17' => ['lat' => -3.7930, 'lon' => 102.2655, 'name' => 'Bengkulu'], // Bengkulu
            '18' => ['lat' => -5.4286, 'lon' => 105.2628, 'name' => 'Lampung'], // Bandar Lampung
            '19' => ['lat' => 3.9456, 'lon' => 108.1429, 'name' => 'Kepri'], // Tanjungpinang
            '21' => ['lat' => 0.9471, 'lon' => 104.4553, 'name' => 'Babel'], // Pangkal Pinang
            '31' => ['lat' => -6.2088, 'lon' => 106.8456, 'name' => 'Jakarta'], // Jakarta
            '32' => ['lat' => -6.9175, 'lon' => 107.6191, 'name' => 'Jabar'], // Bandung
            '33' => ['lat' => -7.0051, 'lon' => 110.4381, 'name' => 'Jateng'], // Semarang
            '34' => ['lat' => -7.7956, 'lon' => 110.3695, 'name' => 'DIY'], // Yogyakarta
            '35' => ['lat' => -7.2575, 'lon' => 112.7521, 'name' => 'Jatim'], // Surabaya
            '36' => ['lat' => -6.1204, 'lon' => 106.1550, 'name' => 'Banten'], // Serang
            '51' => ['lat' => -8.6705, 'lon' => 115.2126, 'name' => 'Bali'], // Denpasar
            '52' => ['lat' => -8.5833, 'lon' => 116.1167, 'name' => 'NTB'], // Mataram
            '53' => ['lat' => -10.1772, 'lon' => 123.6070, 'name' => 'NTT'], // Kupang
            '61' => ['lat' => -0.0263, 'lon' => 109.3425, 'name' => 'Kalbar'], // Pontianak
            '62' => ['lat' => -2.2116, 'lon' => 113.9133, 'name' => 'Kalteng'], // Palangkaraya
            '63' => ['lat' => -3.3194, 'lon' => 114.5906, 'name' => 'Kalsel'], // Banjarmasin
            '64' => ['lat' => -0.5022, 'lon' => 117.1536, 'name' => 'Kaltim'], // Samarinda
            '65' => ['lat' => 3.3344, 'lon' => 117.5892, 'name' => 'Kaltara'], // Tanjung Selor
            '71' => ['lat' => 0.5387, 'lon' => 123.0595, 'name' => 'Sulut'], // Manado
            '72' => ['lat' => -0.8999, 'lon' => 119.8707, 'name' => 'Sulteng'], // Palu
            '73' => ['lat' => -5.1477, 'lon' => 119.4327, 'name' => 'Sulsel'], // Makassar
            '74' => ['lat' => -4.0086, 'lon' => 122.5164, 'name' => 'Sultra'], // Kendari
            '75' => ['lat' => 0.7516, 'lon' => 127.3778, 'name' => 'Gorontalo'], // Gorontalo
            '76' => ['lat' => -2.1115, 'lon' => 120.3083, 'name' => 'Sulbar'], // Mamuju
            '81' => ['lat' => -3.6954, 'lon' => 128.1814, 'name' => 'Maluku'], // Ambon
            '82' => ['lat' => 0.7893, 'lon' => 127.3783, 'name' => 'Malut'], // Ternate
            '91' => ['lat' => -0.8618, 'lon' => 134.0622, 'name' => 'Papbar'], // Manokwari
            '94' => ['lat' => -2.5920, 'lon' => 140.6685, 'name' => 'Papua'], // Jayapura
        ];
        
        return $provinceEstimates[$provinceCode] ?? ['lat' => -2.5, 'lon' => 118.0, 'name' => 'Indonesia']; // Center of Indonesia
    }
    
    /**
     * Get accessibility factor based on location
     * 1.0 = very accessible (major cities)
     * 2.5 = very difficult (remote islands, mountains)
     */
    private function getAccessibilityFactor($cityCode)
    {
        $provinceCode = substr($cityCode, 0, 2);
        
        // Major cities - very accessible
        $majorCities = ['31.71', '31.72', '31.73', '31.74', '31.75', // Jakarta
                        '32.73', '33.74', '35.78', '51.71', '73.71', '12.71']; // Bandung, Semarang, Surabaya, Denpasar, Makassar, Medan
        
        if (in_array($cityCode, $majorCities)) {
            return 1.0; // Excellent infrastructure
        }
        
        // Province-based accessibility
        $accessibility = [
            '31' => 1.0, // Jakarta - excellent
            '32' => 1.1, // Jawa Barat - very good
            '33' => 1.1, // Jawa Tengah - very good
            '34' => 1.1, // DIY - very good
            '35' => 1.1, // Jawa Timur - very good
            '36' => 1.2, // Banten - good
            '51' => 1.3, // Bali - good (island)
            '73' => 1.4, // Sulawesi Selatan - moderate (island)
            '71' => 1.5, // Sulawesi Utara - moderate (island)
            '72' => 1.6, // Sulawesi Tengah - moderate (island, some remote)
            '74' => 1.6, // Sulawesi Tenggara - moderate
            '75' => 1.7, // Gorontalo - moderate
            '76' => 1.8, // Sulawesi Barat - difficult (less developed)
            '12' => 1.3, // Sumatra Utara - good
            '13' => 1.4, // Sumatra Barat - moderate
            '14' => 1.4, // Riau - moderate
            '16' => 1.4, // Sumatra Selatan - moderate
            '11' => 1.6, // Aceh - difficult (far)
            '15' => 1.5, // Jambi - moderate
            '17' => 1.6, // Bengkulu - difficult
            '18' => 1.5, // Lampung - moderate
            '52' => 1.5, // NTB - moderate (island)
            '53' => 1.9, // NTT - difficult (many islands)
            '61' => 1.6, // Kalimantan Barat - difficult
            '62' => 1.7, // Kalimantan Tengah - difficult
            '63' => 1.6, // Kalimantan Selatan - moderate
            '64' => 1.5, // Kalimantan Timur - moderate (developed)
            '65' => 1.8, // Kalimantan Utara - difficult
            '81' => 2.0, // Maluku - very difficult (islands)
            '82' => 2.1, // Maluku Utara - very difficult
            '91' => 2.3, // Papua Barat - very difficult (remote)
            '94' => 2.5, // Papua - very difficult (very remote)
        ];
        
        return $accessibility[$provinceCode] ?? 1.5; // Default: moderate
    }
    
    /**
     * Format ETD range
     */
    private function formatEtd($min, $max)
    {
        if ($min == $max) {
            return $min . ' Hari';
        }
        return $min . '-' . $max . ' Hari';
    }
    
    /**
     * Get available couriers
     */
    public function getCouriers()
    {
        try {
            $response = Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                'key' => $this->apiKey,
            ])->get("{$this->baseUrl}/courier/all");

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'data' => $response->json()
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch couriers',
                'error' => $response->json()
            ], 400);

        } catch (\Exception $e) {
            Log::error('RajaOngkir Get Couriers Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching couriers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Track shipment delivery
     * Uses delivery API key for real-time tracking
     */
    public function trackDelivery(Request $request)
    {
        $request->validate([
            'waybill' => 'required|string',
            'courier' => 'required|string'
        ]);

        try {
            $response = Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                'key' => $this->deliveryApiKey,
            ])->get("{$this->baseUrl}/tracking/waybill", [
                'waybill' => $request->waybill,
                'courier' => strtolower($request->courier)
            ]);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'data' => $response->json()
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to track shipment',
                'error' => $response->json()
            ], 400);

        } catch (\Exception $e) {
            Log::error('RajaOngkir Track Delivery Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error tracking shipment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test Komerce API connectivity
     * Endpoint: GET /api/rajaongkir/test-komerce
     */
    public function testKomerceApi()
    {
        $results = [
            'api_key' => substr($this->apiKey, 0, 10) . '...',
            'base_url' => $this->baseUrl,
            'tests' => []
        ];

        // Test 1: Search Destination (try both API keys)
        try {
            $url = "{$this->baseUrl}/tariff/api/v1/destination/search";
            
            // Try with delivery API key first
            $response = Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                'x-api-key' => $this->deliveryApiKey,
                'Accept' => 'application/json',
            ])->get($url, [
                'keyword' => 'Makassar'
            ]);
            
            $usedKey = 'delivery_key';
            
            // If delivery key fails, try with regular API key
            if (!$response->successful()) {
                $response = Http::withOptions([
                    'verify' => false,
                ])->withHeaders([
                    'x-api-key' => $this->apiKey,
                    'Accept' => 'application/json',
                ])->get($url, [
                    'keyword' => 'Makassar'
                ]);
                $usedKey = 'tariff_key';
            }

            $results['tests']['search_destination'] = [
                'url' => $url,
                'used_key' => $usedKey,
                'status' => $response->status(),
                'success' => $response->successful(),
                'data_count' => count($response->json()['data'] ?? []),
                'sample' => array_slice($response->json()['data'] ?? [], 0, 3),
                'error' => $response->successful() ? null : $response->body()
            ];
        } catch (\Exception $e) {
            $results['tests']['search_destination'] = [
                'error' => $e->getMessage()
            ];
        }

        // Test 2: Calculate Shipping Cost (if search successful)
        if (!empty($results['tests']['search_destination']['sample'])) {
            try {
                $sample = $results['tests']['search_destination']['sample'][0] ?? null;
                $destinationId = $sample['destination_id'] ?? null;
                
                if ($destinationId) {
                    $url = "{$this->baseUrl}/tariff/api/v1/calculate";
                    $response = Http::withOptions([
                        'verify' => false,
                    ])->withHeaders([
                        'x-api-key' => $this->deliveryApiKey, // Try delivery key
                        'Accept' => 'application/json',
                    ])->get($url, [
                        'shipper_destination_id' => $destinationId, // Origin Makassar
                        'receiver_destination_id' => $destinationId, // Destination same for test
                        'weight' => 1, // 1 kg
                    ]);

                    $results['tests']['calculate_cost'] = [
                        'url' => $url,
                        'params' => [
                            'shipper_destination_id' => $destinationId,
                            'receiver_destination_id' => $destinationId,
                            'weight' => 1
                        ],
                        'status' => $response->status(),
                        'success' => $response->successful(),
                        'data' => $response->json(),
                    ];
                }
            } catch (\Exception $e) {
                $results['tests']['calculate_cost'] = [
                    'error' => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Komerce API Test Results',
            'results' => $results
        ]);
    }
}
