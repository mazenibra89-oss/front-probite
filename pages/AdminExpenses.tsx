import React, { useState, useEffect } from 'react';
import { Printer, Search } from 'lucide-react';

const API_URL = 'https://api-probite.exium.my.id';

const AdminExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [range, setRange] = useState<'date' | '7days' | '30days'>('date');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch(`${API_URL}/api/expenses`);
        const data = await response.json();
        setExpenses(Array.isArray(data) ? data : []);
      } catch (err) {
        setExpenses([]);
      }
    };
    fetchExpenses();
  }, []);

  const today = new Date();
  let filteredData = (expenses || []).filter(e => e.createdAt);
  let label = '';
  if (range === 'date') {
    filteredData = filteredData.filter(e => e.createdAt.startsWith(filterDate));
    label = filterDate;
  } else if (range === '7days') {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    filteredData = filteredData.filter(e => new Date(e.createdAt) >= start);
    label = `7 Hari Terakhir`;
  } else if (range === '30days') {
    const start = new Date(today);
    start.setDate(today.getDate() - 29);
    filteredData = filteredData.filter(e => new Date(e.createdAt) >= start);
    label = `30 Hari Terakhir`;
  }

  const totalExpense = filteredData.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Laporan Pengeluaran</h1>
          <p className="text-gray-500">Analisa pengeluaran real-time dari database.</p>
        </div>
        <button onClick={() => window.print()} className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
          <Printer className="w-5 h-5" /> Cetak PDF
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase">Filter Saat Ini</p>
            <p className="text-lg font-bold">{label}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-red-600">Rp {totalExpense.toLocaleString()}</p>
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-8 py-4">ID</th>
              <th className="px-8 py-4">Keterangan</th>
              <th className="px-8 py-4 text-right">Jumlah</th>
              <th className="px-8 py-4 text-center">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredData.map(e => (
              <tr key={e._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-8 py-5 font-bold">{e._id}</td>
                <td className="px-8 py-5">{e.description}</td>
                <td className="px-8 py-5 text-right font-bold text-red-600">Rp {e.amount?.toLocaleString()}</td>
                <td className="px-8 py-5 text-center">{e.createdAt?.slice(0, 10)}</td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="text-gray-400">Belum ada data pengeluaran.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminExpenses;
