import React, { useState } from 'react';
import BuyerLayout from '../components/BuyerLayout';
import api from '../lib/api';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import { useNavigate } from 'react-router-dom';

export default function CustomOrder() {
  const toast = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    size: '',
    color: '',
    fabric_type: '',
    chest: '',
    waist: '',
    hip: '',
    length: '',
    shoulder: '',
    sleeve: '',
    design_notes: '',
    quantity: 1,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem('hr_token');
    if (!token) {
      const shouldLogin = await confirm({
        title: 'Login Diperlukan',
        message: 'Anda harus login terlebih dahulu untuk membuat custom order. Login sekarang?',
        type: 'info',
        confirmText: 'Login',
        cancelText: 'Batal'
      });
      
      if (shouldLogin) {
        navigate('/login');
      }
      return;
    }

    if (!form.customer_name || !form.customer_phone) {
      toast.warning('Nama dan nomor telepon wajib diisi');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('customer_name', form.customer_name);
      formData.append('customer_phone', form.customer_phone);
      if (form.customer_email) formData.append('customer_email', form.customer_email);
      if (form.size) formData.append('size', form.size);
      if (form.color) formData.append('color', form.color);
      if (form.fabric_type) formData.append('fabric_type', form.fabric_type);
      if (form.design_notes) formData.append('design_notes', form.design_notes);
      formData.append('quantity', form.quantity || 1);

      // Measurements as JSON string
      const measurements = {
        chest: form.chest || '',
        waist: form.waist || '',
        hip: form.hip || '',
        length: form.length || '',
        shoulder: form.shoulder || '',
        sleeve: form.sleeve || '',
      };
      
      // Only send measurements if at least one field is filled
      const hasMeasurements = Object.values(measurements).some(v => v !== '');
      if (hasMeasurements) {
        formData.append('measurements', JSON.stringify(measurements));
      }

      if (imageFile) {
        formData.append('reference_image', imageFile);
      }

      const response = await api.post('/custom-orders', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Success response:', response.data);
      toast.success('Permintaan custom order berhasil dikirim! Admin akan menghubungi Anda segera.');
      setTimeout(() => navigate('/my-custom-orders'), 1500);
    } catch (err) {
      console.error('Submit error', err);
      console.error('Error response:', err.response?.data);
      
      let msg = 'Gagal mengirim permintaan';
      
      if (err.response?.data) {
        const data = err.response.data;
        if (data.errors) {
          // Validation errors
          const errorMessages = Object.values(data.errors).flat();
          msg = errorMessages.join(', ');
        } else if (data.message) {
          msg = data.message;
        } else if (data.error) {
          msg = data.error;
        }
      }

      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }  return (
    <BuyerLayout title="Pesan Custom">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-2 text-rose-700">Pesan Baju Bodo Kostum</h2>
          <p className="text-gray-600 mb-6">
            Pesan baju bodo sesuai dengan ukuran, warna, dan desain yang Anda inginkan
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informasi Kontak */}
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Informasi Kontak</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input w-full"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="input w-full"
                    value={form.customer_phone}
                    onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Email (Opsional)</label>
                  <input
                    type="email"
                    className="input w-full"
                    value={form.customer_email}
                    onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Detail Pesanan */}
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Detail Pesanan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ukuran</label>
                  <select
                    className="input w-full"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                  >
                    <option value="">Pilih Ukuran</option>
                    <option value="S">S (Small)</option>
                    <option value="M">M (Medium)</option>
                    <option value="L">L (Large)</option>
                    <option value="XL">XL (Extra Large)</option>
                    <option value="XXL">XXL</option>
                    <option value="Custom">Kostum (isi ukuran detail)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Warna</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    placeholder="Contoh: Merah Maroon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jenis Kain</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={form.fabric_type}
                    onChange={(e) => setForm({ ...form, fabric_type: e.target.value })}
                    placeholder="Contoh: Sutra, Brokat"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    className="input w-full"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
            </div>

            {/* Ukuran Detail */}
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">
                Ukuran Detail (Opsional)
                <span className="text-sm font-normal text-gray-600 ml-2">
                  *dalam centimeter (cm)
                </span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Lingkar Dada</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={form.chest}
                    onChange={(e) => setForm({ ...form, chest: e.target.value })}
                    placeholder="cm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lingkar Pinggang</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={form.waist}
                    onChange={(e) => setForm({ ...form, waist: e.target.value })}
                    placeholder="cm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lingkar Pinggul</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={form.hip}
                    onChange={(e) => setForm({ ...form, hip: e.target.value })}
                    placeholder="cm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Panjang Baju</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={form.length}
                    onChange={(e) => setForm({ ...form, length: e.target.value })}
                    placeholder="cm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lebar Bahu</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={form.shoulder}
                    onChange={(e) => setForm({ ...form, shoulder: e.target.value })}
                    placeholder="cm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Panjang Lengan</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={form.sleeve}
                    onChange={(e) => setForm({ ...form, sleeve: e.target.value })}
                    placeholder="cm"
                  />
                </div>
              </div>
            </div>

            {/* Catatan & Gambar Referensi */}
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Catatan & Referensi</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Catatan Desain/Permintaan Khusus
                  </label>
                  <textarea
                    className="input w-full"
                    rows="4"
                    value={form.design_notes}
                    onChange={(e) => setForm({ ...form, design_notes: e.target.value })}
                    placeholder="Jelaskan detail desain atau permintaan khusus lainnya..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Upload Gambar Referensi (Opsional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-black
                      hover:file:bg-opacity-90"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-xs rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary px-8"
              >
                {submitting ? 'Mengirim...' : 'Kirim Permintaan'}
              </button>
              <a href="/" className="btn btn-outline">
                Batal
              </a>
            </div>
          </form>
        </div>
      </div>
    </BuyerLayout>
  );
}
