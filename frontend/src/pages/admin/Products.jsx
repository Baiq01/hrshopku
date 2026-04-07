import React, {useEffect, useState} from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { imageUrl } from '../../lib/url';
import ProductImage from '../../components/ProductImage';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';

export default function AdminProducts(){
  const toast = useToast();
  const { confirm } = useConfirm();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({name:'',slug:'',price:0,stock:0,description:'',category_id:''});
  const [filesById, setFilesById] = useState({});

  useEffect(()=>{ load(); loadCategories(); },[]);

  async function load(){
    setLoading(true);
    try{
      const r = await api.get('/admin/products');
      const data = r.data;
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setProducts(list);
    }catch(err){
      console.error('Load products (admin) failed:', err);
      // Show a friendly message if unauthorized or server error
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        toast.error('Akses admin diperlukan. Silakan login sebagai admin.');
      } else {
        toast.error('Gagal memuat produk admin');
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function toEdit(id){
    window.location.href = `/admin/products/${id}/edit`;
  }

  async function loadCategories(){
    try{
      const r = await api.get('/admin/categories');
      const data = r.data;
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setCategories(list);
    }catch(err){
      console.error('Load categories failed:', err);
    }
  }

  async function create(){
    // Validasi
    if (!form.name || !form.name.trim()) {
      toast.warning('Nama produk wajib diisi');
      return;
    }
    if (!form.description || !form.description.trim()) {
      toast.warning('Deskripsi produk wajib diisi');
      return;
    }
    if (!form.category_id) {
      toast.warning('Kategori produk wajib dipilih');
      return;
    }
    if (!form.price || form.price <= 0) {
      toast.warning('Harga produk harus lebih dari 0');
      return;
    }

    try {
      await api.post('/admin/products', form);
      setForm({name:'',slug:'',price:0,stock:0,description:'',category_id:''});
      toast.success('Produk berhasil ditambahkan');
      load();
    } catch (err) {
      toast.error('Gagal menambahkan produk: ' + (err.response?.data?.message || err.message));
    }
  }

  async function remove(id){
    const product = products.find(p => p.id === id);
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
      load();
    } catch (err) {
      toast.error('Gagal menghapus produk: ' + (err.response?.data?.message || err.message));
    }
  }

  function onChooseFile(e, id){
    const file = e.target.files?.[0];
    if (file){
      setFilesById(prev => ({...prev, [id]: file}));
    }
  }

  async function uploadImage(id){
    const file = filesById[id];
    if (!file) {
      toast.warning('Pilih file gambar terlebih dahulu');
      return;
    }
    
    try {
      const fd = new FormData();
      fd.append('image', file);
      await api.post(`/admin/products/${id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Gambar berhasil diunggah');
      setFilesById(prev => {
        const next = {...prev};
        delete next[id];
        return next;
      });
      load();
    } catch (err) {
      toast.error('Gagal mengunggah gambar: ' + (err.response?.data?.message || err.message));
    }
  }

  return (
    <AdminLayout title="Produk">
      <h2 className="text-2xl font-semibold mb-4">Produk</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Tambah Produk</h3>
          <div className="space-y-2">
            <input className="input" placeholder="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            <input className="input" placeholder="slug" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} />
            <select className="input" value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}>
              <option value="">-- Pilih Kategori --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="input" placeholder="price" type="number" value={form.price} onChange={e=>setForm({...form,price:parseInt(e.target.value||0)})} />
            <input className="input" placeholder="stock" type="number" value={form.stock} onChange={e=>setForm({...form,stock:parseInt(e.target.value||0)})} />
            <textarea className="input" placeholder="description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
            <button className="btn btn-primary w-full" onClick={create}>Create</button>
          </div>
        </div>

        <div className="lg:col-span-2 card p-4 overflow-x-auto">
          <h3 className="font-semibold mb-3">Daftar Produk</h3>
          {loading && <div>Loading...</div>}
          <table className="table min-w-full">
            <thead className="bg-rose-600 text-white"><tr><th>ID</th><th>Image</th><th>Name</th><th>Kategori</th><th>Price</th><th>Stock</th><th>Upload</th><th>Action</th></tr></thead>
            <tbody>
              {products.map(p=> (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.image ? <div className="w-16 h-16 overflow-hidden rounded"><ProductImage src={p.thumbnail_url || p.image_url || p.image} alt="img" ratio="aspect-square" /></div> : '-'}</td>
                  <td className="max-w-[220px] truncate">
                    <div className="font-semibold truncate">{p.name}</div>
                    {Array.isArray(p.sizes_array) && p.sizes_array.length>0 && (
                      <div className="text-[11px] text-gray-600">Ukuran: {p.sizes_array.join(', ')}</div>
                    )}
                  </td>
                  <td className="text-xs">{p.category ? p.category.name : '-'}</td>
                  <td>Rp {p.price}</td>
                  <td>{p.stock}</td>
                  <td className="space-y-2">
                    <input className="block" type="file" accept="image/*" onChange={e=>onChooseFile(e,p.id)} />
                    <button className="btn btn-outline" onClick={()=>uploadImage(p.id)}>Upload</button>
                  </td>
                  <td className="space-x-2 whitespace-nowrap">
                    <button className="btn btn-outline" onClick={()=>toEdit(p.id)}>Edit</button>
                    <button className="btn btn-outline" onClick={()=>remove(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
