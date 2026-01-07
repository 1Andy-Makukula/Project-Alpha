# 🎯 Pickup-Only MVP - Implementation Checklist

## ✅ **COMPLETED**

### Core Type System
- [x] Removed `deliveryMethod` from Order interface
- [x] Removed `deliveryCoordinates` from Order interface
- [x] Removed `deliveryNotes` from Order interface
- [x] Removed `driverDetails` object from Order interface
- [x] Removed all Wizard of Oz delivery fields
- [x] Simplified Order status to: `'pending' | 'paid' | 'collected'`
- [x] Removed `'deliveryVerification'` from View type
- [x] Kept `recipient_phone` for WhatsApp receipt sharing

### Application Logic
- [x] Removed `DeliveryVerificationPage` import from App.tsx
- [x] Removed `deliveryVerification` route case
- [x] Updated `handleCheckout` signature (removed delivery parameters)
- [x] Removed delivery logic from order creation
- [x] Fixed all TypeScript errors

### Checkout Page
- [x] Removed delivery/pickup toggle UI
- [x] Removed delivery distance calculation logic
- [x] Removed zone-based pricing system
- [x] Removed GPS/geolocation features
- [x] Created new "Pickup & Notification" section
- [x] Simplified fee calculation (no delivery fees)
- [x] Removed unused imports (CarIcon, calculateDistance, etc.)
- [x] Updated props interface

### File Cleanup
- [x] Deleted `DeliveryVerificationPage.tsx`
- [x] Created `PICKUP_ONLY_REFACTORING.md` documentation

### ServiceContext
- [x] Added missing `get` method to orders interface
- [x] Mapped `api.orders.getByCode` to `db.orders.get`

---

## 📋 **NEXT STEPS** (To Complete Full Refactoring)

### 1. Order Success Page Enhancements
- [ ] **Add "Share Receipt to WhatsApp" Button**
  - File: `src/pages/OrderSuccessPage.tsx`
  - Implement `generateReceiptImage()` function
  - Create WhatsApp deep link with pre-filled message
  - Include QR code, Order ID, and pickup instructions

- [ ] **Enhance QR Code Display**
  - Make QR code larger and more prominent
  - Add high-contrast "Golden Receipt" styling
  - Include download button for offline access

- [ ] **Add Pickup Instructions Section**
  - Show shop location clearly
  - Display operating hours
  - Add Google Maps link
  - Show estimated ready time (for restaurants)

### 2. Shop Portal Simplification
- [ ] **File:** `src/pages/ShopPortal.tsx`
- [ ] Remove any "Dispatch" or "Ready for Dispatch" references
- [ ] Simplify orders tab to: `Requests | Kitchen/Pickup | History`
- [ ] Make Scanner the prominent feature
- [ ] Add large "Confirm Collection" button after successful scan
- [ ] Remove delivery method indicators from order cards

### 3. Landing Page Cleanup
- [ ] **File:** `src/pages/LandingPage.tsx`
- [ ] Remove address/location search bar (if present)
- [ ] Update hero section messaging to emphasize pickup-only
- [ ] Add value proposition: "Zero delivery fees - Recipients collect in-store"
- [ ] Update feature cards to remove delivery references

### 4. Customer Portal Updates
- [ ] **File:** `src/pages/CustomerPortal.tsx`
- [ ] Review shop filters - remove delivery-related options
- [ ] Update shop cards to show pickup location clearly
- [ ] Remove any distance/delivery indicators

### 5. Customer Dashboard
- [ ] **File:** `src/pages/CustomerDashboard.tsx`
- [ ] Update order cards to show pickup status only
- [ ] Remove delivery tracking features
- [ ] Add "Share Receipt" option for completed orders
- [ ] Simplify order status display

### 6. Documentation Updates
- [ ] Update `README.md` to reflect pickup-only model
- [ ] Update `API_CONTRACT.md` to remove delivery endpoints
- [ ] Update any user-facing help text
- [ ] Create merchant onboarding guide for QR scanning

### 7. Testing & Validation
- [ ] **End-to-End Flow Testing:**
  - [ ] Complete order placement (pickup-only)
  - [ ] QR code generation
  - [ ] Receipt generation
  - [ ] WhatsApp sharing
  - [ ] Merchant QR scanning
  - [ ] Order collection and fund release

- [ ] **Edge Case Testing:**
  - [ ] Shop closed during order
  - [ ] Made-to-order items (Baker's Protocol)
  - [ ] Restaurant time slots
  - [ ] Invalid QR codes
  - [ ] Manual code entry

- [ ] **Mobile Responsiveness:**
  - [ ] Receipt display on mobile
  - [ ] QR code scanning UX
  - [ ] WhatsApp integration on mobile

### 8. Backend Preparation
- [ ] Review `API_CONTRACT.md` for delivery endpoints to deprecate
- [ ] Update order creation endpoint spec
- [ ] Remove delivery-related webhook handlers
- [ ] Simplify order status transitions
- [ ] Update database schema documentation

---

## 🚨 **CRITICAL REMINDERS**

### What NOT to Do
- ❌ Do NOT add back delivery features
- ❌ Do NOT create "delivery vs. pickup" options
- ❌ Do NOT introduce location-based filtering that implies delivery
- ❌ Do NOT add distance calculations
- ❌ Do NOT create driver/courier features

### Key Principles
- ✅ ALWAYS emphasize in-store pickup
- ✅ ALWAYS show shop location prominently
- ✅ ALWAYS make QR codes the center of collection flow
- ✅ ALWAYS keep recipient location private (no coordinates)
- ✅ ALWAYS maintain simplicity over features

---

## 📊 **Success Metrics**

When implementation is complete:
1. **Code Simplicity:** ~500-600 fewer lines of code
2. **User Flow:** 3 steps instead of 5 (Purchase → Notify → Collect)
3. **Build Time:** No TypeScript errors, successful compilation
4. **Runtime:** No console errors, smooth navigation
5. **UX:** Clear "pickup-only" messaging throughout

---

## 🎉 **Definition of Done**

The refactoring is complete when:
- [ ] No delivery-related UI elements remain
- [ ] All pages show "pickup-only" context
- [ ] WhatsApp receipt sharing works
- [ ] QR code flow is smooth and reliable
- [ ] Documentation is updated
- [ ] All tests pass
- [ ] Backend team has updated API contract

---

**Last Updated:** January 7, 2026
**Status:** Core refactoring complete ✅ - Enhancements pending
