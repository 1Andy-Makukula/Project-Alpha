import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function ShopSettingsForm() {
  const { token } = useAuth();
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!token) {
      setMessage({ type: 'error', text: 'Authentication error. Please log in again.' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/shops/update-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bankName, accountNumber })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setMessage({ type: 'success', text: 'Payout settings saved! Your shop is ready for payouts.' });

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Payout Bank Details</h3>
      <p className="text-sm text-gray-600 mb-4">
        This account receives the net order value after fulfillment. You must enter this
        information for payouts to be successful.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
            Bank Name (e.g., ZANACO, FNB Zambia)
          </label>
          <input
            id="bankName"
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </div>
        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
            Account Number
          </label>
          <input
            id="accountNumber"
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : 'Save Payout Settings'}
        </button>
        {message.text && (
          <p className={`mt-4 text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}
