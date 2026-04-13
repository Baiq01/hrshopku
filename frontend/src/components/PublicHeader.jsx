import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { totalItems } from '../lib/cart';

export default function PublicHeader(){
  const [user, setUser] = useState(null);
  const [count, setCount] = useState(0);
  const [customBadge, setCustomBadge] = useState(false);

  useEffect(()=>{
    try {
      const userData = localStorage.getItem('hr_user');
      if (userData) setUser(JSON.parse(userData));
    } catch {}
    setCount(totalItems());
    const onUpd = ()=> setCount(totalItems());
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
          // show badge if there is at least one order and it's newer than last seen
          if (list.length) setCustomBadge(true);
        }
      } catch (e) {
        // silent
      }
    }
    checkCustomOrders();
  }, [user]);

  function logout(e){
    e.preventDefault();
    localStorage.removeItem('hr_token');
    localStorage.removeItem('hr_user');
    window.location.reload();
  }

  return (
    <header className="bg-primary text-black">
      <div className="container flex items-center justify-between py-3">
        <a href="/" className="text-lg font-bold tracking-wide">HRSHOPKU BAJU BODO</a>
        <div className="flex items-center gap-4">
          <a href="/custom-order" className="text-sm hover:underline font-semibold">Pesan Custom</a>
          <a href="/track" className="text-sm hover:underline">Lacak Paket</a>
          {user ? (
            <span className="text-sm">
              Halo, {user.name} 
              <span className="mx-1">•</span>
              <a href="/my-orders" className="underline">Pesanan</a>
              <span className="mx-1">•</span>
              <a href="/my-custom-orders" className="underline relative"
                 onClick={()=>{ localStorage.setItem('hr_custom_orders_last_seen', new Date().toISOString()); setCustomBadge(false); }}>
                Pesanan Custom
                {customBadge && (
                  <span className="absolute -top-1 -right-3 inline-block h-3 w-3 rounded-full bg-red-600 animate-pulse"></span>
                )}
              </a>
              <span className="mx-1">•</span>
              <a href="#" onClick={logout} className="underline">Logout</a>
            </span>
          ) : (
            <span className="text-sm">
              <a href="/login" className="underline">Login</a>
              <span className="mx-1">|</span>
              <a href="/register" className="underline">Register</a>
            </span>
          )}
          <a href="/cart" className="relative inline-flex items-center">
            <span>Keranjang</span>
            <span className="ml-1 inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-accent px-2 text-xs font-semibold text-gray-900">{count}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
