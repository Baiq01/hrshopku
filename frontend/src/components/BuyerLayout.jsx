import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../lib/api';
import { totalItems } from '../lib/cart';

function NavItem({ to, label, badge }){
  const { pathname } = useLocation();
  const active = pathname === to;
  const base = 'flex items-center gap-3 px-4 py-2 rounded-md hover:bg-primary/30 transition-colors';
  return (
    <Link
      to={to}
      className={base + ' ' + (active ? 'bg-primary/40 text-gray-900 font-semibold' : 'text-gray-700')}
    >
      {/* Rose dot indicator for visibility against soft background */}
      <span
        className={
          'w-2 h-2 rounded-full transition-all ' +
          (active
            ? 'bg-rose-500 ring-2 ring-rose-600/40'
            : 'bg-rose-400/90 hover:bg-rose-500')
        }
      />
      <span className="text-sm font-medium">{label}</span>
      {badge && (
        <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/50 text-xs font-bold text-gray-900">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function BuyerLayout({ title, children }){
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [customBadge, setCustomBadge] = useState(false);

  useEffect(()=>{
    try {
      const userData = localStorage.getItem('hr_user');
      if (userData) setUser(JSON.parse(userData));
    } catch {}
    
    setCartCount(totalItems());
    const onUpd = ()=> setCartCount(totalItems());
    window.addEventListener('cart_updated', onUpd);
    return ()=> window.removeEventListener('cart_updated', onUpd);
  },[]);

  // Check for custom order updates badge
  useEffect(()=>{
    async function checkCustomOrders(){
      const token = localStorage.getItem('hr_token');
      if (!token) return;
      try {
        const lastSeenRaw = localStorage.getItem('hr_custom_orders_last_seen');
        const lastSeen = lastSeenRaw ? new Date(lastSeenRaw) : null;
        const resp = await api.get('/custom-orders/my-orders');
        const list = resp.data || [];
        const newestUpdated = list.reduce((acc, o) => {
          const d = o.updated_at ? new Date(o.updated_at) : new Date(o.created_at);
          return d > acc ? d : acc;
        }, new Date(0));
        if (!lastSeen || newestUpdated > lastSeen) {
          if (list.length) setCustomBadge(true);
        }
      } catch (e) {
        // silent
      }
    }
    checkCustomOrders();
  }, [user]);

  function logout(e){
    e?.preventDefault();
    localStorage.removeItem('hr_token');
    localStorage.removeItem('hr_user');
    window.location.href = '/';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-primary/80 backdrop-blur-sm text-gray-900 flex flex-col z-50">
        <div className="px-4 py-5 border-b border-primary/40">
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/logo.png" alt="HRSHOPKU Logo" className="w-14 h-14 object-contain" />
            <span className="text-xl font-extrabold leading-tight">HRSHOPKU</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavItem to="/" label="Beranda" />
          <NavItem to="/custom-order" label="Pesan Kostum" />
          <NavItem to="/track" label="Lacak Paket" />
          {user && (
            <>
              <NavItem to="/my-orders" label="Pesanan Saya" />
              <NavItem 
                to="/my-custom-orders" 
                label="Pesanan Custom" 
                badge={customBadge ? '!' : null}
              />
            </>
          )}
          <NavItem to="/cart" label="Keranjang" badge={cartCount > 0 ? cartCount : null} />
        </nav>
        <div className="p-3 border-t border-primary/40">
          {user ? (
            <div className="space-y-2">
              <div className="px-4 py-2 text-sm text-gray-700">
                <div className="font-semibold">{user.name}</div>
                <div className="text-xs opacity-75">{user.email}</div>
              </div>
              <button onClick={logout} className="w-full text-left px-4 py-2 rounded-md bg-primary/30 hover:bg-primary/40 text-sm font-medium">
                Keluar
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link to="/login" className="block w-full text-center px-4 py-2 rounded-md bg-primary/30 hover:bg-primary/40 text-sm font-medium">
                Login
              </Link>
              <Link to="/register" className="block w-full text-center px-4 py-2 rounded-md bg-primary/20 hover:bg-primary/30 text-sm font-medium">
                Register
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Content */}
      <div className="ml-64">
        <header className="h-14 bg-white border-b flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">{title || 'HRSHOPKU'}</h1>
          {user && (
            <div className="text-sm text-gray-600">
              Halo, <span className="font-semibold">{user.name}</span>
            </div>
          )}
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
