import React, {useEffect, useState} from 'react';
import axios from 'axios';
import api from '../lib/api';
import { getCart as cartGet, addItem as cartAdd } from '../lib/cart';
import BuyerLayout from '../components/BuyerLayout';
import { API_BASE, MIDTRANS_CLIENT_KEY } from '../config';
import { imageUrl } from '../lib/url';
import ProductImage from '../components/ProductImage';
import { Link } from 'react-router-dom';
import StoreMap from '../components/StoreMap';
import { useToast } from '../components/Toast';

function loadMidtrans(clientKey){
  return new Promise((resolve, reject) => {
    if (document.getElementById('midtrans-script')) return resolve();
    const s = document.createElement('script');
    s.id = 'midtrans-script';
    s.src = `https://app.midtrans.com/snap/snap.js`; // change to production if needed
    s.setAttribute('data-client-key', clientKey);
    s.onload = () => resolve();
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

export default function Home(){
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Hero images slider - bisa campuran jpg/png/webp
  const heroImages = [
    '/images/hero.png',
    '/images/hero1.png',
    '/images/hero2.png',
    '/images/bg-home.png',
  ];

  useEffect(()=>{ loadProducts(); loadCategories(); },[selectedCategory])

  async function loadProducts(){
    try {
      const params = selectedCategory ? { category_id: selectedCategory } : {};
      const r = await axios.get(`${API_BASE}/products`, { params });
      setProducts(r.data.data || r.data);
    } catch(err) {
      console.error('Load products failed', err);
    }
  }

  async function loadCategories(){
    try {
      const r = await axios.get(`${API_BASE}/categories`);
      const list = r.data.data || r.data;
      setCategories(Array.isArray(list) ? list : []);
    } catch(err) {
      console.error('Load categories failed', err);
    }
  }

  // Init cart from localStorage and listen to updates
  useEffect(()=>{
    setCart(cartGet());
    const onUpd = ()=>{ setCart(cartGet()); };
    window.addEventListener('cart_updated', onUpd);
    return ()=> window.removeEventListener('cart_updated', onUpd);
  },[])

  // Auto slide hero images every 4 seconds
  useEffect(()=>{
    const interval = setInterval(()=>{
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 4000);
    return ()=> clearInterval(interval);
  }, [heroImages.length]);

  function addToCart(p){
    const c = cartAdd(p, 1);
    setCart(c);
    toast.cart(p.name, {
      productName: p.name,
      productImage: imageUrl(p.thumbnail_url || p.image_url || p.image)
    });
  }

  async function checkout(){
    if (!cart.length) return toast.warning('Cart kosong');
    
    // Check if user logged in
    const token = localStorage.getItem('hr_token');
    if (!token) {
      if (window.confirm('Anda harus login terlebih dahulu. Login sekarang?')) {
        window.location.href = '/login';
      }
      return;
    }
    try {
      await loadMidtrans(MIDTRANS_CLIENT_KEY);
      const resp = await api.post(`/checkout`, {items:cart});
      const token_snap = resp.data.snap_token;
      const orderId = resp.data?.order?.order_number;
      if (!token_snap) return toast.error('Gagal membuat transaksi');
      window.snap.pay(token_snap, {
        onSuccess: function(result){
          toast.success('Pembayaran sukses!');
          if (orderId) {
            // optional sync to ensure backend reflects final status when webhook is not reachable locally
            api.post('/midtrans/refresh', { order_id: orderId }).catch(()=>{});
          }
          setCart([]);
        },
        onPending: function(result){
          toast.info('Pembayaran pending');
          if (orderId) {
            api.post('/midtrans/refresh', { order_id: orderId }).catch(()=>{});
          }
        },
        onError: function(result){
          toast.error('Pembayaran error');
        }
      });
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Checkout gagal';
      if (data) {
        if (typeof data.message === 'string') msg = data.message;
        else if (typeof data.details === 'string') msg = data.details;
        else if (typeof data.error === 'string') msg = data.error;
      }
      toast.error(msg);
      console.error('Checkout error:', err);
    }
  }

  return (
    <BuyerLayout title="Beranda">
      <section className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div className="flex items-center">
            <div>
              <h2 className="text-gray-700 text-xl">Temukan Dirimu </h2>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-rose-800">Tampilan & Gaya</h1>
              <div className="flex gap-3 mt-6">
                <button onClick={()=>document.getElementById('products-section')?.scrollIntoView({behavior:'smooth'})} className="btn btn-accent rounded-full">Temukan Sekarang</button>
                <a href="/custom-order" className="btn btn-primary rounded-full">Pesan Custom</a>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                ✨ Ingin baju bodo dengan ukuran dan desain khusus? <a href="/custom-order" className="underline font-semibold">Pesan Custom Sekarang</a>
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="group w-full max-w-md md:max-w-lg aspect-[4/3] bg-transparent rounded-3xl overflow-hidden relative ring-1 ring-rose-100/40">
              {/* Slider Images */}
              <div className="relative w-full h-full">
                {/* Soft gradient overlay on top of images */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-50/40 via-transparent to-rose-100/40 mix-blend-normal"></div>
                {heroImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Baju Bodo ${idx + 1}`}
                    style={{
                      transition: 'opacity 1.2s ease, transform 8s ease',
                      transform: idx === currentSlide ? 'scale(1.08)' : 'scale(1.02)'
                    }}
                    className={`absolute inset-0 w-full h-full object-contain ${
                      idx === currentSlide
                        ? 'opacity-100'
                        : 'opacity-0 blur-sm'
                    }`}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ))}
              </div>
              
              {/* Navigation Dots */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentSlide 
                        ? 'bg-white w-6' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
              
              {/* Arrow Navigation */}
              <button
                onClick={() => setCurrentSlide(prev => (prev - 1 + heroImages.length) % heroImages.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto duration-300"
                aria-label="Previous"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentSlide(prev => (prev + 1) % heroImages.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto duration-300"
                aria-label="Next"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="products-section">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Koleksi Produk</h2>
          <a href="/cart" className="text-sm text-rose-700 hover:underline font-semibold">Lihat Keranjang →</a>
        </div>
        
        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button 
            onClick={() => setSelectedCategory('')}
            className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-outline'}`}
          >
            Semua Kategori
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <div key={p.id} className="card overflow-hidden hover:shadow-xl transition-shadow">
              <Link to={`/product/${p.id}`}>
                <ProductImage src={p.thumbnail_url || p.image_url || p.image} alt={p.name} />
              </Link>
              <div className="p-4">
                <Link to={`/product/${p.id}`} className="font-semibold line-clamp-1 hover:underline">{p.name}</Link>
                {p.category && (
                  <p className="text-xs text-rose-600 mb-1 font-medium">{p.category.name}</p>
                )}
                <p className="text-lg font-bold text-gray-800 mb-3">Rp {parseInt(p.price).toLocaleString('id-ID')}</p>
                {Array.isArray(p.sizes_array) && p.sizes_array.length > 0 ? (
                  <Link to={`/product/${p.id}`} className="btn btn-primary w-full text-center">Pilih Ukuran</Link>
                ) : (
                  <button className="btn btn-primary w-full" onClick={()=>addToCart(p)}>Tambah ke Keranjang</button>
                )}
              </div>
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Tidak ada produk dalam kategori ini.
          </div>
        )}
      </section>

      {/* Tentang Toko Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Tentang toko kami
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            HRSHOPKU Baju Bodo adalah toko baju bodo terpercaya di Parepare. Kami menyediakan baju bodo berkualitas dengan desain tradisional dan modern.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Informasi Kontak */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-rose-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Informasi Kontak
            </h3>
            
            <div className="space-y-6">
              {/* Alamat */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Alamat</h4>
                  <p className="text-sm text-gray-600">
                    Jl. Cendrawasih NO.5 Blok B Perumnas Wekke'e<br />
                    Galung Maloang, Kec. Bacukiki<br />
                    Kota Parepare, Sulawesi Selatan 91121
                  </p>
                </div>
              </div>

              {/* Telepon */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">WhatsApp</h4>
                  <a href="https://wa.me/6282393922833" target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline">
                    +62 823-9392-2833
                  </a>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Instagram</h4>
                  <a href="https://www.instagram.com/hrshopku_bajubodo?igsh=Mzd4OWtreTd4ZHB4" target="_blank" rel="noopener noreferrer" className="text-sm text-pink-600 hover:underline">
                    @hrshopku_bajubodo
                  </a>
                </div>
              </div>

              {/* Jam Operasional */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Jam Operasional</h4>
                  <p className="text-sm text-gray-600">
                    Senin - Sabtu: 08:00 - 21:00 WITA<br />
                    Minggu: 08:00 - 22:00 WITA
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Peta */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-rose-100">
            <div className="p-6 bg-gradient-to-r from-rose-50 to-pink-50">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Lokasi Toko
              </h3>
              <p className="text-sm text-gray-600 mt-1">Kunjungi toko kami untuk pilihan produk lebih lengkap</p>
            </div>
            <div className="h-[400px]">
              <StoreMap />
            </div>
          </div>
        </div>
      </section>
    </BuyerLayout>
  )
}
