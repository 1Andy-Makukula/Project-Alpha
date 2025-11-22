
import React, { useState, useMemo } from 'react';
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
import { Order } from './components/OrderCard';
import { db } from './services/firebase';
import { notify } from './services/notificationService';
import { getFirestore, query, collection, onSnapshot } from 'firebase/firestore';
import { AuthProvider, useAuth } from './contexts/AuthContext';

export type View = 'landing' | 'customerPortal' | 'shopPortal' | 'customerDashboard' | 'shopView' | 'checkout' | 'orderSuccess' | 'about' | 'careers' | 'press' | 'terms' | 'privacy' | 'cookies' | 'registerCustomer' | 'registerShop';
export type UserType = 'guest' | 'customer' | 'shop';

// --- NEW: TIER DEFINITIONS ---
export type ShopTier = 'Select' | 'Verified' | 'Independent' | 'Sandbox';

export interface Shop {
    id: number;
    name: string;
    description: string;
    profilePic: string;
    coverImg: string;
    category: string;
    location: string;
    isVerified: boolean;
    isNew?: boolean;
    hasOffer?: boolean;
    rating: number;
    dateAdded: string;
    isFeatured: boolean;
    keywords: string[];
    tier: ShopTier; // The Badge
    minOrder?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  shopId: number;
  shopName: string;
}

