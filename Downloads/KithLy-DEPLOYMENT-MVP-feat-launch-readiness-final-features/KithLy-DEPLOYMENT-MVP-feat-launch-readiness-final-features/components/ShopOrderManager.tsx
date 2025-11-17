// components/ShopOrderManager.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ReceiptModal } from '@/components/ReceiptModal';

// Define the shape of the order
type ShopOrder = {
  id: string;
  status: 'paid' | 'completed' | 'pending' | 'cancelled';
  total_price_in_cents: number;
  pickup_code: string;
  is_paid_out: boolean;
  created_at: string;
};

export function ShopOrderManager() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for the fulfillment form
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [fulfillMessage, setFulfillMessage] = useState({ type: '', text: '' });

  // State for receipt
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/list-shop', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleFulfillOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFulfillMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/orders/fulfill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pickup_code: pickupCodeInput })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fulfillment failed');
      }

      setFulfillMessage({ type: 'success', text: `Success! Order ${data.order_id} fulfilled. Payout initiated.` });
      setPickupCodeInput('');
      fetchOrders(); // Refresh the order list

    } catch (err: any) {
      setFulfillMessage({ type: 'error', text: err.message });
    }
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const paidOrders = orders.filter(o => o.status === 'paid');
  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {viewingOrderId && <ReceiptModal orderId={viewingOrderId} onClose={() => setViewingOrderId(null)} />}

      {/* Fulfillment Section */}
      <div className="md:col-span-1 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Fulfill Order</h3>
        <form onSubmit={handleFulfillOrder} className="space-y-3">
          <label htmlFor="pickupCode" className="block text-sm font-medium text-gray-700">
            Enter 6-Digit Pickup Code
          </label>
          <input
            id="pickupCode"
            type="text"
            value={pickupCodeInput}
            onChange={(e) => setPickupCodeInput(e.target.value)}
            maxLength={6}
            className="w-full p-2 border rounded text-2xl font-bold tracking-widest text-center"
            placeholder="000000"
          />
          <button type="submit" className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700">
            Verify & Fulfill
          </button>
          {fulfillMessage.text && (
            <p className={fulfillMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}>
              {fulfillMessage.text}
            </p>
          )}
        </form>
      </div>

      {/* Orders Awaiting Pickup Section */}
      <div className="md:col-span-2 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Awaiting Pickup ({paidOrders.length})</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {paidOrders.length === 0 && <p className="text-gray-500">No orders are waiting for pickup.</p>}
          {paidOrders.map(order => (
            <div key={order.id} className="p-3 border rounded-md flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold">Order ID: {order.id.substring(0, 8)}...</p>
                <p className="text-sm text-gray-600">Total: ZMW {(order.total_price_in_cents / 100).toFixed(2)}</p>
              </div>
              <span className="font-bold text-lg text-blue-600">{order.pickup_code}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payout / Completed Orders Section */}
      <div className="md:col-span-3 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Payout History (Completed Orders)</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {completedOrders.length === 0 && <p className="text-gray-500">No completed orders yet.</p>}
          {completedOrders.map(order => (
            <div key={order.id} className="p-3 border rounded-md flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold">Order ID: {order.id.substring(0, 8)}...</p>
                <p className="text-sm text-gray-600">Paid Out: ZMW {((order.total_price_in_cents - (order.kithly_fee_in_cents || 0)) / 100).toFixed(2)}</p>
              </div>
              <button
                onClick={() => setViewingOrderId(order.id)}
                className="p-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
              >
                View Receipt
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
