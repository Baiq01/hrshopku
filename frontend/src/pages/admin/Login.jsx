import React, {useState} from 'react';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin(){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    try{
      const r = await api.post('/auth/login',{email,password});
      localStorage.setItem('hr_token', r.data.token);
      nav('/admin/products');
    }catch(err){
      alert('Login gagal');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-card rounded-xl border border-rose-100 p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-extrabold text-rose-700">HRSHOPKU ADMIN</h1>
            <p className="text-xs text-gray-500 mt-1">Silakan login untuk mengelola toko.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
              <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
              <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" />
            </div>
            <button type="submit" className="btn btn-primary w-full">Login</button>
          </form>
          <div className="mt-6 flex gap-3 text-xs justify-center">
            <a href="/login" className="text-gray-500 hover:text-rose-600 hover:underline transition-colors">Login Pembeli</a>
            <span className="text-gray-300">|</span>
            <a href="/tailor/login" className="text-gray-500 hover:text-rose-600 hover:underline transition-colors">Login Penjahit</a>
          </div>
        </div>
      </div>
    </div>
  )
}
