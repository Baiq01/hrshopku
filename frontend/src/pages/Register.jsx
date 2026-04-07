import React, {useState} from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

export default function Register(){
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    setError('');
    try{
      const r = await api.post('/auth/register',{name, email, password});
      localStorage.setItem('hr_token', r.data.token);
      localStorage.setItem('hr_user', JSON.stringify(r.data.user));
      toast.success('Registrasi berhasil! Anda sudah login.');
      setTimeout(() => nav('/'), 1500);
    }catch(err){
      const data = err.response?.data;
      let msg = 'Registrasi gagal';
      if (data) {
        if (typeof data.message === 'string') {
          msg = data.message;
        } else if (data.message && typeof data.message === 'object') {
          // Ambil pesan pertama dari object errors {field: [messages]}
          const first = Object.values(data.message).flat?.() || Object.values(data.message);
          msg = Array.isArray(first) ? (first[0] || msg) : String(first || msg);
        } else if (typeof data.error === 'string') {
          msg = data.error;
        }
      }
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-card rounded-xl border border-rose-100 p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold text-rose-700">HRSHOPKU</h1>
            <p className="text-xs text-gray-500 mt-1">Daftar Akun Baru</p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
              {(error.toLowerCase().includes('sudah terdaftar') || error.toLowerCase().includes('has already been taken')) && (
                <div className="mt-2">
                  Silakan <a href="/login" className="text-rose-600 underline font-semibold">login</a> dengan email tersebut.
                </div>
              )}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</label>
              <input 
                className="input" 
                value={name} 
                onChange={e=>setName(e.target.value)} 
                placeholder="Nama lengkap" 
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
              <input 
                type="email"
                className="input" 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                placeholder="email@example.com" 
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
              <input 
                type="password" 
                className="input" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                placeholder="password" 
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">Daftar</button>
          </form>
          <div className="mt-6 flex gap-2 text-xs justify-center">
            <span className="text-gray-500">Sudah punya akun?</span>
            <a href="/login" className="text-rose-600 hover:underline font-semibold">Login</a>
          </div>
        </div>
      </div>
    </div>
  )
}
