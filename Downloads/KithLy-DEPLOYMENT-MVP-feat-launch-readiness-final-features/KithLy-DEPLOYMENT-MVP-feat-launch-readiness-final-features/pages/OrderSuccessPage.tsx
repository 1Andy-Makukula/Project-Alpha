// pages/OrderSuccessPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // Assuming react-router
// import { CheckCircleIcon } from '@heroicons/react/24/solid'; // Example icon

export function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const tx_ref = searchParams.get('tx_ref'); // Get transaction reference from Flutterwave redirect
  const order_id = searchParams.get('order_id'); // If you passed it back via redirect URL
  const [status, setStatus] = useState<'verifying' | 'success' | 'failure'>('verifying');
  const [pickupCode, setPickupCode] = useState<string | null>(null);

  useEffect(() => {
    if (!tx_ref) {
      setStatus('failure');
      return;
    }

    // --- CRITICAL: Verify the transaction on your backend ---
    const verifyPayment = async () => {
      try {
        // NOTE: This call is redundant if the Flutterwave Webhook worked instantly.
        // But it's good practice to show the user verification status.
        // We will skip actual Flutterwave VERIFY call here, as the webhook is the primary method.

        // Instead, we will fetch the order status/code from our own DB
        const response = await fetch(`/api/orders/status?orderId=${order_id}`);
        const data = await response.json();

        if (response.ok && data.status === 'paid' || data.status === 'ready_for_pickup') {
          setStatus('success');
          setPickupCode(data.pickup_code);
        } else {
          setStatus('failure');
        }

      } catch (e) {
        setStatus('failure');
      }
    };
    verifyPayment();
  }, [tx_ref, order_id]);

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-lg">Verifying payment... Do not close this window.</p>
      </div>
    );
  }

  if (status === 'failure') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-700">
        {/* <XCircleIcon className="w-16 h-16" /> */}
        <h1 className="mt-4 text-3xl font-bold">Payment Failed or Verification Error</h1>
        <p className="mt-2 text-lg">Please check your email/phone for updates or contact support.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-green-700 bg-gray-50">
      {/* <CheckCircleIcon className="w-16 h-16 text-green-600" /> */}
      <h1 className="mt-4 text-4xl font-extrabold">KithLy Order Confirmed!</h1>
      <p className="mt-4 text-xl text-gray-700">Your thoughtfulness is on its way home.</p>

      <div className="p-8 mt-8 text-center bg-white border-4 border-green-500 border-dashed rounded-xl shadow-xl">
        <p className="text-xl font-semibold text-gray-800">Your Secure Pickup Code:</p>
        <div className="mt-2">
          <span className="text-6xl font-black tracking-widest text-green-600">{pickupCode}</span>
        </div>
        <p className="mt-4 text-sm text-gray-600">Share this code ONLY with the recipient.</p>
      </div>

      <p className="mt-8 text-base text-gray-600">The shop has been notified via SMS and email.</p>
      <button onClick={() => navigate('/')} className="mt-6 p-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
        Back to Home
      </button>
    </div>
  );
}
