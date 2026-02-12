import React from 'react';
import { useProbiteStore } from '../store';
import { 
  TrendingUp, 
  ShoppingBag, 
  Wallet, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { OrderStatus } from '../types';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { transactions, products, updateTransactionStatus } = useProbiteStore();

  // Stats Calculation
  const today = new Date().toLocaleDateString();
  const todayTransactions = transactions.filter(t => new Date(t.createdAt).toLocaleDateString() === today && t.status === OrderStatus.COMPLETED);
  const totalOmzet = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalProfit = todayTransactions.reduce((sum, t) => sum + t.totalProfit, 0);
  const totalTransactionsCount = todayTransactions.length;

  // Chart Data Simulation (Last 7 Days)
  const chartData = [
    { name: 'Mon', sales: 1200000 },
    { name: 'Tue', sales: 1500000 },
    { name: 'Wed', sales: 1100000 },
    { name: 'Thu', sales: 1800000 },
    { name: 'Fri', sales: 2400000 },
    { name: 'Sat', sales: 3200000 },
    { name: 'Sun', sales: 2800000 },
  ];

  // Produk Terlaris Berdasarkan Transaksi Nyata
  const completedTransactions = transactions.filter(t => t.status === OrderStatus.COMPLETED);
  const productSalesMap: Record<string, { name: string; count: number; color: string }> = {};
  const colorPalette = ['#C0392B', '#2D3436', '#27AE60', '#2980B9', '#F39C12', '#8E44AD', '#16A085'];

  completedTransactions.forEach(t => {
    t.items.forEach(item => {
      // Hanya produk yang masih ada di daftar produk
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            name: prod.name,
            count: 0,
            color: colorPalette[Object.keys(productSalesMap).length % colorPalette.length]
          };
        }
        productSalesMap[item.productId].count += item.quantity;
      }
    });
  });

  // Urutkan dan ambil top 3
  const bestSellers = Object.values(productSalesMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const stats = [
    { label: 'Omzet Hari Ini', value: `Rp ${totalOmzet.toLocaleString()}`, icon: <Wallet className="text-blue-500" />, trend: '+12%', color: 'bg-blue-50' },
    { label: 'Profit Hari Ini', value: `Rp ${totalProfit.toLocaleString()}`, icon: <TrendingUp className="text-[#27AE60]" />, trend: '+8%', color: 'bg-emerald-50' },
    { label: 'Total Transaksi', value: totalTransactionsCount.toString(), icon: <ShoppingBag className="text-[#C0392B]" />, trend: '+5%', color: 'bg-red-50' },
    { label: 'Stok Kritis', value: products.filter(p => p.stock < 10).length.toString(), icon: <Users className="text-orange-500" />, trend: 'Warning', color: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2 md:px-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Ringkasan Bisnis</h1>
          <p className="text-gray-500 text-sm md:text-base">Pantau performa PROBITE secara real-time.</p>
        </div>
        <div className="bg-white px-3 md:px-4 py-2 rounded-xl shadow-sm border text-xs md:text-sm font-medium">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2 md:px-0">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-3 md:gap-4">
            <div className={`p-3 md:p-4 rounded-2xl ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-xs md:text-sm text-gray-500 mb-1">{stat.label}</p>
              <h4 className="text-lg md:text-2xl font-bold">{stat.value}</h4>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}
                <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{stat.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 px-2 md:px-0">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-2">
            <h3 className="text-lg md:text-xl font-bold">Grafik Penjualan Mingguan</h3>
            <select className="bg-gray-50 border-none outline-none rounded-lg px-3 py-1 text-xs md:text-sm">
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
            </select>
          </div>
          <div className="h-[220px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(v) => `${v/1000000}M`} />
                <Tooltip cursor={{fill: '#f8f8f8'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="sales" radius={[10, 10, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#C0392B' : '#E5E7EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-lg md:text-xl font-bold mb-6 md:mb-8">Produk Terlaris</h3>
          <div className="h-[150px] md:h-[250px] w-full mb-6 md:mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={bestSellers} cx="50%" cy="50%" innerRadius={40} md:innerRadius={60} outerRadius={70} md:outerRadius={100} paddingAngle={5} dataKey="count">
                  {bestSellers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 md:space-y-4">
            {bestSellers.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}} />
                  <span className="font-medium text-xs md:text-base">{item.name}</span>
                </div>
                <span className="text-gray-500 font-bold text-xs md:text-base">{item.count} terjual</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 overflow-x-auto">
        <div className="p-4 md:p-8 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-bold">Transaksi Terbaru</h3>
          <button className="text-[#C0392B] font-bold text-xs md:text-sm" onClick={() => navigate('/admin/reports')}>Lihat Semua</button>
        </div>
        <div className="overflow-x-auto" style={{ maxHeight: 400, overflowY: 'auto' }}>
          <table className="w-full text-left min-w-[480px]">
            <thead className="bg-gray-50 text-gray-500 text-xs md:text-sm uppercase tracking-wider">
              <tr>
                <th className="px-4 md:px-8 py-2 md:py-4">ID Transaksi</th>
                <th className="px-4 md:px-8 py-2 md:py-4">Waktu</th>
                <th className="px-4 md:px-8 py-2 md:py-4">Total Bayar</th>
                <th className="px-4 md:px-8 py-2 md:py-4">Status</th>
                <th className="px-4 md:px-8 py-2 md:py-4">Kota</th>
                <th className="px-4 md:px-8 py-2 md:py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.slice().reverse().map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 md:px-8 py-2 md:py-4 font-bold text-xs md:text-base">{t.queueNumber}</td>
                  <td className="px-4 md:px-8 py-2 md:py-4 text-gray-500 text-xs md:text-base">
                    {new Date(t.createdAt).toLocaleDateString()}<br/>
                    <span className="text-gray-400">{new Date(t.createdAt).toLocaleTimeString()}</span>
                  </td>
                  <td className="px-4 md:px-8 py-2 md:py-4 font-bold text-[#27AE60] text-xs md:text-base">Rp {t.total.toLocaleString()}</td>
                  <td className="px-4 md:px-8 py-2 md:py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.status === 'Menunggu Pembayaran' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{t.status}</span>
                  </td>
                  <td className="px-4 md:px-8 py-2 md:py-4 font-bold text-[#C0392B] text-xs md:text-base">{t.city}</td>
                  <td className="px-4 md:px-8 py-2 md:py-4">
                    {t.status === 'Menunggu Pembayaran' ? (
                      <button
                        onClick={() => updateTransactionStatus(t.id, OrderStatus.COMPLETED)}
                        className="bg-[#27AE60] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-[#219150] transition"
                      >
                        Tandai Sudah Dibayar
                      </button>
                    ) : t.status === 'Selesai' ? (
                      <button
                        onClick={() => updateTransactionStatus(t.id, OrderStatus.PENDING)}
                        className="bg-orange-400 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-orange-500 transition"
                      >
                        Kembalikan ke Pending
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">{t.status}</span>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 md:px-8 py-8 md:py-12 text-center text-gray-400 text-xs md:text-base">Belum ada transaksi hari ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
