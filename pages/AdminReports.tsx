import React, { useState, useEffect } from 'react';
import { Calendar, Printer, Search } from 'lucide-react';

const API_URL = 'https://api-probite.exium.my.id';

const AdminReports: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [range, setRange] = useState<'date' | '7days' | '30days'>('date');
  const [cityFilter, setCityFilter] = useState<'Semarang' | 'Jogja' | 'ALL'>('ALL');

  // Ambil data dari backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/sales/history`);
        const data = await response.json();
        // Cek apakah data array, jika tidak cek field lain
        if (Array.isArray(data)) {
          setTransactions(data);
        } else if (Array.isArray(data.history)) {
          setTransactions(data.history);
        } else {
          setTransactions([]);
        }
        console.log("Data diterima dari Backend:", data);
      } catch (err) {
        setTransactions([]);
        console.error("Gagal mengambil laporan:", err);
      }
    };
    fetchHistory();
  }, []);

  // Filter data: hanya transaksi yang sudah dibayar
  const today = new Date();
  let filteredData = (transactions || []).filter(t => t.createdAt && t.paid);
  if (cityFilter !== 'ALL') {
    filteredData = filteredData.filter(t => t.city === cityFilter);
  }
  let label = '';
  if (range === 'date') {
    filteredData = filteredData.filter(t => t.createdAt.startsWith(filterDate));
    label = filterDate;
  } else if (range === '7days') {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    filteredData = filteredData.filter(t => new Date(t.createdAt) >= start);
    label = `7 Hari Terakhir`;
  } else if (range === '30days') {
    const start = new Date(today);
    start.setDate(today.getDate() - 29);
    filteredData = filteredData.filter(t => new Date(t.createdAt) >= start);
    label = `30 Hari Terakhir`;
  }

  // Hitung total omzet & profit
  const totalOmzet = filteredData.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const totalProfit = filteredData.reduce((sum, t) => sum + (t.totalProfit || 0), 0);

  // Daftar tanggal unik untuk filter
  const uniqueDates = Array.from(new Set(transactions.map(t => t.createdAt?.slice(0, 10)))).filter(Boolean).sort().reverse();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Laporan Penjualan</h1>
          <p className="text-gray-500">Analisa pendapatan real-time dari database.</p>
        </div>
        <button onClick={() => window.print()} className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
          <Printer className="w-5 h-5" /> Cetak PDF
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase">Filter Saat Ini</p>
            <p className="text-lg font-bold">{label}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase">Total Omzet</p>
            <p className="text-2xl font-bold text-black">Rp {totalOmzet.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase">Total Profit</p>
            <p className="text-2xl font-bold text-green-600">Rp {totalProfit.toLocaleString()}</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
         <input
            type="date"
            className="font-bold border rounded-xl px-4 py-2 outline-none"
            value={filterDate}
            onChange={e => { setFilterDate(e.target.value); setRange('date'); }}
            max={new Date().toISOString().split('T')[0]}
         />
         <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['date', '7days', '30days'] as const).map(r => (
                <button 
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${range === r ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
                >
                    {r === 'date' ? 'Harian' : r === '7days' ? '7 Hari' : '30 Hari'}
                </button>
            ))}
         </div>
         {/* City Filter Buttons */}
         <div className="flex gap-2 ml-auto">
           <button
             onClick={() => setCityFilter('ALL')}
             className={`px-4 py-2 rounded-lg font-bold text-xs border transition-all ${cityFilter === 'ALL' ? 'bg-[#C0392B] text-white border-[#C0392B]' : 'bg-white text-gray-500 border-gray-200'}`}
           >Semua</button>
           <button
             onClick={() => setCityFilter('Semarang')}
             className={`px-4 py-2 rounded-lg font-bold text-xs border transition-all ${cityFilter === 'Semarang' ? 'bg-[#C0392B] text-white border-[#C0392B]' : 'bg-white text-gray-500 border-gray-200'}`}
           >Semarang</button>
           <button
             onClick={() => setCityFilter('Jogja')}
             className={`px-4 py-2 rounded-lg font-bold text-xs border transition-all ${cityFilter === 'Jogja' ? 'bg-[#C0392B] text-white border-[#C0392B]' : 'bg-white text-gray-500 border-gray-200'}`}
           >Jogja</button>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-8 py-4">ID Transaksi</th>
              <th className="px-8 py-4">Item</th>
              <th className="px-8 py-4 text-right">Total</th>
              <th className="px-8 py-4 text-center">Kota</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredData.map(t => (
              <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-8 py-5 font-bold">{t.queueNumber || t._id}</td>
                <td className="px-8 py-5">
                   <div className="text-xs text-gray-500">
                      {t.items?.map((item: any, i: number) => (
                        <div key={i}>{item.name} x{item.quantity}</div>
                      ))}
                   </div>
                </td>
                <td className="px-8 py-5 text-right font-bold text-green-600">Rp {t.totalAmount?.toLocaleString()}</td>
                <td className="px-8 py-5 text-center font-bold text-red-600">{t.city || '-'}</td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="text-gray-400">Belum ada transaksi di database.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReports;