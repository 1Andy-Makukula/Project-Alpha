import React from 'react';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart } from 'lucide-react';
// We use the currency hook, which is now part of the App
import { useCurrency } from '@/hooks/useCurrency'; 

// Define a common Product type
type Product = {
  id: string;
  name: string;
  description: string;
  price_in_cents: number;
  image_url: string;
  shop_id: string;
  stock_quantity: number;
};

// This is the FIX: 'export function' (a named export)
// instead of 'export default function'
export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  // Use the real currency hook
  const { convertCentsToUSD, isLoading } = useCurrency();
  const usdPrice = convertCentsToUSD(product.price_in_cents);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      priceInCents: product.price_in_cents,
      imageUrl: product.image_url,
      quantity: 1,
      shopId: product.shop_id,
    });
  };

  return (
    <div className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex-shrink-0">
        <img 
          className="h-48 w-full object-cover" 
          src={product.image_url || 'https://placehold.co/400x300/f0f0f0/AAAAAA?text=No+Image'} 
          alt={product.name} 
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500 truncate" title={product.description}>
          {product.description}
        </p>
        
        <div className="mt-4 flex flex-col">
          <p className="text-xl font-bold text-gray-900">
            ZMW {(product.price_in_cents / 100).toFixed(2)}
          </p>
          <p className="text-sm font-medium text-green-600">
            {isLoading ? 'Loading...' : `~ ${usdPrice}`}
          </p>
        </div>

        <button
          onClick={handleAddToCart}
          className="mt-4 flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}