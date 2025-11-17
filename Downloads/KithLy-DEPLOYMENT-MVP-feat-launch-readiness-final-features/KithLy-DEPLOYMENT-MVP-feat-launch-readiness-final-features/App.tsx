// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';

// Pages
import  LandingPage  from '@/pages/LandingPage';
import { ShopView } from '@/pages/ShopView';
import  CheckoutPage  from '@/pages/CheckoutPage';
import  CustomerDashboard  from '@/pages/CustomerDashboard';
import  ShopPortal  from '@/pages/ShopPortal';
import { AuthPage } from '@/pages/AuthPage';
import { OrderSuccessPage } from '@/pages/OrderSuccessPage'; // New Page

// Layout components
import  Header  from '@/components/Header';
import  Footer  from '@/components/Footer';
import  CartSidebar  from '@/components/CartSidebar';

// Component to protect routes
const ProtectedRoute: React.FC<{ children: React.ReactNode, roles?: string[] }> = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="p-10 text-center">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />; // Or unauthorized page
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <Header onCustomerLogin={() => {}} onShopLogin={() => {}} />
      <main className="min-h-[80vh]">
        <Routes>
          <Route path="/" element={<LandingPage setView={() => {}} />} />
          <Route path="/shop/:shopId" element={<ShopView />} />
          <Route path="/auth" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard setView={() => {}} cartItemCount={0} onCartClick={() => {}} orders={[]} checkoutSuccess={false} onDismissSuccess={() => {}} /></ProtectedRoute>} />

          {/* Shop Owner Route */}
          <Route path="/portal/shop" element={<ProtectedRoute roles={['shop_owner']}><ShopPortal setView={() => {}} orders={[]} onMarkAsCollected={() => {}} /></ProtectedRoute>} />

          {/* Checkout/Order Flow */}
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage setView={() => {}} cart={[]} onCheckout={() => {}} /></ProtectedRoute>} />
          <Route path="/order/success" element={<OrderSuccessPage />} />

          {/* Catch-all */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </main>
      <Footer />
      <CartSidebar isOpen={false} onClose={() => {}} cart={[]} onUpdateQuantity={() => {}} onRemoveItem={() => {}} onCheckout={() => {}} />
    </>
  );
};

// --- Main App Component ---
export function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
