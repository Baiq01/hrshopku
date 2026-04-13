<?php
// Find Parepare city ID from Binderbyte
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$bbKey = config('services.binderbyte.api_key');
$bbBase = rtrim(config('services.binderbyte.base_url'), '/');

echo "=== Mencari Provinsi Sulawesi Selatan ===\n";
$client = Illuminate\Support\Facades\Http::timeout(15)->withoutVerifying();
$resp = $client->get($bbBase . '/wilayah/provinsi', ['api_key' => $bbKey]);

if ($resp->ok()) {
    $data = $resp->json();
    $provinces = $data['value'] ?? [];
    $sulsel = null;
    foreach ($provinces as $p) {
        if (stripos($p['name'], 'SULAWESI SELATAN') !== false) {
            $sulsel = $p;
            break;
        }
    }
    
    if ($sulsel) {
        echo "Provinsi ditemukan:\n";
        echo "  ID: {$sulsel['id']}\n";
        echo "  Nama: {$sulsel['name']}\n\n";
        
        echo "=== Mencari Kota Parepare ===\n";
        $resp2 = $client->get($bbBase . '/wilayah/kabupaten', [
            'api_key' => $bbKey,
            'id_provinsi' => $sulsel['id']
        ]);
        
        if ($resp2->ok()) {
            $data2 = $resp2->json();
            $cities = $data2['value'] ?? [];
            
            echo "Semua kota di Sulawesi Selatan:\n";
            $parepare = null;
            foreach ($cities as $c) {
                echo "  - {$c['id']}: {$c['name']}\n";
                if (stripos($c['name'], 'PARE') !== false || stripos($c['name'], 'PAREPARE') !== false) {
                    $parepare = $c;
                }
            }
            
            if ($parepare) {
                echo "\n✅ Parepare ditemukan!\n";
                echo "  City ID: {$parepare['id']}\n";
                echo "  Nama: {$parepare['name']}\n\n";
                echo "Gunakan ID ini untuk SHIPPING_ORIGIN_CITY_ID\n";
            } else {
                echo "\n⚠️  Parepare tidak ditemukan di daftar. Gunakan ID kota terdekat.\n";
            }
        }
    }
}
