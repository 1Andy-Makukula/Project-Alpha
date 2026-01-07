# 📋 Quick Reference: Wizard of Oz Implementation

## ⚡ Quick Start (Right Now!)

### 1. Restart Your Dev Server
```bash
# In terminal running npm run dev:
# Press Ctrl+C

# Then restart:
npm run dev
```
**Why?** New environment variables need a fresh start.

### 2. Test the New Features
Navigate to: `http://localhost:5173`

✅ **Payment Simulation** - Should still work (purple banner)  
✅ **Delivery Checkout** - No map, cleaner interface  
✅ **Customer Dashboard** - See your orders  
✅ **Verification Link** - Click on delivery order to test WhatsApp flow

---

## 📞 WhatsApp Verification Flow (Visual Guide)

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Customer Checks Out (London)                       │
│  ────────────────────────────────────────────────────────  │
│  ✓ Enters recipient phone: +260971234567                    │
│  ✓ Completes payment                                        │
│  ✓ Order created with delivery_verification_status=pending  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Django Sends WhatsApp (Automated)                  │
│  ────────────────────────────────────────────────────────  │
│  📱 WhatsApp Message to Recipient:                          │
│  "A gift has been sent! Tap this link to share location:"   │
│  https://kith.ly/verify/KLY-ABC123                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Recipient Opens Link (Lusaka)                      │
│  ────────────────────────────────────────────────────────  │
│  🌐 DeliveryVerificationPage loads                          │
│  📦 Shows order summary                                     │
│  🟡 Big golden button: "Share Location via WhatsApp"        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Recipient Shares GPS Pin                           │
│  ────────────────────────────────────────────────────────  │
│  📱 WhatsApp opens with pre-filled message                  │
│  📍 Recipient taps 📎 → Location → Send Current Location    │
│  ✓ KithLy Support receives GPS pin                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Admin Captures Address (Manual)                    │
│  ────────────────────────────────────────────────────────  │
│  👤 Admin opens WhatsApp on phone                           │
│  📍 Taps GPS pin → Google Maps                              │
│  📝 Copies: "House 12, Kabulonga, Lusaka"                   │
│  💻 Pastes into Django Admin → delivery_address_note        │
│  ✓ Updates status to 'verified'                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: Export to Yango (Batch)                            │
│  ────────────────────────────────────────────────────────  │
│  📊 Admin filters: Ready for Dispatch + Verified            │
│  📄 Exports CSV Manifest                                    │
│  ⬆️  Uploads to Yango Business Dashboard                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: Yango Assigns Driver                               │
│  ────────────────────────────────────────────────────────  │
│  🚗 Yango assigns driver to delivery                        │
│  🚘 Driver info: Plate AEW-1234                             │
│  💻 Admin updates order.driver_plate_number in Django       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 8: Shop Confirms Handover                             │
│  ────────────────────────────────────────────────────────  │
│  🏪 Shop owner logs into Shop Portal                        │
│  ✓ Sees driver plate: AEW-1234                              │
│  ✅ "Confirm Handover" button now ENABLED                   │
│  📦 Hands package to driver, clicks button                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 9: Driver Delivers                                    │
│  ────────────────────────────────────────────────────────  │
│  🚗 Driver uses Yango app with delivery address             │
│  📍 Navigates to: "House 12, Kabulonga, Lusaka"             │
│  🎁 Delivers gift to recipient                              │
│  ✓ Marks complete in Yango                                  │
│  💻 Admin updates status to 'delivered' in Django           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Monday: Django Developer Checklist

### Priority 1: Setup (Day 1)
- [ ] Review `DJANGO_IMPLEMENTATION.md`
- [ ] Set up Django project + PostgreSQL
- [ ] Install dependencies (see requirements.txt in docs)
- [ ] Create `.env` file with Twilio credentials
- [ ] Test admin login

### Priority 2: Auth & Models (Day 2-3)
- [ ] Implement custom User model with roles
- [ ] Set up JWT authentication
- [ ] Create Order model with Wizard of Oz fields
- [ ] Create OrderItem model
- [ ] Run migrations
- [ ] Test order creation via Django Admin

### Priority 3: WhatsApp (Day 4)
- [ ] Create WhatsApp service (Twilio)
- [ ] Implement post-save signal
- [ ] Test sending WhatsApp message to test number
- [ ] Verify link format in message

### Priority 4: CSV Export (Day 5)
- [ ] Create admin action for CSV export
- [ ] Test exporting sample orders
- [ ] Verify CSV format matches Yango requirements
- [ ] Add filtering for "ready_for_dispatch" + "verified"

###Priority 5: API Endpoints (Week 2)
- [ ] Create Order serializers
- [ ] Implement OrderViewSet
- [ ] Add custom actions:
  - [ ] `update_delivery_address`
  - [ ] `assign_driver`
  - [ ] `confirm_handover`
- [ ] Test all endpoints with Postman/cURL
- [ ] Document API in README

---

## 🗂️ Documentation Index

| Document | Purpose | Audience |
|----------|---------|----------|
| **REFACTORING_SUMMARY.md** | What we did today | Everyone |
| **LOGISTICS_FLOW.md** | How the system works | Product, Dev, Ops |
| **DJANGO_IMPLEMENTATION.md** | Backend setup guide | Django Developer |
| **PAYMENT_SIMULATION_GUIDE.md** | Testing payments | QA, Frontend Dev |
| **API_CONTRACT.md** | Frontend ↔ Backend contract | Both Devs |
| **.agent/workflows/wizard-of-oz-refactor.md** | Implementation plan | Project Manager |

---

## 🔑 Key Environment Variables

