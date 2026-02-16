import React, { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, Wallet, Users } from 'lucide-react';

const API_URL = 'https://api-probite.exium.my.id';

const AdminDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch(`${API_URL}/api/sales/history`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setTransactions(data);
        } else if (Array.isArray(data.history)) {
          setTransactions(data.history);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const today = new Date().toLocaleDateString();
  const todayTransactions = transactions.filter(t => new Date(t.createdAt).toLocaleDateString() === today);
  const totalOmzet = todayTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const totalTransactionsCount = todayTransactions.length;

  const stats = [
    { label: 'Omzet Hari Ini', value: `Rp ${totalOmzet.toLocaleString()}`, icon: <Wallet className="text-blue-500" />, color: 'bg-blue-50' },
    { label: 'Total Transaksi', value: totalTransactionsCount.toString(), icon: <ShoppingBag className="text-[#C0392B]" />, color: 'bg-red-50' },
    { label: 'Stok Kritis', value: '0', icon: <Users className="text-orange-500" />, color: 'bg-orange-50' },
  ];

  // Fungsi untuk update status pembayaran
  const handleTogglePaid = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_URL}/api/sales/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid: !currentStatus })
      });
      if (res.ok) {
        setTransactions(transactions => transactions.map(t => t._id === id ? { ...t, paid: !currentStatus } : t));
      } else {
        alert('Gagal update status pembayaran!');
      }
    } catch (err) {
      alert('Gagal update status pembayaran!');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Memuat Data Bisnis...</div>;

  return (
    <div className="space-y-8 animate-in fade-in">
      <header>
        <h1 className="text-3xl font-bold">Ringkasan Bisnis Online</h1>
        <p className="text-gray-500">Data real-time dari Server VPS & MongoDB.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <h4 className="text-2xl font-bold">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-6">Transaksi Terbaru</h3>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
            <tr>
              <th className="px-8 py-4">ID</th>
              <th className="px-8 py-4">Tanggal</th>
              <th className="px-8 py-4">Total</th>
              <th className="px-8 py-4">Kota</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 5).map((t: any) => (
              <tr key={t._id} className="border-b">
                <td className="px-8 py-4">{t.queueNumber || t._id}</td>
                <td className="px-8 py-4">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="px-8 py-4 font-bold text-green-600">Rp {t.totalAmount?.toLocaleString()}</td>
                <td className="px-8 py-4">{t.city || '-'}</td>
                <td className="px-8 py-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${t.paid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {t.paid ? 'Sudah Dibayar' : 'Belum Dibayar'}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <button
                    className={`px-4 py-2 rounded-xl font-bold ${t.paid ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
                    disabled={updatingId === t._id}
                    onClick={() => handleTogglePaid(t._id, t.paid)}
                  >
                    {updatingId === t._id ? 'Menyimpan...' : t.paid ? 'Tandai Belum' : 'Tandai Sudah'}
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">Belum ada transaksi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;