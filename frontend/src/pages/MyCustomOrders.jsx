import React, { useState, useEffect } from 'react';
import BuyerLayout from '../components/BuyerLayout';
import api from '../lib/api';

export default function MyCustomOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const resp = await api.get('/custom-orders/my-orders');
      setOrders(resp.data);
      // mark as seen for header badge
      localStorage.setItem('hr_custom_orders_last_seen', new Date().toISOString());
    } catch (err) {
      console.error('Load error', err);
      if (err.response?.status === 401) {
        alert('Anda harus login terlebih dahulu');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status) {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      in_production: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-purple-100 text-purple-800',
      canceled: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      pending: 'Menunggu',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      in_production: 'Produksi',
      shipped: 'Dikirim',
      completed: 'Selesai',
      canceled: 'Dibatalkan',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  }

  function formatPrice(price) {
    if (!price) return '-';
    return 'Rp ' + parseInt(price).toLocaleString('id-ID');
  }

  function formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <BuyerLayout title="Pesanan Kostum">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-rose-700">Pesanan Kostum Saya</h2>
            <a href="/custom-order" className="btn btn-primary">
              + Pesan Kostum Baru
            </a>
          </div>

          {loading ? (
            <div className="text-center py-12">Memuat...</div>
          ) : orders.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-600 mb-4">Anda belum memiliki pesanan kostum</p>
              <a href="/custom-order" className="btn btn-primary">
                Buat Pesanan Kostum
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-500">#{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {order.size && (
                          <div>
                            <span className="font-medium">Ukuran:</span> {order.size}
                          </div>
                        )}
                        {order.color && (
                          <div>
                            <span className="font-medium">Warna:</span> {order.color}
                          </div>
                        )}
                        {order.fabric_type && (
                          <div>
                            <span className="font-medium">Kain:</span> {order.fabric_type}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Jumlah:</span> {order.quantity} pcs
                        </div>
                        {order.estimated_price && (
                          <div>
                            <span className="font-medium">Est. Harga:</span>{' '}
                            {formatPrice(order.estimated_price)}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Tanggal:</span> {formatDate(order.created_at)}
                        </div>
                        {order.tracking_number && (
                          <div>
                            <span className="font-medium">Resi:</span> <span className="font-mono">{order.tracking_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="btn btn-outline btn-sm"
                      >
                        Lihat Detail
                      </button>
                      {order.tracking_number && (
                        <a
                          href={`/track?waybill=${order.tracking_number}&courier=${(order.shipping_courier||'').toLowerCase()}`}
                          className="btn btn-sm btn-primary"
                        >
                          Lacak Paket
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Detail Pesanan Kostum #{selectedOrder.id}</h3>
                <div className="mt-2">{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informasi Kontak */}
              <div>
                <h4 className="font-semibold mb-2">Informasi Kontak</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Nama:</span> {selectedOrder.customer_name}
                  </div>
                  <div>
                    <span className="text-gray-600">Telepon:</span> {selectedOrder.customer_phone}
                  </div>
                  {selectedOrder.customer_email && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Email:</span> {selectedOrder.customer_email}
                    </div>
                  )}
                </div>
              </div>

              {/* Detail Pesanan */}
              <div>
                <h4 className="font-semibold mb-2">Detail Pesanan</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {selectedOrder.size && (
                    <div>
                      <span className="text-gray-600">Ukuran:</span> {selectedOrder.size}
                    </div>
                  )}
                  {selectedOrder.color && (
                    <div>
                      <span className="text-gray-600">Warna:</span> {selectedOrder.color}
                    </div>
                  )}
                  {selectedOrder.fabric_type && (
                    <div>
                      <span className="text-gray-600">Jenis Kain:</span> {selectedOrder.fabric_type}
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Jumlah:</span> {selectedOrder.quantity} pcs
                  </div>
                </div>
              </div>

              {/* Ukuran Detail */}
              {selectedOrder.measurements && Object.keys(selectedOrder.measurements).some(k => selectedOrder.measurements[k]) && (
                <div>
                  <h4 className="font-semibold mb-2">Ukuran Detail (cm)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {selectedOrder.measurements.chest && (
                      <div>
                        <span className="text-gray-600">Lingkar Dada:</span> {selectedOrder.measurements.chest}
                      </div>
                    )}
                    {selectedOrder.measurements.waist && (
                      <div>
                        <span className="text-gray-600">Lingkar Pinggang:</span> {selectedOrder.measurements.waist}
                      </div>
                    )}
                    {selectedOrder.measurements.hip && (
                      <div>
                        <span className="text-gray-600">Lingkar Pinggul:</span> {selectedOrder.measurements.hip}
                      </div>
                    )}
                    {selectedOrder.measurements.length && (
                      <div>
                        <span className="text-gray-600">Panjang Baju:</span> {selectedOrder.measurements.length}
                      </div>
                    )}
                    {selectedOrder.measurements.shoulder && (
                      <div>
                        <span className="text-gray-600">Lebar Bahu:</span> {selectedOrder.measurements.shoulder}
                      </div>
                    )}
                    {selectedOrder.measurements.sleeve && (
                      <div>
                        <span className="text-gray-600">Panjang Lengan:</span> {selectedOrder.measurements.sleeve}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Catatan Desain */}
              {selectedOrder.design_notes && (
                <div>
                  <h4 className="font-semibold mb-2">Catatan Desain</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedOrder.design_notes}
                  </p>
                </div>
              )}

              {/* Gambar Referensi */}
              {selectedOrder.reference_image && (
                <div>
                  <h4 className="font-semibold mb-2">Gambar Referensi</h4>
                  <img
                    src={`${process.env.REACT_APP_API_URL}/storage/${selectedOrder.reference_image}`}
                    alt="Reference"
                    className="max-w-md rounded border"
                  />
                </div>
              )}

              {/* Estimasi Harga */}
              {selectedOrder.estimated_price && (
                <div>
                  <h4 className="font-semibold mb-2">Estimasi Harga</h4>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(selectedOrder.estimated_price)}
                  </p>
                </div>
              )}

              {/* Shipping / Resi */}
              {selectedOrder.tracking_number && (
                <div>
                  <h4 className="font-semibold mb-2">Informasi Pengiriman</h4>
                  <div className="text-sm">
                    <div>Kurir: {selectedOrder.shipping_courier || '-'}</div>
                    <div>Nomor Resi: <span className="font-mono">{selectedOrder.tracking_number}</span></div>
                    {selectedOrder.shipped_at && (
                      <div>Dikirim pada: {formatDate(selectedOrder.shipped_at)}</div>
                    )}
                    <div className="mt-2">
                      <a href={`/track?waybill=${selectedOrder.tracking_number}&courier=${(selectedOrder.shipping_courier||'').toLowerCase()}`} className="underline text-primary">Lacak Paket</a>
                    </div>
                  </div>
                </div>
              )}
              {/* Catatan Admin */}
              {selectedOrder.admin_notes && (
                <div>
                  <h4 className="font-semibold mb-2">Catatan dari Admin</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedOrder.admin_notes}
                    </p>
                    {selectedOrder.responded_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Direspon pada: {formatDate(selectedOrder.responded_at)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Tanggal */}
              <div className="text-xs text-gray-500 border-t pt-4">
                <div>Dibuat: {formatDate(selectedOrder.created_at)}</div>
                {selectedOrder.updated_at && (
                  <div>Diperbarui: {formatDate(selectedOrder.updated_at)}</div>
                )}
              </div>
            </div>

            <div className="p-6 border-t">
              <button onClick={() => setSelectedOrder(null)} className="btn btn-outline w-full">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </BuyerLayout>
  );
}
