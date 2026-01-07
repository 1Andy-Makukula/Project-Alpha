# Payment Simulation Guide

## Overview
KithLy now supports **Payment Simulation Mode** for testing the complete checkout flow without requiring actual payment gateway integration. This is perfect for internal testing, demos, and development.

## Features

### 🔧 Simulation Mode
- **Bypass Flutterwave**: No real payment gateway calls are made
- **Instant Order Completion**: Orders are processed immediately without payment delays
- **Visual Indicators**: Clear UI indicators show when simulation mode is active
- **Full Checkout Flow**: Test all checkout features including:
  - Delivery/Collection options
  - Restaurant pickup time selection
  - Made-to-order (Baker's Protocol) flow
  - Distance calculation and zone-based pricing
  - All fee calculations

### 📍 Live Mode
- **Real Payments**: Connects to actual Flutterwave payment gateway
- **Production Ready**: Use when testing with real payment credentials
- **Secure**: All payments processed through Flutterwave's secure infrastructure

## Configuration

### Setting the Payment Mode

Payment mode is controlled via the `VITE_PAYMENT_MODE` environment variable in `.env.local`:

```bash
# For testing/simulation
VITE_PAYMENT_MODE=simulation

# For live payments
VITE_PAYMENT_MODE=live
```

### Quick Setup

1. **Open `.env.local`** in the project root
2. **Add or modify** the `VITE_PAYMENT_MODE` variable:
   ```bash
   VITE_PAYMENT_MODE=simulation
   ```
3. **Restart the dev server** for changes to take effect:
   ```bash
   npm run dev
   ```

## Visual Indicators

### When Simulation Mode is Active:

1. **Banner at Checkout**
   - Purple gradient banner appears at the top of the checkout page
   - Contains the message: "🔧 SIMULATION MODE ACTIVE"
   - Explains that no real transactions will occur

2. **Modified Pay Button**
   - Shows "🔧 Pay ZMK XXX (Simulated)"
   - Clear indication that payment is simulated

3. **Toast Notifications**
   - "🔧 SIMULATION MODE: Processing payment..."
   - "✅ SIMULATION: Payment successful!"

## Usage

### Testing the Checkout Flow

1. **Start in Simulation Mode** (recommended for testing)
   ```bash
   # In .env.local
   VITE_PAYMENT_MODE=simulation
   ```

2. **Add items to cart** and proceed to checkout

3. **Fill out checkout form**:
   - Recipient information
   - Phone number (must be valid Zambian format: +260XXXXXXXXX)
   - Delivery/collection preference
   - Pickup time (for restaurants)

4. **Click Pay Button**
   - Payment is simulated (1.5 second delay)
   - Order is automatically completed
   - Redirected to Customer Dashboard

5. **View Order**
   - Check order status in Customer Dashboard
   - All order details preserved

### Switching to Live Mode

When you're ready to test with real payments:

1. **Get Flutterwave Credentials**
   - Sign up at [Flutterwave](https://flutterwave.com)
   - Get your public key

2. **Update `.env.local`**:
   ```bash
   VITE_PAYMENT_MODE=live
   VITE_FLUTTERWAVE_PUBLIC_KEY=your_actual_public_key_here
   ```

3. **Restart dev server**

4. **Test with real payment**
   - Use Flutterwave test cards for safe testing
   - See [Flutterwave docs](https://developer.flutterwave.com/docs/integration-guides/testing-helpers) for test card numbers

## Benefits for Testing

### ✅ Internal Testing
- Test complete user journeys without payment gateway setup
- Validate order flow, notifications, and status updates
- Demo the app to stakeholders without real transactions

### ✅ Development
- Develop features that depend on successful payment
- Test edge cases (shop closed, made-to-order items, etc.)
- Iterate quickly without payment gateway overhead

### ✅ Safe Testing
- No risk of accidental charges
- No need for test payment credentials during early development
- Switch to live mode only when ready

## Environment Variables Reference

```bash
# API Configuration
VITE_API_MODE=mock                          # 'mock' or API URL
VITE_API_BASE_URL=http://localhost:8000/api # Django backend URL

# Payment Configuration
VITE_PAYMENT_MODE=simulation                # 'simulation' or 'live'
VITE_FLUTTERWAVE_PUBLIC_KEY=your_key_here   # Required for live mode

# Other
VITE_AUTH_TOKEN_KEY=kithly_auth_token
VITE_APP_ENV=development
```

## Troubleshooting

### Simulation Mode Not Working
- **Check `.env.local`**: Ensure `VITE_PAYMENT_MODE=simulation` is set
- **Restart dev server**: Vite doesn't hot-reload environment variables
- **Clear browser cache**: Sometimes cached code can cause issues

### Still seeing Flutterwave
- **Verify env variable**: Run `echo $env:VITE_PAYMENT_MODE` (PowerShell) to check
- **Check for typos**: Must be exactly `simulation` (lowercase)
- **Restart completely**: Stop dev server (Ctrl+C) and restart

### Orders Not Completing
- **Phone validation**: Must use format `+260XXXXXXXXX`
- **Required fields**: All form fields must be filled
- **Check console**: Look for error messages in browser console

## Best Practices

1. **Use Simulation for Development**
   - Keep `VITE_PAYMENT_MODE=simulation` during active development
   - Only switch to live mode for payment gateway integration testing

2. **Document Test Scenarios**
   - Test all delivery types (collection/delivery)
   - Test restaurant orders with time slots
   - Test made-to-order items (Baker's Protocol)

3. **Transition to Live Mode Gradually**
   - First test with Flutterwave test credentials
   - Then test with small amounts in production
   - Finally, go live with full production setup

## Related Documentation

- **API_CONTRACT.md**: Backend integration specifications
- **DJANGO_BACKEND_SPEC.md**: Complete backend implementation guide
- **README.md**: General project setup and overview

## Support

If you need to switch between modes frequently, you can create multiple environment files:

```bash
# .env.simulation
VITE_PAYMENT_MODE=simulation

# .env.live
VITE_PAYMENT_MODE=live
VITE_FLUTTERWAVE_PUBLIC_KEY=your_key_here
```

Then copy the appropriate file to `.env.local` when needed.

---

**Happy Testing! 🚀**
