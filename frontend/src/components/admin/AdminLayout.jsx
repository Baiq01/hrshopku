import React from 'react';
import { useLocation, Link } from 'react-router-dom';

function NavItem({ to, label }){
  const { pathname } = useLocation();
  const active = pathname === to;
  const base = 'flex items-center gap-3 px-4 py-2 rounded-md hover:bg-primary/30 transition-colors';
  return (
    <Link
      to={to}
      className={base + ' ' + (active ? 'bg-primary/40 text-gray-900 font-semibold' : 'text-gray-700')}
    >
      {/* Solid rose dot indicator (distinct from soft pink background) */}
      <span
        className={
          'w-2 h-2 rounded-full transition-all ' +
          (active
            ? 'bg-rose-500 ring-2 ring-rose-600/40'
            : 'bg-rose-400/90 hover:bg-rose-500')
        }
      />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export default function AdminLayout({ title, children }){
  function logout(e){
    e?.preventDefault();
    localStorage.removeItem('hr_token');
    localStorage.removeItem('hr_user');
    window.location.href = '/admin/login';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-primary/80 backdrop-blur-sm text-gray-900 flex flex-col">
        <div className="px-4 py-5 border-b border-primary/40">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="HRSHOPKU Logo" className="w-14 h-14 object-contain" />
            <div className="text-xl font-extrabold leading-tight">HRSHOPKU</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavItem to="/admin" label="Dashboard" />
          <NavItem to="/admin/categories" label="Kategori" />
          <NavItem to="/admin/products" label="Produk" />
          <NavItem to="/admin/orders" label="Transaksi" />
          <NavItem to="/admin/custom-orders" label="Riwayat Pesanan Khusus" />
          <NavItem to="/admin/email-logs" label="Log Email" />
          {/* <NavItem to="/admin/users" label="Akun Member" /> */}
        </nav>
        <div className="p-3 border-t border-primary/40">
          <button onClick={logout} className="w-full text-left px-4 py-2 rounded-md bg-primary/30 hover:bg-primary/40 text-sm font-medium">Keluar</button>
        </div>
      </aside>

      {/* Content */}
      <div className="ml-64">
        <header className="h-14 bg-white/90 backdrop-blur border-b border-pink-100 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">{title || 'Admin'}</h1>
          <a href="#" onClick={logout} className="text-sm text-primary hover:underline">Keluar</a>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
