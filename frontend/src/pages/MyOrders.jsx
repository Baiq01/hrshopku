import React, { useEffect, useState } from 'react';
import BuyerLayout from '../components/BuyerLayout';
import api from '../lib/api';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const token = localStorage.getItem('hr_token');
      if (!token) {
        alert('Silakan login terlebih dahulu');
        window.location.href = '/login';
        return;
      }
      const resp = await api.get('/orders/my');
      const data = resp.data;
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      // Normalize items JSON if needed
      list.forEach(o => {
        if (o && typeof o.items === 'string') {
          try { o.items = JSON.parse(o.items); } catch {}
        }
      });
      setOrders(list);
    } catch (err) {
      console.error('Failed to load orders', err);
      const s = err.response?.status;
      if (s === 401) {
        alert('Silakan login terlebih dahulu');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  }

  function viewTracking(order) {
    if (order.tracking_number && order.courier) {
      window.location.href = `/track?waybill=${order.tracking_number}&courier=${order.courier.toLowerCase()}`;
    } else {
      alert('Nomor resi belum tersedia');
    }
  }

  function renderStatusBadge(status){
    const map = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800',
      canceled: 'bg-red-100 text-red-800'
    };
    const labelMap = {
      pending: 'Menunggu',
      paid: 'Dibayar',
      processing: 'Diproses',
      shipped: 'Dikirim',
      completed: 'Selesai',
      canceled: 'Dibatalkan'
    }
    return <span className={`px-3 py-1 rounded text-sm font-medium ${map[status]||'bg-gray-100 text-gray-800'}`}>{labelMap[status]||status}</span>
  }

  return (
    <BuyerLayout title="Pesanan Saya">
      <h2 className="text-3xl font-bold mb-6">Pesanan Saya</h2>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-600 mb-4">Belum ada pesanan</p>
          <a href="/" className="btn btn-primary">
            Mulai Belanja
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{order.order_number}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  </div>
                  {renderStatusBadge(order.status)}
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-semibold">Rp {order.total_amount?.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kurir:</span>
                      <span>{order.courier || '-'}</span>
                    </div>
                    {order.tracking_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">No. Resi:</span>
                        <span className="font-mono">{order.tracking_number}</span>
                      </div>
                    )}
                    {/* Show first sizes summary if any */}
                    {Array.isArray(order.items) && order.items.some(i=>i.size) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ukuran:</span>
                        <span className="truncate max-w-[160px]">{order.items.filter(i=>i.size).map(i=>i.size).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="btn btn-outline text-sm"
                    >
                      Detail
                    </button>
                    {order.tracking_number && (
                      <button
                        onClick={() => viewTracking(order)}
                        className="btn btn-primary text-sm"
                      >
                        Lacak Paket
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Detail Pesanan</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Nomor Order</p>
                    <p className="font-semibold">{selectedOrder.order_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    {renderStatusBadge(selectedOrder.status)}
                  </div>
                  <div>
                    <p className="text-gray-600">Kurir</p>
                    <p className="font-semibold">{selectedOrder.courier || '-'}</p>
                  </div>
                  {selectedOrder.tracking_number && (
                    <div>
                      <p className="text-gray-600">No. Resi</p>
                      <p className="font-semibold font-mono">{selectedOrder.tracking_number}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Alamat Pengiriman</h4>
                  <p className="text-sm">{selectedOrder.customer_name}</p>
                  <p className="text-sm">{selectedOrder.customer_phone}</p>
                  <p className="text-sm">{selectedOrder.shipping_address}</p>
                  <p className="text-sm">
                    {selectedOrder.shipping_city}, {selectedOrder.shipping_province}{' '}
                    {selectedOrder.shipping_postal_code}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Item Pesanan</h4>
                  <div className="space-y-2">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.name}{item.size ? ` (${item.size})` : ''} x {item.quantity}
                        </span>
                        <span>Rp {((item.price || 0) * (item.quantity || 0)).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Subtotal</span>
                    <span>
                      Rp{' '}
                      {(
                        (selectedOrder.total_amount || 0) - (selectedOrder.shipping_cost || 0)
                      ).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Ongkir</span>
                    <span>Rp {(selectedOrder.shipping_cost || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>Rp {(selectedOrder.total_amount || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {selectedOrder.tracking_number && (
                  <button
                    onClick={() => viewTracking(selectedOrder)}
                    className="btn btn-primary w-full mt-4"
                  >
                    Lacak Paket
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
    </BuyerLayout>
  );
}
