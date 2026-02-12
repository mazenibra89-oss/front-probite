import React, { useState } from 'react';
import { useProbiteStore } from '../store';
import { Plus, Edit2, Trash2, Search, X, TrendingUp } from 'lucide-react';
import { CATEGORIES } from '../constants';

const AdminProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProbiteStore();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Makanan',
    hpp: 0,
    price: 0, // harga jual
    stock: 0,
    image: 'https://picsum.photos/400/400',
    description: ''
  });

  // Harga jual diinput manual, profit = price - hpp
  const estimatedProfit = formData.price - formData.hpp;

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({ name: '', category: 'Makanan', hpp: 0, price: 0, stock: 0, image: 'https://picsum.photos/400/400', description: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditId(p.id);
    setFormData({ ...p });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData };
    if (editId) {
      updateProduct(editId, payload);
    } else {
      addProduct(payload);
    }
    setShowModal(false);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Produk</h1>
          <p className="text-gray-500">Kelola daftar menu dan inventaris stok kamu.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-[#C0392B] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#C0392B]/20 hover:-translate-y-1 transition-all"
        >
          <Plus className="w-5 h-5" />
          Tambah Produk Baru
        </button>
      </header>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Cari nama produk..." 
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border-none outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-[#C0392B]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-gray-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-8 py-5">Info Produk</th>
                <th className="px-8 py-5 text-right">HPP</th>
                <th className="px-8 py-5 text-right">Harga Jual</th>
                <th className="px-8 py-5 text-right">Stok</th>
                <th className="px-8 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <p className="font-bold">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-mono text-gray-500">Rp {p.hpp.toLocaleString()}</td>
                  <td className="px-8 py-5 text-right font-bold text-[#27AE60]">Rp {p.price.toLocaleString()}</td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-3 py-1 rounded-lg font-bold text-xs ${p.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                      {p.stock} pcs
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenEdit(p)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-screen overflow-y-auto">
            <div className="p-8 border-b flex items-center justify-between">
              <h3 className="text-2xl font-bold">{editId ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Gambar Produk</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#C0392B]"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setFormData({ ...formData, image: ev.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="mt-2 w-32 h-32 object-cover rounded-xl border border-gray-200 shadow"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Produk</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#C0392B]"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#C0392B]"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {CATEGORIES.filter(c => c !== 'Semua' && c !== 'Cemilan').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Stok Awal</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#C0392B]"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Produk</label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#C0392B] resize-none min-h-[80px]"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tulis deskripsi produk..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">HPP (Modal)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#C0392B]"
                      value={formData.hpp}
                      onChange={(e) => setFormData({...formData, hpp: parseInt(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Harga Jual</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#C0392B]"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                      required
                    />
                  </div>
                  
                  {/* Calculation Preview */}
                  <div className="bg-[#27AE60]/5 p-6 rounded-2xl border border-[#27AE60]/20 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Estimasi Profit / pcs:</span>
                      <span className="text-[#C0392B] font-bold">Rp {estimatedProfit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-2xl font-bold bg-[#C0392B] text-white hover:bg-[#A93226] shadow-lg shadow-[#C0392B]/20"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
