import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { getCart, totalAmount, clearCart } from '../lib/cart';
import BuyerLayout from '../components/BuyerLayout';
import api from '../lib/api';
import { MIDTRANS_CLIENT_KEY } from '../config';
import { searchDestination, calculateShippingCost } from '../lib/rajaongkir';
import { ORIGIN_SUBDISTRICT_ID, DEFAULT_PRODUCT_WEIGHT, COURIERS } from '../config/shipping';
import { useToast } from '../components/Toast';

function loadMidtrans(clientKey){
  return new Promise((resolve, reject) => {
    if (document.getElementById('midtrans-script')) return resolve();
    const s = document.createElement('script');
    s.id = 'midtrans-script';
    s.src = `https://app.sandbox.midtrans.com/snap/snap.js`;
    s.setAttribute('data-client-key', clientKey);
    s.onload = () => resolve();
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

// Debounce hook for search
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Checkout(){
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    destination_id: '', // Komerce destination ID
    destination_label: '', // Full label
    subdistrict_name: '',
    district_name: '',
    city_name: '',
    province_name: '',
    postal_code: '',
    courier: '',
    shipping_service: '',
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Search destination states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const [shipOptions, setShipOptions] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [loadingShipping, setLoadingShipping] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(()=>{
    setItems(getCart());
    const onUpd = ()=> setItems(getCart());
    window.addEventListener('cart_updated', onUpd);
    return ()=> window.removeEventListener('cart_updated', onUpd);
  },[]);

  const subtotal = useMemo(()=> totalAmount(), [items]);
  const grandTotal = useMemo(()=> subtotal + (shippingCost||0), [subtotal, shippingCost]);

  // Search destination when query changes
  useEffect(() => {
    if (debouncedSearch.length < 3) {
      setSearchResults([]);
      return;
    }

    const doSearch = async () => {
      setIsSearching(true);
      try {
        const result = await searchDestination(debouncedSearch);
        if (result.success && result.data) {
          setSearchResults(result.data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    doSearch();
  }, [debouncedSearch]);

  // Select destination from search results
  const selectDestination = useCallback((dest) => {
    setForm(prev => ({
      ...prev,
      destination_id: dest.id,
      destination_label: dest.label,
      subdistrict_name: dest.subdistrict_name || '',
      district_name: dest.district_name || '',
      city_name: dest.city_name || '',
      province_name: dest.province_name || '',
      postal_code: dest.zip_code || '',
    }));
    setSearchQuery(dest.label);
    setShowResults(false);
    setShipOptions([]);
    setShippingCost(0);
  }, []);

  async function checkShipping(){
    if (!form.destination_id){
      return toast.warning('Pilih alamat tujuan dulu.');
    }
    
    try{
      setLoadingShipping(true);
      setShipOptions([]);
      
      // Calculate total weight (use product weight or default)
      const totalWeight = items.reduce((sum, item) => {
        const weight = item.weight || DEFAULT_PRODUCT_WEIGHT;
        return sum + (item.quantity * weight);
      }, 0);
      
      // Item value for Komerce API
      const itemValue = subtotal || 100000;
      
      const result = await calculateShippingCost({
        origin_id: ORIGIN_SUBDISTRICT_ID,
        destination_id: form.destination_id,
        weight: totalWeight,
        courier: form.courier || '', // Empty means all couriers
        item_value: itemValue
      });
      
      if (result.success && result.data?.data?.services) {
        let services = result.data.data.services.map(svc => ({
          service: svc.service_name,
          description: svc.service_display || svc.description || '',
          cost: svc.cost,
          etd: svc.etd || '-',
          courier: svc.courier || form.courier?.toUpperCase() || 'UNKNOWN',
          is_cod: svc.is_cod || false
        }));
        
        // Filter by selected courier if specified (not empty)
        if (form.courier) {
          const courierUpper = form.courier.toUpperCase();
          services = services.filter(s => s.courier === courierUpper);
        }
        
        // Sort by cost
        services.sort((a, b) => a.cost - b.cost);
        
        setShipOptions(services);
        
        if (services[0]){
          setForm(prev=> ({...prev, shipping_service: services[0].service }));
          setShippingCost(services[0].cost||0);
        }
      } else {
        toast.warning('Tidak ada layanan pengiriman tersedia untuk tujuan ini');
        setShipOptions([]);
        setShippingCost(0);
      }
    } catch(err) {
      console.error('Error calculating shipping:', err);
      toast.error('Gagal menghitung ongkir. ' + (err.response?.data?.message || err.message));
      setShipOptions([]);
      setShippingCost(0);
    } finally {
      setLoadingShipping(false);
    }
  }

  async function pay(){
    if (!items.length) return toast.warning('Keranjang kosong');

    const token = localStorage.getItem('hr_token');
    if (!token) {
      if (window.confirm('Anda harus login terlebih dahulu. Login sekarang?')) window.location.href = '/login';
      return;
    }

    // minimal validation
    if (!form.name || !form.phone || !form.address || !form.destination_id || !form.postal_code) {
      return toast.warning('Lengkapi data pengiriman terlebih dahulu.');
    }
    if (!form.shipping_service || !form.courier) {
      return toast.warning('Silakan cek ongkir dan pilih layanan pengiriman.');
    }

    try{
      setSubmitting(true);
      await loadMidtrans(MIDTRANS_CLIENT_KEY);
      const resp = await api.post('/checkout', {
        items,
        subtotal,
        shipping_cost: shippingCost,
        grand_total: grandTotal,
        customer: {
          name: form.name,
          phone: form.phone,
        },
        shipping: {
          address: form.address,
          city: form.city_name,
          province: form.province_name,
          subdistrict: form.subdistrict_name,
          district: form.district_name,
          postal_code: form.postal_code,
          method: form.shipping_service,
          cost: shippingCost,
          destination_id: form.destination_id,
          courier: form.courier,
          service: form.shipping_service,
        }
      });
      const token_snap = resp.data.snap_token;
      const orderId = resp.data?.order?.order_number;
      if (!token_snap) return toast.error('Gagal membuat transaksi');
      window.snap.pay(token_snap, {
        onSuccess: function(){
          clearCart();
          if (orderId) api.post('/midtrans/refresh', { order_id: orderId }).catch(()=>{});
          
          // Show success message
          toast.success(`Pembayaran berhasil! Nomor Order: ${orderId}`);
          
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        },
        onPending: function(){
          toast.info('Pembayaran pending, menunggu konfirmasi.');
          if (orderId) api.post('/midtrans/refresh', { order_id: orderId }).catch(()=>{});
        },
        onError: function(){
          toast.error('Pembayaran error');
        }
      });
    }catch(err){
      const data = err.response?.data;
      let msg = 'Checkout gagal';
      if (data) msg = data.message || data.details || data.error || msg;
      toast.error(msg);
      console.error('Checkout error', err);
    }finally{
      setSubmitting(false);
    }
  }

  return (
    <BuyerLayout title="Checkout">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-semibold text-lg mb-4">Data Pengiriman</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</label>
              <input className="input" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="Nama lengkap" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">No. HP</label>
              <input className="input" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} placeholder="08xxxxxxxxxx" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Alamat Lengkap</label>
              <input className="input" value={form.address} onChange={e=>setForm({...form, address: e.target.value})} placeholder="Nama jalan, nomor rumah, RT/RW" />
            </div>
            
            {/* Search Destination - Autocomplete */}
            <div className="md:col-span-2 relative">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Cari Kelurahan/Kecamatan/Kota <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input 
                  className="input pr-10" 
                  value={searchQuery} 
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                    // Clear selection when typing new query
                    if (form.destination_id) {
                      setForm(prev => ({...prev, destination_id: '', destination_label: ''}));
                    }
                  }}
                  onFocus={() => setShowResults(true)}
                  placeholder="Ketik nama kelurahan, kecamatan, atau kota (min 3 huruf)"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-rose-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((dest, idx) => (
                    <button
                      key={dest.id || idx}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-rose-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-rose-50"
                      onClick={() => selectDestination(dest)}
                    >
                      <div className="text-sm font-medium text-gray-900">{dest.subdistrict_name}</div>
                      <div className="text-xs text-gray-500">
                        {dest.district_name}, {dest.city_name}, {dest.province_name} - {dest.zip_code}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {showResults && searchQuery.length >= 3 && !isSearching && searchResults.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
                  Tidak ditemukan hasil untuk "{searchQuery}"
                </div>
              )}
            </div>
            
            {/* Selected Destination Display */}
            {form.destination_id && (
              <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-green-800">Alamat Tujuan Dipilih</div>
                    <div className="text-sm text-green-700">
                      {form.subdistrict_name}, {form.district_name}, {form.city_name}
                    </div>
                    <div className="text-xs text-green-600">
                      {form.province_name} - {form.postal_code}
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        destination_id: '',
                        destination_label: '',
                        subdistrict_name: '',
                        district_name: '',
                        city_name: '',
                        province_name: '',
                        postal_code: ''
                      }));
                      setSearchQuery('');
                      setShipOptions([]);
                      setShippingCost(0);
                    }}
                    className="text-green-600 hover:text-green-800 text-xs underline"
                  >
                    Ubah
                  </button>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Kode Pos</label>
              <input 
                className="input bg-gray-50" 
                value={form.postal_code} 
                onChange={e=>setForm({...form, postal_code: e.target.value})} 
                placeholder="XXXXX"
                readOnly={!!form.destination_id}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Kurir</label>
              <select className="input" value={form.courier} onChange={e=> {
                setForm({...form, courier: e.target.value, shipping_service: ''});
                setShipOptions([]);
                setShippingCost(0);
              }}>
                <option value="">Pilih Kurir</option>
                {COURIERS.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <button 
                type="button" 
                onClick={checkShipping} 
                disabled={loadingShipping || !form.destination_id}
                className="btn btn-outline disabled:opacity-50"
              >
                {loadingShipping ? 'Menghitung...' : 'Cek Ongkir'}
              </button>
              {!form.destination_id && (
                <p className="text-xs text-gray-500 mt-1">Pilih alamat tujuan terlebih dahulu</p>
              )}
            </div>
            {shipOptions.length>0 && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Pilih Layanan</label>
                <div className="space-y-2">
                  {shipOptions.map((opt, idx) => (
                    <label key={`${opt.courier}-${opt.service}-${idx}`} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                      <input type="radio" name="svc" checked={form.shipping_service === opt.service} onChange={()=>{ setForm(prev=> ({...prev, shipping_service: opt.service, courier: opt.courier.toLowerCase() })); setShippingCost(opt.cost||0); }} />
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{opt.courier} {opt.service}</div>
                        <div className="text-xs text-gray-600">
                          {opt.description} {opt.etd && opt.etd !== '-' ? `(ETD: ${opt.etd})` : ''}
                          {opt.is_cod && <span className="ml-2 text-green-600 font-medium">✓ COD</span>}
                        </div>
                      </div>
                      <span className="font-bold text-rose-700">Rp {parseInt(opt.cost).toLocaleString('id-ID')}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 h-max">
          <h3 className="font-semibold text-lg mb-4">Ringkasan Pesanan</h3>
          <div className="space-y-3 text-sm">
            {(items||[]).map(it => (
              <div key={it.product_id} className="flex justify-between">
                <span className="truncate mr-2">{it.name} × {it.quantity}</span>
                <span>Rp {parseInt((it.price||0)*(it.quantity||0)).toLocaleString('id-ID')}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">Rp {parseInt(subtotal).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ongkir {form.courier?.toUpperCase()} {form.shipping_service}</span>
              <span className="font-semibold">Rp {parseInt(shippingCost||0).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-3 border-t">
              <span>Total</span>
              <span className="text-rose-700">Rp {parseInt(grandTotal).toLocaleString('id-ID')}</span>
            </div>
            <button disabled={submitting} onClick={pay} className="btn bg-accent w-full mt-4">{submitting? 'Memproses…' : 'Bayar Sekarang'}</button>
            <a href="/cart" className="btn btn-outline w-full">Kembali ke Keranjang</a>
          </div>
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {showResults && searchResults.length > 0 && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowResults(false)}
        />
      )}
    </BuyerLayout>
  );
}
