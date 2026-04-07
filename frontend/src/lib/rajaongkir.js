import api from './api';

/**
 * Get list of provinces
 */
export async function getProvinces() {
  try {
    const response = await api.get('/rajaongkir/provinces');
    return response.data;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw error;
  }
}

/**
 * Get cities by province ID
 * @param {number} provinceId 
 */
export async function getCities(provinceId) {
  try {
    const response = await api.get('/rajaongkir/cities', {
      params: { province_id: provinceId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
}

/**
 * Get subdistricts by city ID
 * @param {number} cityId 
 */
export async function getSubdistricts(cityId) {
  try {
    const response = await api.get('/rajaongkir/subdistricts', {
      params: { city_id: cityId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching subdistricts:', error);
    throw error;
  }
}

/**
 * Calculate shipping cost
 * @param {object} params 
 * @param {number} params.origin_id - Origin Komerce destination ID
 * @param {number} params.destination_id - Destination Komerce destination ID
 * @param {number} params.weight - Weight in grams
 * @param {string} params.courier - Courier code (jne, jnt, sicepat, etc.)
 * @param {number} params.item_value - Item value in IDR (for Komerce API)
 */
export async function calculateShippingCost({
  origin_id,
  destination_id,
  weight,
  courier,
  item_value = 100000
}) {
  try {
    const response = await api.get('/rajaongkir/calculate-cost', {
      params: {
        origin_id,
        destination_id,
        weight,
        courier,
        item_value
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error calculating shipping cost:', error);
    throw error;
  }
}

/**
 * Get available couriers
 */
export async function getCouriers() {
  try {
    const response = await api.get('/rajaongkir/couriers');
    return response.data;
  } catch (error) {
    console.error('Error fetching couriers:', error);
    throw error;
  }
}

/**
 * Track shipment delivery
 * @param {string} waybill - Waybill/resi number
 * @param {string} courier - Courier code (jne, tiki, pos, etc.)
 */
export async function trackDelivery(waybill, courier) {
  try {
    const response = await api.get('/rajaongkir/track-delivery', {
      params: { 
        waybill,
        courier: courier.toLowerCase()
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error tracking delivery:', error);
    throw error;
  }
}

/**
 * Search destination by keyword (city, subdistrict, postal code)
 * Uses Komerce API for real-time search
 * @param {string} keyword - Search keyword (min 3 characters)
 */
export async function searchDestination(keyword) {
  try {
    const response = await api.get('/rajaongkir/search-destination', {
      params: { keyword }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching destination:', error);
    throw error;
  }
}
