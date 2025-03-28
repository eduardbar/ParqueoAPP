/**
 * 🅿️ ParqueoAPP - Aplicación Principal (Frontend)
 * 
 * Componente raíz de la aplicación React que configura:
 * - Enrutamiento de la aplicación con React Router
 * - Protección de rutas basada en autenticación y roles
 * - Sistema de notificaciones con react-hot-toast
 * - Layout responsive y accesible
 * 
 * Arquitectura:
 * - Principio KISS: Estructura simple y clara de rutas
 * - Separación de responsabilidades: Componentes específicos por funcionalidad
 * - Control de acceso: Rutas protegidas y públicas claramente definidas
 * 
 * @author ParqueoAPP Team
 * @version 1.0.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import './index.css';

// === COMPONENTES DE LAYOUT ===
import Layout from './components/Layout';

// === PÁGINAS PÚBLICAS ===
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// === PÁGINAS PROTEGIDAS ===
// Páginas para conductores
import DriverMapPage from './pages/DriverMapPage';
import ParkingLotsPage from './pages/ParkingLotsPage';
import BookingsPage from './pages/BookingsPage';

// Páginas para propietarios
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import OwnerDashboard from './pages/OwnerDashboard';

// Páginas compartidas (autenticadas)
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import PaymentHistoryPage from './components/PaymentHistoryPage';

// === COMPONENTES DE PROTECCIÓN DE RUTAS ===

/**
 * Componente ProtectedRoute
 * 
 * Protege rutas que requieren autenticación y/o roles específicos.
 * Redirige automáticamente a login si no está autenticado.
 * 
 * @param children - Componente hijo a proteger
 * @param roles - Array opcional de roles permitidos (ej: ['DRIVER', 'OWNER'])
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ 
  children, 
  roles = [] 
}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  // Verificar autenticación
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  
  // Verificar autorización por rol si se especificaron roles
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

/**
 * Componente PublicRoute
 * 
 * Protege rutas públicas (login, register) para usuarios ya autenticados.
 * Redirige automáticamente al dashboard apropiado según el rol del usuario.
 * 
 * Lógica de redirección:
 * - DRIVER -> /parking-lots (búsqueda de estacionamientos)
 * - OWNER -> /owner-dashboard (gestión de estacionamientos)
 * 
 * @param children - Componente hijo (página pública)
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (isAuthenticated && user) {
    // Redirección inteligente basada en el rol del usuario
    const redirectPath = user.role === 'DRIVER' ? '/parking-lots' : '/owner-dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  return <>{children}</>;
};

/**
 * Componente Principal de la Aplicación
 * 
 * Configura el enrutamiento completo de la aplicación y el sistema de notificaciones.
 * Utiliza el patrón de Layout Wrapper para mantener consistencia visual.
 */
const App: React.FC = () => {
  return (
    <>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <HomePage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/parking-lots" 
              element={
                <ProtectedRoute>
                  <ParkingLotsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment-history" 
              element={
                <ProtectedRoute>
                  <PaymentHistoryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bookings" 
              element={
                <ProtectedRoute roles={['DRIVER']}>
                  <BookingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/owner-dashboard" 
              element={
                <ProtectedRoute roles={['OWNER']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/map" 
              element={
                <ProtectedRoute roles={['DRIVER']}>
                  <DriverMapPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute roles={['OWNER']}>
                  <OwnerDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </>
  );
};

export default App;
