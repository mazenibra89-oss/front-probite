import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { CATEGORIES } from '../constants';

// Alamat API VPS Anda (Pastikan sudah diset di Vercel Env)
const API_URL = 'https://api-probite.exium.my.id';

const AdminProducts: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]); // State produk dari backend

  const [formData, setFormData] = useState({
    name: '',
    category: 'Makanan',
    hpp: 0,
    price: 0,
    stock: 0,
    image: '', // Akan diisi url setelah upload
    description: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Load data dari Database saat halaman dibuka
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []); // Simpan produk dari backend
    } catch (err) {
      console.error("Gagal ambil produk:", err);
    }
  };

  // Handler upload gambar langsung ke backend dan update formData.image
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file); // Harus sama dengan upload.single('file') di backend

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formDataUpload, // Jangan set Header Content-Type, biarkan browser yang mengaturnya
      });
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, image: data.url })); // Simpan URL dari backend ke state
        setImageFile(file);
        alert("Gambar berhasil diupload!");
      }
    } catch (err) {
      alert("Gagal upload gambar!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const authData = JSON.parse(localStorage.getItem('probite_auth') || '{}');

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/api/products/${editId}` : `${API_URL}/api/products/add`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`
        },
        body: JSON.stringify({ ...formData })
      });

      if (response.ok) {
        await fetchProducts(); // Refresh list dari DB
        setShowModal(false);
        setImageFile(null);
      }
    } catch (err) {
      alert("Gagal menyimpan ke server!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus produk ini secara permanen?")) return;
    const authData = JSON.parse(localStorage.getItem('probite_auth') || '{}');

    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authData.token}` }
      });
      if (response.ok) fetchProducts();
    } catch (err) {
      alert("Gagal menghapus produk!");
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 p-4 md:p-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Produk</h1>
          <p className="text-gray-500">Data tersimpan aman di Cloud MongoDB Atlas.</p>
        </div>
        <button 
          onClick={() => { setEditId(null); setFormData({name:'', category:'Makanan', hpp:0, price:0, stock:0, image:'https://picsum.photos/400/400', description:''}); setShowModal(true); }}
          className="bg-[#C0392B] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" /> Tambah Produk
        </button>
      </header>

      <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden">
        <div className="p-6 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" placeholder="Cari produk..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-[#C0392B]"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-gray-500 text-xs uppercase font-bold bg-gray-50">
              <tr>
                <th className="px-8 py-5">Info Produk</th>
                <th className="px-8 py-5 text-right">Harga Jual</th>
                <th className="px-8 py-5 text-right">Stok</th>
                <th className="px-8 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <p className="font-bold">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-[#27AE60]">Rp {p.price.toLocaleString()}</td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${p.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {p.stock} pcs
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setEditId(p._id); setFormData({...p}); setShowModal(true); }} className="p-2 text-blue-500"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-2 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL BERESIN DI SINI (Singkat untuk contoh) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 overflow-y-auto max-h-screen">
             <h3 className="text-2xl font-bold mb-6">{editId ? 'Edit Produk' : 'Tambah Produk'}</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block font-bold mb-1">Nama Produk</label>
                <input className="w-full p-3 rounded-xl bg-gray-50" placeholder="Nama Produk" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />

                <label className="block font-bold mb-1">Kategori</label>
                <select className="w-full p-3 rounded-xl bg-gray-50" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">HPP</label>
                    <input type="number" className="p-3 rounded-xl bg-gray-50 w-full" placeholder="HPP" value={formData.hpp} onChange={e => setFormData({...formData, hpp: +e.target.value})} />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Harga Jual</label>
                    <input type="number" className="p-3 rounded-xl bg-gray-50 w-full" placeholder="Harga Jual" value={formData.price} onChange={e => setFormData({...formData, price: +e.target.value})} />
                  </div>
                </div>

                <label className="block font-bold mb-1">Stok</label>
                <input type="number" className="w-full p-3 rounded-xl bg-gray-50" placeholder="Stok" value={formData.stock} onChange={e => setFormData({...formData, stock: +e.target.value})} />

                <label className="block font-bold mb-1">URL Gambar</label>
                <input className="w-full p-3 rounded-xl bg-gray-50" placeholder="URL Gambar" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />

                <label className="block font-bold mb-1">Deskripsi</label>
                <textarea className="w-full p-3 rounded-xl bg-gray-50" placeholder="Deskripsi" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />

                <label className="block font-bold mb-1">Gambar Produk</label>
                <input type="file" accept="image/*" className="w-full p-3 rounded-xl bg-gray-50" onChange={handleFileUpload} />
                {imageFile && <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-32 h-32 object-cover rounded-xl mt-2" />}

                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-4 bg-gray-100 rounded-2xl font-bold">Batal</button>
                  <button type="submit" className="flex-1 p-4 bg-[#C0392B] text-white rounded-2xl font-bold">{isLoading ? 'Menyimpan...' : 'Simpan'}</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;