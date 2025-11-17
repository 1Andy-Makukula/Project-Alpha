import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';

// Pages
import { LandingPage } from '@/pages/LandingPage';
import { ShopView } from '@/pages/ShopView';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { CustomerDashboard } from '@/pages/CustomerDashboard';
import { ShopPortal } from '@/pages/ShopPortal';
import { AuthPage } from '@/pages/AuthPage';
import { OrderSuccessPage } from '@/pages/OrderSuccessPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { TermsOfServicePage } from '@/pages/TermsOfServicePage'; // Import new page
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage'; // Import new page

// Layout components
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartSidebar } from '@/components/CartSidebar';

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
      <Header />
      <main className="min-h-[80vh]">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/shop/:shopId" element={<ShopView />} />
          <Route path="/auth" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} /> {/* Add new route */}
          <Route path="/privacy" element={<PrivacyPolicyPage />} /> {/* Add new route */}

          {/* Protected Buyer Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order/success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />

          {/* Protected Shop Owner Route */}
          <Route path="/portal/shop" element={<ProtectedRoute roles={['shop_owner']}><ShopPortal /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </main>
      <Footer />
      <CartSidebar />
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
