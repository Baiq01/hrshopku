import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';

export default function AdminProductEdit(){
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:'', slug:'', description:'', details:'', price:0, stock:0, sizes:'' });

  useEffect(()=>{ load(); }, [id]);

  async function load(){
    setLoading(true);
    try {
      const r = await api.get(`/admin/products/${id}`);
      const p = r.data;
      setProduct(p);
      // Prepare sizes as comma string for editing
      let sizesStr = '';
      if (Array.isArray(p.sizes_array)) sizesStr = p.sizes_array.join(',');
      else if (Array.isArray(p.sizes)) sizesStr = p.sizes.join(',');
      setForm({
        name: p.name||'',
        slug: p.slug||'',
        description: p.description||'',
        details: p.details||'',
        price: p.price||0,
        stock: p.stock||0,
        sizes: sizesStr
      });
    } catch (e){
      toast.error('Gagal memuat produk: ' + (e.response?.data?.message || e.message));
    } finally { setLoading(false); }
  }

  async function save(){
    // Validasi
    if (!form.name || !form.name.trim()) {
      toast.warning('Nama produk wajib diisi');
      return;
    }
    if (!form.description || !form.description.trim()) {
      toast.warning('Deskripsi produk wajib diisi');
      return;
    }
    if (!form.price || form.price <= 0) {
      toast.warning('Harga produk harus lebih dari 0');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/admin/products/${id}`, { ...form });
      toast.success('Perubahan berhasil disimpan');
      setTimeout(() => nav('/admin/products'), 1500);
    } catch (e){
      toast.error('Gagal menyimpan: ' + (e.response?.data?.message || e.message));
    } finally { setSaving(false); }
  }

  async function deleteProduct(){
    const confirmed = await confirm({
      title: 'Hapus Produk',
      message: `Yakin ingin menghapus produk "${product?.name}"? Tindakan ini tidak dapat dibatalkan.`,
      type: 'danger',
      confirmText: 'Hapus',
      cancelText: 'Batal'
    });
    
    if (!confirmed) return;

    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Produk berhasil dihapus');
      setTimeout(() => nav('/admin/products'), 1500);
    } catch (err) {
      toast.error('Gagal menghapus produk: ' + (err.response?.data?.message || err.message));
    }
  }

  if (loading) return <AdminLayout title="Edit Produk"><div className="p-6">Memuat...</div></AdminLayout>;
  if (!product) return <AdminLayout title="Edit Produk"><div className="p-6 text-red-600">Produk tidak ditemukan</div></AdminLayout>;

  return (
    <AdminLayout title={`Edit: ${product.name}`}> 
      <div className="max-w-3xl space-y-6">
        <div className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Nama</label>
            <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Slug</label>
            <input className="input" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Harga</label>
              <input type="number" className="input" value={form.price} onChange={e=>setForm({...form,price:parseInt(e.target.value||0)})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Stok</label>
              <input type="number" className="input" value={form.stock} onChange={e=>setForm({...form,stock:parseInt(e.target.value||0)})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Deskripsi Singkat</label>
            <textarea className="input h-24" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Detail Produk (bahan, perawatan, dll)</label>
            <textarea className="input h-32" value={form.details} onChange={e=>setForm({...form,details:e.target.value})} placeholder="Contoh: Bahan katun premium\nCuci dengan air dingin\nJangan gunakan pemutih" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Ukuran (pisahkan dengan koma)</label>
            <input className="input" value={form.sizes} onChange={e=>setForm({...form,sizes:e.target.value})} placeholder="S,M,L,XL" />
            <p className="text-xs text-gray-500 mt-1">Gunakan format: S,M,L,XL (tanpa spasi di akhir). Biarkan kosong jika free size.</p>
          </div>
          <div className="flex gap-3 pt-4">
            <button disabled={saving} onClick={save} className="btn btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>
            <button disabled={saving} onClick={()=>nav('/admin/products')} className="btn btn-outline">Batal</button>
            <button disabled={saving} onClick={deleteProduct} className="btn bg-red-600 text-white hover:bg-red-700 ml-auto">Hapus Produk</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
