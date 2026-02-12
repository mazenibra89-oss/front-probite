import React, { useState } from 'react';
import { useProbiteStore } from '../store';
import { Calendar, Printer, Search } from 'lucide-react';

const AdminReports: React.FC = () => {
  const { transactions } = useProbiteStore();
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [range, setRange] = useState<'date' | '7days' | '30days'>('date');

  // Helper untuk filter range
  const today = new Date();
  let filteredData = transactions;
  let label = '';
  if (range === 'date') {
    filteredData = transactions.filter(t => t.createdAt.startsWith(filterDate));
    label = filterDate;
  } else if (range === '7days') {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    filteredData = transactions.filter(t => {
      const d = new Date(t.createdAt);
      return d >= start && d <= today;
    });
    label = `7 Hari Terakhir (${start.toISOString().split('T')[0]} - ${today.toISOString().split('T')[0]})`;
  } else if (range === '30days') {
    const start = new Date(today);
    start.setDate(today.getDate() - 29);
    filteredData = transactions.filter(t => {
      const d = new Date(t.createdAt);
      return d >= start && d <= today;
    });
    label = `30 Hari Terakhir (${start.toISOString().split('T')[0]} - ${today.toISOString().split('T')[0]})`;
  }
  const totalOmzet = filteredData.reduce((sum, t) => sum + t.total, 0);
  const totalProfit = filteredData.reduce((sum, t) => sum + t.totalProfit, 0);

  // Ambil semua tanggal unik dari transaksi
  const uniqueDates = Array.from(new Set(transactions.map(t => t.createdAt.slice(0, 10)))).sort((a, b) => (a as string).localeCompare(b as string)).reverse();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Laporan Penjualan</h1>
          <p className="text-gray-500">Analisa pendapatan dan keuntungan harian kamu.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const printArea = document.getElementById('print-area');
              if (printArea) {
                const printWindow = window.open('', '', 'width=900,height=650');
                printWindow!.document.write(`
                  <html>
                    <head>
                      <title>Laporan Penjualan - ${filterDate}</title>
                      <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; background: #F5E6D3; margin: 0; padding: 0; }
                        .pdf-container { background: #fff; max-width: 900px; margin: 32px auto; border-radius: 32px; box-shadow: 0 8px 32px #0001; padding: 40px 32px; }
                        .pdf-title { text-align: center; font-size: 2.5rem; font-weight: bold; color: #C0392B; margin-bottom: 0.5rem; letter-spacing: 2px; }
                        .pdf-subtitle { text-align: center; color: #888; font-size: 1.1rem; margin-bottom: 2.5rem; }
                        .pdf-summary { display: flex; justify-content: center; gap: 48px; margin-bottom: 2.5rem; }
                        .pdf-summary-item { text-align: center; }
                        .pdf-summary-label { color: #888; font-size: 0.95rem; font-weight: 600; }
                        .pdf-summary-value { font-size: 1.3rem; font-weight: bold; color: #27AE60; }
                        table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 1rem; }
                        th, td { border: 1px solid #eee; padding: 10px 14px; text-align: left; }
                        th { background: #F5E6D3; color: #C0392B; font-size: 1.05rem; }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                        .total { font-weight: bold; color: #27AE60; }
                        .status { border-radius: 16px; background: #EAFBF2; color: #27AE60; padding: 4px 16px; font-size: 0.95rem; font-weight: bold; border: 1px solid #B6E8D8; }
                      </style>
                    </head>
                    <body>
                      <div class="pdf-container">
                        <div class="pdf-title">PROBITE</div>
                        <div class="pdf-subtitle">Laporan Penjualan Tanggal <b>${filterDate}</b></div>
                        <div class="pdf-summary">
                          <div class="pdf-summary-item">
                            <div class="pdf-summary-label">Total Omzet</div>
                            <div class="pdf-summary-value">Rp ${totalOmzet.toLocaleString()}</div>
                          </div>
                          <div class="pdf-summary-item">
                            <div class="pdf-summary-label">Total Profit</div>
                            <div class="pdf-summary-value">Rp ${totalProfit.toLocaleString()}</div>
                          </div>
                        </div>
                        ${printArea.innerHTML}
                      </div>
                    </body>
                  </html>
                `);
                printWindow!.document.close();
                printWindow!.focus();
                setTimeout(() => printWindow!.print(), 300);
              }
            }}
            className="bg-[#2D3436] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:-translate-y-1 transition-all"
          >
            <Printer className="w-5 h-5" />
            Cetak PDF
          </button>
        </div>
      </header>

      <div id="print-area">
        {/* Date Filter */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#F5E6D3] rounded-xl text-[#C0392B]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Pilih Tanggal / Range</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                <input 
                  type="date" 
                  className="font-bold border-none outline-none focus:ring-0 cursor-pointer"
                  value={filterDate}
                  onChange={(e) => { setFilterDate(e.target.value); setRange('date'); }}
                  disabled={range !== 'date'}
                />
                <select
                  className="font-bold border border-[#C0392B] rounded-lg px-2 py-1 text-xs text-[#C0392B] bg-white"
                  value={filterDate}
                  onChange={e => { setFilterDate(e.target.value); setRange('date'); }}
                  disabled={range !== 'date'}
                >
                  <option value="">Pilih Tanggal Transaksi</option>
                  {uniqueDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
                <button
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${range==='7days'?'bg-[#C0392B] text-white border-[#C0392B]':'bg-white text-[#C0392B] border-[#C0392B]'}`}
                  onClick={() => setRange('7days')}
                  type="button"
                >7 Hari</button>
                <button
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${range==='30days'?'bg-[#C0392B] text-white border-[#C0392B]':'bg-white text-[#C0392B] border-[#C0392B]'}`}
                  onClick={() => setRange('30days')}
                  type="button"
                >30 Hari</button>
                <button
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${range==='date'?'bg-[#C0392B] text-white border-[#C0392B]':'bg-white text-[#C0392B] border-[#C0392B]'}`}
                  onClick={() => setRange('date')}
                  type="button"
                >Tgl</button>
              </div>
            </div>
          </div>

          <div className="h-10 w-px bg-gray-100 hidden md:block" />

          <div className="flex flex-1 items-center gap-8 justify-end">
            <div className="text-right">
              <p className="text-xs text-gray-400 font-bold uppercase">Total Omzet</p>
              <p className="text-xl font-bold text-[#2D3436]">Rp {totalOmzet.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-bold uppercase">Total Profit</p>
              <p className="text-xl font-bold text-[#27AE60]">Rp {totalProfit.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Report Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50">
            <h3 className="text-xl font-bold">Rincian Transaksi - {label}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-8 py-4">ID Transaksi</th>
                  <th className="px-8 py-4">Produk</th>
                  <th className="px-8 py-4 text-right">Total</th>
                  <th className="px-8 py-4 text-right">Profit</th>
                  <th className="px-8 py-4 text-center">Status</th>
                  <th className="px-8 py-4 text-center">Kota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5 font-bold">{t.queueNumber}</td>
                    <td className="px-8 py-5">
                      <div className="text-xs text-gray-500 space-y-1">
                        {t.items.map((item, i) => (
                          <div key={i} className="flex justify-between gap-4">
                            <span>{item.name} x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-bold">Rp {t.total.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right font-bold text-[#27AE60]">Rp {t.totalProfit.toLocaleString()}</td>
                    <td className="px-8 py-5 text-center">
                      <span className="px-3 py-1 rounded-full bg-green-50 text-[#27AE60] text-xs font-bold border border-green-100">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center font-bold text-[#C0392B]">{t.city}</td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <Search className="w-12 h-12 mb-4 opacity-10" />
                        <p>Tidak ada transaksi pada tanggal ini.</p>
                      </div>
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
