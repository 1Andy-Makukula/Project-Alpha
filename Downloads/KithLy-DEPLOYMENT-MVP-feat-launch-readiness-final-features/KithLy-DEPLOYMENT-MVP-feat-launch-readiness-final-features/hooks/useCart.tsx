// hooks/useCart.tsx
import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

// Define the structure of an item in the cart
export type CartItem = {
  productId: string;
  shopId: string;
  name: string;
  price_in_cents: number;
  quantity: number;
};

// Define the shape of the CartContext
interface CartContextType {
  items: CartItem[];
  totalPrice: number; // Total price in cents
  addItem: (product: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  canCheckout: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// --- Provider Component ---
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Calculate total price and check if checkout is possible
  const { totalPrice, canCheckout } = useMemo(() => {
    const total = items.reduce((sum, item) => sum + (item.price_in_cents * item.quantity), 0);
    // Can only checkout if the cart is not empty AND all items are from the same shop (MVP Rule)
    const allSameShop = items.length > 0 && new Set(items.map(item => item.shopId)).size === 1;

    return {
      totalPrice: total,
      canCheckout: allSameShop,
    };
  }, [items]);

  const addItem = (product: CartItem) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(item => item.productId === product.productId);

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const newItems = [...currentItems];
        newItems[existingItemIndex].quantity += product.quantity;
        return newItems;
      } else {
        // Add new item
        return [...currentItems, product];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{
      items,
      totalPrice,
      addItem,
      removeItem,
      clearCart,
      canCheckout
    }}>
      {children}
    </CartContext.Provider>
  );
};

// --- Custom Hook ---
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
