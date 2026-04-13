# RajaOngkir API Integration

API untuk menghitung ongkir menggunakan RajaOngkir Komerce.

## Base URL
```
Backend: http://localhost:8000/api/rajaongkir
RajaOngkir: https://rajaongkir.komerce.id/api/v1
```

## API Key
```
XGl4XnNKe83d8dd135a3bf6dSqOsOgDY
```

## Endpoints

### 1. Get Provinces
Get list of all provinces in Indonesia.

**Endpoint:** `GET /api/rajaongkir/provinces`

**Response:**
```json
{
  "success": true,
  "data": {
    "meta": {
      "code": 200,
      "status": "success"
    },
    "data": [
      {
        "province_id": "1",
        "province_name": "Bali"
      }
    ]
  }
}
```

### 2. Get Cities
Get cities by province ID.

**Endpoint:** `GET /api/rajaongkir/cities?province_id={id}`

**Query Parameters:**
- `province_id` (required): Province ID

**Response:**
```json
{
  "success": true,
  "data": {
    "meta": {
      "code": 200,
      "status": "success"
    },
    "data": [
      {
        "city_id": "1",
        "province_id": "1",
        "city_name": "Badung",
        "type": "Kabupaten",
        "postal_code": "80351"
      }
    ]
  }
}
```

### 3. Get Subdistricts
Get subdistricts by city ID.

**Endpoint:** `GET /api/rajaongkir/subdistricts?city_id={id}`

**Query Parameters:**
- `city_id` (required): City ID

**Response:**
```json
{
  "success": true,
  "data": {
    "meta": {
      "code": 200,
      "status": "success"
    },
    "data": [
      {
        "subdistrict_id": "1",
        "city_id": "1",
        "subdistrict_name": "Abiansemal"
      }
    ]
  }
}
```

### 4. Calculate Shipping Cost
Calculate shipping cost between two locations.

**Endpoint:** `POST /api/rajaongkir/calculate-cost`

**Request Body:**
```json
{
  "origin_subdistrict_id": 5505,
  "destination_subdistrict_id": 6234,
  "weight": 1000,
  "courier": "jne"
}
```

**Parameters:**
- `origin_subdistrict_id` (required): Origin subdistrict ID
- `destination_subdistrict_id` (required): Destination subdistrict ID
- `weight` (required): Weight in grams (minimum: 1)
- `courier` (required): Courier code (jne, tiki, pos, jnt, sicepat, anteraja, etc.)

**Response:**
```json
{
  "success": true,
  "data": {
    "meta": {
      "code": 200,
      "status": "success"
    },
    "data": {
      "origin": {
        "subdistrict_id": "5505",
        "subdistrict_name": "Menteng",
        "city": "Jakarta Pusat",
        "province": "DKI Jakarta"
      },
      "destination": {
        "subdistrict_id": "6234",
        "subdistrict_name": "Sukajadi",
        "city": "Bandung",
        "province": "Jawa Barat"
      },
      "services": [
        {
          "service_name": "REG",
          "service_display": "Regular",
          "description": "Layanan Reguler",
          "cost": 9000,
          "etd": "1-2 Hari"
        },
        {
          "service_name": "YES",
          "service_display": "Yakin Esok Sampai",
          "description": "Yakin Esok Sampai",
          "cost": 15000,
          "etd": "1 Hari"
        }
      ]
    }
  }
}
```

### 5. Get Couriers
Get list of available couriers.

**Endpoint:** `GET /api/rajaongkir/couriers`

**Response:**
```json
{
  "success": true,
  "data": {
    "meta": {
      "code": 200,
      "status": "success"
    },
    "data": [
      {
        "courier_code": "jne",
        "courier_name": "JNE"
      },
      {
        "courier_code": "tiki",
        "courier_name": "TIKI"
      },
      {
        "courier_code": "pos",
        "courier_name": "POS Indonesia"
      }
    ]
  }
}
```

### 6. Track Delivery (Tracking Pengiriman)
Track real-time shipment delivery status.

**Endpoint:** `GET /api/rajaongkir/track-delivery`

**Query Parameters:**
- `waybill` (required): Nomor resi/waybill
- `courier` (required): Kode kurir (jne, tiki, pos, jnt, sicepat, anteraja, etc.)

**Example Request:**
```
GET /api/rajaongkir/track-delivery?waybill=8327823782378&courier=jne
```

