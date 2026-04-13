import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminDashboard(){
  const [stats, setStats] = useState({ categories: 0, products: 0, orders: 0 });
  useEffect(() => { load(); }, []);

  async function load(){
    try {
      const [c, p, o] = await Promise.all([
        api.get('/admin/categories'),
        api.get('/admin/products'),
        api.get('/admin/orders')
      ]);
      const categories = Array.isArray(c.data) ? c.data.length : (Array.isArray(c.data?.data) ? c.data.data.length : 0);
      const products = Array.isArray(p.data) ? p.data.length : (Array.isArray(p.data?.data) ? p.data.data.length : 0);
      const orders = Array.isArray(o.data) ? o.data.length : (Array.isArray(o.data?.data) ? o.data.data.length : 0);
      setStats({ categories, products, orders });
    } catch (e) {
      // ignore errors silently for dashboard
    }
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="text-sm text-gray-500">Jumlah Kategori</div>
          <div className="text-3xl font-bold mt-1">{stats.categories}</div>
          <a className="mt-3 inline-block text-sm text-rose-700 underline" href="/admin/categories">Lihat Selengkapnya</a>
        </div>
        <div className="card p-6">
          <div className="text-sm text-gray-500">Jumlah Produk</div>
          <div className="text-3xl font-bold mt-1">{stats.products}</div>
          <a className="mt-3 inline-block text-sm text-rose-700 underline" href="/admin/products">Lihat Selengkapnya</a>
        </div>
      </div>

      <div className="card mt-8 p-8 flex items-center justify-center">
        <div className="text-center">
          <img 
            alt="Admin Dashboard" 
            className="mx-auto mb-6 w-48 h-48 object-contain" 
            src="/images/admin-panel.png"
          />
          <div className="text-3xl font-bold tracking-wide bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
            SELAMAT DATANG!
          </div>
          <div className="text-sm text-gray-600 mt-1">Dashboard Admin HRSHOPKU</div>
          <div className="mt-4 text-xs text-gray-500">Kelola produk, pesanan, dan kategori dengan mudah</div>
        </div>
      </div>
    </AdminLayout>
  );
}
