import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import AdminLayout from '../components/layout/AdminLayout';

import Home from '../pages/Home';
import Catalog from '../pages/Catalog';
import Quote from '../pages/Quote';
import Auth from '../pages/Auth';
import Register from '../pages/Register';
import PasswordReset from '../pages/PasswordReset';
import UpdatePassword from '../pages/UpdatePassword';
import AdminDashboard from '../pages/AdminDashboard';
import AdminAnalytics from '../pages/AdminAnalytics';
import AdminProducts from '../pages/AdminProducts';
import UserDashboard from '../pages/UserDashboard';
import UserProfile from '../pages/UserProfile';
import { useAuth } from '../context/useAuth';

// Guard para Clientes Autenticados
function ProtectedUserRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando sesión...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// Guard de Administrador para Layout Routes
function ProtectedAdminLayout() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando permisos...</div>;
  }

  return profile?.role === 'admin' ? <AdminLayout /> : <Navigate to="/" replace />;
}

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* RUTAS PÚBLICAS Y DE CLIENTE (Con Header y Footer público) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/cotizacion" element={<Quote />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recuperar-clave" element={<PasswordReset />} />
          <Route path="/restablecer-clave" element={<UpdatePassword />} />

          {/* Rutas privadas de Cliente (Requieren Login) */}
          <Route element={<ProtectedUserRoute />}>
            <Route path="/mis-cotizaciones" element={<UserDashboard />} />
            <Route path="/perfil" element={<UserProfile />} />
          </Route>
        </Route>

        {/* RUTAS PRIVADAS ADMIN (Panel Admin con Sidebar exclusivo) */}
        <Route element={<ProtectedAdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/productos" element={<AdminProducts />} />
          <Route path="/admin/analitica" element={<AdminAnalytics />} />
          <Route path="/admin/nuevo-producto" element={<Navigate to="/admin/productos" replace />} />
        </Route>

        <Route path="*" element={<h2 style={{ textAlign: 'center', padding: '50px' }}>404 - Página no encontrada</h2>} />
      </Routes>
    </Router>
  );
}