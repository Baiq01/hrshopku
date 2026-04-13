# Panduan Fitur Nomor Resi & Tracking

## 🎯 Alur Kerja Sistem

### 1. **Customer Checkout & Payment**
- Customer melakukan checkout dan payment melalui Midtrans
- System menyimpan informasi kurir (JNE/TIKI/POS/dll)
- Setelah payment sukses, customer mendapat notifikasi:
  ```
  Pembayaran berhasil!
  
  Nomor Order: HR1730628XXX
  Kurir: JNE
  
  Nomor resi akan diberikan setelah paket dikirim.
  ```

### 2. **Admin Input Nomor Resi**
- Admin login ke `/admin/orders`
- Klik order untuk melihat detail
- Input nomor resi di form:
  - **Status**: Update ke "shipped" 
  - **No. Resi**: Masukkan nomor resi dari kurir
  - **Kurir**: Otomatis terisi dari order
- Klik "Simpan"

### 3. **Customer Tracking**
Customer dapat tracking paket dengan 2 cara:

#### Cara 1: Melalui Menu "Pesanan Saya"
1. Login ke akun
2. Klik "Pesanan" di header
3. Pilih order
4. Klik "Lacak Paket" (jika resi sudah ada)

#### Cara 2: Melalui Menu "Lacak Paket"
1. Buka `/track` (tidak perlu login)
2. Input nomor resi
3. Pilih kurir
4. Klik "Lacak Paket"

## 📊 Database Schema

### Tabel: orders
Kolom baru yang ditambahkan:
```sql
tracking_number VARCHAR(255) NULL    -- Nomor resi
courier VARCHAR(255) NULL            -- Kurir (JNE, TIKI, POS, dll)
```

## 🔌 API Endpoints

### 1. Admin Update Order (dengan resi)
```http
PATCH /api/admin/orders/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "shipped",
  "tracking_number": "JP1234567890"
}
```

**Response:**
```json
{
  "id": 1,
  "order_number": "HR1730628XXX",
  "status": "shipped",
  "tracking_number": "JP1234567890",
  "courier": "JNE",
  ...
}
```

### 2. Track Shipment
```http
GET /api/shipping/track?waybill=JP1234567890&courier=jne
```

**Response:**
```json
{
  "success": true,
  "courier": "JNE",
  "waybill": "JP1234567890",
  "summary": {
    "status": "DELIVERED",
    "service": "REG",
    "origin": "PAREPARE",
    "destination": "JAKARTA"
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

## 🎨 Frontend Pages

### 1. Admin Order Detail (`/admin/orders/:id`)
**Features:**
- Form input nomor resi
- Update status order
- Menyimpan kurir secara otomatis dari checkout

**Screenshot Flow:**
```
[Admin Orders List] → [Click Order] → [Input Resi] → [Save]
```

### 2. Customer Orders (`/my-orders`)
**Features:**
- List semua order customer
- Status order (pending/paid/shipped/etc)
- Nomor resi (jika sudah ada)
- Button "Lacak Paket"

**Status yang ditampilkan:**
- 🟡 Pending
- 🟢 Paid
- 🔵 Shipped (dengan resi)
- 🔴 Canceled

### 3. Track Shipment (`/track`)
**Features:**
- Form input resi manual
- Auto-track dari query params (`?waybill=XXX&courier=jne`)
- Support 10+ kurir
- Tampilan detail tracking

**Auto-Track URL:**
```
/track?waybill=JP1234567890&courier=jne
```

## 💡 Contoh Penggunaan

### Skenario 1: Order Baru
1. Customer checkout produk → Pilih JNE REG
2. Payment sukses → Status: "paid", courier: "JNE"
3. Admin terima order → Input resi "JP1234567890"
4. Status update → "shipped" + nomor resi
5. Customer klik "Lacak Paket" → Redirect ke tracking

### Skenario 2: Customer Check Status
1. Customer login
2. Klik "Pesanan" di header
3. Lihat list order dengan status
4. Order dengan resi → Button "Lacak Paket" aktif
5. Klik → Auto redirect ke tracking page

### Skenario 3: Tracking Manual
1. Customer dapat nomor resi via WhatsApp/Email
2. Buka `/track` (tanpa login)
3. Input resi + pilih kurir
4. Lihat detail tracking

## 🔧 Configuration

### Kurir yang Didukung Tracking:
- ✅ JNE
- ✅ J&T Express
- ✅ TIKI
- ✅ POS Indonesia
- ✅ SiCepat
- ✅ AnterAja
- ✅ Ninja Xpress
- ✅ Lion Parcel
- ✅ ID Express
- ✅ Shopee Express

### Environment Variables:
```env
BINDERBYTE_API_KEY=your_api_key
BINDERBYTE_BASE_URL=https://api.binderbyte.com
BINDERBYTE_VERIFY_SSL=false
```

## 🧪 Testing

### Test Admin Input Resi:
1. Login admin: `/admin/login`
2. Buka orders: `/admin/orders`
3. Pilih order dengan status "paid"
4. Input resi: "TEST123456"
5. Update status: "shipped"
6. Save → Check database

### Test Customer Tracking:
1. Buka: `/track?waybill=TEST123456&courier=jne`
2. Verify form auto-filled
3. Click "Lacak Paket"
4. Check response (404 karena resi test)

### Test with Real Resi:
1. Dapatkan resi real dari order JNE/TIKI/dll
2. Input di `/track`
3. Verify tracking history muncul

## 📝 Notes

- Nomor resi **opsional** - order bisa dibuat tanpa resi
- Resi bisa diupdate kapan saja oleh admin
- Customer bisa tracking tanpa login (via menu "Lacak Paket")
- Link "Pesanan" hanya muncul jika user sudah login
- Tracking menggunakan Binderbyte API (real-time dari kurir)

## 🚀 Future Enhancements

1. **Email Notification**: Kirim email otomatis saat resi ditambahkan
2. **WhatsApp Integration**: Send resi via WhatsApp
3. **Auto-Status Update**: Update status otomatis berdasarkan tracking
4. **Bulk Upload**: Admin upload resi via CSV/Excel
5. **Customer Notification Center**: In-app notification saat resi available
