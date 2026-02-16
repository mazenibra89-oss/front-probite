import React, { useState, useEffect } from 'react';
import { useProbiteStore } from '../store';
import { Calendar, Printer, Search } from 'lucide-react';

const API_URL = 'https://api-probite.exium.my.id';

const AdminReports: React.FC = () => {
  // Ambil transaksi dan fungsi setTransactions dari Zustand
  const { transactions, setTransactions } = useProbiteStore();
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [range, setRange] = useState<'date' | '7days' | '30days'>('date');

  // Efek untuk memastikan data terbaru dari server
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API_URL}/api/sales/history`);
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error("Gagal mengambil laporan dari server");
      }
    };
    fetchReports();
  }, []);

  // Helper untuk filter range
  const today = new Date();
  let filteredData = transactions || [];
  let label = '';

  if (range === 'date') {
    filteredData = transactions.filter(t => t.createdAt && t.createdAt.startsWith(filterDate));
    label = filterDate;
  } else if (range === '7days') {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    filteredData = transactions.filter(t => {
      const d = new Date(t.createdAt);
      return d >= start && d <= today;
    });
    label = `7 Hari Terakhir`;
  } else if (range === '30days') {
    const start = new Date(today);
    start.setDate(today.getDate() - 29);
    filteredData = transactions.filter(t => {
      const d = new Date(t.createdAt);
      return d >= start && d <= today;
    });
    label = `30 Hari Terakhir`;
  }

  // Menghitung Omzet dan Profit dari data Backend
  // Catatan: Pastikan di backend field-nya adalah totalAmount
  const totalOmzet = filteredData.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  
  // Jika di backend Anda belum menyimpan field profit, kita asumsikan profit 20% atau sesuaikan kodenya
  const totalProfit = filteredData.reduce((sum, t) => sum + (t.totalProfit || (t.totalAmount * 0.3)), 0);

  const uniqueDates = Array.from(new Set(transactions.map(t => t.createdAt?.slice(0, 10)))).filter(Boolean).sort().reverse();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Laporan Penjualan</h1>
          <p className="text-gray-500">Data Real-time dari Cloud MongoDB.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()} // Menggunakan print browser bawaan lebih stabil untuk layout modern
            className="bg-[#2D3436] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:-translate-y-1 transition-all"
          >
            <Printer className="w-5 h-5" />
            Cetak Laporan
          </button>
        </div>
      </header>

      <div id="print-area">
        {/* Filter Section */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-wrap items-center gap-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#F5E6D3] rounded-xl text-[#C0392B]">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex gap-2">
                <select
                  className="font-bold border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white outline-none focus:ring-2 focus:ring-[#C0392B]"
                  value={filterDate}
                  onChange={e => { setFilterDate(e.target.value); setRange('date'); }}
                >
                  <option value="">Pilih Tanggal</option>
                  {uniqueDates.map(date => (
                    <option key={date as string} value={date as string}>{date as string}</option>
                  ))}
                </select>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button onClick={() => setRange('date')} className={`px-4 py-1 rounded-lg text-xs font-bold ${range==='date'?'bg-white shadow text-[#C0392B]':'text-gray-500'}`}>Harian</button>
                    <button onClick={() => setRange('7days')} className={`px-4 py-1 rounded-lg text-xs font-bold ${range==='7days'?'bg-white shadow text-[#C0392B]':'text-gray-500'}`}>7 Hari</button>
                    <button onClick={() => setRange('30days')} className={`px-4 py-1 rounded-lg text-xs font-bold ${range==='30days'?'bg-white shadow text-[#C0392B]':'text-gray-500'}`}>30 Hari</button>
                </div>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-8 justify-end">
            <div className="text-right">
              <p className="text-xs text-gray-400 font-bold uppercase">Total Omzet</p>
              <p className="text-xl font-bold text-[#2D3436]">Rp {totalOmzet.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-bold uppercase">Estimasi Profit</p>
              <p className="text-xl font-bold text-[#27AE60]">Rp {totalProfit.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold">Rincian Transaksi - {label}</h3>
            <span className="text-sm bg-gray-100 px-4 py-1 rounded-full font-medium text-gray-500">{filteredData.length} Transaksi</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-8 py-4">Waktu</th>
                  <th className="px-8 py-4">Item Pesanan</th>
                  <th className="px-8 py-4 text-right">Total Bayar</th>
                  <th className="px-8 py-4 text-center">Metode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.map((t: any) => (
                  <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5">
                        <p className="font-bold text-sm">{new Date(t.createdAt).toLocaleTimeString()}</p>
                        <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-xs text-gray-600">
                        {t.items?.map((item: any, i: number) => (
                          <span key={i}>{item.name} (x{item.quantity}){i < t.items.length - 1 ? ', ' : ''}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-bold text-[#27AE60]">Rp {t.totalAmount?.toLocaleString()}</td>
                    <td className="px-8 py-5 text-center">
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">
                        {t.paymentMethod || 'Cash'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-gray-400">
                      <Search className="w-12 h-12 mb-4 mx-auto opacity-10" />
                      <p>Tidak ada data penjualan untuk periode ini.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;