// --- THE "SUPER ADMIN" MANUAL CONTROL ---
// Data moved from CustomerPortal to here for centralization
const RAW_SHOPS: Omit<Shop, 'tier'>[] = [
    { id: 1, name: "Mama's Kitchen", description: "Authentic home-cooked meals and groceries.", profilePic: "https://picsum.photos/id/40/200/200", coverImg: "https://picsum.photos/id/1060/800/400", category: "Groceries", location: "Lagos, Nigeria", isVerified: true, isNew: false, hasOffer: true, rating: 4.8, dateAdded: '2024-07-15', isFeatured: true, keywords: ['rice', 'jollof', 'stew', 'pepper soup', 'yam', 'beans', 'oil'] },
    { id: 2, name: "The Gift Box", description: "Unique handcrafted gifts for every occasion.", profilePic: "https://picsum.photos/id/43/200/200", coverImg: "https://picsum.photos/id/10/800/400", category: "Gifts", location: "Accra, Ghana", isVerified: false, isNew: true, hasOffer: false, rating: 4.5, dateAdded: '2024-07-28', isFeatured: true, keywords: ['jewelry', 'crafts', 'art', 'fabric', 'souvenirs', 'beads', 'sculpture'] },
    { id: 3, name: "Campus Supplies Co.", description: "All your essential student needs in one place.", profilePic: "https://picsum.photos/id/48/200/200", coverImg: "https://picsum.photos/id/20/800/400", category: "Student Support", location: "Nairobi, Kenya", isVerified: true, isNew: false, hasOffer: false, rating: 4.7, dateAdded: '2024-06-20', isFeatured: false, keywords: ['books', 'stationery', 'laptop', 'backpack', 'uniform', 'pens', 'textbooks'] },
    { id: 4, name: "Daily Needs Grocers", description: "Fresh produce and daily essentials delivered.", profilePic: "https://picsum.photos/id/53/200/200", coverImg: "https://picsum.photos/id/25/800/400", category: "Groceries", location: "Lagos, Nigeria", isVerified: true, isNew: false, hasOffer: false, rating: 4.6, dateAdded: '2024-07-01', isFeatured: true, keywords: ['vegetables', 'fruits', 'milk', 'bread', 'eggs', 'tomatoes', 'onions'] },
    { id: 5, name: "Celebration Creations", description: "Cakes, flowers, and party supplies.", profilePic: "https://picsum.photos/id/63/200/200", coverImg: "https://picsum.photos/id/30/800/400", category: "Gifts", location: "Johannesburg, SA", isVerified: false, isNew: true, hasOffer: true, rating: 4.4, dateAdded: '2024-07-25', isFeatured: false, keywords: ['cake', 'flowers', 'balloons', 'party', 'chocolate', 'birthday', 'wedding'] },
    { id: 7, name: "Accra Fine Gifts", description: "Luxury gifts from Ghana.", profilePic: "https://picsum.photos/id/70/200/200", coverImg: "https://picsum.photos/id/71/800/400", category: "Gifts", location: "Accra, Ghana", isVerified: true, isNew: false, hasOffer: true, rating: 4.9, dateAdded: '2024-05-10', isFeatured: true, keywords: ['gold', 'kente', 'luxury', 'fashion', 'watches', 'perfume'] },
    { id: 8, name: "Nairobi Scholar Hub", description: "Textbooks and more for students.", profilePic: "https://picsum.photos/id/80/200/200", coverImg: "https://picsum.photos/id/81/800/400", category: "Student Support", location: "Nairobi, Kenya", isVerified: false, isNew: true, hasOffer: false, rating: 4.3, dateAdded: '2024-07-29', isFeatured: false, keywords: ['science kit', 'calculators', 'notebooks', 'lab coat', 'art supplies'] },
    { id: 9, name: "Lusaka Fresh Market", description: "Farm fresh vegetables and meats.", profilePic: "https://picsum.photos/id/90/200/200", coverImg: "https://picsum.photos/id/292/800/400", category: "Groceries", location: "Lusaka, Zambia", isVerified: true, isNew: true, hasOffer: true, rating: 4.7, dateAdded: '2024-10-01', isFeatured: true, keywords: ['beef', 'chicken', 'vegetables', 'maize', 'mealie meal', 'spinach'] },
    { id: 10, name: "Zambia Textbooks", description: "Curriculum books for all grades.", profilePic: "https://picsum.photos/id/100/200/200", coverImg: "https://picsum.photos/id/24/800/400", category: "Student Support", location: "Lusaka, Zambia", isVerified: true, isNew: false, hasOffer: false, rating: 4.5, dateAdded: '2024-08-15', isFeatured: false, keywords: ['textbooks', 'grade 12', 'examination', 'past papers', 'syllabus'] },
    { id: 11, name: "Heritage Crafts", description: "Traditional Zambian crafts and decor.", profilePic: "https://picsum.photos/id/111/200/200", coverImg: "https://picsum.photos/id/112/800/400", category: "Gifts", location: "Livingstone, Zambia", isVerified: false, isNew: true, hasOffer: false, rating: 4.8, dateAdded: '2024-09-10', isFeatured: true, keywords: ['copper', 'wood carving', 'baskets', 'masks', 'curios'] },
    { id: 12, name: "Tech Connect", description: "Laptops and gadgets for students.", profilePic: "https://picsum.photos/id/120/200/200", coverImg: "https://picsum.photos/id/3/800/400", category: "Student Support", location: "Lusaka, Zambia", isVerified: true, isNew: false, hasOffer: true, rating: 4.6, dateAdded: '2024-06-05', isFeatured: false, keywords: ['laptop', 'phone', 'charger', 'headphones', 'usb', 'power bank'] },
    { id: 13, name: "Sweet Treats Bakery", description: "Delicious pastries and custom cakes.", profilePic: "https://picsum.photos/id/130/200/200", coverImg: "https://picsum.photos/id/96/800/400", category: "Groceries", location: "Ndola, Zambia", isVerified: false, isNew: true, hasOffer: false, rating: 4.9, dateAdded: '2024-10-15', isFeatured: true, keywords: ['bread', 'scones', 'pies', 'donuts', 'cake'] },
    { id: 14, name: "AfroChic Boutique", description: "Modern African fashion and accessories.", profilePic: "https://picsum.photos/id/140/200/200", coverImg: "https://picsum.photos/id/141/800/400", category: "Gifts", location: "Lusaka, Zambia", isVerified: true, isNew: false, hasOffer: true, rating: 4.2, dateAdded: '2024-07-10', isFeatured: false, keywords: ['dress', 'shirt', 'chitenge', 'fabric', 'fashion'] },
];

// THE "ALGORITHM" (Manual Admin Assignment)
const assignShopTiers = (shops: Omit<Shop, 'tier'>[]): Shop[] => {
    return shops.map(shop => {
        // 1. KithLy Select (Gold) - Our Top Picks (High rating + Featured)
        if (shop.rating >= 4.8 && shop.isFeatured) {
            return { ...shop, tier: 'Select', minOrder: 150 };
        }
        // 2. Verified Partners (Blue) - Verified standard shops
        if (shop.isVerified && !shop.name.toLowerCase().includes('mama')) {
            return { ...shop, tier: 'Verified', minOrder: 50 };
        }
        // 3. Independent Sellers (Green) - Families/Small Businesses
        if (shop.name.toLowerCase().includes('mama') || shop.category === 'Gifts') {
            return { ...shop, tier: 'Independent', minOrder: 30 };
        }
        // Default to Sandbox
        return { ...shop, tier: 'Sandbox', minOrder: 0 };
    });
};

