import React from 'react';
import { Link } from 'react-router-dom';

export function TermsOfServicePage() {
  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">KithLy Terms of Service</h1>
      <p className="text-gray-500 italic mb-6">
          [PLACEHOLDER: You must replace this with your official Terms of Service before launching.]
      </p>
      <div className="space-y-4 prose">

        <h2 className="text-xl font-semibold">1. Introduction and Scope</h2>
        <p>
          Welcome to KithLy. By using our service, you agree to these terms. Our platform
          connects Diaspora buyers with local Zambian shops for the purpose of
          gifting and personal purchases.
        </p>

        <h2 className="text-xl font-semibold">2. Account and Security</h2>
        <p>
          You must be 18 years or older to create an account. You are responsible
          for all activity on your account and for keeping your password secure. This includes
          activity initiated via email/password login or Google authentication.
        </p>

        <h2 className="text-xl font-semibold">3. Transactions and Payouts (FinTech Core)</h2>
        <p>
          KithLy acts as a marketplace and payment facilitator. Funds for "paid" orders
          are held in escrow until the order is verified as "completed" by the shop owner
          via the **Secure Pickup Code**.
        </p>
        <p>
          Shop owners agree that payouts will be initiated by KithLy via our payment
          partner (Flutterwave) to the bank account on file. Payouts are net of any
          applicable commission fees, which are currently **0% for the first three (3) months**
          as per the current promotional rate.
        </p>

        <h2 className="text-xl font-semibold">4. Fulfillment and Pickup</h2>
        <p>
          Shop owners are responsible for maintaining accurate stock and fulfilling
          orders in a timely manner. Buyers and recipients agree to the **"Secure Pickup"**
          model, where orders must be collected in person using the provided code
          or digital confirmation.
        </p>
      </div>
    </div>
  );
}
