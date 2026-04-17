import React, {useState} from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    setError('');
    try{
      const r = await api.post('/auth/login',{email, password});
      localStorage.setItem('hr_token', r.data.token);
      localStorage.setItem('hr_user', JSON.stringify(r.data.user));
      
      // Redirect based on is_admin
      if (r.data.user.is_admin) {
        nav('/admin/products');
      } else {
        nav('/');
      }
    }catch(err){
      const data = err.response?.data;
      let msg = 'Email atau password salah';
      if (data) {
        if (typeof data.message === 'string') msg = data.message;
        else if (data.message && typeof data.message === 'object') {
          const first = Object.values(data.message).flat?.() || Object.values(data.message);
          msg = Array.isArray(first) ? (first[0] || msg) : String(first || msg);
        } else if (typeof data.error === 'string') msg = data.error;
      }
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-card rounded-xl border border-rose-100 p-8">
          <div className="mb-6 text-center">
            <img src="/images/logo.png" alt="HRSHOPKU Logo" className="w-20 h-20 mx-auto mb-3 object-contain" />
            <h1 className="text-2xl font-extrabold text-rose-700">HRSHOPKU</h1>
            <p className="text-xs text-gray-500 mt-1">Login Pembeli</p>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
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
            <button type="submit" className="btn bg-primary w-full">Login</button>
          </form>
          <div className="mt-6 flex gap-2 text-xs justify-center">
            <span className="text-gray-500">Belum punya akun?</span>
            <a href="/register" className="text-rose-600 hover:underline font-semibold">Daftar Sekarang</a>
          </div>
          <div className="mt-3 flex gap-3 text-center justify-center text-xs">
            <a href="/admin/login" className="text-gray-500 hover:text-rose-600 hover:underline transition-colors">Login sebagai Admin</a>
            <span className="text-gray-300">|</span>
            <a href="/tailor/login" className="text-gray-500 hover:text-rose-600 hover:underline transition-colors">Login sebagai Penjahit</a>
          </div>
        </div>
      </div>
    </div>
  )
}
