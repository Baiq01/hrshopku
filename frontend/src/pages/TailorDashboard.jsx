import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TailorLayout from '../components/TailorLayout';
import { useToast } from '../components/Toast';

function TailorDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');
  const [processingId, setProcessingId] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesForm, setNotesForm] = useState({ id: null, notes: '', action: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'tailor') {
      navigate('/tailor/login');
      return;
    }

    fetchCustomOrders();
  }, [filter, navigate]);

  const fetchCustomOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/tailor/custom-orders?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomOrders(response.data.data || []);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/tailor/login');
      } else {
        setError('Gagal memuat data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    setNotesForm({ id, notes: '', action: 'accept' });
    setShowNotesModal(true);
  };

  const handleReject = async (id) => {
    setNotesForm({ id, notes: '', action: 'reject' });
    setShowNotesModal(true);
  };

  const submitAction = async () => {
    const { id, notes, action } = notesForm;

    if (action === 'reject' && !notes.trim()) {
      toast.warning('Alasan penolakan harus diisi');
      return;
    }

    setProcessingId(id);
    setShowNotesModal(false);
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = action === 'accept' ? 'accept' : 'reject';
      
      await axios.post(
        `http://localhost:8000/api/tailor/custom-orders/${id}/${endpoint}`,
        { notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(action === 'accept' ? 'Custom order berhasil diterima!' : 'Custom order berhasil ditolak');
      fetchCustomOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || `Gagal ${action === 'accept' ? 'menerima' : 'menolak'} custom order`);
    } finally {
      setProcessingId(null);
      setNotesForm({ id: null, notes: '', action: '' });
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'Menunggu',
      accepted: 'Diterima',
      rejected: 'Ditolak',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <TailorLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border border-rose-100">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Custom Orders
          </h1>
          <p className="text-gray-600">Kelola permintaan custom order dari pelanggan</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl mb-6 p-2 flex gap-2 border border-rose-100">
          {['pending', 'accepted', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-rose-50'
              }`}
            >
              {status === 'pending' && 'Menunggu'}
              {status === 'accepted' && 'Diterima'}
              {status === 'rejected' && 'Ditolak'}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : customOrders.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-12 text-center border border-rose-100">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak ada custom order</h3>
            <p className="text-gray-500">Belum ada permintaan dengan status ini</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {customOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-rose-100 hover:shadow-2xl transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {order.customer_name}
                    </h3>
                    <p className="text-sm text-gray-600">{order.customer_phone}</p>
                    {order.customer_email && (
                      <p className="text-sm text-gray-600">{order.customer_email}</p>
                    )}
                  </div>
                  {getStatusBadge(order.tailor_status)}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600"><span className="font-semibold">Ukuran:</span> {order.size || '-'}</p>
                    <p className="text-gray-600"><span className="font-semibold">Warna:</span> {order.color || '-'}</p>
                    <p className="text-gray-600"><span className="font-semibold">Jenis Kain:</span> {order.fabric_type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600"><span className="font-semibold">Jumlah:</span> {order.quantity}</p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Estimasi Harga:</span>{' '}
                      {order.estimated_price ? `Rp ${Number(order.estimated_price).toLocaleString('id-ID')}` : '-'}
                    </p>
                  </div>
                </div>

                {order.design_notes && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Catatan Desain:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{order.design_notes}</p>
                  </div>
                )}

                {order.measurements && typeof order.measurements === 'object' && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Ukuran Detail:</p>
                    <div className="bg-gray-50 p-3 rounded-lg grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(order.measurements).map(([key, value]) => (
                        <p key={key} className="text-gray-600">
                          <span className="font-medium">{key}:</span> {value}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {order.reference_image && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Gambar Referensi:</p>
                    <img
                      src={`http://localhost:8000/storage/${order.reference_image}`}
                      alt="Reference"
                      className="max-w-xs rounded-lg shadow-md"
                    />
                  </div>
                )}

                {order.tailor_notes && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Catatan Penjahit:</p>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{order.tailor_notes}</p>
                  </div>
                )}

                {order.tailor_status === 'pending' && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleAccept(order.id)}
                      disabled={processingId === order.id}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50"
                    >
                      {processingId === order.id ? 'Memproses...' : '✓ Terima'}
                    </button>
                    <button
                      onClick={() => handleReject(order.id)}
                      disabled={processingId === order.id}
                      className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50"
                    >
                      {processingId === order.id ? 'Memproses...' : '✗ Tolak'}
                    </button>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  Dibuat: {new Date(order.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setShowNotesModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-rose-100 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                {notesForm.action === 'accept' ? '✓ Terima Custom Order' : '✗ Tolak Custom Order'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {notesForm.action === 'accept' 
                  ? 'Tambahkan catatan (opsional)' 
                  : 'Jelaskan alasan penolakan (wajib)'}
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catatan {notesForm.action === 'reject' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                className="w-full px-4 py-3 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
                rows="5"
                value={notesForm.notes}
                onChange={(e) => setNotesForm({ ...notesForm, notes: e.target.value })}
                placeholder={notesForm.action === 'accept' 
                  ? 'Contoh: Siap dikerjakan, estimasi selesai 2 minggu...' 
                  : 'Contoh: Maaf, desain terlalu rumit untuk dikerjakan saat ini...'}
              />
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={submitAction}
                className={`flex-1 py-3 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition-all ${
                  notesForm.action === 'accept'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                    : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
                }`}
              >
                {notesForm.action === 'accept' ? 'Terima' : 'Tolak'}
              </button>
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </TailorLayout>
  );
}

export default TailorDashboard;
