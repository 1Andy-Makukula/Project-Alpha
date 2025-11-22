
import React, { useMemo } from 'react';
import { CartItem } from '../App';
import Button from './Button';
import { TrashIcon, XIcon, MapPinIcon, CartIcon } from './icons/NavigationIcons';

// Fallback icon if Store is not available in NavigationIcons yet
const StoreIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({className, ...props}) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.617A3.001 3.001 0 009 9.35M18 9.35a3.001 3.001 0 00-3.75.617 3.001 3.001 0 00-3 3.75 3.001 3.001 0 00-3-3.75z" />
  </svg>
);

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckoutShop: (shopId: number) => void;
  onClearShop: (shopId: number) => void;
}

interface ShopGroup {
    shopName: string;
    items: CartItem[];
    total: number;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onCheckoutShop, onClearShop }) => {
  
  // Group cart items by Shop ID
  const groupedCart = useMemo(() => {
    return cart.reduce((acc, item) => {
      const shopId = item.shopId;
      if (!acc[shopId]) {
        acc[shopId] = { shopName: item.shopName, items: [], total: 0 };
      }
      acc[shopId].items.push(item);
      acc[shopId].total += item.product.price * item.quantity;
      return acc;
    }, {} as Record<number, ShopGroup>);
  }, [cart]);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

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
            <h2 className="text-xl font-bold gradient-text flex items-center gap-2">
                <CartIcon className="w-6 h-6 text-kithly-primary" />
                Your Cart ({totalCartItems})
            </h2>
            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-grow overflow-y-auto p-4 space-y-6 bg-gray-50/50">
            {Object.entries(groupedCart).length > 0 ? (
              Object.entries(groupedCart).map(([shopIdStr, group]) => {
                  const shopId = Number(shopIdStr);
                  const { shopName, items, total } = group; // Destructure here to ensure type safety
                  
                  return (
                    <div key={shopId} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      {/* Shop Header */}
                      <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                         <div className="flex items-center gap-2">
                            <StoreIcon className="w-5 h-5 text-kithly-accent" />
                            <div>
                                <h3 className="font-bold text-kithly-dark text-sm">{shopName}</h3>
                                <p className="text-xs text-gray-500 flex items-center mt-0.5"><MapPinIcon className="w-3 h-3 mr-1"/> Pickup Only</p>
                            </div>
                         </div>
                         <button onClick={() => onClearShop(shopId)} className="text-xs text-red-500 hover:underline">Clear Shop</button>
                      </div>

                      {/* Items */}
                      <div className="p-4 space-y-4">
                        {items.map(item => (
                          <div key={item.product.id} className="flex items-center space-x-3">
                            <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover border border-gray-100" />
                            <div className="flex-grow min-w-0">
                              <p className="font-semibold text-sm text-kithly-dark truncate">{item.product.name}</p>
                              <p className="text-xs text-gray-500">ZMK {item.product.price.toFixed(2)}</p>
                              
                              <div className="flex items-center space-x-2 mt-2">
                                <button onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-bold transition">-</button>
                                <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                                <button onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-bold transition">+</button>
                              </div>
                            </div>
                            <div className="text-right pl-2">
                                <p className="font-bold text-sm mb-2">ZMK {(item.product.price * item.quantity).toFixed(2)}</p>
                                <button onClick={() => onRemoveItem(item.product.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Shop Footer */}
                      <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-3">
                             <span className="text-sm font-medium text-gray-600">Shop Subtotal</span>
                             <span className="text-lg font-bold text-kithly-dark">ZMK {total.toFixed(2)}</span>
                          </div>
                          <Button 
                            variant="primary" 
                            className="w-full !py-2.5 !text-sm shadow-sm" 
                            onClick={() => onCheckoutShop(shopId)}
                          >
                            Checkout {shopName}
                          </Button>
                      </div>
                    </div>
                  );
              })
            ) : (
               <div className="flex-grow flex flex-col items-center justify-center text-center p-6 h-full">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                       <CartIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-gray-700">Your cart is empty</h3>
                  <p className="mt-2 text-sm text-gray-500">Looks like you haven't added anything yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
