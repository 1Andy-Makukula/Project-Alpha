import React, { useMemo } from 'react';
import { CartItem } from '../App';
import Button from './Button';
import { TrashIcon, XIcon } from './icons/NavigationIcons';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const groupedCart = useMemo(() => {
    // FIX: Explicitly typing the accumulator (`acc`) in the `reduce` function to ensure TypeScript correctly infers the type of `groupedCart`. This resolves downstream type inference errors.
    return cart.reduce((acc: Record<string, CartItem[]>, item) => {
      const shopName = item.shopName;
      if (!acc[shopName]) {
        acc[shopName] = [];
      }
      acc[shopName].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold gradient-text">Your Cart</h2>
            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Content */}
          {cart.length > 0 ? (
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {/* FIX: Explicitly type the destructured `items` as `CartItem[]`. `Object.entries` may not correctly infer the value type, leading to `unknown` and causing errors on `.map`. */}
              {Object.entries(groupedCart).map(([shopName, items]: [string, CartItem[]]) => (
                <div key={shopName}>
                  <h3 className="font-semibold text-kithly-dark mb-3">{shopName}</h3>
                  <div className="space-y-4">
                    {items.map(item => (
                      <div key={item.product.id} className="flex items-center space-x-4">
                        <img src={item.product.image} alt={item.product.name} className="w-20 h-20 rounded-lg object-cover" />
                        <div className="flex-grow">
                          <p className="font-semibold text-sm text-kithly-dark">{item.product.name}</p>
                          <p className="text-sm text-gray-500">${item.product.price.toFixed(2)}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <button onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 rounded border border-gray-300 text-gray-600 hover:bg-gray-100">-</button>
                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 rounded border border-gray-300 text-gray-600 hover:bg-gray-100">+</button>
                          </div>
                        </div>
                        <button onClick={() => onRemoveItem(item.product.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                <svg className="w-24 h-24 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <h3 className="mt-4 text-xl font-semibold text-gray-700">Your cart is empty</h3>
                <p className="mt-2 text-sm text-gray-500">Looks like you haven't added anything to your cart yet.</p>
            </div>
          )}

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-kithly-dark">Subtotal</span>
                <span className="text-2xl font-bold text-kithly-dark">${subtotal.toFixed(2)}</span>
              </div>
              <Button variant="primary" className="w-full" onClick={onCheckout}>Proceed to Checkout</Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;