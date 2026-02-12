import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';

const AdminRegister: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem('probite_auth');
    if (!auth) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Menggunakan 127.0.0.1 agar lebih stabil dibanding localhost
      const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registrasi berhasil! Silakan login.');
        setTimeout(() => navigate('/admin/login'), 1500);
      } else {
        setError(data.message || 'Gagal registrasi');
      }
    } catch (err) {
      setError('Gagal terhubung ke server. Pastikan Backend sudah jalan di port 5000.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5E6D3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-gray-500 hover:text-[#C0392B] mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Dashboard Admin
        </button>
        <div className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[#C0392B] mb-2">Register Admin</h1>
            <p className="text-gray-400">Buat akun admin baru</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F5E6D3]/30 outline-none focus:ring-2 focus:ring-[#C0392B]" placeholder="Username admin" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F5E6D3]/30 outline-none focus:ring-2 focus:ring-[#C0392B]" placeholder="Password" required />
            </div>
            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-xl flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
            {success && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-xl">✅ {success}</div>}
            <button type="submit" className="w-full bg-[#C0392B] text-white py-4 rounded-2xl font-bold hover:bg-[#A93226] transition-all">Register Sekarang</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;