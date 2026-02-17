import React, { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, Wallet, Users, Plus, X } from 'lucide-react';
import { getSaldo, setSaldo } from '../utils/saldo';

const API_URL = 'https://api-probite.exium.my.id';

const AdminDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    quantity: 1,
    unit: '',
    amount: 0,
    branch: 'Semarang',
    date: new Date().toISOString().slice(0, 10)
  });
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<'ALL' | 'Semarang' | 'Jogja'>('ALL');

  // State untuk saldo input
  const [saldoInput, setSaldoInput] = useState(0);
  const [showSaldoInput, setShowSaldoInput] = useState(false);

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

  // Filter transaksi sesuai kota yang dipilih (untuk tabel, tanpa filter bulan)
  const filteredTransactions = transactions.filter(t => {
    if (selectedCity === 'ALL') return true;
    return t.city === selectedCity;
  });

  // Omzet & total transaksi hanya hitung bulan ini dan paid=true (untuk rekap)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.paid;
  });
  const totalMonthlyOmzet = monthlyTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const totalMonthlyTransactionsCount = monthlyTransactions.length;

  // Omzet dan transaksi bulanan per cabang
  const semarangTransactions = transactions.filter(t => {
    const d = new Date(t.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.paid && t.city === 'Semarang';
  });
  const jogjaTransactions = transactions.filter(t => {
    const d = new Date(t.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.paid && t.city === 'Jogja';
  });
  const omzetSemarang = semarangTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const countSemarang = semarangTransactions.length;
  const omzetJogja = jogjaTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const countJogja = jogjaTransactions.length;

  // Filter transaksi sesuai kota yang dipilih
  const filteredTransactionsRekap = transactions.filter(t => {
    const d = new Date(t.createdAt);
    const isMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.paid;
    if (selectedCity === 'ALL') return isMonth;
    return isMonth && t.city === selectedCity;
  });
  const totalOmzet = filteredTransactionsRekap.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const totalCount = filteredTransactionsRekap.length;

  // Hitung omzet all time dan pengeluaran all time sesuai kota
  const omzetAllTime = transactions.filter(t => (selectedCity === 'ALL' ? true : t.city === selectedCity) && t.paid).reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const pengeluaranAllTime = 0; // Akan diisi setelah fetch pengeluaran
  const [expenses, setExpenses] = useState<any[]>([]);

  // Fetch pengeluaran all time
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await fetch(`${API_URL}/api/expenses`);
        const data = await res.json();
        setExpenses(Array.isArray(data) ? data : []);
      } catch (err) {
        setExpenses([]);
      }
    };
    fetchExpenses();
  }, []);

  const pengeluaranFiltered = expenses.filter(e => selectedCity === 'ALL' ? true : e.branch === selectedCity);
  const pengeluaranAll = pengeluaranFiltered.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Saldo = omzetAllTime + saldoInput - pengeluaranAll
  const saldo = omzetAllTime + getSaldo(selectedCity) - pengeluaranAll;

  const stats = [
    { label: 'Omzet Bulan Ini', value: `Rp ${totalMonthlyOmzet.toLocaleString()}`, icon: <Wallet className="text-blue-500" />, color: 'bg-blue-50' },
    { label: 'Total Transaksi Bulan Ini', value: totalMonthlyTransactionsCount.toString(), icon: <ShoppingBag className="text-[#C0392B]" />, color: 'bg-red-50' },
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

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: expenseForm.description,
          quantity: expenseForm.quantity,
          unit: expenseForm.unit,
          amount: expenseForm.amount,
          branch: expenseForm.branch,
          createdAt: expenseForm.date
        })
      });
      if (res.ok) {
        setShowExpenseModal(false);
        setExpenseForm({ description: '', quantity: 1, unit: '', amount: 0, branch: 'Semarang', date: new Date().toISOString().slice(0, 10) });
        alert('Pengeluaran berhasil ditambahkan!');
      } else {
        alert('Gagal menambah pengeluaran!');
      }
    } catch (err) {
      alert('Gagal menambah pengeluaran!');
    } finally {
      setExpenseLoading(false);
    }
  };

  // Handler tambah saldo manual
  const handleAddSaldo = () => {
    setSaldo(selectedCity, getSaldo(selectedCity) + saldoInput);
    setSaldoInput(0);
    setShowSaldoInput(false);
  };

  if (loading) return <div className="p-10 text-center font-bold">Memuat Data Bisnis...</div>;

  return (
    <div className="space-y-8 animate-in fade-in">
      <header>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Ringkasan Bisnis Online</h1>
            <p className="text-gray-500">Data real-time dari Server VPS & MongoDB.</p>
          </div>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 bg-[#C0392B] text-white px-6 py-3 rounded-2xl font-bold shadow-lg"
          >
            <Plus className="w-5 h-5" /> Tambah Pengeluaran
          </button>
        </div>
      </header>

      {/* Modal Tambah Pengeluaran */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 overflow-y-auto max-h-screen relative">
            <button className="absolute top-4 right-4 text-gray-400" onClick={() => setShowExpenseModal(false)}><X className="w-6 h-6"/></button>
            <h3 className="text-2xl font-bold mb-6">Tambah Pengeluaran</h3>
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block font-bold mb-1">Nama Barang / Keterangan</label>
                <input className="w-full p-3 rounded-xl bg-gray-50" placeholder="Nama Barang / Keterangan" value={expenseForm.description} onChange={e => setExpenseForm(f => ({...f, description: e.target.value}))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Jumlah</label>
                  <input type="number" min="1" className="w-full p-3 rounded-xl bg-gray-50" value={expenseForm.quantity} onChange={e => setExpenseForm(f => ({...f, quantity: +e.target.value}))} required />
                </div>
                <div>
                  <label className="block font-bold mb-1">Satuan</label>
                  <input className="w-full p-3 rounded-xl bg-gray-50" placeholder="pcs, box, dll" value={expenseForm.unit} onChange={e => setExpenseForm(f => ({...f, unit: e.target.value}))} required />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Harga (Total)</label>
                <input type="number" min="0" className="w-full p-3 rounded-xl bg-gray-50" placeholder="Harga Total" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({...f, amount: +e.target.value}))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Cabang</label>
                  <select className="w-full p-3 rounded-xl bg-gray-50" value={expenseForm.branch} onChange={e => setExpenseForm(f => ({...f, branch: e.target.value}))} required>
                    <option value="Semarang">Semarang</option>
                    <option value="Jogja">Jogja</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Tanggal</label>
                  <input type="date" className="w-full p-3 rounded-xl bg-gray-50" value={expenseForm.date} onChange={e => setExpenseForm(f => ({...f, date: e.target.value}))} required />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 p-4 bg-gray-100 rounded-2xl font-bold">Batal</button>
                <button type="submit" className="flex-1 p-4 bg-[#C0392B] text-white rounded-2xl font-bold" disabled={expenseLoading}>{expenseLoading ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tombol filter kota */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setSelectedCity('ALL')} className={`px-4 py-2 rounded-lg font-bold text-xs border transition-all ${selectedCity === 'ALL' ? 'bg-[#C0392B] text-white border-[#C0392B]' : 'bg-white text-gray-500 border-gray-200'}`}>Semua</button>
        <button onClick={() => setSelectedCity('Semarang')} className={`px-4 py-2 rounded-lg font-bold text-xs border transition-all ${selectedCity === 'Semarang' ? 'bg-[#C0392B] text-white border-[#C0392B]' : 'bg-white text-gray-500 border-gray-200'}`}>Semarang</button>
        <button onClick={() => setSelectedCity('Jogja')} className={`px-4 py-2 rounded-lg font-bold text-xs border transition-all ${selectedCity === 'Jogja' ? 'bg-[#C0392B] text-white border-[#C0392B]' : 'bg-white text-gray-500 border-gray-200'}`}>Jogja</button>
      </div>

      {/* Dua kotak: Omzet & Total Transaksi sesuai filter kota */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <div className="text-gray-500 font-bold mb-1">Omzet Bulan Ini</div>
          <div className="text-2xl font-bold text-[#C0392B]">Rp {totalOmzet.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <div className="text-gray-500 font-bold mb-1">Total Transaksi</div>
          <div className="text-2xl font-bold text-[#2980B9]">{totalCount}</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center items-center relative">
          <div className="text-gray-500 font-bold mb-1">Saldo (All Time)</div>
          <div className="text-2xl font-bold text-green-600">Rp {saldo.toLocaleString()}</div>
          <button onClick={() => setShowSaldoInput(v => !v)} className="absolute top-4 right-4 bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-xl">+</button>
          {showSaldoInput && (
            <div className="absolute top-12 right-4 bg-white border rounded-xl shadow-lg p-4 z-10 flex flex-col gap-2">
              <input type="number" className="border rounded-lg px-3 py-2 w-32" value={saldoInput} onChange={e => setSaldoInput(+e.target.value)} placeholder="Tambah Saldo" />
              <button onClick={handleAddSaldo} className="bg-green-600 text-white rounded-lg px-4 py-2 font-bold">Tambah</button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-4 md:p-8 overflow-x-auto">
        <h3 className="text-xl font-bold mb-6">Transaksi Terbaru</h3>
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full min-w-[700px] text-left">
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
              {filteredTransactions.map((t: any) => (
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
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">Belum ada transaksi.</td>
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