const AppContent: React.FC = () => {
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
  
  // NEW: Centralized Shop Data with Tiers
  const shops = useMemo(() => assignShopTiers(RAW_SHOPS), []);
  
  // NEW: Track which shop is being checked out
  const [checkoutShopId, setCheckoutShopId] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    switch(type) {
      case 'error': toast.error(message); break;
      case 'info': toast.info(message); break;
      default: toast.success(message);
    }
  };

  React.useEffect(() => {
    const q = query(collection(getFirestore(), "orders"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({ ...doc.data(), id: doc.id });
      });
      setOrders(orders);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const { currentUser, isShopOwner } = useAuth();
  const navigate = (newView: View, shopId?: number, query?: string) => {
    if (newView === 'shopPortal' && !isShopOwner) {
        setView('landing');
        return;
    }

    if (shopId !== undefined) {
      setSelectedShopId(shopId);
    }
    
    if (query !== undefined) {
        setLandingSearchQuery(query);
    } else if (newView !== 'customerPortal') {
        setLandingSearchQuery('');
    }

    if (newView === 'customerDashboard' || newView === 'customerPortal' || newView === 'shopView' || newView === 'checkout' || newView === 'orderSuccess') {
        setUserType('customer');
    } else if (newView === 'shopPortal') {
        setUserType('shop');
    } else if (newView === 'landing') {
        setUserType('guest');
    }

    setView(newView);
    window.scrollTo(0, 0);
  };

  const shopStats = useMemo(() => {
    const shopOrders = orders; 
    
    const pending = shopOrders
        .filter(o => o.status === 'paid')
        .reduce((sum, o) => sum + o.total, 0);

    const available = shopOrders
        .filter(o => o.status === 'collected')
        .reduce((sum, o) => sum + o.total, 0);

    return { pending, available, totalOrders: shopOrders.length };
  }, [orders]);

  const handleToggleLike = (productId: number) => {
    setLikedItems(prev => {
        const isLiked = prev.includes(productId);
        showToast(isLiked ? "Removed from favorites" : "Added to favorites", 'info');
        return isLiked ? prev.filter(id => id !== productId) : [...prev, productId];
    });
  };

  const handleAddToCart = (product: Product, shopData: { id: number; name: string; }, quantity: number = 1) => {
    setCart(prevCart => {
        const existingItem = prevCart.find(item => item.product.id === product.id);
        if (existingItem) {
            const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
            if (newQuantity === existingItem.quantity) {
                 showToast(`Cannot add more. Stock limit reached.`, 'error');
                 return prevCart;
            }
            showToast(`Cart updated: ${product.name}`, 'success');
            return prevCart.map(item =>
                item.product.id === product.id
                    ? { ...item, quantity: newQuantity }
                    : item
            );
        } else {
            if (product.stock > 0) {
                const newQuantity = Math.min(quantity, product.stock);
                if (newQuantity > 0) {
                    showToast(`Added to cart: ${product.name}`, 'success');
                    return [...prevCart, {
                        product: product,
                        quantity: newQuantity,
                        shopId: shopData.id,
                        shopName: shopData.name
                    }];
                }
            }
            showToast(`Out of stock`, 'error');
            return prevCart;
        }
    });
  };

  const handleUpdateCartQuantity = (productId: number, newQuantity: number) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        return prevCart.filter(item => item.product.id !== productId);
      }
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const quantity = Math.min(newQuantity, item.product.stock);
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    showToast("Item removed from cart", 'info');
  };

  const handleClearCartShop = (shopId: number) => {
    setCart(prevCart => prevCart.filter(item => item.shopId !== shopId));
    showToast("Shop items cleared", 'info');
  };

  const clearCart = () => {
    setCart([]);
  }

  const handleMarkAsCollected = async (orderId: string, method: 'scan' | 'manual' = 'scan') => {
    try {
        const success = await db.orders.verifyAndCollect(orderId, method);
        if (success) {
            setOrders(prev => prev.map(o => o.id === orderId ? { 
                ...o, 
                status: 'collected', 
                collectedOn: new Date().toISOString(),
                verificationMethod: method 
            } : o));
        } else {
             toast.error("Verification failed or order already collected");
        }
    } catch (error) {
        toast.error("Verification error");
    }
  };

  const handleCheckout = async (recipient: { name: string; email: string; phone: string }, message: string): Promise<string> => {
    // Determine which items to process
    let itemsToCheckout = cart;
    if (checkoutShopId) {
        itemsToCheckout = cart.filter(item => item.shopId === checkoutShopId);
    }

    if (itemsToCheckout.length === 0) {
        toast.error("No items to checkout for this shop.");
        return;
    }

    const groupedByShop = itemsToCheckout.reduce((acc: Record<number, CartItem[]>, item) => {
        const shopId = item.shopId;
        if (!acc[shopId]) {
            acc[shopId] = [];
        }
        acc[shopId].push(item);
        return acc;
    }, {} as Record<number, CartItem[]>);

    const shopItems = Object.values(groupedByShop)[0];
    const total = shopItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const itemCount = shopItems.reduce((sum, item) => sum + item.quantity, 0);
    
    const newOrder: Omit<Order, 'id' | 'collectionCode'> = {
        customerName: recipient.name,
        customerAvatar: 'https://picsum.photos/seed/customer/100/100',
        recipient: recipient,
        paidOn: null,
        collectedOn: null,
        total,
        itemCount,
        status: 'pending',
        shopName: shopItems[0].shopName,
        ...(message && { message }),
        items: shopItems.map(item => ({
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            image: item.product.image,
        })),
    };

    const createdOrder = await db.orders.create(newOrder);
    return createdOrder.id;
  };
  
  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const renderView = () => {
    const commonProps = {
        cartItemCount,
        onCartClick: () => setIsCartOpen(true),
        showToast,
        targetCity,
        setTargetCity
    };

    switch (view) {
      case 'customerPortal':
        return <CustomerPortal setView={navigate} initialSearchQuery={landingSearchQuery} shops={shops} {...commonProps} />;
      case 'shopPortal':
        return <ShopPortal 
            setView={navigate} 
            orders={orders} 
            onMarkAsCollected={handleMarkAsCollected} 
            showToast={showToast} 
            walletStats={shopStats}
        />;
      case 'customerDashboard':
        return <CustomerDashboard setView={navigate} {...commonProps} orders={orders} checkoutSuccess={checkoutSuccess} onDismissSuccess={() => setCheckoutSuccess(false)} showToast={showToast} />;
       case 'shopView':
        return <ShopView setView={navigate} shopId={selectedShopId} onAddToCart={handleAddToCart} likedItems={likedItems} onToggleLike={handleToggleLike} showToast={showToast} {...commonProps} />;
      case 'checkout':
        // Filter cart for CheckoutPage based on checkoutShopId
        const checkoutCart = checkoutShopId
            ? cart.filter(item => item.shopId === checkoutShopId)
            : cart;
        return <CheckoutPage setView={navigate} cart={checkoutCart} onCheckout={handleCheckout} showToast={showToast} clearCart={clearCart} />;
      case 'orderSuccess':
        return <OrderSuccessPage setView={navigate} newOrders={lastCompletedOrders} />;
      case 'registerCustomer': return <RegisterCustomer setView={navigate} />;
      case 'registerShop': return <RegisterShop setView={navigate} />;
      case 'about': return <AboutUs setView={navigate} />;
      case 'careers': return <Careers setView={navigate} />;
      case 'press': return <Press setView={navigate} />;
      case 'terms': return <TermsOfService setView={navigate} />;
      case 'privacy': return <PrivacyPolicy setView={navigate} />;
      case 'cookies': return <CookiePolicy setView={navigate} />;
      case 'landing':
      default:
        return <LandingPage setView={navigate} targetCity={targetCity} setTargetCity={setTargetCity} />;
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
        onCheckoutShop={(shopId) => {
            setCheckoutShopId(shopId);
            setIsCartOpen(false);
            navigate('checkout');
        }}
        onClearShop={handleClearCartShop}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
