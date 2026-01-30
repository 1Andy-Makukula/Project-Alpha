<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# KithLy - Zambia's Premier Marketplace Platform

A modern React/TypeScript marketplace application designed for the informal economy, with headless Django backend support.

**Current Status:** ✅ Frontend Complete | 🔄 Backend Integration Ready

---

## 🚀 Quick Start

**Prerequisites:** Node.js 16+

### Running the App

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# http://localhost:5173
```

**Note:** Currently running in **mock mode** with localStorage. Real database integration coming soon!

---

## 📚 Documentation

### 🆕 Latest Updates (Jan 2026)
- **[REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)** - Complete Wizard of Oz refactoring summary
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick start guide with visual flow diagrams
- **[LOGISTICS_FLOW.md](./LOGISTICS_FLOW.md)** - WhatsApp-based delivery verification system
- **[DJANGO_IMPLEMENTATION.md](./DJANGO_IMPLEMENTATION.md)** - Complete backend implementation guide
- **[PAYMENT_SIMULATION_GUIDE.md](./PAYMENT_SIMULATION_GUIDE.md)** - Testing payments without credentials

### For Developers:
- **[API_CONTRACT.md](./API_CONTRACT.md)** - JSON examples for Django developer
- **[DJANGO_BACKEND_SPEC.md](./DJANGO_BACKEND_SPEC.md)** - Technical specification for Django

### Workflows:
- **[Feature Implementation Plan](./.agent/workflows/feature-implementation-plan.md)** - Feature roadmap
- **[Wizard of Oz Refactor](./.agent/workflows/wizard-of-oz-refactor.md)** - Implementation checklist

---

## 🎯 Key Features

### 🆕 Wizard of Oz Logistics (NEW!)
- **WhatsApp Verification** - Recipients share GPS location via WhatsApp
- **Manual Address Capture** - Admin captures delivery addresses from WhatsApp pins
- **CSV Export for Yango** - Batch export orders for courier assignment
- **Driver Assignment Gate** - Shops can't handover without driver assigned
- **Payment Simulation** - Test full checkout flow without payment gateway

### Shopping Experience
- **Multi-Shop Cart** - Order from multiple shops simultaneously
- **Made-to-Order Support** - Request custom products with Baker's Protocol
- **Time-Slot Pickup** - Schedule collection times for restaurants
- **Geolocation Filtering** - Find shops by city/region

### Shop Management
- **Real-Time Orders Dashboard** - Track incoming orders
- **QR Scanner** - Verify order collection securely
- **Wallet Overview** - Pending & available funds tracking
- **Driver Handover Workflow** - Confirm handover with plate number verification

---

## 🏗️ Architecture

### Frontend Stack
- **React 18** + **TypeScript**
- **Vite** - Lightning-fast build tool
- **Sonner** - Beautiful toast notifications
- **QRCode.react** - QR generation
- **Flutterwave** - Payment gateway integration
- **Canvas Confetti** - Celebration effects

### Backend Integration
- **Mode:** Environment-switchable (mock ↔ live)
- **API Layer:** REST with JWT authentication
- **Target Backend:** Django REST Framework + PostgreSQL
- **External Services:** Twilio WhatsApp API, Yango Business

### Current Mode
```env
VITE_API_MODE=mock              # Uses localStorage
VITE_PAYMENT_MODE=simulation    # No real payments
```

Switch to live when Django is ready:
```env
VITE_API_MODE=live
VITE_API_BASE_URL=http://localhost:8000/api
VITE_PAYMENT_MODE=live
VITE_FLUTTERWAVE_PUBLIC_KEY=your_key_here
```

---

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Route pages
├── services/        # Backend services
│   ├── api/         # API layer (NEW!)
│   │   ├── httpClient.ts
│   │   ├── ordersApi.ts
│   │   └── productsApi.ts
│   └── firebaseStub.ts  # Mock data
├── context/         # React context providers
├── types/           # TypeScript definitions
├── config/          # Configuration files
└── utils/           # Utilities & helpers
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🌐 Environment Variables

See `.env.example` for all available options.

**Key Variables:**
- `VITE_API_MODE` - `mock` or `live`
- `VITE_API_BASE_URL` - Django API URL
- `VITE_FLUTTERWAVE_PUBLIC_KEY` - Payment gateway key

---

## 🤝 Contributing

This project is prepared for backend integration:
1. Frontend uses TypeScript types in `src/types/index.ts`
2. API contracts defined in `API_CONTRACT.md`
3. Mock data in `src/services/firebaseStub.ts` shows expected structure
4. Switching to live backend requires **one environment variable change**

---

## 📞 Support

For questions about:
- **Frontend Implementation** - See component documentation
- **Backend Integration** - Read `BACKEND_INTEGRATION_PREP.md`
- **API Contract** - Check `API_CONTRACT.md`

---

## 📄 License

Private Project - All Rights Reserved

---

**Built with ❤️ for Zambia's Informal Economy**
