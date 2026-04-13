import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../components/Toast';

export default function EmailLogs() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState(''); // '', 'sent', 'failed'
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  async function load(page = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 20 });
      if (filter) params.append('status', filter);
      const r = await api.get(`/admin/email-logs?${params}`);
      const data = r.data;
      const list = Array.isArray(data?.data) ? data.data : [];
      setLogs(list);
      setMeta({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        from: data.from || 1,
        to: data.to || 0,
        total: data.total || 0,
        prev_page_url: data.prev_page_url,
        next_page_url: data.next_page_url,
      });
    } catch (err) {
      console.error('Load email logs failed:', err);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        toast.error('Akses admin diperlukan');
      } else {
        toast.error('Gagal memuat log email');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filter]);

  function openDetail(log) {
    setSelectedLog(log);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedLog(null);
  }

  return (
    <AdminLayout title="Email Logs">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Log Pengiriman Email</h2>
        <div className="flex gap-2">
          <button
            className={`btn ${filter === '' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('')}
          >
            Semua
          </button>
          <button
            className={`btn ${filter === 'sent' ? 'btn-success' : 'btn-outline'}`}
            onClick={() => setFilter('sent')}
          >
            Terkirim
          </button>
          <button
            className={`btn ${filter === 'failed' ? 'btn-danger' : 'btn-outline'}`}
            onClick={() => setFilter('failed')}
          >
            Gagal
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-4">Loading...</div>}

      <div className="card p-4 overflow-x-auto">
        <table className="table min-w-full">
          <thead className="bg-rose-100 text-gray-800">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Penerima</th>
              <th className="px-3 py-2">Subjek</th>
              <th className="px-3 py-2">Template</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Dikirim</th>
              <th className="px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && !loading && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  Tidak ada log email
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{log.id}</td>
                <td className="px-3 py-2 max-w-[200px] truncate">{log.to}</td>
                <td className="px-3 py-2 max-w-[250px] truncate">{log.subject || '-'}</td>
                <td className="px-3 py-2 text-xs text-gray-600">{log.template || '-'}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      log.status === 'sent'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {log.status === 'sent' ? 'Terkirim' : 'Gagal'}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm text-gray-600">
                  {log.sent_at ? new Date(log.sent_at).toLocaleString('id-ID') : '-'}
                </td>
                <td className="px-3 py-2">
                  <button
                    className="text-rose-600 hover:underline text-sm font-medium"
                    onClick={() => openDetail(log)}
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Menampilkan {meta.from} - {meta.to} dari {meta.total} log
          </div>
          <div className="flex items-center gap-3">
            <button
              className="btn btn-outline"
              disabled={!meta.prev_page_url}
              onClick={() => load(meta.current_page - 1)}
            >
              Prev
            </button>
            <span className="text-sm font-medium">
              Halaman {meta.current_page} / {meta.last_page}
            </span>
            <button
              className="btn btn-outline"
              disabled={!meta.next_page_url}
              onClick={() => load(meta.current_page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-pink-50">
              <h3 className="text-xl font-bold text-gray-800">Detail Email Log #{selectedLog.id}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Penerima</label>
                <p className="text-gray-900">{selectedLog.to}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subjek</label>
                <p className="text-gray-900">{selectedLog.subject || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Template</label>
                <p className="text-gray-600 text-sm font-mono">{selectedLog.template || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedLog.status === 'sent'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {selectedLog.status === 'sent' ? 'Terkirim' : 'Gagal'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Waktu Dikirim</label>
                <p className="text-gray-900">
                  {selectedLog.sent_at ? new Date(selectedLog.sent_at).toLocaleString('id-ID') : '-'}
                </p>
              </div>
              {selectedLog.payload && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Payload</label>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.payload, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.error && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Error</label>
                  <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-800">
                    {selectedLog.error}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                className="btn btn-outline"
                onClick={closeModal}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
