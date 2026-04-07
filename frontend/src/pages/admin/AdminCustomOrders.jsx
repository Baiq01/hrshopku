import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';

export default function AdminCustomOrders() {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveForm, setApproveForm] = useState({
    status: 'approved',
    admin_notes: '',
    estimated_price: '',
  });

  useEffect(() => {
    loadOrders();
  }, [filter]);

  async function loadOrders() {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const resp = await api.get('/admin/custom-orders', { params });
      setOrders(resp.data.data || resp.data);
    } catch (err) {
      console.error('Load error', err);
      toast.error('Gagal memuat data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveReject() {
    if (!selectedOrder) return;

    if (approveForm.status === 'approved' && !approveForm.estimated_price) {
      toast.warning('Harap masukkan estimasi harga untuk pesanan yang disetujui');
      return;
    }

    try {
      await api.patch(`/admin/custom-orders/${selectedOrder.id}`, approveForm);
      toast.success('Pesanan berhasil diperbarui');
      setShowApproveModal(false);
      setSelectedOrder(null);
      setApproveForm({ status: 'approved', admin_notes: '', estimated_price: '' });
      loadOrders();
    } catch (err) {
      console.error('Update error', err);
      toast.error('Gagal memperbarui: ' + (err.response?.data?.message || err.message));
    }
  }

  async function handleDelete(id) {
    const confirmed = await confirm({
      title: 'Hapus Pesanan',
      message: 'Yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.',
      type: 'danger',
      confirmText: 'Hapus',
      cancelText: 'Batal'
    });
    
    if (!confirmed) return;
    
    try {
      await api.delete(`/admin/custom-orders/${id}`);
      toast.success('Pesanan berhasil dihapus');
      loadOrders();
    } catch (err) {
      console.error('Delete error', err);
      toast.error('Gagal menghapus: ' + (err.response?.data?.message || err.message));
    }
  }

  // Ship / add tracking number
  const [showShipModal, setShowShipModal] = useState(false);
  const [shipForm, setShipForm] = useState({ tracking_number: '', shipping_courier: '' });

  function openShipModal(order) {
    setSelectedOrder(order);
    setShipForm({ tracking_number: order.tracking_number || '', shipping_courier: order.shipping_courier || '' });
    setShowShipModal(true);
  }

  async function handleSubmitShip() {
    if (!selectedOrder) return;
    if (!shipForm.tracking_number) {
      toast.warning('Masukkan nomor resi');
      return;
    }
    try {
      await api.patch(`/admin/custom-orders/${selectedOrder.id}`, { 
        tracking_number: shipForm.tracking_number,
        shipping_courier: shipForm.shipping_courier,
        status: 'shipped'
      });
      toast.success('Resi tersimpan dan status diupdate ke dikirim');
      setShowShipModal(false);
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      console.error('Ship update error', err);
      toast.error('Gagal menyimpan resi: ' + (err.response?.data?.message || err.message));
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await api.patch(`/admin/custom-orders/${id}`, { status: newStatus });
      toast.success('Status berhasil diperbarui');
      loadOrders();
    } catch (err) {
      console.error('Update error', err);
      toast.error('Gagal memperbarui: ' + (err.response?.data?.message || err.message));
    }
  }

  function openApproveModal(order, status) {
    setSelectedOrder(order);
    setApproveForm({
      status: status,
      admin_notes: '',
      estimated_price: '',
    });
    setShowApproveModal(true);
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

  function getTailorStatusBadge(status) {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'Menunggu Penjahit',
      accepted: 'Diterima Penjahit',
      rejected: 'Ditolak Penjahit',
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
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <AdminLayout title="History Costum Order">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pesanan Custom</h2>
        <div className="flex gap-2">
          <select
            className="input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
            <option value="in_production">Produksi</option>
            <option value="shipped">Dikirim</option>
            <option value="completed">Selesai</option>
            <option value="canceled">Dibatalkan</option>
          </select>
          <button onClick={loadOrders} className="btn btn-outline">
            ⟳ Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Memuat...</div>
      ) : orders.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-600">Tidak ada pesanan custom</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-bold text-lg">#{order.id}</span>
                    {getStatusBadge(order.status)}
                    {getTailorStatusBadge(order.tailor_status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
                    <div>
                      <span className="font-medium">Nama:</span> {order.customer_name}
                    </div>
                    <div>
                      <span className="font-medium">Telepon:</span> {order.customer_phone}
                    </div>
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
                  </div>

                  {order.design_notes && (
                    <div className="text-sm bg-gray-50 p-3 rounded mb-2">
                      <span className="font-medium">Catatan:</span> {order.design_notes.substring(0, 150)}
                      {order.design_notes.length > 150 && '...'}
                    </div>
                  )}

                  {order.admin_notes && (
                    <div className="text-sm bg-blue-50 p-3 rounded">
                      <span className="font-medium">Catatan Admin:</span> {order.admin_notes}
                    </div>
                  )}

                  {order.tailor && (
                    <div className="text-sm bg-green-50 p-3 rounded mt-2">
                      <span className="font-medium">Penjahit:</span> {order.tailor.name}
                      {order.tailor_notes && (
                        <div className="mt-1">
                          <span className="font-medium">Catatan Penjahit:</span> {order.tailor_notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 lg:w-48">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => openApproveModal(order, 'approved')}
                        className="btn btn-sm bg-green-600 text-white hover:bg-green-700"
                      >
                        ✓ Setujui
                      </button>
                      <button
                        onClick={() => openApproveModal(order, 'rejected')}
                        className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                      >
                        ✕ Tolak
                      </button>
                    </>
                  )}
                  {order.status === 'approved' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'in_production')}
                      className="btn btn-sm btn-primary"
                    >
                      Mulai Produksi
                    </button>
                  )}
                  {order.status === 'in_production' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'completed')}
                      className="btn btn-sm bg-purple-600 text-white hover:bg-purple-700"
                    >
                      Selesai
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="btn btn-sm btn-outline"
                  >
                    Lihat Detail
                  </button>
                  <button
                    onClick={() => openShipModal(order)}
                    className="btn btn-sm bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    {order.tracking_number ? 'Edit Resi' : 'Tambah Resi'}
                  </button>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ship/Resi Modal */}
      {showShipModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowShipModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Tambah / Edit Resi Pesanan #{selectedOrder.id}</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nomor Resi</label>
                <input className="input w-full" value={shipForm.tracking_number} onChange={e=>setShipForm({...shipForm, tracking_number:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kurir (contoh: jne, jnt)</label>
                <input className="input w-full" value={shipForm.shipping_courier} onChange={e=>setShipForm({...shipForm, shipping_courier:e.target.value})} />
              </div>
            </div>

            <div className="p-6 border-t flex gap-2">
              <button onClick={handleSubmitShip} className="btn btn-primary flex-1">Simpan & Tandai Dikirim</button>
              <button onClick={()=>setShowShipModal(false)} className="btn btn-outline">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && !showApproveModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Detail Pesanan Custom #{selectedOrder.id}</h3>
                <div className="mt-2">{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Same detail structure as MyCustomOrders */}
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

              {selectedOrder.measurements && Object.keys(selectedOrder.measurements).some(k => selectedOrder.measurements[k]) && (
                <div>
                  <h4 className="font-semibold mb-2">Ukuran Detail (cm)</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {selectedOrder.measurements.chest && (
                      <div>
                        <span className="text-gray-600">Dada:</span> {selectedOrder.measurements.chest}
                      </div>
                    )}
                    {selectedOrder.measurements.waist && (
                      <div>
                        <span className="text-gray-600">Pinggang:</span> {selectedOrder.measurements.waist}
                      </div>
                    )}
                    {selectedOrder.measurements.hip && (
                      <div>
                        <span className="text-gray-600">Pinggul:</span> {selectedOrder.measurements.hip}
                      </div>
                    )}
                    {selectedOrder.measurements.length && (
                      <div>
                        <span className="text-gray-600">Panjang:</span> {selectedOrder.measurements.length}
                      </div>
                    )}
                    {selectedOrder.measurements.shoulder && (
                      <div>
                        <span className="text-gray-600">Bahu:</span> {selectedOrder.measurements.shoulder}
                      </div>
                    )}
                    {selectedOrder.measurements.sleeve && (
                      <div>
                        <span className="text-gray-600">Lengan:</span> {selectedOrder.measurements.sleeve}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedOrder.design_notes && (
                <div>
                  <h4 className="font-semibold mb-2">Catatan Desain</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                    {selectedOrder.design_notes}
                  </p>
                </div>
              )}

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

              {selectedOrder.estimated_price && (
                <div>
                  <h4 className="font-semibold mb-2">Estimasi Harga</h4>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(selectedOrder.estimated_price)}
                  </p>
                </div>
              )}

              {selectedOrder.admin_notes && (
                <div>
                  <h4 className="font-semibold mb-2">Catatan Admin</h4>
                  <div className="bg-blue-50 p-4 rounded">
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

              {selectedOrder.tailor && (
                <div>
                  <h4 className="font-semibold mb-2">Status Penjahit</h4>
                  <div className="bg-green-50 p-4 rounded">
                    <div className="mb-2">{getTailorStatusBadge(selectedOrder.tailor_status)}</div>
                    <p className="text-sm">
                      <span className="font-medium">Penjahit:</span> {selectedOrder.tailor.name}
                    </p>
                    {selectedOrder.tailor_notes && (
                      <p className="text-sm mt-2">
                        <span className="font-medium">Catatan:</span> {selectedOrder.tailor_notes}
                      </p>
                    )}
                    {selectedOrder.tailor_responded_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Direspon pada: {formatDate(selectedOrder.tailor_responded_at)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t">
              <button onClick={() => setSelectedOrder(null)} className="btn btn-outline w-full">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject Modal */}
      {showApproveModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowApproveModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">
                {approveForm.status === 'approved' ? 'Setujui' : 'Tolak'} Pesanan #{selectedOrder.id}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {approveForm.status === 'approved' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Estimasi Harga <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    value={approveForm.estimated_price}
                    onChange={(e) =>
                      setApproveForm({ ...approveForm, estimated_price: e.target.value })
                    }
                    placeholder="Contoh: 500000"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Catatan untuk Customer {approveForm.status === 'rejected' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  className="input w-full"
                  rows="4"
                  value={approveForm.admin_notes}
                  onChange={(e) =>
                    setApproveForm({ ...approveForm, admin_notes: e.target.value })
                  }
                  placeholder={
                    approveForm.status === 'approved'
                      ? 'Tambahan informasi atau catatan...'
                      : 'Jelaskan alasan penolakan...'
                  }
                ></textarea>
              </div>
            </div>

            <div className="p-6 border-t flex gap-2">
              <button onClick={handleApproveReject} className="btn btn-primary flex-1">
                {approveForm.status === 'approved' ? 'Setujui' : 'Tolak'}
              </button>
              <button onClick={() => setShowApproveModal(false)} className="btn btn-outline">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
