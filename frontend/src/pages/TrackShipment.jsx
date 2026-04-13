import React, { useState, useEffect } from 'react';
import BuyerLayout from '../components/BuyerLayout';
import api from '../lib/api';

export default function TrackShipment() {
  const [form, setForm] = useState({
    waybill: '',
    courier: 'jne',
    phone: '' // Last 5 digits for JNE
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Check for query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const waybill = params.get('waybill') || params.get('resi');
    const courier = params.get('courier');
    
    if (waybill) {
      setForm(prev => ({
        ...prev,
        waybill,
        courier: courier || prev.courier
      }));
      
      // Auto-track if both params present (skip if JNE without phone)
      if (waybill && courier && courier !== 'jne') {
        setTimeout(() => {
          handleTrackWithParams(waybill, courier, '');
        }, 100);
      }
    }
  }, []);

  async function handleTrackWithParams(waybill, courier, phone) {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const params = { waybill, courier };
      if (phone) params.phone = phone;
      
      const resp = await api.get('/shipping/track', { params });

      if (resp.data.success) {
        setResult(resp.data);
      } else {
        setError(resp.data.message || 'Resi tidak ditemukan');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal melacak resi';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleTrack(e) {
    e.preventDefault();
    if (!form.waybill.trim()) {
      setError('Nomor resi wajib diisi');
      return;
    }

    // JNE requires last 5 digits of recipient phone
    if (form.courier === 'jne' && !form.phone.trim()) {
      setError('Untuk kurir JNE, masukkan 5 digit terakhir nomor HP penerima');
      return;
    }

    await handleTrackWithParams(form.waybill, form.courier, form.phone);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <BuyerLayout title="Lacak Pengiriman">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Lacak Pengiriman</h2>

        {/* Info Banner */}
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
          <p className="text-sm">
            <strong>✅ Powered by Komerce API</strong> - Mendukung tracking dari berbagai kurir: 
            JNE, J&T, SiCepat, AnterAja, Ninja, Lion Parcel, ID Express, SAP, dan lainnya.
          </p>
        </div>

        {/* Form */}
        <div className="card p-6 mb-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Nomor Resi</label>
              <input
                type="text"
                className="input w-full"
                placeholder="Masukkan nomor resi"
                value={form.waybill}
                onChange={(e) => setForm({ ...form, waybill: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Kurir</label>
              <select
                className="input w-full"
                value={form.courier}
                onChange={(e) => setForm({ ...form, courier: e.target.value, phone: '' })}
              >
                <option value="jne">JNE</option>
                <option value="jnt">J&T Express</option>
                <option value="sicepat">SiCepat</option>
                <option value="anteraja">AnterAja</option>
                <option value="ninja">Ninja Xpress</option>
                <option value="lion">Lion Parcel</option>
                <option value="idexpress">ID Express</option>
                <option value="spx">Shopee Express (SPX)</option>
                <option value="sap">SAP Express</option>
                <option value="tiki">TIKI</option>
                <option value="pos">POS Indonesia</option>
                <option value="wahana">Wahana</option>
                <option value="rpx">RPX</option>
                <option value="jet">JET Express</option>
                <option value="rex">REX</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Pastikan pilih kurir yang sesuai dengan label resi Anda
              </p>
            </div>

            {/* Phone input for JNE */}
            {form.courier === 'jne' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  5 Digit Terakhir No. HP Penerima <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Contoh: 56789"
                  maxLength={5}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  JNE memerlukan 5 digit terakhir nomor HP penerima untuk validasi
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Melacak...' : 'Lacak Paket'}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">{error}</p>
            <div className="mt-2 text-sm text-red-600">
              <p>Tips jika tracking gagal:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Pastikan nomor resi sudah benar (tidak ada spasi atau karakter tambahan)</li>
                <li>Pastikan kurir yang dipilih sesuai dengan label pengiriman</li>
                <li>Resi baru mungkin belum terupdate di sistem kurir (coba lagi dalam 1-2 jam)</li>
                <li>Resi dari marketplace (TikTok/Shopee/Tokopedia) bisa dicek langsung di aplikasi marketplace tersebut</li>
              </ul>
            </div>
          </div>
        )}

        {/* Result */}
        {result && result.success && (
          <div className="space-y-6">
            {/* Source badge */}
            {result.source && (
              <div className="text-xs text-gray-500">
                Data dari: <span className="font-medium uppercase">{result.source}</span>
              </div>
            )}

            {/* Summary */}
            {result.summary && (
              <div className="card p-6">
                <h3 className="text-xl font-semibold mb-4">Informasi Pengiriman</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Nomor Resi</p>
                    <p className="font-semibold">{result.waybill}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Kurir</p>
                    <p className="font-semibold">{result.courier}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className={`font-semibold ${
                      (result.summary.status || '').toLowerCase().includes('delivered') || 
                      (result.summary.status || '').toLowerCase().includes('terkirim') 
                        ? 'text-green-600' 
                        : 'text-blue-600'
                    }`}>
                      {result.summary.status || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Service</p>
                    <p className="font-semibold">{result.summary.service || '-'}</p>
                  </div>
                  {(result.summary.shipper_name || result.summary.origin) && (
                    <div>
                      <p className="text-gray-600">Pengirim / Asal</p>
                      <p className="font-semibold">
                        {result.summary.shipper_name && `${result.summary.shipper_name} - `}
                        {result.summary.origin || '-'}
                      </p>
                    </div>
                  )}
                  {(result.summary.receiver_name || result.summary.destination) && (
                    <div>
                      <p className="text-gray-600">Penerima / Tujuan</p>
                      <p className="font-semibold">
                        {result.summary.receiver_name && `${result.summary.receiver_name} - `}
                        {result.summary.destination || '-'}
                      </p>
                    </div>
                  )}
                  {result.summary.weight && (
                    <div>
                      <p className="text-gray-600">Berat</p>
                      <p className="font-semibold">{result.summary.weight}</p>
                    </div>
                  )}
                  {result.summary.desc && (
                    <div className="md:col-span-2">
                      <p className="text-gray-600">Keterangan</p>
                      <p className="font-semibold">{result.summary.desc}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Detail */}
            {result.detail && result.detail.length > 0 && (
              <div className="card p-6">
                <h3 className="text-xl font-semibold mb-4">Detail Paket</h3>
                <div className="space-y-2 text-sm">
                  {result.detail.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-2 py-2 border-b last:border-b-0">
                      <span className="text-gray-600">{item.label || item.key}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History / Manifest */}
            {result.history && result.history.length > 0 && (
              <div className="card p-6">
                <h3 className="text-xl font-semibold mb-4">Riwayat Pengiriman</h3>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                  
                  <div className="space-y-4">
                    {result.history.map((item, idx) => (
                      <div key={idx} className="flex gap-4 relative">
                        {/* Timeline dot */}
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10
                          ${idx === 0 ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}>
                          {idx === 0 && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        
                        <div className="flex-grow pb-4">
                          <p className="text-xs text-gray-500">
                            {formatDate(item.date || item.manifest_date || item.time || item.created_at)}
                          </p>
                          <p className={`font-medium ${idx === 0 ? 'text-green-700' : 'text-gray-800'}`}>
                            {item.desc || item.manifest_description || item.description || item.status || '-'}
                          </p>
                          {(item.location || item.city_name) && (
                            <p className="text-sm text-gray-600">
                              📍 {item.location || item.city_name}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Raw data for debugging (optional) */}
            {process.env.NODE_ENV === 'development' && result.data && (
              <details className="card p-6">
                <summary className="cursor-pointer font-semibold mb-2">
                  Raw API Response (Dev Only)
                </summary>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
