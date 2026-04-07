# Panduan Konfigurasi Shipping / Ongkir

## 📍 Kota Asal Pengiriman
Sistem sekarang sudah dikonfigurasi dengan kota asal: **Parepare, Sulawesi Selatan**

```env
SHIPPING_ORIGIN_CITY_ID=73.72
```

### Cara Mengganti Kota Asal:
1. Buka terminal dan jalankan:
   ```bash
   cd D:\web hrshopku\backend
   php find-parepare.php
   ```
2. Edit file untuk mencari kota lain (ganti 'PARE' dengan nama kota Anda)
3. Salin `City ID` yang ditemukan
4. Update `.env`:
   ```env
   SHIPPING_ORIGIN_CITY_ID=73.72  # ganti dengan City ID Anda
   ```
5. Clear cache:
   ```bash
   php artisan config:clear
   ```

## 💰 Cara Mengatur Harga Ongkir

Karena RajaOngkir sudah deprecated, sistem menggunakan **Local Estimator** dengan harga yang bisa Anda atur sendiri.

### Edit di file `.env`:

```env
# Berat default per produk (dalam gram)
SHIPPING_DEFAULT_WEIGHT_GRAM=500

# Tarif JNE
SHIPPING_BASE_JNE=30000      # Harga dasar (1 kg pertama)
SHIPPING_PERKG_JNE=10000     # Tambahan per kg berikutnya

# Tarif TIKI
SHIPPING_BASE_TIKI=28000     # Harga dasar
SHIPPING_PERKG_TIKI=9000     # Tambahan per kg

# Tarif POS Indonesia
SHIPPING_BASE_POS=25000      # Harga dasar
SHIPPING_PERKG_POS=8000      # Tambahan per kg
```

### Cara Kerja Perhitungan:
```
Total Ongkir = Harga Dasar + (Jumlah KG tambahan × Harga per KG)
```

**Contoh:**
- Customer beli 2 produk @ 500 gram = 1000 gram = 1 kg
- Kurir: JNE
- Perhitungan: 
  - 1 kg pertama = Rp 30.000 (SHIPPING_BASE_JNE)
  - Tidak ada kg tambahan
  - **Total = Rp 30.000**

**Contoh 2:**
- Customer beli 5 produk @ 500 gram = 2500 gram = 2.5 kg → dibulatkan ke 3 kg
- Kurir: JNE  
- Perhitungan:
  - 1 kg pertama = Rp 30.000
  - 2 kg tambahan = 2 × Rp 10.000 = Rp 20.000
  - **Total = Rp 50.000**

## 🔄 Update Harga:

1. Edit file `D:\web hrshopku\backend\.env`
2. Ubah nilai `SHIPPING_BASE_*` dan `SHIPPING_PERKG_*` sesuai kebutuhan
3. Clear config cache:
   ```bash
   cd D:\web hrshopku\backend
   php artisan config:clear
   ```
4. Refresh halaman checkout

## 📊 Status Providers:

- ❌ **RajaOngkir**: Deprecated (410) - semua endpoint tidak aktif
- ✅ **Binderbyte**: Active - untuk data provinsi/kota
- ✅ **EMSIFA**: Active - backup data wilayah
- ✅ **Local Estimator**: Active - perhitungan ongkir berdasarkan config

## 🧪 Test Ongkir:

```bash
cd D:\web hrshopku\backend
php test-shipping-cost.php
```

Akan menampilkan perhitungan ongkir dari Parepare ke Jakarta untuk 2 produk.

## 📦 Fitur Tracking / Cek Resi

Sistem sudah dilengkapi dengan fitur tracking menggunakan Binderbyte API.

### Endpoint API:
```
GET /api/shipping/track?waybill=RESI123&courier=jne
```

**Parameter:**
- `waybill` atau `resi`: Nomor resi pengiriman (wajib)
- `courier`: Kode kurir (default: jne)

**Kurir yang didukung:**
- `jne` - JNE
- `jnt` - J&T Express
- `tiki` - TIKI
- `pos` - POS Indonesia
- `sicepat` - SiCepat
- `anteraja` - AnterAja
- `ninja` - Ninja Xpress
- `lion` - Lion Parcel
- `idexpress` - ID Express
- `spx` - Shopee Express

### Frontend:
Akses halaman tracking di: **http://localhost:3000/track**

User dapat:
1. Masukkan nomor resi
2. Pilih kurir
3. Klik "Lacak Paket"
4. Melihat detail pengiriman dan riwayat tracking

### Response API:
```json
{
  "success": true,
  "courier": "JNE",
  "waybill": "RESI123",
  "summary": {
    "status": "DELIVERED",
    "service": "REG",
    "origin": "PAREPARE",
    "destination": "JAKARTA",
    "weight": "1 kg"
  },
  "history": [
    {
      "date": "2025-11-03 10:00",
      "desc": "Paket telah diterima",
      "location": "JAKARTA"
    }
  ]
}
```

### Test Tracking:
```bash
cd D:\web hrshopku\backend
php test-tracking.php
```

**Note:** Untuk test dengan data real, gunakan nomor resi asli dari pengiriman yang sudah ada.

