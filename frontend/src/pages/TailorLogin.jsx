import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function TailorLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', formData);
      
      const { user, token } = response.data;

      // Validasi role penjahit
      if (user.role !== 'tailor') {
        setError('Akses ditolak. Anda bukan penjahit.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      navigate('/tailor');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-rose-100">
          {/* Logo dan Judul */}
          <img 
            src="/images/logo.png" 
            alt="HRSHOPKU Logo" 
            className="w-20 h-20 mx-auto mb-3 object-contain"
          />
          <h1 className="text-3xl font-extrabold text-center mb-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            HRSHOPKU
          </h1>
          <p className="text-center text-rose-600 font-medium mb-6">Login Penjahit</p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 flex gap-3 text-xs justify-center">
            <a href="/login" className="text-gray-500 hover:text-rose-600 hover:underline transition-colors">Login Pembeli</a>
            <span className="text-gray-300">|</span>
            <a href="/admin/login" className="text-gray-500 hover:text-rose-600 hover:underline transition-colors">Login Admin</a>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Khusus untuk penjahit HRSHOPKU</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TailorLogin;
