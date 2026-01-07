# KithLy Backend Integration Preparation Guide

## 🎯 Overview

This document outlines the steps to prepare your React/TypeScript frontend for seamless Django backend integration. The goal is to ensure your developer can plug in the Django API with **zero breaking changes** to your existing codebase.

---

## ✅ What We've Done

### 1. **API Abstraction Layer Created**

We've built a complete API service layer that switches between **mock data** (current state) and **live Django API** (future state) based on environment configuration.

**Files Created:**
- `src/config/api.config.ts` - Central API configuration
- `src/services/api/httpClient.ts` - HTTP client with auth & error handling
- `src/services/api/ordersApi.ts` - Orders API service
- `src/services/api/productsApi.ts` - Products API service
- `src/services/api/index.ts` - Unified API exports
- `.env.example` - Environment variable template
- `.env.local` - Local development configuration

### 2. **Environment-Based Mode Switching**

Your app now supports two modes:
- **Mock Mode (`VITE_API_MODE=mock`)** - Uses `firebaseStub.ts` (current)
- **Live Mode (`VITE_API_MODE=live`)** - Calls Django REST API (future)

**How It Works:**
```typescript
// In any API service file:
if (isMockMode()) {
  return mockDb.orders.getAll(); // Uses localStorage stub
}
return httpClient.get<Order[]>('/api/orders/'); // Calls Django
```

---

## 🔧 What You Need to Do

### Step 1: Update Service Context (Critical)

**File:** `src/context/ServiceContext.tsx`

Replace the current `db` import from `firebaseStub.ts` with the new API layer:

```typescript
// OLD (Remove this):
import { db } from '../services/firebaseStub';

// NEW (Add this):
import { api } from '../services/api';

// Update the context value:
const value = {
  db: {
    orders: api.orders,
    products: api.products,
  },
  notify: notificationService,
  // ... other services
};
```

### Step 2: Verify TypeScript Types Match Backend Schema

**File:** `src/types/index.ts`

Ensure your types match the Django backend models **exactly**. Your developer should validate these against his Django serializers:

#### Critical Type Mappings:

**Order Model:**
```typescript
export interface Order {
  id: string;              // Django: CharField (collection_code primary key?)
  customerName: string;    // Django: customer_name
  paidOn: string;          // Django: paid_on (DateTimeField, ISO format)
  collectedOn: string | null;  // Django: collected_on (nullable)
  total: number;           // Django: DecimalField
  status: 'pending' | 'paid' | 'ready_for_dispatch' | 'dispatched' | 'collected';
  deliveryMethod: 'pickup' | 'delivery';
  collectionCode: string;  // Django: collection_code (unique)
  deliveryCoordinates?: {  // Django: JSONField
    lat: number;
    lng: number;
  };
  items: any[];            // Django: JSONField or OrderItem FK
}
```

**Product Model:**
```typescript
export interface Product {
  id: number;
  name: string;
  price: number;           // Django: DecimalField
  image: string;           // Django: ImageField URL
  stock: number;
  shopId?: number;         // Django: ForeignKey
}
```

**⚠️ Naming Convention Alert:**
Your TypeScript uses **camelCase** (`customerName`), but Django defaults to **snake_case** (`customer_name`).

**Solution:** Your developer must configure Django REST Framework serializers to use camelCase:

```python
# In Django serializers.py
from rest_framework import serializers

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

    def to_representation(self, instance):
        # Convert snake_case to camelCase for frontend
        data = super().to_representation(instance)
        return {
            'id': data['id'],
            'customerName': data['customer_name'],
            'paidOn': data['paid_on'],
            # ... etc
        }
```

### Step 3: Test Mock Data Matches Production Structure

**File:** `src/services/firebaseStub.ts`

The `mockOrders` array (line 34) is currently empty. Populate it with **realistic mock data** that matches your TypeScript types **exactly**.

**Action Required:**
```typescript
const mockOrders: Order[] = [
  {
    id: 'KLY-TEST001',
    customerName: 'Alice Mwanza',
    customerAvatar: 'https://ui-avatars.com/api/?name=Alice+Mwanza',
    paidOn: '2026-01-03T10:30:00Z',
    collectedOn: null,
    total: 250.00,
    itemCount: 3,
    status: 'paid',
    deliveryMethod: 'pickup',
    collectionCode: 'KLY-ABC123DEF',
    shopName: 'Fresh Greens Market',
    shopId: 1,
    items: [
      { id: 101, name: 'Tomatoes', price: 50, quantity: 2 },
      { id: 102, name: 'Lettuce', price: 150, quantity: 1 },
    ],
  },
  // Add 5-10 more realistic orders here
];
```

### Step 4: Add CORS Proxy for Local Testing (Optional)

When your developer deploys the Django backend locally (`http://localhost:8000`), you'll need CORS enabled.

**Developer's Django Task:**
```python
# settings.py
INSTALLED_APPS = [
    'corsheaders',  # Add this
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add at top
    # ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Your Vite dev server
]
```

### Step 5: Update .gitignore

Add these lines to `.gitignore`:

```
# Environment files
.env.local
.env.production.local
.env.development.local
.env.test.local
```

