import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function TailorLayout({ children }) {
  const navigate = useNavigate();
  const [tailorName, setTailorName] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
      setTailorName(user.name);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post('http://localhost:8000/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/tailor/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-rose-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/tailor" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="/images/logo.png" 
                alt="HRSHOPKU Logo" 
                className="w-14 h-14 object-contain"
              />
              <div>
                <span className="text-xl font-extrabold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  HRSHOPKU
                </span>
                <p className="text-xs text-rose-600 font-medium">Dashboard Penjahit</p>
              </div>
            </Link>

            <nav className="flex items-center gap-4">
              <Link 
                to="/tailor" 
                className="px-4 py-2 text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-all font-medium"
              >
                Custom Orders
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Halo, <span className="font-semibold text-rose-700">{tailorName}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

export default TailorLayout;
