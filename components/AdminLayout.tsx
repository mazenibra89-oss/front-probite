import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, BarChart3, LogOut, Home, UserPlus } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('probite_auth');
    navigate('/login');
  };

  const isLoggedIn = !!localStorage.getItem('probite_auth');

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Produk & Stok', path: '/admin/products', icon: <Package className="w-5 h-5" /> },
    { label: 'Laporan', path: '/admin/reports', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Hitung HPP', path: '/admin/hpp', icon: <BarChart3 className="w-5 h-5 rotate-90" /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#F5E6D3]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2D3436] text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-[#C0392B]">PROBITE<span className="text-white">Admin</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                ? 'bg-[#C0392B] text-white' 
                : 'hover:bg-gray-800 text-gray-400'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          {isLoggedIn && (
            <Link
              to="/admin/register"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/admin/register' ? 'bg-[#C0392B] text-white' : 'hover:bg-gray-800 text-gray-400'}`}
            >
              <UserPlus className="w-5 h-5" />
              Register Admin
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-gray-700 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors">
            <Home className="w-5 h-5" />
            Ke Customer View
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#2D3436] border-t border-gray-700 flex justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 px-2 py-1 text-xs font-bold transition-colors ${location.pathname === item.path ? 'text-[#C0392B]' : 'text-gray-400'}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
        {isLoggedIn && (
          <Link
            to="/admin/register"
            className={`flex flex-col items-center gap-1 px-2 py-1 text-xs font-bold transition-colors ${location.pathname === '/admin/register' ? 'text-[#C0392B]' : 'text-gray-400'}`}
          >
            <UserPlus className="w-5 h-5" />
            Register Admin
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-2 py-1 text-xs font-bold text-red-400"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8 pb-16 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
