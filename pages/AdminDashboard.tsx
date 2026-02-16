import React, { useEffect, useState } from 'react';
import { useProbiteStore } from '../store';
import { TrendingUp, ShoppingBag, Wallet, Users, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API_URL = 'https://api-probite.exium.my.id';

const AdminDashboard: React.FC = () => {
  const { transactions, setTransactions, products } = useProbiteStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch(`${API_URL}/api/sales/history`);
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error("Gagal ambil history transaksi");
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const today = new Date().toLocaleDateString();
  const todayTransactions = transactions.filter(t => new Date(t.createdAt).toLocaleDateString() === today);
  
  const totalOmzet = todayTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalTransactionsCount = todayTransactions.length;

  const stats = [
    { label: 'Omzet Hari Ini', value: `Rp ${totalOmzet.toLocaleString()}`, icon: <Wallet className="text-blue-500" />, color: 'bg-blue-50' },
    { label: 'Total Transaksi', value: totalTransactionsCount.toString(), icon: <ShoppingBag className="text-[#C0392B]" />, color: 'bg-red-50' },
    { label: 'Stok Kritis', value: products.filter(p => p.stock < 10).length.toString(), icon: <Users className="text-orange-500" />, color: 'bg-orange-50' },
  ];

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
        <h3 className="text-xl font-bold mb-6">Aktivitas Penjualan Terakhir</h3>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
            <tr>
              <th className="px-8 py-4">Waktu</th>
              <th className="px-8 py-4">Total</th>
              <th className="px-8 py-4">Metode</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 5).map((t: any) => (
              <tr key={t._id} className="border-b">
                <td className="px-8 py-4">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="px-8 py-4 font-bold text-green-600">Rp {t.totalAmount.toLocaleString()}</td>
                <td className="px-8 py-4">{t.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;