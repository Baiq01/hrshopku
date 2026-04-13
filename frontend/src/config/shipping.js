// Shipping Configuration
// Origin location: Parepare, Sulawesi Selatan

// Komerce Destination ID untuk LABUKKANG, UJUNG, PAREPARE (Sulawesi Selatan)
// This is the origin for all shipments
export const ORIGIN_SUBDISTRICT_ID = 82026;

// Default weight per product (in grams)
// If products don't have weight field, this will be used
export const DEFAULT_PRODUCT_WEIGHT = 500;

// Available couriers from Komerce API
// Empty value means all couriers will be shown
export const COURIERS = [
  { code: '', name: 'Semua Kurir' },
  { code: 'jne', name: 'JNE' },
  { code: 'jnt', name: 'J&T Express' },
  { code: 'sicepat', name: 'SiCepat' },
  { code: 'ninja', name: 'Ninja Express' },
  { code: 'idexpress', name: 'ID Express' },
  { code: 'sap', name: 'SAP Express' },
  { code: 'lion', name: 'Lion Parcel' },
];