**Why:** Never commit API keys or local configuration to Git.

---

## 🧪 Testing the Integration

### Phase 1: Mock Mode Testing (Now)

1. Ensure `VITE_API_MODE=mock` in `.env.local`
2. Run `npm run dev`
3. Test all flows:
   - [ ] Create an order
   - [ ] View orders in Customer Dashboard
   - [ ] Scan QR code in Shop Portal
   - [ ] Verify collection
   - [ ] Pin delivery location

### Phase 2: Live Mode Testing (After Backend is Ready)

1. Your developer starts Django: `python manage.py runserver`
2. Update `.env.local`:
   ```
   VITE_API_MODE=live
   VITE_API_BASE_URL=http://localhost:8000/api
   ```
3. Restart Vite: `npm run dev`
4. **The app should work identically**, but now using real database data.

---

## 🔐 Authentication Integration

### Current State:
Your app has `AuthContext` but no real authentication yet.

### What Your Developer Needs to Build:

**Django Endpoints:**
```
POST /api/auth/login/
POST /api/auth/register/
POST /api/auth/logout/
GET /api/auth/me/
```

**Frontend Update Required:**
Update `src/services/authService.ts` to use the new API:

```typescript
import { httpClient } from './api/httpClient';
import { setAuthToken } from '../config/api.config';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await httpClient.post('/auth/login/',
      { email, password },
      { requiresAuth: false } // No token needed for login
    );
    setAuthToken(response.token); // Store JWT
    return response.user;
  },

  // ... implement register, logout, etc.
};
```

---

## 📊 Data Migration Strategy

### Shops & Products
Your mock shops are in `src/services/enhancedShopData.ts`. This data should be **seeded into Django** by your developer.

**Action for Developer:**
Create a Django management command to import this data:

```bash
python manage.py seed_shops
```

---

## 🚀 Deployment Checklist

### Before Handover to Developer:

- [ ] All TypeScript types finalized in `src/types/index.ts`
- [ ] Mock data in `firebaseStub.ts` matches production structure
- [ ] ServiceContext updated to use new API layer
- [ ] `.env.example` committed to Git
- [ ] `.env.local` added to `.gitignore`
- [ ] All features tested in mock mode

### After Developer Completes Backend:

- [ ] Django CORS configured for frontend domain
- [ ] API endpoints return camelCase JSON (not snake_case)
- [ ] Authentication tokens use JWT (Knox/SimpleJWT)
- [ ] All endpoints match `src/config/api.config.ts` paths
- [ ] Test in live mode: `VITE_API_MODE=live`

---

## 🔄 Migration Timeline

### Week 1 (You - Now):
✅ API layer created (Done!)
⏳ Update ServiceContext
⏳ Populate mock data
⏳ Test all flows in mock mode

### Week 2 (Developer):
⏳ Build Django models
⏳ Create DRF serializers (camelCase output)
⏳ Implement authentication
⏳ Build priority endpoints (Orders, Products)

### Week 3 (Integration):
⏳ Switch to `VITE_API_MODE=live`
⏳ Test locally (Django + Vite running together)
⏳ Fix any bugs
⏳ Deploy to staging

---

## 🆘 Common Issues & Solutions

### Issue 1: "CORS Error" in Browser Console
**Cause:** Django not allowing your frontend domain.
**Fix:** Developer adds your Vite URL to `CORS_ALLOWED_ORIGINS`.

### Issue 2: "401 Unauthorized" on All Requests
**Cause:** Auth token not being sent or invalid.
**Fix:** Check `localStorage` for token. Verify Django is accepting `Bearer` tokens.

### Issue 3: Field Names Don't Match
**Example:** Backend sends `customer_name`, frontend expects `customerName`.
**Fix:** Developer must configure serializer to output camelCase (see Step 2).

### Issue 4: Orders Not Showing in Dashboard
**Cause:** Backend filtering orders by user, but mock data has no user association.
**Fix:** Temporarily disable user filtering in Django during testing, or ensure proper authentication.

---

## 📞 Questions for Your Developer

Before Monday, send your developer these questions:

1. **Will you use JWT tokens (via Knox or SimpleJWT) for authentication?**
   *(This affects how we send the `Authorization` header)*

2. **Can you ensure API responses use camelCase field names?**
   *(Critical for zero frontend changes)*

3. **What's your preferred approach for handling image uploads?**
   *(We suggest Cloudinary for products/shops)*

4. **Will the API be deployed locally first, or directly to a hosting service?**
   *(Affects our `VITE_API_BASE_URL` configuration)*

---

## ✨ Summary

**You're 80% ready for backend integration!** The infrastructure is in place. Complete Steps 1-5 above, and your app will seamlessly switch from mock data to live Django APIs with a single environment variable change.

**Key Principle:** Your developer should never need to touch React code. All changes happen in the API layer and configuration files.

---

**Next Steps:**
1. Complete the checklist in Step 1-5
2. Send this document + `DJANGO_BACKEND_SPEC.md` to your developer
3. Schedule a 30-minute call to align on field naming conventions
4. Start testing! 🚀
