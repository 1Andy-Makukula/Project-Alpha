# Backend Integration: Quick Start Checklist

This is your action checklist to prepare KithLy for backend integration. Follow these steps in order.

---

## ✅ Immediate Actions (Do This Now)

### 1. Update ServiceContext to Use New API Layer

**File:** `src/context/ServiceContext.tsx`

**Current Import (Line ~5):**
```typescript
import { db } from '../services/firebaseStub';
```

**Change To:**
```typescript
import { api } from '../services/api';
```

**Then Update the Context Value:**
Find where you create the context value and change:
```typescript
// OLD
db: db,

// NEW
db: {
  orders: api.orders,
  products: api.products,
}
```

**Why:** This switches your app to use the new API layer that can toggle between mock and live data.

---

### 2. Test in Mock Mode

Run your dev server and verify everything still works:

```bash
npm run dev
```

**Test These Flows:**
- [ ] Browse shops
- [ ] Add items to cart
- [ ] Checkout and create an order
- [ ] View order in Customer Dashboard
- [ ] View order in Shop Portal
- [ ] Scan QR code to verify order

**Expected Result:** Everything should work the same as before, but now you'll see **realistic mock orders** in the dashboard.

---

### 3. Review TypeScript Types

**File:** `src/types/index.ts`

Open this file and review the `Order` and `Product` interfaces (lines 85-117 and 57-68).

**Send to Developer:** Take a screenshot or copy these interfaces and send them to your Django developer. He needs to ensure his Django models match **exactly**.

**Critical Fields to Verify:**
- Order status values: `'pending' | 'paid' | 'ready_for_dispatch' | 'dispatched' | 'collected'`
- Delivery method: `'pickup' | 'delivery'`
- Collection code format: String (unique identifier)
- Delivery coordinates: `{ lat: number; lng: number; }`

---

### 4. Populate .env.local (Already Done ✓)

We've created `.env.local` with:
```
VITE_API_MODE=mock
```

**Don't change this yet.** After your developer finishes the backend, you'll switch to:
```
VITE_API_MODE=live
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 📤 Send to Your Developer (Monday)

### Documents to Share:
1. **DJANGO_BACKEND_SPEC.md** - Technical specification (you already have this)
2. **BACKEND_INTEGRATION_PREP.md** - Integration guide (created with this setup)
3. **src/types/index.ts** - TypeScript type definitions

### Critical Questions to Ask:

**Question 1: Field Naming**
> "Will your Django API return JSON in camelCase (customerName) or snake_case (customer_name)?"
>
> **Preferred Answer:** "camelCase" (matches your frontend)
>
> **Important:** If he says snake_case, he needs to add a serializer transformer. Show him the example in `BACKEND_INTEGRATION_PREP.md` (Step 2).

**Question 2: Authentication**
> "What authentication method will you use? JWT with Knox, SimpleJWT, or something else?"
>
> **Expected:** JWT (JSON Web Tokens)

**Question 3: CORS**
> "Will you enable CORS for http://localhost:5173 so the frontend can talk to the Django backend locally?"
>
> **Expected:** "Yes, I'll use django-cors-headers"

**Question 4: API Endpoint Paths**
> "Can you confirm the API endpoints will match these paths?"
>
> Then show him `src/config/api.config.ts` lines 33-62 (the API_ENDPOINTS object).

---

## 🧪 Testing After Backend is Ready

### Step 1: Start Django Backend
Your developer runs:
```bash
python manage.py runserver
```

Django should now be running at `http://localhost:8000`

### Step 2: Switch to Live Mode

**File:** `.env.local`

Change:
```
VITE_API_MODE=live
VITE_API_BASE_URL=http://localhost:8000/api
```

### Step 3: Restart Vite

Stop your dev server (Ctrl+C) and restart:
```bash
npm run dev
```

### Step 4: Test Live Data

Now your app is talking to the real Django backend!

**Test:**
- [ ] Login (if authentication is ready)
- [ ] Create an order
- [ ] Check Django admin to see if order appears in database
- [ ] View order in frontend
- [ ] Verify QR code collection flow

**Common Issues:**

**Problem:** "CORS Error" in browser console
**Fix:** Developer needs to add your Vite URL to Django CORS settings

**Problem:** "401 Unauthorized"
**Fix:** Check auth token in localStorage. Ensure Django accepts Bearer tokens.

**Problem:** Fields are undefined (e.g., `order.customerName` is undefined)
**Fix:** Django is sending snake_case. Developer needs to fix serializer (see prep guide).

---

## 📊 Mock Data Verification

Open your browser console and type:
```javascript
localStorage.getItem('kithly_orders_v2')
```

You should see JSON with realistic orders. This is what Django will return (but from a database instead of localStorage).

---

## 🚀 Optional: Create Sample Data Export for Developer

If you want to help your developer seed the database with your mock shops:

1. Open `src/services/enhancedShopData.ts`
2. Copy the shop data
3. Send it to your developer
4. He can create a Django management command to import it:

```bash
python manage.py seed_shops
```

---

## ✨ Summary

**What You Did:**
- ✅ Created API service layer
- ✅ Set up environment configuration
- ✅ Generated realistic mock data
- ✅ Updated .gitignore for security

**What's Left:**
1. Update ServiceContext (5 minutes)
2. Test all flows in mock mode (15 minutes)
3. Send docs to developer (2 minutes)
4. Wait for backend to be ready
5. Switch to live mode and test together

**Time Required:** ~30 minutes of work on your end.

**Result:** When the backend is ready, switching from mock to live will be **one line of code change** in `.env.local`.

---

## 🆘 Need Help?

If you encounter issues:

1. **Check console for errors** - Open browser DevTools (F12)
2. **Verify .env.local exists** - Should be in project root
3. **Clear localStorage** - Run: `localStorage.clear()` in console
4. **Restart dev server** - Sometimes Vite needs a fresh start

---

**Next Step:** Open `src/context/ServiceContext.tsx` and make the changes in Step 1 above! 🎯
