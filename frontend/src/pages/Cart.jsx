import React, { useEffect, useMemo, useState } from 'react';
import { getCart, updateQty, removeItem, clearCart, totalAmount } from '../lib/cart';
import api from '../lib/api';
import { MIDTRANS_CLIENT_KEY } from '../config';
import BuyerLayout from '../components/BuyerLayout';
import { useToast } from '../components/Toast';

function loadMidtrans(clientKey){
  return new Promise((resolve, reject) => {
    if (document.getElementById('midtrans-script')) return resolve();
    const s = document.createElement('script');
    s.id = 'midtrans-script';
    s.src = `https://app.sandbox.midtrans.com/snap/snap.js`;
    s.setAttribute('data-client-key', clientKey);
    s.onload = () => resolve();
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

export default function Cart(){
  const toast = useToast();
  const [items, setItems] = useState([]);

  useEffect(()=>{
    setItems(getCart());
    const onUpd = ()=> setItems(getCart());
    window.addEventListener('cart_updated', onUpd);
    return ()=> window.removeEventListener('cart_updated', onUpd);
  },[]);

  function inc(id, size){
    const it = items.find(i=>i.product_id===id && (i.size||null)===(size||null));
    setItems(updateQty(id, (it?.quantity||0) + 1, { size }));
  }
  function dec(id, size){
    const it = items.find(i=>i.product_id===id && (i.size||null)===(size||null));
    setItems(updateQty(id, (it?.quantity||0) - 1, { size }));
  }
  function del(id, size){ setItems(removeItem(id, { size })); }
  function clearAll(){ setItems(clearCart()); }

  const total = useMemo(()=> totalAmount(), [items]);

  function goCheckout(){
    if (!items.length) return toast.warning('Keranjang kosong');
    const token = localStorage.getItem('hr_token');
    if (!token) {
      if (window.confirm('Anda harus login terlebih dahulu. Login sekarang?')) window.location.href = '/login';
      return;
    }
    window.location.href = '/checkout';
  }

  return (
    <BuyerLayout title="Keranjang Belanja">
      <h2 className="text-2xl font-bold mb-6">Keranjang Belanja</h2>

      {items.length===0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-600 mb-4">Keranjang kosong.</p>
          <a href="/" className="btn btn-primary">Belanja Sekarang</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-4 overflow-x-auto">
            <table className="table min-w-full">
              <thead className="bg-rose-600 text-white">
                <tr>
                  <th>Produk</th>
                  <th>Harga</th>
                  <th className="w-48">Qty</th>
                  <th>Subtotal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={`${it.product_id}-${it.size||'def'}`}>
                    <td className="max-w-[280px] truncate">
                      <div className="truncate font-medium">{it.name}</div>
                      {it.size && <div className="text-xs text-gray-500">Ukuran: {it.size}</div>}
                    </td>
                    <td>Rp {parseInt(it.price||0).toLocaleString('id-ID')}</td>
                    <td>
                      <div className="inline-flex items-center gap-2">
                        <button onClick={()=>dec(it.product_id, it.size)} className="btn btn-outline px-3">-</button>
                        <span className="inline-block min-w-[40px] text-center font-semibold">{it.quantity}</span>
                        <button onClick={()=>inc(it.product_id, it.size)} className="btn btn-outline px-3">+</button>
                      </div>
                    </td>
                    <td>Rp {parseInt((it.price||0)*(it.quantity||0)).toLocaleString('id-ID')}</td>
                    <td>
                      <button onClick={()=>del(it.product_id, it.size)} className="btn btn-outline btn-sm">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card p-6 h-max">
            <h3 className="font-semibold text-lg mb-4">Ringkasan Belanja</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Item:</span>
                <span className="font-semibold">{items.reduce((a,b)=>a+b.quantity,0)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-rose-700">Rp {parseInt(total).toLocaleString('id-ID')}</span>
              </div>
              <button onClick={goCheckout} className="btn btn-primary w-full mt-4">Lanjut ke Checkout</button>
              <button onClick={clearAll} className="btn btn-outline w-full">Kosongkan Keranjang</button>
              <a href="/" className="btn btn-accent w-full">Lanjut Belanja</a>
            </div>
          </div>
        </div>
      )}
    </BuyerLayout>
  );
}
