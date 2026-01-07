---
description: Wizard of Oz Logistics Refactoring Plan
---

# KithLy "Wizard of Oz" Logistics Refactoring

## Overview
Refactor KithLy to implement a WhatsApp-based delivery verification system that eliminates complex map integrations in favor of a streamlined, manual logistics flow powered by Yango Business.

## Implementation Tasks

### Phase 1: Cleanup & Removal ✅
- [x] Identify files to remove
- [ ] Delete PinLocationPage.tsx
- [ ] Delete ShopMap.tsx  
- [ ] Remove Firebase service files (firebase.ts, firebaseConfig.ts, firebaseReal.ts, firebaseStub.ts)
- [ ] Remove Leaflet dependencies from package.json
- [ ] Remove Firebase dependency from package.json
- [ ] Run npm install to update dependencies

### Phase 2: Type System Updates
- [ ] Update Order interface in src/types/index.ts:
  - Add `delivery_address_note?: string`
  - Add `driver_plate_number?: string`
  - Add `delivery_verification_status?: 'pending' | 'verified' | 'delivered'`

### Phase 3: Landing Page Cleanup
- [ ] Remove LocationSelector from LandingPage.tsx
- [ ] Remove SearchBar from public Landing Page
- [ ] Keep Hero and Features only for unauthenticated users

### Phase 4: Portal Protection & Routing
- [ ] Ensure CustomerPortal has SearchBar and City selector inside (post-auth only)
- [ ] Update login redirect logic:
  - customer → /catalog (CustomerPortal)
  - shop → /scanner (ShopPortal)
  - admin → /admin (AdminDashboard)
- [ ] Verify ProtectedRoute wraps all portals

### Phase 5: Delivery Verification Page
- [ ] Create DeliveryVerificationPage.tsx
  - Large golden "Share Location via WhatsApp" button
  - Button opens: `https://wa.me/[SUPPORT_NUMBER]?text=Confirming delivery for Order [OrderID]`
  - Display order summary and instructions
  - Show estimated delivery time

### Phase 6: Shop Portal Updates
- [ ] Update ShopPortal.tsx OrderCard component:
  - Display `driver_plate_number` if available
  - Show delivery address note
  - Enable "Confirm Handover" button only when driver_plate_number is populated
  - Add visual indicator for driver assignment

### Phase 7: Customer Dashboard Updates
- [ ] Update CustomerDashboard.tsx:
  - Show delivery verification status
  - Add link to DeliveryVerificationPage for pending deliveries
  - Display driver plate number when assigned

### Phase 8: Remove Unused Imports
- [ ] Scan codebase for Leaflet imports and remove
- [ ] Remove Firebase imports from App.tsx and other components
- [ ] Clean up CheckoutPage.tsx (remove ShopMap component)

### Phase 9: Environment & Configuration
- [ ] Add VITE_WHATSAPP_SUPPORT_NUMBER to .env.example
- [ ] Add VITE_VERIFICATION_BASE_URL to .env.example
- [ ] Update .env.local accordingly

### Phase 10: Documentation
- [ ] Create LOGISTICS_FLOW.md documenting the Wizard of Oz system
- [ ] Update API_CONTRACT.md with new Order fields
- [ ] Update DJANGO_BACKEND_SPEC.md with:
  - Order model updates
  - CSV Manifest export functionality
  - WhatsApp Twilio integration
  - Post-save signal for delivery orders

## Backend Requirements (For Django Developer)

### 1. Order Model Updates
```python
class Order(models.Model):
    # Existing fields...
    delivery_address_note = models.TextField(blank=True, null=True)
    driver_plate_number = models.CharField(max_length=20, blank=True, null=True)
    delivery_verification_status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('verified', 'Verified'), ('delivered', 'Delivered')],
        default='pending'
    )
```

### 2. CSV Manifest Export
Admin action to export orders where:
- `status == 'READY_FOR_DISPATCH'`
- `delivery_method == 'delivery'`

CSV Columns:
- Shop_Pickup_Address
- delivery_address_note (Destination)
- Recipient_Phone
- Order_ID

### 3. WhatsApp Integration (Twilio)
Post-save signal on Order model:
- Trigger when `delivery_method == 'delivery'`
- Send WhatsApp message via Twilio API
- Template: "Hello {{name}}! A gift has been sent to you via KithLy..."
- Include verification link: `https://kith.ly/verify/{{order_id}}`

### 4. JWT Authentication
- Use `djangorestframework-simplejwt`
- Custom User model with roles: ['CUSTOMER', 'SHOP', 'ADMIN']

## Testing Checklist
- [ ] Login flow redirects to correct portal based on role
- [ ] Customer cannot access admin/shop pages
- [ ] Shop owner cannot access customer dashboard
- [ ] DeliveryVerificationPage opens WhatsApp correctly
- [ ] Order shows driver details when assigned
- [ ] Shop portal's handover button logic works
- [ ] Payment simulation still works
- [ ] No Leaflet/Firebase console errors

## Success Criteria
- ✅ No map dependencies in package.json
- ✅ No Firebase SDK initialization errors
- ✅ Clean public landing page (no search/location)
- ✅ Protected portals with proper redirects
- ✅ WhatsApp verification button functional
- ✅ Driver plate number field integrated
- ✅ Shop portal handover flow works
