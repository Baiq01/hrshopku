import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';

export default function AdminCategories() {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', slug: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(()=>{ load(); },[]);

  async function load(){
    setLoading(true);
    try{
      const r = await api.get('/admin/categories');
      const data = r.data;
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setCategories(list);
    }catch(err){
      console.error('Load categories (admin) failed:', err);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        toast.error('Akses admin diperlukan. Silakan login sebagai admin.');
      } else {
        toast.error('Gagal memuat kategori admin');
      }
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  async function save(){
    if (!form.name || !form.name.trim()) {
      toast.warning('Nama kategori wajib diisi');
      return;
    }
    
    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, form);
        toast.success('Kategori berhasil diperbarui');
      } else {
        await api.post('/admin/categories', form);
        toast.success('Kategori berhasil dibuat');
      }
      setForm({name:'', slug:'', description:''});
      setEditingId(null);
      load();
    } catch(err) {
      console.error('Save category failed', err);
      toast.error('Gagal menyimpan kategori: ' + (err.response?.data?.message || err.message));
    }
  }

  function edit(cat){
    setForm({name: cat.name, slug: cat.slug, description: cat.description || ''});
    setEditingId(cat.id);
  }

  function cancelEdit(){
    setForm({name:'', slug:'', description:''});
    setEditingId(null);
  }

  async function remove(id){
    const category = categories.find(c => c.id === id);
    const confirmed = await confirm({
      title: 'Hapus Kategori',
      message: `Yakin ingin menghapus kategori "${category?.name}"? Produk dalam kategori akan tetap ada (category_id = null).`,
      type: 'danger',
      confirmText: 'Hapus',
      cancelText: 'Batal'
    });
    
    if (!confirmed) return;
    
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Kategori berhasil dihapus');
      load();
    } catch(err) {
      console.error('Delete category failed', err);
      toast.error('Gagal menghapus: ' + (err.response?.data?.message || err.message));
    }
  }

  return (
    <AdminLayout title="Kategori">
      <h2 className="text-2xl font-semibold mb-4">Kategori</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">{editingId ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
          <div className="space-y-2">
            <input 
              className="input" 
              placeholder="Nama Kategori" 
              value={form.name} 
              onChange={e=>setForm({...form,name:e.target.value})} 
            />
            <input 
              className="input" 
              placeholder="Slug (opsional)" 
              value={form.slug} 
              onChange={e=>setForm({...form,slug:e.target.value})} 
            />
            <textarea 
              className="input" 
              placeholder="Deskripsi (opsional)" 
              rows="3"
              value={form.description} 
              onChange={e=>setForm({...form,description:e.target.value})} 
            />
            <button className="btn btn-primary w-full" onClick={save}>
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button className="btn btn-outline w-full" onClick={cancelEdit}>Batal</button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 card p-4 overflow-x-auto">
          <h3 className="font-semibold mb-3">Daftar Kategori</h3>
          {loading && <div>Loading...</div>}
          <table className="table min-w-full">
            <thead className="bg-rose-600 text-white">
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Slug</th>
                <th>Deskripsi</th>
                <th>Jumlah Produk</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c=> (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td className="text-xs text-gray-600">{c.slug}</td>
                  <td className="max-w-[200px] truncate text-sm">{c.description || '-'}</td>
                  <td className="text-center">{c.products_count || 0}</td>
                  <td className="space-x-2">
                    <button className="btn btn-outline btn-sm" onClick={()=>edit(c)}>Edit</button>
                    <button className="btn btn-outline btn-sm" onClick={()=>remove(c.id)}>Hapus</button>
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
