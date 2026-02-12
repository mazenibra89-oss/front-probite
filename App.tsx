import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomerHome from './pages/CustomerHome';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminReports from './pages/AdminReports';
import AdminRegister from './pages/AdminRegister';
import AdminLayout from './components/AdminLayout';
import AdminHPP from './pages/AdminHPP';

const App: React.FC = () => {
  // Simple auth check simulation
  const isAuthenticated = () => !!localStorage.getItem('probite_auth');

  return (
    <Router>
      <Routes>
        {/* Customer Route */}
        <Route path="/" element={<CustomerHome />} />
        
        {/* Auth Route */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={isAuthenticated() ? <AdminLayout /> : <Navigate to="/login" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="hpp" element={<AdminHPP />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
