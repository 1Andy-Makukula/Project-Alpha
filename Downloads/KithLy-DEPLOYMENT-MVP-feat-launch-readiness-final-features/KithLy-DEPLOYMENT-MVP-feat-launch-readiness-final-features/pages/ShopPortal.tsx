import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { NewProductForm } from '@/components/NewProductForm';
import { ShopOrderManager } from '@/components/ShopOrderManager';
import { ShopSettingsForm } from '@/components/ShopSettingsForm'; // Import new component

export function ShopPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings'>('orders');

  // NOTE: Replace this placeholder with the actual shop ID fetched from your database
  // (e.g., via a new API endpoint: /api/shops/me)
  const PLACEHOLDER_SHOP_ID = "0000-SHOP-ID-0000";

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Shop Portal</h1>
      <p className="mb-6 text-lg">Welcome, {user?.first_name}! Manage your high-value Diaspora sales here.</p>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-600'}`}
        >
          Order Management
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`py-2 px-4 ${activeTab === 'products' ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-600'}`}
        >
          Product Management
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2 px-4 ${activeTab === 'settings' ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-600'}`}
        >
          Payout Settings
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'orders' && (
          <ShopOrderManager />
        )}
        {activeTab === 'products' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>
            <NewProductForm shopId={PLACEHOLDER_SHOP_ID} />
            {/* TODO: Add a component to list/edit existing products */}
          </div>
        )}
        {activeTab === 'settings' && (
          // Render the new settings form
          <ShopSettingsForm />
        )}
      </div>
    </div>
  );
}
