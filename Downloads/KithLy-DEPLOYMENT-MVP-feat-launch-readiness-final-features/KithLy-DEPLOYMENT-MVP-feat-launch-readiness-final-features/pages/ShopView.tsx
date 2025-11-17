// pages/ShopView.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Assuming you use react-router
import { ProductCard } from '@/components/ProductCard'; // Your component
// Define a Product type
type Product = {
  id: string;
  name: string;
  price_in_cents: number;
  image_url: string;
  description: string;
};

export function ShopView() {
  const { shopId } = useParams(); // Get shopId from URL: /shop/123-abc
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shopId) return;

    const fetchProducts = async () => {
      try {
        // Use the new query param API endpoint
        const response = await fetch(`/api/shops/products?shopId=${shopId}`);
        if (!response.ok) throw new Error('Failed to fetch products');

        const data = await response.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [shopId]);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-3xl font-bold">Shop Name</h1> {/* Fetch shop details too */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            // You'll need to adapt ProductCard to accept this data
            // and handle adding to cart
          />
        ))}
      </div>
    </div>
  );
}
