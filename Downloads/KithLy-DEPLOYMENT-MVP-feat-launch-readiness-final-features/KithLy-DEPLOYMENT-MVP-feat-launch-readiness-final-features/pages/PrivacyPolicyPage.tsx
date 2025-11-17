import React from 'react';

export function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">KithLy Privacy Policy</h1>
      <p className="text-gray-500 italic mb-6">
          [PLACEHOLDER: You must replace this with your official Privacy Policy before launching.]
      </p>
      <div className="space-y-4 prose">

        <h2 className="text-xl font-semibold">1. Data We Collect</h2>
        <p>
          We collect information you provide to us, such as your name, email, and
          phone number. For shop owners, we also collect **bank account details** for payouts.
          We collect data from Google Sign-In if you choose to use it.
        </p>

        <h2 className="text-xl font-semibold">2. Data Usage and Transparency</h2>
        <p>
          Your data is used to:
          <ul>
            <li>Process transactions and manage your account.</li>
            <li>Send order notifications (SMS via Twilio) and password resets (Email via Resend).</li>
            <li>Process shop owner payouts (via Flutterwave).</li>
            <li>Improve our service and combat fraud.</li>
          </ul>
        </p>

        <h2 className="text-xl font-semibold">3. Data Sharing with Partners</h2>
        <p>
          We do not sell your personal data. We only share it with our
          critical service partners for the purpose of providing the KithLy service:
          Flutterwave, Twilio, and Resend. Your bank details are transmitted securely
          to Flutterwave for payout processing.
        </p>
      </div>
    </div>
  );
}