### Frontend (.env.local)
```bash
# Already configured ✅
VITE_API_MODE=mock
VITE_PAYMENT_MODE=simulation
VITE_WHATSAPP_SUPPORT_NUMBER=260971234567
VITE_VERIFICATION_BASE_URL=https://kith.ly/verify
```

### Backend (Django .env) - TO BE CREATED
```bash
# Django
SECRET_KEY=generate-secure-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=kithly_db
DB_USER=postgres
DB_PASSWORD=your_password

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=get_from_twilio
TWILIO_AUTH_TOKEN=get_from_twilio
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## 📦 Order Data Structure (Frontend ↔ Backend)

### Minimal Order Creation (Frontend → Backend)
```json
{
  "customer_name": "John Doe",
  "total": 250.00,
  "item_count": 3,
  "delivery_method": "delivery",
  "shop_name": "Sweet Treats",
  "shop_id": 1,
  "recipient_phone": "+260971234567",
  "message": "Happy Birthday!",
  "items": [
    {
      "product_id": 1,
      "product_name": "Chocolate Cake",
      "price": 100.00,
      "quantity": 2
    }
  ]
}
```

### Complete Order Response (Backend → Frontend)
```json
{
  "id": "KLY-ABC123",
  "customer_name": "John Doe",
  "total": 250.00,
  "status": "paid",
  "delivery_method": "delivery",
  "recipient_phone": "+260971234567",
  "delivery_address_note": null,  // ← Admin fills this
  "driver_plate_number": null,    // ← Admin fills this
  "delivery_verification_status": "pending",
  "verification_link_sent_at": "2026-01-06T10:00:00Z",
  "paid_on": "2026-01-06T10:00:00Z",
  "items": [...]
}
```

---

##🎨 UI Components Reference

### Delivery Verification Page
**File:** `src/pages/DeliveryVerificationPage.tsx`  
**Route:** `/deliveryVerification`  
**Props:** `{ order: Order, setView: Function }`

**Features:**
- Animated package icon
- Order summary card
- Step-by-step instructions
- Golden WhatsApp CTA button
- Security notice

### Checkout Page (Updated)
**File:** `src/pages/CheckoutPage.tsx`  
**Changes:**
- Removed `ShopMap` component
- Added shop info banner
- Maintains all other checkout features
- Payment simulation still works

---

## 🧪 Testing Scenarios

### Scenario 1: Happy Path (Delivery)
1. ✅ Customer places order with delivery
2. ✅ Payment simulated successfully
3. ✅ Order appears in Customer Dashboard
4. ✅ Click order → Navigate to verification page
5. ✅ Click WhatsApp button → Opens WhatsApp
6. ⏳ (Backend) WhatsApp message should be sent
7. ⏳ (Admin) Capture address from WhatsApp
8. ⏳ (Admin) Export to CSV
9. ⏳ (Admin) Assign driver
10. ⏳ (Shop) Confirm handover

### Scenario 2: Collection (Pickup)
1. ✅ Customer places order with pickup
2. ✅ Payment simulated successfully
3. ✅ Order appears in Customer Dashboard
4. ✅ No verification link needed
5. ⏳ Shop sees collection code
6. ⏳ Shop scans QR or enters code manually
7. ⏳ Order marked as collected

### Scenario 3: Made-to-Order
1. ✅ Customer selects made-to-order item
2. ✅ Sees "Request Order" button (not "Pay")
3. ✅ Confirmation dialog mentions escrow
4. ✅ Order created with status="pending"
5. ⏳ Shop approves/rejects request
6. If approved → same flow as Scenario 1

---

## 🚨 Critical Success Factors

### Must Haves for Launch
- ✅ **Frontend:** Payment simulation works
- ✅ **Frontend:** Delivery verification page functional
- ⏳ **Backend:** WhatsApp message triggers on order creation
- ⏳ **Backend:** Admin can update delivery address
- ⏳ **Backend:** CSV export works
- ⏳ **Backend:** API endpoints functional

### Nice to Haves (Post-MVP)
- ⏳ Automated driver assignment via Yango API
- ⏳ Real-time order status updates
- ⏳ SMS fallback for WhatsApp failures
- ⏳ Bulk address updates
- ⏳ Driver tracking integration

---

## 💡 Pro Tips

### For Frontend Testing
```bash
# Clear Vite cache if TypeScript acts weird
rm -rf node_modules/.vite

# Check env variables loaded
# In browser console:
console.log(import.meta.env.VITE_PAYMENT_MODE)
console.log(import.meta.env.VITE_WHATSAPP_SUPPORT_NUMBER)
```

### For Django Developer
```python
# Test Twilio without creating order
from orders.services.whatsapp_service import WhatsAppService

service = WhatsAppService()
# Create a mock order object with recipient_phone
# service.send_delivery_verification_link(mock_order)
```

### For QA
- Use `+260971234567` as test recipient phone
- Orders with delivery show verification link
- Orders with pickup don't need verification
- WhatsApp button should open web.whatsapp.com or app

---

## 🎉 You're All Set!

**Everything you need is in these docs:**
1. `REFACTORING_SUMMARY.md` ← Start here (overview)
2. `LOGISTICS_FLOW.md` ← Understand the process
3. `DJANGO_IMPLEMENTATION.md` ← Build the backend
4. `PAYMENT_SIMULATION_GUIDE.md` ← Test payments

**Questions?** Check the docs first, they're comprehensive!

**Ready to ship?** Start with payment simulation testing, then hand off backend tasks.

---

**Created:** 2026-01-06  
**Status:** ✅ Complete & Ready for Backend Development
