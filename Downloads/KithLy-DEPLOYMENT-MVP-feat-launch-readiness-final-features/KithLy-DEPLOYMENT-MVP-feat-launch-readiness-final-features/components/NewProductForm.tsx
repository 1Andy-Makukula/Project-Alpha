// components/NewProductForm.tsx
import React, { useState } from 'react';
// Assume you have useAuth() hook that provides the user's token and shop_id
// import { useAuth } from '@/hooks/useAuth';

export function NewProductForm({ shopId }: { shopId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const { token } = useAuth(); // Get auth token

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name || !price || !shopId) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. Upload the image to Vercel Blob
      const uploadResponse = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) throw new Error('File upload failed');
      const blob = await uploadResponse.json();
      const image_url = blob.url; // The URL from Vercel Blob

      // 2. Create the product in your database
      const productData = {
        shop_id: shopId,
        name: name,
        price_in_cents: parseInt(price) * 100,
        stock_quantity: 0, // Default
        description: '', // Add a field for this
        image_url: image_url,
      };

      const createResponse = await fetch('/api/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // Send the auth token
        },
        body: JSON.stringify(productData),
      });

      if (!createResponse.ok) throw new Error('Failed to create product');

      const newProduct = await createResponse.json();
      alert(`Product created! ${newProduct.name}`);
      // Reset form
      setName('');
      setPrice('');
      setFile(null);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label>Product Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border" />
      </div>
      <div>
        <label>Price (in ZMW)</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-2 border" />
      </div>
      <div>
        <label>Product Image</label>
        <input type="file" onChange={handleFileChange} className="w-full" />
      </div>
      <button type="submit" disabled={loading} className="p-2 text-white bg-blue-500 rounded">
        {loading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
}
