import React, { useState } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, Settings, CheckCircle2, X } from 'lucide-react';
import { useProbiteStore } from '../store';
import { CATEGORIES } from '../constants';
import { CartItem, Transaction } from '../types';
import { Link } from 'react-router-dom';

const CustomerHome: React.FC = () => {
  const { products, processCheckout } = useProbiteStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(
    CATEGORIES.find(cat => cat !== 'Semua') || ''
  );
  const [orderResult, setOrderResult] = useState<Transaction | null>(null);
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Transaction | null>(null);
  const [openDesc, setOpenDesc] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Semua' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Jangan langsung buka keranjang mobile
    // setShowCartMobile(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const result = processCheckout(cart, selectedCity);
    setPendingOrder(result);
    setShowPaymentModal(true);
    setCart([]);
    setSelectedCity(''); // Reset kota setelah order
  };

  // Tentukan index kategori ketiga
  const thirdCategory = CATEGORIES.filter(cat => cat !== 'Semua')[2];

  return (
    <div className={`min-h-screen flex flex-col${cart.length > 0 ? ' md:flex-row' : ''} max-h-screen overflow-hidden relative`}> 
      {/* Main Products Area */}
      <div className={`flex-1 flex flex-col p-4 md:p-8 overflow-hidden bg-[#F5E6D3]${cart.length === 0 ? ' w-full' : ''}`}>
        <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4 relative">
          <div>
            <h1 className="text-3xl font-bold text-[#C0392B]">PROBITE</h1>
            <p className="text-gray-600">Fresh & Tasty Bites, Delivered with Love.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Cari menu favorit kamu..." 
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-[#C0392B] outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Admin Login Button pojok kanan atas */}
          <Link to="/login" className="absolute top-0 right-0 md:static flex items-center gap-2 text-xs md:text-sm text-gray-400 hover:text-[#C0392B] transition-colors font-bold bg-white/80 md:bg-transparent px-4 py-2 md:p-0 rounded-2xl md:rounded-none shadow md:shadow-none mt-2 md:mt-0 z-30">
            <Settings className="w-4 h-4" />
          </Link>
        </header>

        {/* Categories */}
        <div className="w-full">
          <div className="flex md:justify-center overflow-x-auto whitespace-nowrap gap-3 md:gap-8 pb-2 -mx-4 md:mx-0 px-4 sticky top-0 z-20 bg-[#F5E6D3] custom-scrollbar-hide border-b border-[#e0c9b0]">
            {CATEGORIES.filter(cat => cat !== 'Semua' && cat !== 'Cemilan').map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-6 py-2 rounded-full whitespace-nowrap transition-all font-medium text-base md:text-lg shadow-sm border
                  ${activeCategory === cat ? 'bg-[#C0392B] text-white shadow-lg border-[#C0392B]' : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <style>{`
          .custom-scrollbar-hide::-webkit-scrollbar { display: none; }
          .custom-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* Product List Responsive Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar w-full" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col w-full">
                <div className="relative" style={{ height: 180 }}>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    style={{ width: '100%', height: 180, objectFit: 'cover', flexShrink: 0 }}
                    className="block"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#C0392B]">
                    {product.category}
                  </div>
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="text-white text-xl font-extrabold tracking-widest drop-shadow-lg">SOLD OUT</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                  <p className="text-[#27AE60] font-bold text-xl mb-4">
                    Rp {product.price.toLocaleString()}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <button
                      className="text-xs text-[#C0392B] font-bold bg-[#F5E6D3] px-3 py-1 rounded-xl border border-[#C0392B] hover:bg-[#C0392B] hover:text-white transition-all"
                      onClick={() => setOpenDesc(openDesc === product.id ? null : product.id)}
                      type="button"
                    >
                      Deskripsi
                    </button>
                    <button 
                      disabled={product.stock <= 0}
                      onClick={() => addToCart(product)}
                      className="bg-[#C0392B] text-white p-3 rounded-2xl shadow-lg hover:shadow-[#C0392B]/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {openDesc === product.id && (
                  <div className="mt-3 p-3 bg-[#F5E6D3] rounded-xl text-sm text-gray-700 border border-[#C0392B]/20 animate-in fade-in duration-200">
                    {product.description || 'Tidak ada deskripsi.'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar (Desktop) */}
      {cart.length > 0 && (
        <div className="hidden md:flex w-full md:w-96 bg-white shadow-2xl flex-col p-6 max-h-screen">
          <div className="flex items-center gap-3 mb-8 border-b pb-4">
            <ShoppingCart className="text-[#C0392B] w-6 h-6" />
            <h2 className="text-2xl font-bold">Keranjang Saya</h2>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex gap-4 p-3 bg-[#F5E6D3]/30 rounded-2xl animate-in slide-in-from-right duration-300">
                <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm leading-tight mb-1">{item.name}</h4>
                  <p className="text-[#C0392B] text-sm font-bold">Rp {(item.price * item.quantity).toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"><Minus className="w-3 h-3"/></button>
                    <span className="text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"><Plus className="w-3 h-3"/></button>
                    <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-500 opacity-50 hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t pt-6 space-y-4">
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Pilih Kota Pengiriman</label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#C0392B] text-base font-bold mb-2"
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
              >
                <option value="">-- Pilih Kota --</option>
                <option value="Semarang">Semarang</option>
                <option value="Jogja">Jogja</option>
              </select>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>Rp {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Pajak (0%)</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-[#C0392B] pt-2">
              <span>Total</span>
              <span>Rp {total.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || !selectedCity}
              className="w-full bg-[#C0392B] text-white py-4 rounded-3xl font-bold text-lg shadow-xl shadow-[#C0392B]/20 hover:bg-[#A93226] transition-all transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              Checkout Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Floating Cart Button (Mobile) */}
      {cart.length > 0 && (
        <button
          className="fixed md:hidden bottom-6 right-6 z-40 bg-[#C0392B] text-white rounded-full shadow-lg flex items-center px-5 py-3 gap-2 font-bold text-base"
          onClick={() => setShowCartMobile(true)}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Keranjang ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
        </button>
      )}

      {/* Cart Drawer (Mobile) */}
      {cart.length > 0 && showCartMobile && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCartMobile(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-6 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-3 mb-6 border-b pb-3">
              <ShoppingCart className="text-[#C0392B] w-6 h-6" />
              <h2 className="text-xl font-bold flex-1">Keranjang Saya</h2>
              <button onClick={() => setShowCartMobile(false)} className="text-gray-400 hover:text-gray-600"><X/></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 p-3 bg-[#F5E6D3]/30 rounded-2xl">
                  <img src={item.image} className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm leading-tight mb-1">{item.name}</h4>
                    <p className="text-[#C0392B] text-sm font-bold">Rp {(item.price * item.quantity).toLocaleString()}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"><Minus className="w-3 h-3"/></button>
                      <span className="text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"><Plus className="w-3 h-3"/></button>
                      <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-500 opacity-50 hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t pt-4 space-y-3">
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Pilih Kota Pengiriman</label>
                <select
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#C0392B] text-base font-bold mb-2"
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                >
                  <option value="">-- Pilih Kota --</option>
                  <option value="Semarang">Semarang</option>
                  <option value="Jogja">Jogja</option>
                </select>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Subtotal</span>
                <span>Rp {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Pajak (0%)</span>
                <span>Rp 0</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-[#C0392B] pt-1">
                <span>Total</span>
                <span>Rp {total.toLocaleString()}</span>
              </div>
              <button 
                onClick={() => { handleCheckout(); setShowCartMobile(false); }}
                disabled={cart.length === 0 || !selectedCity}
                className="w-full bg-[#C0392B] text-white py-3 rounded-2xl font-bold text-base shadow-xl shadow-[#C0392B]/20 hover:bg-[#A93226] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                Checkout Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Payment Modal */}
      {showPaymentModal && pendingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] p-8 md:p-12 max-w-md w-full text-center relative overflow-hidden animate-in zoom-in duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#27AE60]" />
            <button onClick={() => { setShowPaymentModal(false); setPendingOrder(null); setSelectedCity(''); }} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"><X/></button>
            <h2 className="text-3xl font-bold mb-2">Konfirmasi Pembayaran</h2>
            <p className="text-gray-500 mb-4">Silakan lakukan pembayaran ke kasir atau konfirmasi melalui WhatsApp.</p>
            <div className="mb-6 p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded-xl text-yellow-900 font-bold text-sm flex items-center gap-2">
              <span className="inline-block bg-yellow-400 rounded-full w-2 h-2 mr-2"></span>
              <span>WAJIB konfirmasi pesanan ke WhatsApp Probite setelah checkout agar pesanan diproses!</span>
            </div>
            <div className="bg-[#F5E6D3]/50 rounded-3xl py-6 mb-8 border-2 border-dashed border-[#C0392B]/30">
              <div className="text-lg font-bold text-[#C0392B] mb-2">Nomor Order Anda</div>
              <div className="text-3xl font-black text-[#C0392B] tracking-tighter mb-2">{pendingOrder.queueNumber}</div>
              <div className="text-lg font-bold text-[#C0392B] mb-2 mt-4">Total Bayar</div>
              <div className="text-4xl font-black text-[#C0392B] tracking-tighter mb-2">Rp {pendingOrder.total.toLocaleString()}</div>
              <div className="text-base font-bold text-[#2D3436] mt-4">Kota: {pendingOrder.city}</div>
            </div>
            <a
              href={`https://wa.me/${pendingOrder.city === 'Jogja' ? '6282221457744' : '6281392504909'}?text=Halo%20Probite%2C%20saya%20ingin%20konfirmasi%20pesanan%20dengan%20total%20Rp%20${pendingOrder.total.toLocaleString()}%20dan%20ID%20${pendingOrder.queueNumber}%20dari%20kota%20${pendingOrder.city}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-[#128C7E] transition mb-4"
            >
              Konfirmasi via WhatsApp
            </a>
            <button 
              onClick={() => { setShowPaymentModal(false); setPendingOrder(null); setSelectedCity(''); }}
              className="w-full bg-[#2D3436] text-white py-4 rounded-2xl font-bold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerHome;
