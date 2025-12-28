
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
import ContactsPage from './pages/ContactsPage';
import NotificationPage from './pages/NotificationPage';
import ProfilePage from './pages/ProfilePage';
import SecurityPage from './pages/SecurityPage';
import PaymentsPage from './pages/PaymentsPage';
import PinLocationPage from './pages/PinLocationPage';
import { AboutUs, Careers, Press, TermsOfService, PrivacyPolicy, CookiePolicy } from './pages/StaticPages';
import { RegisterCustomer, RegisterShop } from './pages/RegisterPages';
import { useServices } from './context/ServiceContext';
import { AuthProvider } from './contexts/AuthContext';
import { View, UserType, Shop, Product, CartItem, Order } from './types';
import { assignShopTiers } from './services/shopService';
import { ENHANCED_SHOPS } from './services/enhancedShopData';
import { filterShopsByGeolocation } from './services/geolocationService';

/**
 * @desc The main application component.
 * Acts as the root of the application, managing state, navigation,
 * and data flow between different views.
 * @returns {React.ReactElement} The rendered application.
 */
const App: React.FC = () => {
  // --- Core Services ---
  /**
   * @desc Access to the backend service layer (database, notifications).
   * @todo The backend logic is currently mocked. Swap with a real implementation in ServiceProvider.
   */
  const { db, notify } = useServices();

  // --- Application State ---
  const [view, setView] = useState<View>('landing');
  const [userType, setUserType] = useState<UserType>('guest');
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [landingSearchQuery, setLandingSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastCompletedOrders, setLastCompletedOrders] = useState<Order[]>([]);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [likedItems, setLikedItems] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [targetCity, setTargetCity] = useState<string>('Lusaka');
  const [checkoutShopId, setCheckoutShopId] = useState<number | null>(null);
  const [sharedNotifications, setSharedNotifications] = useState<any[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);


  /**
   * @desc Memoized shop data, enriched with calculated tiers and filtered by location.
   * Using ENHANCED_SHOPS which includes geolocation data and more products.
   */
  const shops = useMemo(() => {
    const allShops = assignShopTiers(ENHANCED_SHOPS);
    if (targetCity && targetCity !== 'All') {
      return filterShopsByGeolocation(allShops, { city: targetCity });
    }
    return allShops;
  }, [targetCity]);

  /**
   * @desc Displays a toast notification to the user.
   * @param {string} message - The message to display.
   * @param {'success' | 'error' | 'info'} [type='success'] - The type of toast.
   */
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    switch (type) {
      case 'error': toast.error(message); break;
      case 'info': toast.info(message); break;
      default: toast.success(message);
    }
  };

  /**
   * @desc Effect to load initial data when the application starts.
   * @todo Fetch user-specific orders after authentication is implemented.
   */
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

  /**
   * @desc Effect to handle browser history (back/forward buttons).
   * Uses the PopStateEvent to restore the application's view state.
   */
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

  /**
   * @desc Navigates to a new view within the application.
   * @param {View} newView - The view to navigate to.
   * @param {number} [shopId] - Optional shop ID for context.
   * @param {string} [query] - Optional search query.
   */
  const navigate = (newView: View, shopId?: number, query?: string) => {
    if (shopId !== undefined) setSelectedShopId(shopId);
    if (query !== undefined) setLandingSearchQuery(query);
    setView(newView);
    window.scrollTo(0, 0);
    window.history.pushState({ view: newView, shopId, query }, '', `/${newView}`);
  };

  // --- Business Logic ---

  /**
   * @desc Handles adding a product to the cart or updating its quantity.
   * @param {Product} product - The product to add.
   * @param {{ id: number; name: string; }} shopData - The shop the product belongs to.
   * @param {number} [quantity=1] - The quantity to add.
   * @todo Logic should be moved to a dedicated cart management hook or service.
   */
  const handleUpdateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
  };

  const handleAddToCart = (product: Product, shopData: { id: number; name: string; }, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity, shopId: shopData.id, shopName: shopData.name }];
    });
    showToast(`${product.name} added to cart!`, 'success');
  };

  const handleUpdateCartQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const handleClearCartShop = (shopId: number) => {
    setCart(prevCart => prevCart.filter(item => item.shopId !== shopId));
    showToast('Shop items cleared from cart', 'info');
  };

  /**
   * @desc Processes the checkout, creates orders, and clears the cart.
   * @param {object} recipient - The recipient's details.
   * @param {string} message - An optional message for the order.
   * @todo This is a critical backend integration point. The logic for order creation
   * and payment processing must be handled securely on the server.
   */
  const handleCheckout = async (
    recipient: { name: string; email: string; phone: string },
    message: string,
    deliveryMethod: string,
    deliveryType: 'collection' | 'delivery',
    additionalDetails?: { pickupTime?: string; orderType?: 'request' | 'instant' }
  ) => {
    if (!checkoutShopId) return;

    const shopCart = cart.filter(item => item.shopId === checkoutShopId);
    if (shopCart.length === 0) return;

    const total = shopCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const itemCount = shopCart.reduce((sum, item) => sum + item.quantity, 0);
    const shop = shops.find(s => s.id === checkoutShopId);

    const isRequest = additionalDetails?.orderType === 'request';

    const newOrder: Order = {
      id: `KLY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      customerName: recipient.name,
      customerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient.name)}&background=random`,
      paidOn: new Date().toISOString(),
      collectedOn: null,
      total,
      itemCount,
      status: isRequest ? 'pending' : 'paid',
      deliveryMethod: deliveryType === 'collection' ? 'pickup' : 'delivery',
      collectionCode: `KLY-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      shopName: shop?.name || 'Unknown Shop',
      message,
      items: shopCart.map(item => ({ ...item.product, quantity: item.quantity })),
      pickupTime: additionalDetails?.pickupTime,
      orderType: additionalDetails?.orderType,
      approvalStatus: isRequest ? 'pending' : 'approved'
    };

    try {
      await db.orders.create(newOrder);
      setOrders(prev => [newOrder, ...prev]);
      setLastCompletedOrders([newOrder]);
      setCart(prevCart => prevCart.filter(item => item.shopId !== checkoutShopId));
      setCheckoutSuccess(true);
      navigate('orderSuccess');
      showToast('Order placed successfully!', 'success');
    } catch (error) {
      showToast('Failed to place order. Please try again.', 'error');
    }
  };

  // --- Render Logic ---

  /**
   * @desc Renders the current view based on the application's state.
   * @returns {React.ReactElement} The component for the current view.
   */
  const renderView = () => {
    const selectedShop = selectedShopId ? shops.find(s => s.id === selectedShopId) : null;

    switch (view) {
      case 'landing':
        return <LandingPage setView={navigate} targetCity={targetCity} setTargetCity={setTargetCity} />;

      case 'customerPortal':
        return (
          <CustomerPortal
            setView={navigate}
            cartItemCount={cart.length}
            onCartClick={() => setIsCartOpen(true)}
            initialSearchQuery={landingSearchQuery}
            targetCity={targetCity}
            setTargetCity={setTargetCity}
            shops={shops}
          />
        );

      case 'shopView':
        if (!selectedShop) {
          navigate('customerPortal');
          return null;
        }
        return (
          <ShopView
            setView={navigate}
            shopId={selectedShopId}
            onAddToCart={handleAddToCart}
            cartItemCount={cart.length}
            onCartClick={() => setIsCartOpen(true)}
            likedItems={likedItems}
            onToggleLike={(productId) => {
              setLikedItems(prev =>
                prev.includes(productId)
                  ? prev.filter(id => id !== productId)
                  : [...prev, productId]
              );
            }}
            showToast={showToast}
            targetCity={targetCity}
            setTargetCity={setTargetCity}
          />
        );

      case 'checkout':
        return (
          <CheckoutPage
            setView={navigate}
            cart={cart.filter(item => item.shopId === checkoutShopId)}
            onCheckout={handleCheckout}
            showToast={showToast}
          />
        );

      case 'orderSuccess':
        return (
          <OrderSuccessPage
            setView={navigate}
            newOrders={lastCompletedOrders}
            setActiveOrderId={setActiveOrderId}
          />
        );

      case 'pinLocation':
        return <PinLocationPage setView={navigate} orderId={activeOrderId} onUpdateOrder={handleUpdateOrder} />;

      case 'customerDashboard':
        return (
          <CustomerDashboard
            setView={navigate}
            orders={orders}
            onCartClick={() => setIsCartOpen(true)}
            cartItemCount={cart.length}
            showToast={showToast}
            targetCity={targetCity}
            setTargetCity={setTargetCity}
            onSendReview={(review) => {
              // Handle review submission
              console.log('Review submitted:', review);
              showToast('Thank you for your review!', 'success');
            }}
          />
        );

      case 'shopPortal':
        const walletStats = {
          pending: orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.total, 0),
          available: orders.filter(o => o.status === 'collected').reduce((sum, o) => sum + o.total, 0),
          totalOrders: orders.length
        };
        return (
          <ShopPortal
            setView={navigate}
            orders={orders}
            onMarkAsCollected={(orderId, method) => {
              db.orders.verifyAndCollect(orderId, method).then(success => {
                if (success) {
                  setOrders(prev =>
                    prev.map(o =>
                      o.id === orderId
                        ? { ...o, status: 'collected', collectedOn: new Date().toISOString(), verificationMethod: method }
                        : o
                    )
                  );
                }
              });
            }}
            onUpdateOrder={handleUpdateOrder}
            showToast={showToast}
            walletStats={walletStats}
            notifications={sharedNotifications}
          />
        );

      case 'registerCustomer':
        return <RegisterCustomer setView={navigate} />;

      case 'registerShop':
        return <RegisterShop setView={navigate} />;

      case 'about':
        return <AboutUs setView={navigate} />;

      case 'careers':
        return <Careers setView={navigate} />;

      case 'press':
        return <Press setView={navigate} />;

      case 'terms':
        return <TermsOfService setView={navigate} />;

      case 'privacy':
        return <PrivacyPolicy setView={navigate} />;

      case 'cookies':
        return <CookiePolicy setView={navigate} />;

      case 'contacts':
        return <ContactsPage setView={navigate} />;

      case 'notifications':
        return <NotificationPage setView={navigate} />;

      case 'profile':
        return <ProfilePage setView={navigate} />;

      case 'security':
        return <SecurityPage setView={navigate} />;

      case 'payments':
        return <PaymentsPage setView={navigate} />;

      case 'pinLocation':
        return <PinLocationPage setView={navigate} />;

      default:
        return <LandingPage setView={navigate} targetCity={targetCity} setTargetCity={setTargetCity} />;
    }
  };

  return (
    <AuthProvider>
      <div className="bg-kithly-background text-kithly-dark">
        <Toaster position="top-center" richColors />
        {renderView()}
        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onCheckoutShop={(shopId) => {
            setCheckoutShopId(shopId);
            setIsCartOpen(false);
            navigate('checkout');
          }}
          onClearShop={handleClearCartShop}
        />
      </div>
    </AuthProvider>
  );
};

export default App;
