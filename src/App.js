import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Auth from './pages/StitchLogin';
import Verify from './pages/Verify';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import PostAd, { PostedAd } from './pages/PostAd';
import MyAds from './pages/MyAds';
import AdminDashboard from './pages/AdminDashboard';
import Messages from './pages/Messages';
import Categories from './pages/Categories';
import Success from './pages/Success';
import Support from './pages/Support';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import './App.css';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, ADMIN_EMAIL } = useAuth();
  if (!currentUser) return <Navigate to="/auth" />;
  if (requireAdmin && currentUser.email !== ADMIN_EMAIL) return <Navigate to="/marketplace" />;
  if (!requireAdmin && currentUser.email === ADMIN_EMAIL) return <Navigate to="/admin" />;
  if (!requireAdmin && !currentUser.emailVerified) return <Navigate to="/verify" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { currentUser, ADMIN_EMAIL } = useAuth();
  if (currentUser) {
    if (currentUser.email === ADMIN_EMAIL) return <Navigate to="/admin" />;
    if (!currentUser.emailVerified) return <Navigate to="/verify" />;
    return <Navigate to="/marketplace" />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/verify" element={<Verify />} />

          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/post" element={<ProtectedRoute><PostAd /></ProtectedRoute>} />
          <Route path="/posted" element={<ProtectedRoute><PostedAd /></ProtectedRoute>} />
          <Route path="/myads" element={<ProtectedRoute><MyAds /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/categories/:category" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/support" element={<Support />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
