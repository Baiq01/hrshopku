import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../components/Toast';

export default function AdminOrders(){
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load(page=1){
    setLoading(true);
    try{
      const r = await api.get(`/admin/orders?page=${page}`);
      const data = r.data;
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setOrders(list);
      setMeta(data?.meta || null);
    }catch(err){
      console.error('Load orders failed:', err);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        toast.error('Akses admin diperlukan');
      } else {
        toast.error('Gagal memuat data pesanan');
      }
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); },[]);

  return (
    <AdminLayout title="Transaksi">
      <h2 className="text-2xl font-semibold mb-4">Data Pembelian</h2>
      {loading && <div>Loading...</div>}
      <div className="card p-4 overflow-x-auto">
        <table className="table min-w-full">
          <thead className="bg-primary/30 text-gray-800">
            <tr>
              <th>No</th>
              <th>Order</th>
              <th>Pembeli</th>
              <th>Status Belanja</th>
              <th>Total Pembelian</th>
              <th>Items</th>
              <th>Tanggal Pembelian</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, idx) => (
              <tr key={o.id}>
                <td>{(meta?.from || 1) + idx}</td>
                <td><a className="text-primary underline" href={`/admin/orders/${o.id}`}>{o.order_number}</a></td>
                <td>{o.user ? `${o.user.name}` : '-'}</td>
                <td>
                  <span className={`badge ${o.status==='paid' || o.status==='settlement' ? 'badge-success' : (o.status==='pending' ? 'badge-warning' : 'badge-danger')}`}>{o.status}</span>
                </td>
                <td>Rp {o.total_amount}</td>
                <td>{Array.isArray(o.items) ? o.items.length : (typeof o.items === 'string' ? (()=>{ try { return JSON.parse(o.items).length } catch { return '-'; } })() : '-')}</td>
                <td>{o.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {meta && (
        <div className="mt-3 flex items-center gap-3">
          <button className="btn btn-outline" disabled={!meta?.prev_page_url} onClick={()=> load((meta.current_page||1)-1)}>Prev</button>
          <span className="text-sm">Page {meta.current_page} / {meta.last_page}</span>
          <button className="btn btn-outline" disabled={!meta?.next_page_url} onClick={()=> load((meta.current_page||1)+1)}>Next</button>
        </div>
      )}
    </AdminLayout>
  );
}