**Response:**
```json
{
  "success": true,
  "data": {
    "meta": {
      "code": 200,
      "status": "success"
    },
    "data": {
      "waybill": "8327823782378",
      "courier": {
        "code": "jne",
        "name": "JNE"
      },
      "origin": {
        "city": "JAKARTA",
        "province": "DKI JAKARTA"
      },
      "destination": {
        "city": "BANDUNG",
        "province": "JAWA BARAT"
      },
      "shipper": {
        "name": "HRSHOPKU",
        "phone": "08123456789"
      },
      "receiver": {
        "name": "CUSTOMER NAME",
        "phone": "08987654321",
        "address": "Jl. Customer Address"
      },
      "status": {
        "code": "DELIVERED",
        "description": "Delivered"
      },
      "history": [
        {
          "date": "2025-11-07 14:30:00",
          "description": "DELIVERED TO [CUSTOMER NAME | 07-11-2025 14:30]",
          "location": "BANDUNG"
        },
        {
          "date": "2025-11-07 08:15:00",
          "description": "WITH DELIVERY COURIER",
          "location": "BANDUNG"
        },
        {
          "date": "2025-11-06 18:00:00",
          "description": "RECEIVED AT DESTINATION [BANDUNG]",
          "location": "BANDUNG"
        },
        {
          "date": "2025-11-06 10:00:00",
          "description": "SHIPMENT FORWARDED TO DESTINATION",
          "location": "JAKARTA"
        },
        {
          "date": "2025-11-05 16:30:00",
          "description": "SHIPMENT RECEIVED AT ORIGIN [JAKARTA]",
          "location": "JAKARTA"
        }
      ]
    }
  }
}
```

## Frontend Usage Example

```javascript
import {
  getProvinces,
  getCities,
  getSubdistricts,
  calculateShippingCost,
  getCouriers,
  trackDelivery
} from '../lib/rajaongkir';

// Get provinces
const provinces = await getProvinces();

// Get cities by province
const cities = await getCities(provinceId);

// Get subdistricts by city
const subdistricts = await getSubdistricts(cityId);

// Calculate shipping cost
const result = await calculateShippingCost({
  origin_subdistrict_id: 5505,
  destination_subdistrict_id: 6234,
  weight: 1000,
  courier: 'jne'
});

// Get available couriers
const couriers = await getCouriers();

// Track delivery
const tracking = await trackDelivery('8327823782378', 'jne');
console.log('Status:', tracking.data.data.status.description);
console.log('History:', tracking.data.data.history);
```

## Error Handling

Semua endpoint mengembalikan error dengan format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Notes

1. **Weight**: Berat harus dalam gram (minimum 1 gram)
2. **Courier**: Kode kurir harus lowercase (jne, tiki, pos, dll)
3. **Subdistrict ID**: Untuk perhitungan ongkir yang akurat, gunakan subdistrict_id
4. **SSL Verification**: Dinonaktifkan untuk development (verify: false)
5. **API Keys**: 
   - `RAJAONGKIR_API_KEY`: Untuk calculate cost dan location (XGl4XnNKe83d8dd135a3bf6dSqOsOgDY)
   - `RAJAONGKIR_DELIVERY_API_KEY`: Untuk tracking delivery (JwcOES4ge83d8dd135a3bf6dw3olGTEs)
6. **Tracking**: Nomor resi harus valid dan sesuai dengan kurir yang dipilih

## Testing

Test API menggunakan curl atau Postman:

```bash
# Get Provinces
curl -X GET "http://localhost:8000/api/rajaongkir/provinces"

# Get Cities
curl -X GET "http://localhost:8000/api/rajaongkir/cities?province_id=9"

# Get Subdistricts
curl -X GET "http://localhost:8000/api/rajaongkir/subdistricts?city_id=152"

# Calculate Cost
curl -X POST "http://localhost:8000/api/rajaongkir/calculate-cost" \
  -H "Content-Type: application/json" \
  -d '{
    "origin_subdistrict_id": 5505,
    "destination_subdistrict_id": 6234,
    "weight": 1000,
    "courier": "jne"
  }'

# Track Delivery
curl -X GET "http://localhost:8000/api/rajaongkir/track-delivery?waybill=8327823782378&courier=jne"
```

## Integration dengan Halaman TrackShipment

API tracking delivery ini bisa diintegrasikan dengan halaman `TrackShipment.jsx` yang sudah ada:

```javascript
// frontend/src/pages/TrackShipment.jsx
import { trackDelivery } from '../lib/rajaongkir';

const handleTrack = async () => {
  try {
    const result = await trackDelivery(waybill, courier);
    if (result.success) {
      setTrackingData(result.data.data);
    }
  } catch (error) {
    setError('Gagal melacak paket');
  }
};
```
