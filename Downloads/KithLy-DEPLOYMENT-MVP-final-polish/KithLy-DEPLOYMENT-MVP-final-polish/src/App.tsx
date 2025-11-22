





import React, { useState, useMemo } from 'react';
import LandingPage from './pages/LandingPage';
import CustomerPortal from './pages/CustomerPortal';
import ShopPortal from './pages/ShopPortal';
import CustomerDashboard from './pages/CustomerDashboard';
import ShopView from './pages/ShopView';
import CartSidebar from './components/CartSidebar';
import CheckoutPage from './pages/CheckoutPage';
import { Order } from './components/OrderCard';

export type View = 'landing' | 'customerPortal' | 'shopPortal' | 'customerDashboard' | 'shopView' | 'checkout';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  shopId: number;
  shopName: string;
}

const mockInitialOrders: Order[] = [
    { 
        id: '#KLY-8ADG4', customerName: 'Adanna E.', customerAvatar: 'https://picsum.photos/id/1011/100/100', 
        paidOn: '2024-07-28T10:30:00Z', collectedOn: null, total: 40.50, itemCount: 2, status: 'paid',
        collectionCode: 'KLY8ADG4',
        message: 'Happy birthday Mum! Hope you have a wonderful day. Love from London!',
        items: [
            { id: 102, name: "Imported Rice (5kg)", quantity: 1, price: 15.50, image: "https://picsum.photos/id/292/400/400" },
            { id: 101, name: "Fresh Produce Box", quantity: 1, price: 25.00, image: "https://picsum.photos/id/1080/400/400" },
        ] 
    },
    { 
        id: '#KLY-9BHF5', customerName: 'Michael O.', customerAvatar: 'https://picsum.photos/id/1005/100/100', 
        paidOn: '2024-07-27T14:00:00Z', collectedOn: '2024-07-27T18:15:00Z', total: 10.20, itemCount: 2, status: 'collected',
        collectionCode: 'KLY9BHF5',
        items: [
            { id: 105, name: "Organic Milk (1L)", quantity: 1, price: 4.20, image: "https://picsum.photos/id/493/400/400" },
            { id: 106, name: "Free-Range Eggs (12)", quantity: 1, price: 6.00, image: "https://picsum.photos/id/451/400/400" },
        ] 
    },
];

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(mockInitialOrders);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const navigate = (newView: View, shopId?: number) => {
    if (shopId !== undefined) {
      setSelectedShopId(shopId);
    }
    setView(newView);
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (product: Product, shopData: { id: number; name: string; }) => {
    setCart(prevCart => {
        const existingItem = prevCart.find(item => item.product.id === product.id);
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                return prevCart.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return prevCart; // Stock limit reached
            }
        } else {
            if (product.stock > 0) {
                return [...prevCart, {
                    product: product,
                    quantity: 1,
                    shopId: shopData.id,
                    shopName: shopData.name
                }];
            } else {
                 return prevCart; // Cannot add out of stock item
            }
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
  };

  const handleMarkAsCollected = (orderId: string) => {
    setOrders(prevOrders => 
        prevOrders.map(order => 
            order.id === orderId 
                ? { ...order, status: 'collected', collectedOn: new Date().toISOString() } 
                : order
        )
    );
  };

  const handleCheckout = (recipient: { name: string; email: string; phone: string }, message: string) => {
    // FIX: Explicitly typing the accumulator (`acc`) in the `reduce` function to ensure TypeScript correctly infers the type of `groupedByShop`. This resolves downstream type inference errors.
    const groupedByShop = cart.reduce((acc: Record<number, CartItem[]>, item) => {
        const shopId = item.shopId;
        if (!acc[shopId]) {
            acc[shopId] = [];
        }
        acc[shopId].push(item);
        return acc;
    }, {} as Record<number, CartItem[]>);

    // FIX: Add explicit type `CartItem[]` for `shopItems`. `Object.values` can sometimes result in an `unknown[]` type, causing subsequent method calls like `reduce` and `map` to fail.
    const newOrders = Object.values(groupedByShop).map((shopItems: CartItem[]) => {
        const total = shopItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const itemCount = shopItems.reduce((sum, item) => sum + item.quantity, 0);
        const randomIdPart = Math.random().toString(36).substring(2, 7).toUpperCase();
        
        const newOrder: Order = {
            id: `#KLY-${randomIdPart}`,
            customerName: recipient.name,
            customerAvatar: 'https://picsum.photos/seed/customer/100/100', // Placeholder
            paidOn: new Date().toISOString(),
            collectedOn: null,
            total,
            itemCount,
            status: 'paid',
            collectionCode: `KLY${randomIdPart}`,
            ...(message && { message }),
            items: shopItems.map(item => ({
                id: item.product.id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
                image: item.product.image,
            })),
        };
        return newOrder;
    });

    setOrders(prev => [...newOrders, ...prev]);
    setCart([]);
    setCheckoutSuccess(true);
    navigate('customerDashboard');
  };
  
  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const renderView = () => {
    const commonProps = {
        cartItemCount,
        onCartClick: () => setIsCartOpen(true),
    };

    switch (view) {
      case 'customerPortal':
        return <CustomerPortal setView={navigate} {...commonProps} />;
      case 'shopPortal':
        return <ShopPortal setView={navigate} orders={orders} onMarkAsCollected={handleMarkAsCollected} />;
      case 'customerDashboard':
        return <CustomerDashboard setView={navigate} {...commonProps} orders={orders} checkoutSuccess={checkoutSuccess} onDismissSuccess={() => setCheckoutSuccess(false)} />;
       case 'shopView':
        return <ShopView setView={navigate} shopId={selectedShopId} onAddToCart={handleAddToCart} {...commonProps} />;
      case 'checkout':
        return <CheckoutPage setView={navigate} cart={cart} onCheckout={handleCheckout} />;
      case 'landing':
      default:
        return <LandingPage setView={navigate} />;
    }
  };

  return (
    <div className="bg-kithly-background text-kithly-dark">
      {renderView()}
      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => {
            setIsCartOpen(false);
            navigate('checkout');
        }}
      />
    </div>
  );
};

export default App;