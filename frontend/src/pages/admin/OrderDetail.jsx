import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../components/Toast';

export default function AdminOrderDetail(){
  const toast = useToast();
  const { id } = useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const allowed = ['pending','paid','processing','shipped','canceled'];

  async function load(){
    setLoading(true);
    try{
      const r = await api.get(`/admin/orders/${id}`);
      const o = r.data;
      // Normalize items: could be JSON string
      if (o && typeof o.items === 'string'){
        try { o.items = JSON.parse(o.items); } catch {}
      }
      setOrder(o);
      setStatus(o?.status || 'pending');
      setTrackingNumber(o?.tracking_number || '');
    }catch(err){
      console.error('Load order failed', err);
      const s = err.response?.status;
      if (s === 401 || s === 403) {
        toast.error('Akses admin diperlukan');
      } else {
        toast.error('Gagal memuat detail pesanan');
      }
    }finally{
      setLoading(false);
    }
  }

  async function save(){
    try{
      const r = await api.patch(`/admin/orders/${id}`, { 
        status,
        tracking_number: trackingNumber
      });
      setOrder(r.data);
      toast.success('Status dan nomor resi berhasil disimpan');
    }catch(err){
      console.error('Update status failed', err);
      const msg = err.response?.data?.error || 'Gagal menyimpan status';
      toast.error(msg);
    }
  }

  useEffect(()=>{ load(); },[id]);

  const totals = useMemo(()=>{
    if (!order || !Array.isArray(order.items)) return { qty: 0, amount: order?.total_amount || 0 };
    const qty = order.items.reduce((a,b)=> a + (b.quantity||0), 0);
    const amount = order.items.reduce((a,b)=> a + (b.quantity||0)*(b.price||0), 0);
    return { qty, amount };
  }, [order]);

  return (
    <AdminLayout title="Detail Transaksi">
      <button onClick={()=> nav('/admin/orders')} className="btn btn-outline mb-3">← Kembali</button>
      <h2 className="text-2xl font-semibold">Order Detail</h2>
      {loading && <div>Loading...</div>}
      {!loading && order && (
        <div className="mt-4 space-y-4">
          <div className="card p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              <div><span className="font-medium">Order:</span> {order.order_number}</div>
              <div><span className="font-medium">Pembeli:</span> {order.user ? `${order.user.name} (${order.user.email})` : '-'}</div>
              <div><span className="font-medium">Dibuat:</span> {order.created_at}</div>
            </div>
          </div>

          <div className="card p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="font-medium w-32">Status:</label>
                <select className="input max-w-xs" value={status} onChange={e=>setStatus(e.target.value)}>
                  {allowed.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium w-32">No. Resi:</label>
                <input 
                  type="text" 
                  className="input max-w-md" 
                  placeholder="Masukkan nomor resi (opsional)"
                  value={trackingNumber}
                  onChange={e=>setTrackingNumber(e.target.value)}
                />
                {order?.courier && (
                  <span className="text-sm text-gray-600">Kurir: {order.courier}</span>
                )}
              </div>
              <div>
                <button onClick={save} className="btn btn-primary">Simpan</button>
              </div>
            </div>
          </div>

          <div className="card p-4 overflow-x-auto">
            <table className="table min-w-full">
              <thead className="bg-primary/30 text-gray-800">
                <tr>
                  <th>#</th>
                  <th>Nama</th>
                  <th>Ukuran</th>
                  <th>Harga</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(order.items||[]).map((it, idx) => (
                  <tr key={idx}>
                    <td>{idx+1}</td>
                    <td>{it.name}</td>
                    <td>{it.size || '-'}</td>
                    <td>Rp {it.price}</td>
                    <td>{it.quantity}</td>
                    <td>Rp {(it.price||0) * (it.quantity||0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-right space-y-1">
              <div><span className="font-medium">Total Qty:</span> {totals.qty}</div>
              <div><span className="font-medium">Total Amount:</span> Rp {totals.amount}</div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
