import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, Settings, X } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { CartItem, Transaction } from '../types';
import { Link } from 'react-router-dom';

// Pastikan URL API sudah benar
const API_URL = 'https://api-probite.exium.my.id';

const CustomerHome: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Makanan');
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any | null>(null);
  const [openDesc, setOpenDesc] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]); // Ambil produk langsung dari backend

  // --- SINKRONISASI DATA PRODUK DARI DATABASE ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []); // Simpan produk dari backend
      } catch (err) {
        console.error("Gagal mengambil menu dari server:", err);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Semua' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id); // Pakai _id (MongoDB)
      if (existing) {
        return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // --- SINKRONISASI CHECKOUT KE DATABASE ---
  const handleCheckout = async () => {
    if (cart.length === 0 || !selectedCity) return;
    setIsLoading(true);

    const orderData = {
      items: cart.map(item => ({
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: total,
      paymentMethod: 'Transfer/Cash',
      city: selectedCity
    };

    try {
      const response = await fetch(`${API_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        setPendingOrder(result); // result berisi data dari backend (termasuk queueNumber)
        setShowPaymentModal(true);
        setCart([]);
        setSelectedCity('');
      } else {
        alert("Gagal memproses pesanan ke server.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${cart.length > 0 ? 'md:flex-row' : ''} max-h-screen overflow-hidden relative bg-[#F5E6D3]`}>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden">
        <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#C0392B]">PROBITE</h1>
            <p className="text-gray-600 text-sm">Menu Fresh dari Database Cloud.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Cari menu favorit..." 
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#C0392B]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link to="/login" className="text-gray-400 hover:text-[#C0392B]"><Settings className="w-5 h-5"/></Link>
        </header>

        {/* Categories Bar */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6">
          {CATEGORIES.filter(c => c !== 'Semua' && c !== 'Cemilan').map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-bold transition-all border ${activeCategory === cat ? 'bg-[#C0392B] text-white border-[#C0392B]' : 'bg-white text-gray-600 border-gray-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-2 pb-32 md:pb-0">{/* Tambah pb-32 untuk mobile jika cart muncul */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product._id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col relative">
                <img src={product.image} className="h-44 w-full object-cover" alt={product.name} />
                {product.stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="text-white text-xl font-bold">SOLD OUT</span>
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  <p className="text-[#27AE60] font-bold text-xl mb-4">Rp {product.price.toLocaleString()}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <button 
                      onClick={() => setOpenDesc(openDesc === product._id ? null : product._id)}
                      className="text-xs font-bold text-[#C0392B] bg-red-50 px-3 py-1 rounded-lg"
                    >
                      Detail
                    </button>
                    <button 
                      disabled={product.stock <= 0}
                      onClick={() => addToCart(product)}
                      className="bg-[#C0392B] text-white p-3 rounded-2xl disabled:bg-gray-300"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {openDesc === product._id && (
                    <p className="mt-3 text-xs text-gray-500 italic">{product.description || 'Tidak ada deskripsi.'}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar Desktop (Tampil jika ada isi) */}
      {cart.length > 0 && (
        <div className="hidden md:flex w-96 bg-white border-l p-6 flex-col">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><ShoppingCart className="text-[#C0392B]"/> Pesanan</h2>
          <div className="flex-1 overflow-y-auto space-y-4">
            {cart.map(item => (
              <div key={item._id} className="flex gap-3 items-center">
                <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1">
                    <p className="font-bold text-sm leading-none">{item.name}</p>
                    <p className="text-[#C0392B] font-bold text-xs">Rp {(item.price * item.quantity).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item._id, -1)} className="bg-gray-100 p-1 rounded"><Minus className="w-3 h-3"/></button>
                    <span className="text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} className="bg-gray-100 p-1 rounded"><Plus className="w-3 h-3"/></button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t pt-4">
            <select 
                className="w-full p-3 bg-gray-50 rounded-xl mb-4 font-bold outline-none"
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
            >
                <option value="">-- Pilih Kota --</option>
                <option value="Semarang">Semarang</option>
                <option value="Jogja">Jogja</option>
            </select>
            <div className="flex justify-between text-xl font-bold text-[#C0392B] mb-4">
              <span>Total</span>
              <span>Rp {total.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={!(selectedCity === 'Semarang' || selectedCity === 'Jogja') || isLoading}
              className="w-full bg-[#C0392B] text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-200 disabled:bg-gray-300"
            >
              {isLoading ? 'Memproses...' : 'Checkout'}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Cart Bar (Bottom) */}
      {cart.length > 0 && (
        <>
          {/* Floating bar at bottom for mobile */}
          <button
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden w-[90vw] max-w-md bg-[#C0392B] text-white flex items-center justify-between px-6 py-4 rounded-2xl shadow-lg font-bold text-lg"
            onClick={() => setShowCartMobile(true)}
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Keranjang
              <span className="ml-2 bg-white text-[#C0392B] rounded-full px-3 py-1 text-sm font-bold">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
            </span>
            <span>Rp {total.toLocaleString()}</span>
          </button>

          {/* Mobile Cart Drawer/Modal */}
          {showCartMobile && (
            <div className="fixed inset-0 z-50 flex items-end md:hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCartMobile(false)} />
              <div className="relative w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl animate-slideUp">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="text-[#C0392B]"/> Pesanan</h2>
                  <button onClick={() => setShowCartMobile(false)}><X className="w-6 h-6 text-gray-400"/></button>
                </div>
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item._id} className="flex gap-3 items-center">
                      <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-bold text-sm leading-none">{item.name}</p>
                        <p className="text-[#C0392B] font-bold text-xs">Rp {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item._id, -1)} className="bg-gray-100 p-1 rounded"><Minus className="w-3 h-3"/></button>
                        <span className="text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, 1)} className="bg-gray-100 p-1 rounded"><Plus className="w-3 h-3"/></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t pt-4">
                  <select 
                    className="w-full p-3 bg-gray-50 rounded-xl mb-4 font-bold outline-none"
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                  >
                    <option value="">-- Pilih Kota --</option>
                    <option value="Semarang">Semarang</option>
                    <option value="Jogja">Jogja</option>
                  </select>
                  <div className="flex justify-between text-xl font-bold text-[#C0392B] mb-4">
                    <span>Total</span>
                    <span>Rp {total.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => { setShowCartMobile(false); handleCheckout(); }}
                    disabled={!(selectedCity === 'Semarang' || selectedCity === 'Jogja') || isLoading}
                    className="w-full bg-[#C0392B] text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-200 disabled:bg-gray-300"
                  >
                    {isLoading ? 'Memproses...' : 'Checkout'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Order Payment Modal (Muncul setelah checkout sukses ke DB) */}
      {showPaymentModal && pendingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-[#C0392B] mb-2">Pesanan Diterima!</h2>
            <p className="text-gray-500 mb-6 text-sm">Nomor Antrean Anda:</p>
            <div className="bg-[#F5E6D3] py-6 rounded-3xl border-2 border-dashed border-[#C0392B]/30 mb-6">
                <span className="text-5xl font-black text-[#C0392B]">{pendingOrder.queueNumber}</span>
            </div>
            <a
              href={`https://wa.me/${pendingOrder.city === 'Jogja' ? '6282221457744' : '6281392504909'}?text=Konfirmasi%20Order%20${pendingOrder.queueNumber}%20Total%20Rp%20${pendingOrder.totalAmount.toLocaleString()}`}
              target="_blank"
              className="block w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold mb-3"
            >
              Konfirmasi WhatsApp
            </a>
            <button onClick={() => setShowPaymentModal(false)} className="w-full py-4 font-bold text-gray-400">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerHome;