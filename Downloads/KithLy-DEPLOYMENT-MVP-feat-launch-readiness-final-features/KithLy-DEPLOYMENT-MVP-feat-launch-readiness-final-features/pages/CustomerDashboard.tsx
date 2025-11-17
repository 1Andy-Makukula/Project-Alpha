// pages/CustomerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ReceiptModal } from '@/components/ReceiptModal';
import { OrderStatusBadge } from '@/components/OrderStatusBadge'; // Assumes you have this

type BuyerOrder = {
  id: string;
  status: 'paid' | 'completed' | 'pending' | 'cancelled';
  total_price_in_cents: number;
  pickup_code: string;
  created_at: string;
  shop_name: string;
  shop_image_url: string;
};

export function CustomerDashboard() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders/list-buyer', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch order history');
        const data = await response.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  if (loading) return <div>Loading your dashboard...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const activeOrders = orders.filter(o => o.status === 'paid');
  const pastOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  return (
    <div className="container mx-auto p-4">
      {viewingOrderId && <ReceiptModal orderId={viewingOrderId} onClose={() => setViewingOrderId(null)} />}

      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.first_name}!</h1>

      {/* Active Orders Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Active Orders (Ready for Pickup)</h2>
        {activeOrders.length === 0 ? (
          <p className="text-gray-600">You have no orders ready for pickup.</p>
        ) : (
          <div className="space-y-4">
            {activeOrders.map(order => (
              <div key={order.id} className="p-4 bg-white rounded-lg shadow-md border-l-4 border-blue-500">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{order.shop_name}</h3>
                    <p className="text-sm text-gray-500">Order ID: {order.id.substring(0, 8)}...</p>
                    <p className="text-lg font-bold mt-2">ZMW {(order.total_price_in_cents / 100).toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-700">Your Secure Pickup Code:</p>
                    <p className="text-3xl font-bold tracking-widest text-blue-600">{order.pickup_code}</p>
                    <button
                      onClick={() => setViewingOrderId(order.id)}
                      className="text-sm text-blue-500 hover:underline mt-1"
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Orders Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Order History</h2>
        {pastOrders.length === 0 ? (
          <p className="text-gray-600">You have no past orders.</p>
        ) : (
          <div className="space-y-4">
            {pastOrders.map(order => (
              <div key={order.id} className="p-4 bg-white rounded-lg shadow-sm border">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{order.shop_name}</h3>
                    <p className="text-sm text-gray-500">Order ID: {order.id.substring(0, 8)}...</p>
                    <p className="text-sm text-gray-500">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <OrderStatusBadge status={order.status} />
                    <p className="text-lg font-bold mt-1">ZMW {(order.total_price_in_cents / 100).toFixed(2)}</p>
                    <button
                      onClick={() => setViewingOrderId(order.id)}
                      className="text-sm text-blue-500 hover:underline mt-1"
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
