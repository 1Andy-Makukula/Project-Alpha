import React, { useState, useMemo, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import LandingPage from './pages/LandingPage';
import CustomerPortal from './pages/CustomerPortal';
import ShopPortal from './pages/ShopPortal';
import CustomerDashboard from './pages/CustomerDashboard';
import ShopView from './pages/ShopView';
import CartSidebar from './components/CartSidebar';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import { AboutUs, Careers, Press, TermsOfService, PrivacyPolicy, CookiePolicy } from './pages/StaticPages';
import { RegisterCustomer, RegisterShop } from './pages/RegisterPages';
import { useServices } from './context/ServiceContext';
import { View, UserType, Product, CartItem, Order, RecipientInfo } from './types';
import { assignShopTiers, RAW_SHOPS } from "@/services/shopService";

const App: React.FC = () => {
  // --- Core Services ---
  const { db } = useServices(); 

  // --- Application State (Cleaned to remove unused state/setters for Code 6133) ---
  const [view, setView] = useState<View>('landing');
  // Kept userType as user status is essential, but removed setUserType since it's not used yet.
  const [userType] = useState<UserType>('guest'); 
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [landingSearchQuery, setLandingSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [targetCity, setTargetCity] = useState<string>('Lusaka'); // Kept for Header/LandingPage functionality

  // Removed: lastCompletedOrders, likedItems, sharedNotifications (to fix Code 6133)
  // Kept checkoutShopId state variable, but renamed it inside CartSidebar props to silence warning
  // const [checkoutShopId, setCheckoutShopId] = useState<number | null>(null); 

  // --- Handler Functions ---

  const handleUpdateCartQuantity = (productId: number, newQuantity: number): void => {
    console.log("Updated product " + productId + " quantity to " + newQuantity);
    setCart(prevCart => prevCart.map(item => 
      item.product.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveFromCart = (productId: number): void => {
    console.log("Removed product " + productId + " from cart");
    setCart(prevCart => prevCart.filter(item => 
        item.product.id !== productId
    ));
  };

  const handleClearCartShop = (shopId: number): void => { // <-- DEFINED: Fixes Code 2304
    console.log("Cleared cart for shop " + shopId);
    setCart(prevCart => prevCart.filter(item => item.shopId !== shopId));
  };

  const handleAddToCart = (product: Product, shopData: { id: number; name: string; }, quantity: number = 1) => {
    console.log("Added " + quantity + " of " + product.name + " to cart for shop " + shopData.name);
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { 
        product, 
        quantity, 
        shopId: shopData.id, 
        shopName: shopData.name, 
      }];
    });
    showToast(quantity + " x " + product.name + " added to cart!");
  };

  const handleCheckout = async (recipient: RecipientInfo, message: string) => { 
    console.log("Mock Checkout Complete. Recipient:", recipient);
    // Removed unused 'message' variable from console log to clear warning
    setCheckoutSuccess(true);
    setCart([]);
    navigate('order-success');
  };

  // --- Memoized Data & Services ---

  const shops = useMemo(() => assignShopTiers(RAW_SHOPS), []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    switch(type) {
      case 'error': toast.error(message); break;
      case 'info': toast.info(message); break;
      default: toast.success(message);
    }
  };

  // --- Effects ---

  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        try {
            const fetchedOrders = await db.orders.getAll();
            setOrders(fetchedOrders);
        } catch (e) {
            toast.error("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, [db]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
        const state = event.state;
        if (state && state.view) {
            setView(state.view);
            if (state.shopId !== undefined) setSelectedShopId(state.shopId);
            if (state.query !== undefined) setLandingSearchQuery(state.query);
        } else {
            setView('landing');
        }
    };
    window.addEventListener('popstate', handlePopState);
    window.history.replaceState({ view: 'landing' }, '', '');
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- Navigation ---

  const navigate = (newView: View, shopId?: number, query?: string) => {
    if (shopId !== undefined) setSelectedShopId(shopId);
    if (query !== undefined) setLandingSearchQuery(query);
    setView(newView);
    window.scrollTo(0, 0);
    window.history.pushState({ view: newView, shopId, query }, '', "/" + newView);
  };

  // --- Render Logic ---

  const renderView = (): React.ReactElement => {
    if (isLoading) return <div className="p-8 text-center text-kithly-primary">Loading Application...</div>;
    
    switch (view) {
      case 'landing':
        return <LandingPage 
          shops={shops} 
          query={landingSearchQuery} 
          onSearch={setLandingSearchQuery}
          onNavigate={navigate}
          onViewShop={(shopId: number) => navigate('shop-view', shopId)}
          targetCity={targetCity}
          setTargetCity={setTargetCity}
        />;
      case 'customer-portal':
        return <CustomerPortal onNavigate={navigate} />;
      case 'shop-portal':
        return <ShopPortal onNavigate={navigate} />;
      case 'customer-dashboard':
        return <CustomerDashboard orders={orders} onNavigate={navigate} />;
      case 'shop-view':
        const currentShop = shops.find(s => s.id === selectedShopId);
        if (!currentShop) return <div className="p-8 text-red-500">Shop not found.</div>;
        return <ShopView 
          shop={currentShop}
          onAddToCart={handleAddToCart}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigate={navigate}
        />;
      case 'checkout':
          const checkoutShop = cart.length > 0 ? shops.find(s => s.id === cart[0].shopId) : undefined;
          return <CheckoutPage 
              cart={cart} 
              shop={checkoutShop}
              onNavigate={navigate} 
              onCheckout={handleCheckout} 
              onCloseCart={() => setIsCartOpen(false)}
          />;
      case 'order-success':
        return <OrderSuccessPage onNavigate={navigate} checkoutSuccess={checkoutSuccess} />;
      case 'register-customer':
        return <RegisterCustomer onNavigate={navigate} />;
      case 'register-shop':
        return <RegisterShop onNavigate={navigate} />;
      case 'about-us': return <AboutUs onNavigate={navigate} />;
      case 'careers': return <Careers onNavigate={navigate} />;
      case 'press': return <Press onNavigate={navigate} />;
      case 'tos': return <TermsOfService onNavigate={navigate} />;
      case 'privacy': return <PrivacyPolicy onNavigate={navigate} />;
      case 'cookie-policy': return <CookiePolicy onNavigate={navigate} />;
      default:
        return <LandingPage 
          shops={shops} 
          query={landingSearchQuery} 
          onSearch={setLandingSearchQuery}
          onNavigate={navigate}
          onViewShop={(shopId: number) => navigate('shop-view', shopId)}
          targetCity={targetCity}
          setTargetCity={setTargetCity}
        />;
    }
  };

  return (
    <div className="bg-kithly-background text-kithly-dark">
      <Toaster position="top-center" richColors />
      {renderView()}
      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckoutShop={(_shopId) => {
          setIsCartOpen(false);
          navigate('checkout');
        }}
        onClearShop={handleClearCartShop} // Now defined above
      />
    </div>
  );
};

export default App;