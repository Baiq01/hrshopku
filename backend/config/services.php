<?php

return [
    // other services...

    'midtrans' => [
        'server_key' => env('MIDTRANS_SERVER_KEY'),
        'client_key' => env('MIDTRANS_CLIENT_KEY'),
        'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
        'verify_ssl' => env('MIDTRANS_VERIFY_SSL', true),
    ],

    // Binderbyte for wilayah data
    'binderbyte' => [
        'api_key' => env('BINDERBYTE_API_KEY'),
        'base_url' => env('BINDERBYTE_BASE_URL', 'https://api.binderbyte.com'),
        'verify_ssl' => env('BINDERBYTE_VERIFY_SSL', true),
    ],

    // RajaOngkir (Next v3 API)
    'rajaongkir' => [
        'api_key' => env('RAJAONGKIR_API_KEY'), // for shipping cost calculations
        'delivery_api_key' => env('RAJAONGKIR_DELIVERY_API_KEY'), // for shipping delivery/tracking
        'base_url' => env('RAJAONGKIR_BASE_URL', 'https://api.rajaongkir.com/next/v3'),
        'verify_ssl' => env('RAJAONGKIR_VERIFY_SSL', true),
    ],

    // Shipping estimator configuration (since Binderbyte doesn't provide cost)
    'shipping' => [
        'default_weight_gram' => env('SHIPPING_DEFAULT_WEIGHT_GRAM', 500),
        'origin_city_id' => env('SHIPPING_ORIGIN_CITY_ID'), // optional, for display only
        'rates' => [
            'jne' => [
                'base' => env('SHIPPING_BASE_JNE', 30000),
                'perkg' => env('SHIPPING_PERKG_JNE', 10000),
            ],
            'tiki' => [
                'base' => env('SHIPPING_BASE_TIKI', 28000),
                'perkg' => env('SHIPPING_PERKG_TIKI', 9000),
            ],
            'pos' => [
                'base' => env('SHIPPING_BASE_POS', 25000),
                'perkg' => env('SHIPPING_PERKG_POS', 8000),
            ],
        ],
    ],
];
