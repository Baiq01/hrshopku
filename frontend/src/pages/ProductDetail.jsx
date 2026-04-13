import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BuyerLayout from '../components/BuyerLayout';
import { API_BASE } from '../config';
import ProductImage from '../components/ProductImage';
import { addItem } from '../lib/cart';
import { useToast } from '../components/Toast';
import { imageUrl } from '../lib/url';

export default function ProductDetail(){
  const { id } = useParams();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [renderedDetails, setRenderedDetails] = useState('');

  useEffect(()=>{ load(); }, [id]);

  async function load(){
    setLoading(true); setError('');
    try {
      const r = await axios.get(`${API_BASE}/products/${id}`);
      const p = r.data;
      // normalize sizes array
      if (p && typeof p.sizes_array === 'undefined') {
        if (p.sizes && Array.isArray(p.sizes)) p.sizes_array = p.sizes;
        else if (typeof p.sizes === 'string') { try { p.sizes_array = JSON.parse(p.sizes); } catch { p.sizes_array = []; } }
      }
      setProduct(p);
      if (p?.sizes_array?.length) setSelectedSize(p.sizes_array[0]);
    } catch (e) {
      setError('Produk tidak ditemukan');
    } finally {
      setLoading(false);
    }
  }

  // Markdown render for details, sanitized
  useEffect(()=>{
    async function renderMd(){
      if (!product?.details) { setRenderedDetails(''); return; }
      try{
        const [{ marked }, DOMPurify] = await Promise.all([
          import('marked'),
          import('dompurify')
        ]);
        const html = marked.parse(product.details || '');
        const clean = DOMPurify.default.sanitize(html);
        setRenderedDetails(clean);
      }catch{
        setRenderedDetails('');
      }
    }
    renderMd();
  }, [product?.details]);

  const variantMap = useMemo(()=>{
    const map = {};
    if (product?.variants && Array.isArray(product.variants)){
      product.variants.forEach(v=>{ if (v?.size) map[v.size] = v; });
    }
    return map;
  }, [product]);

  const displayPrice = useMemo(()=>{
    const base = parseInt(product?.price||0);
    if (selectedSize && variantMap[selectedSize] && variantMap[selectedSize].price!=null){
      return parseInt(variantMap[selectedSize].price||0);
    }
    return base;
  }, [product, selectedSize, variantMap]);

  const selectedStock = useMemo(()=>{
    if (selectedSize && variantMap[selectedSize] && variantMap[selectedSize].stock!=null){
      return parseInt(variantMap[selectedSize].stock||0);
    }
    return product?.stock ?? null;
  }, [product, selectedSize, variantMap]);

  function addToCart(){
    if (!product) return;
    if (product.sizes_array?.length && !selectedSize) {
      toast.warning('Pilih ukuran terlebih dahulu');
      return;
    }
    if (selectedStock!=null && selectedStock<=0) {
      toast.error('Stok untuk ukuran ini habis');
      return;
    }
    addItem({ ...product, size: selectedSize, price: displayPrice }, qty, { size: selectedSize });
    toast.cart(product.name, {
      productName: product.name,
      productImage: imageUrl(product.thumbnail_url || product.image_url || product.image)
    });
  }

  function inc(){ setQty(q=> Math.min(99, q+1)); }
  function dec(){ setQty(q=> Math.max(1, q-1)); }

  if (loading) return <BuyerLayout title="Memuat Produk"><div className="p-8 text-center">Memuat...</div></BuyerLayout>;
  if (error) return <BuyerLayout title="Produk"><div className="p-8 text-center text-red-600">{error}</div></BuyerLayout>;
  if (!product) return null;

  return (
    <BuyerLayout title={product.name}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <ProductImage src={product.thumbnail_url || product.image_url || product.image} alt={product.name} ratio="aspect-square" />
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            {product.category && <p className="text-xs uppercase tracking-wide text-rose-600 font-semibold">{product.category.name}</p>}
          </div>
          <p className="text-2xl font-bold text-rose-700">Rp {parseInt(displayPrice||0).toLocaleString('id-ID')}</p>
          {product.details && (
            <div className="prose max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: renderedDetails }} />
          )}
          {product.sizes_array?.length ? (
            <div>
              <h3 className="text-sm font-semibold mb-2">Pilih Ukuran:</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes_array.map(sz => (
                  <button
                    key={sz}
                    onClick={()=> setSelectedSize(sz)}
                    className={'px-3 py-1 rounded-md text-sm font-medium border ' + (selectedSize===sz ? 'bg-rose-600 text-white border-rose-600' : 'bg-white hover:bg-rose-50 border-gray-300')}
                  >{sz}</button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Ukuran tunggal / free size.</p>
          )}
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2">
              <button onClick={dec} className="btn btn-outline px-3">-</button>
              <span className="min-w-[40px] text-center font-semibold">{qty}</span>
              <button onClick={inc} className="btn btn-outline px-3">+</button>
            </div>
            <button onClick={addToCart} disabled={selectedStock!=null && selectedStock<=0} className="btn btn-primary disabled:opacity-60">
              {selectedStock!=null && selectedStock<=0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Stok: {selectedStock!=null ? selectedStock : '-'} • ID: {product.id}
          </div>
        </div>
      </div>
      {product.description && (
        <div className="max-w-5xl mx-auto mt-12">
          <h2 className="text-lg font-semibold mb-3">Deskripsi</h2>
          <p className="text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      )}
    </BuyerLayout>
  );
}
