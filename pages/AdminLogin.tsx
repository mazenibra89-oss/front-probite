import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://api-probite.exium.my.id/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('probite_auth', JSON.stringify({ 
          username: data.user.username, 
          token: data.token, 
          role: 'Owner' 
        }));
        // Force redirect to admin page
        navigate('/admin', { replace: true });
        // As backup, reload page after redirect
        setTimeout(() => {
          window.location.href = '/#/admin';
        }, 500);
      } else {
        setError(data.message || 'Username atau Password salah!');
      }
    } catch (err) {
      setError('Gagal terhubung ke server. Pastikan Backend sudah dijalankan!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5E6D3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-[#C0392B] mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Customer Page
        </button>
        <div className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#C0392B] mb-2">PROBITE</h1>
            <p className="text-gray-400">Admin Control Panel</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F5E6D3]/30 outline-none focus:ring-2 focus:ring-[#C0392B]" placeholder="admin" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F5E6D3]/30 outline-none focus:ring-2 focus:ring-[#C0392B]" placeholder="••••••••" required />
            </div>
            {error && <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl"><AlertCircle className="w-4 h-4" />{error}</div>}
            <button type="submit" className="w-full bg-[#C0392B] text-white py-4 rounded-2xl font-bold hover:bg-[#A93226] transition-all">Masuk Sekarang</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;