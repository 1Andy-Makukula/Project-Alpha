# KithLy Wizard of Oz Logistics Flow

## Overview
The "Wizard of Oz" logistics system is a manual, WhatsApp-based delivery verification flow that eliminates complex map integrations while maintaining a smooth customer experience. This approach allows KithLy to operate efficiently without requiring sophisticated GPS tracking or real-time driver coordination systems.

## The Trust Loop: Complete Flow

### 1. **Checkout → Payment** (Customer Action)
**Location:** London (or any sender location)

**What Happens:**
- Customer completes checkout for a gift order
- Payment is processed (via Flutterwave in live mode, or simulated in test mode)
- KithLy captures the **recipient's phone number** (+260XXXXXXXXX format)
- Order is created with status: `paid`
- Order includes:
  - `recipient_phone`: Zambian mobile number
  - `delivery_verification_status`: 'pending'
  - `verification_link_sent_at`: Timestamp

**Frontend Code:**
```tsx
// In App.tsx - handleCheckout function
const newOrder: Order = {
  // ... other fields
  recipient_phone: recipient.phone,
  delivery_verification_status: deliveryType === 'delivery' ? 'pending' : undefined,
  verification_link_sent_at: deliveryType === 'delivery' ? new Date().toISOString() : undefined,
};
```

---

### 2. **Automated WhatsApp Trigger** (Backend Action)
**Technology:** Django + Twilio WhatsApp API

**What Happens:**
- Django backend detects new order with `delivery_method === 'delivery'`
- Post-save signal triggers Twilio WhatsApp message
- Message sent to `recipient_phone`

**WhatsApp Message Template:**
```
Hello {{recipient_name}}! 

A gift has been sent to you via KithLy 🎁

To ensure we deliver to your exact gate, please tap this link to share your location with our dispatch team:

https://kith.ly/verify/{{order_id}}

- KithLy Team
```

**Django Implementation:**
```python
# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from twilio.rest import Client

@receiver(post_save, sender=Order)
def send_delivery_verification_link(sender, instance, created, **kwargs):
    if created and instance.delivery_method == 'delivery':
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        message = client.messages.create(
            from_='whatsapp:+14155238886',  # Twilio WhatsApp number
            to=f'whatsapp:{instance.recipient_phone}',
            body=f"""Hello {instance.customer_name}!

A gift has been sent to you via KithLy 🎁

To ensure we deliver to your exact gate, please tap this link to share your location:

https://kith.ly/verify/{instance.id}

- KithLy Team"""
        )
        
        instance.verification_link_sent_at = timezone.now()
        instance.save(update_fields=['verification_link_sent_at'])
```

---

### 3. **Recipient Opens Link** (Customer Action)
**URL:** `https://kith.ly/verify/{order_id}`

**What Happens:**
- Recipient taps the WhatsApp link
- Opens DeliveryVerificationPage in browser
- Sees:
  - Order summary
  - Large golden "Share Location via WhatsApp" button
  - Step-by-step instructions

**Frontend Page:**
```tsx
// DeliveryVerificationPage.tsx
- Shows order details (ID, shop, items)
- Prominent WhatsApp CTA button
- Instructions on how to share GPS pin
- Verification status indicator
```

---

### 4. **Share Location Pin** (Customer Action)
**Platform:** WhatsApp

**What Happens:**
- Customer taps "Share Location via WhatsApp" button
- Opens WhatsApp with pre-filled message to KithLy support number
- Customer taps 📎 (attachment) → 📍 Location
- Selects "Share Live Location" or "Send Current Location"
- WhatsApp GPS pin is sent to KithLy support team

**WhatsApp Pre-filled Message:**
```
🎁 Confirming delivery location for Order #KLY-ABC123

Please share your exact delivery location pin below.
```

**Support Receives:**
- WhatsApp message from recipient
- GPS coordinates (clickable map pin in WhatsApp)
- Order ID for reference

---

### 5. **Admin Captures Location** (Manual Admin Action)
**Platform:** Django Admin Dashboard

**What Happens:**
- Admin opens the WhatsApp message on their phone
- Taps the GPS pin to open in Google Maps
- Copies the address or coordinates
- Logs into Django Admin
- Finds the order by ID
- Pastes the location into `delivery_address_note` field
- Updates `delivery_verification_status` to 'verified'

**Django Admin Interface:**
```python
# admin.py
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'status', 'delivery_verification_status']
    list_filter = ['status', 'delivery_verification_status', 'delivery_method']
    search_fields = ['id', 'customer_name', 'recipient_phone']
    
    fieldsets = [
        ('Order Info', {
            'fields': ['id', 'customer_name', 'recipient_phone', 'status']
        }),
        ('Delivery Details', {
            'fields': ['delivery_method', 'delivery_address_note', 'delivery_verification_status']
        }),
        ('Driver Assignment', {
            'fields': ['driver_plate_number'],
            'description': 'Assign driver plate number from Yango dashboard'
        })
    ]
```

---

### 6. **Batch Export to Yango** (Admin Action)
**Platform:** Django Admin + Yango Business Dashboard

**What Happens:**
- Admin filters orders: `status == 'READY_FOR_DISPATCH'` AND `delivery_method == 'delivery'`
- Selects orders for export
- Clicks "Export CSV Manifest" action
- Downloads CSV file
- Uploads to Yango Business Web Dashboard

**CSV Manifest Structure:**
```csv
Order_ID,Shop_Pickup_Address,Delivery_Address,Recipient_Phone,Items_Count,Total_Value
KLY-ABC123,"123 Main St, Lusaka","Plot 456, Kabulonga, Lusaka",+260971234567,3,250.00
KLY-DEF456,"789 Central Ave, Lusaka","House 12, Woodlands, Lusaka",+260972345678,5,420.00
```

**Django Implementation:**
```python
# admin.py
@admin.action(description="Export CSV Manifest for Yango")
def export_yango_manifest(modeladmin, request, queryset):
    queryset = queryset.filter(
        status='READY_FOR_DISPATCH',
        delivery_method='delivery',
        delivery_verification_status='verified'
    )
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="yango_manifest_{timezone.now().strftime("%Y%m%d_%H%M")}.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['Order_ID', 'Shop_Pickup_Address', 'Delivery_Address', 'Recipient_Phone', 'Items_Count', 'Total_Value'])
    
    for order in queryset:
        shop = order.shop
        writer.writerow([
            order.id,
            shop.address if shop else 'N/A',
            order.delivery_address_note,
            order.recipient_phone,
            order.item_count,
            f'{order.total:.2f}'
        ])
    
    return response
```

---

### 7. **Yango Assigns Driver** (Yango Platform)
**Platform:** Yango Business Dashboard

**What Happens:**
- Admin uploads CSV to Yango
- Yango assigns drivers to deliveries
- Each delivery gets a driver with:
  - Driver name
  - Vehicle plate number
  - Phone number
  
**Admin Actions:**
- Downloads driver assignment report from Yango
- Returns to Django Admin
- Updates each order with `driver_plate_number`

---

### 8. **Shop Sees Driver Info** (Shop Portal)
**Platform:** KithLy Shop Portal (Frontend)

**What Happens:**
- Shop owner logs into Shop Portal
- Sees order in "Ready for Dispatch" status
- **Critical:** "Confirm Handover" button is DISABLED until `driver_plate_number` is populated
- Once driver is assigned:
  - Button becomes ENABLED
  - Shop can see driver plate number
  - Shop confirms handover when driver arrives

**Frontend Logic:**
```tsx
// ShopPortal.tsx - OrderCard component
<Button
  disabled={!order.driver_plate_number}
  onClick={() => confirmHandover(order.id)}
  variant={order.driver_plate_number ? 'primary' : 'disabled'}
>
  {order.driver_plate_number 
    ? `Confirm Handover to ${order.driver_plate_number}` 
    : 'Waiting for Driver Assignment...'}
</Button>

{order.driver_plate_number && (
  <div className="driver-info">
    <p>Driver Plate: <strong>{order.driver_plate_number}</strong></p>
    <p>Delivery Address: {order.delivery_address_note}</p>
  </div>
)}
```

---

### 9. **Delivery Completion** (Driver Action)
**Platform:** Physical Delivery

**What Happens:**
- Driver picks up from shop (shop confirms handover)
- Driver uses the `delivery_address_note` in Yango app
- Driver delivers to recipient
- Driver marks delivery complete in Yango
- Admin updates order status to 'delivered' in Django

---

## Order Status Flow

```
pending (request orders only)
    ↓
paid (payment received)
    ↓
ready_for_dispatch (shop marks ready)
    ↓
dispatched (driver assigned, picked up from shop)
    ↓
delivered (recipient received)
    ↓
collected (synonym for delivered in pickup scenario)
```

## Delivery Verification Status Flow

```
pending (link sent, awaiting location)
    ↓
verified (admin captured location from WhatsApp)
    ↓
delivered (driver completed delivery)
```

## Key Features & Safety Nets

### 1. **Operational Safety**
- **No automatic dispatch**: All deliveries require manual verification
- **Human-in-the-loop**: Admin reviews every delivery address
- **Plate number gate**: Shops can't handover without driver assignment

### 2. **WhatsApp Security**
- Uses Twilio's official WhatsApp Business API
- Verified sender number displayed in app
- Recipients can reply directly for support

### 3. **Fallback Options**
- If recipient doesn't respond: Admin can call `recipient_phone`
- If location unclear: Admin can request clarification via WhatsApp
- If address incorrect: Admin updates `delivery_address_note` manually

### 4. **Cost Efficiency**
- No need for real-time GPS tracking infrastructure
- No custom driver app development
- Leverages existing Yango infrastructure
- Minimal backend complexity

---

## Environment Variables

```bash
# Frontend (.env.local)
VITE_WHATSAPP_SUPPORT_NUMBER=260971234567
VITE_VERIFICATION_BASE_URL=https://kith.ly/verify
VITE_PAYMENT_MODE=simulation  # or 'live'

# Backend (Django settings.py)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=+14155238886
YANGO_BUSINESS_API_KEY=your_yango_key  # Optional for future automation
```

---

## Technical Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React + TypeScript (Vite) |
| **Backend** | Django REST Framework |
| **Database** | PostgreSQL (recommended) |
| **WhatsApp** | Twilio WhatsApp Business API |
| **Delivery** | Yango Business (Manual CSV Upload) |
| **Payment** | Flutterwave (ZMW support) |
| **Auth** | JWT (djangorestframework-simplejwt) |

---

## Testing the Flow (Simulation Mode)

1. **Enable Simulation:**
   ```bash
   # In .env.local
   VITE_PAYMENT_MODE=simulation
   ```

2. **Place Test Order:**
   - Add items to cart
   - Checkout with delivery
   - Use test phone: `+260971234567`
   - Payment is simulated

3. **Check Order Created:**
   - View in Customer Dashboard
   - Should show "pending" verification status

4. **Simulate WhatsApp Message:**
   - Backend would send message (skip in simulation)
   - Manually navigate to `/deliveryVerification`

5. **Test WhatsApp Button:**
   - Click "Share Location via WhatsApp"
   - Should open WhatsApp web/app with pre-filled message

6. **Admin Actions:**
   - Log into Django admin (when backend ready)
   - Update `delivery_address_note`
   - Change status to 'verified'

---

## Future Enhancements

### Phase 2: Semi-Automation
- Yango API integration for automatic driver assignment
- Automatic status updates when driver accepts
- SMS notifications instead of just WhatsApp

### Phase 3: Full Integration
- Real-time driver tracking
- In-app delivery status updates
- Automatic `driver_plate_number` population via Yango API

### Phase 4: Scale
- Multi-courier support (Yango + others)
- AI-powered address parsing from WhatsApp pins
- Batch processing optimization

---

## Troubleshooting

### Issue: Recipient doesn't receive WhatsApp message
**Solution:** 
- Verify Twilio WhatsApp template is approved
- Check `recipient_phone` format (+260XXXXXXXXX)
- Ensure Twilio account has WhatsApp enabled

### Issue: Location pin unclear
**Solution:**
- Admin can request clarification via WhatsApp
- Use Google Maps satellite view
- Call recipient directly

### Issue: Shop can't see driver info
**Solution:**
- Verify `driver_plate_number` is populated in database
- Check shop portal is fetching latest order data
- Ensure shop is viewing correct order

---

## ROI & Benefits

- **Reduced Development Time:** No custom GPS tracking needed
- **Lower Infrastructure Costs:** Leverages Yango's existing platform
- **Faster Time to Market:** Can launch with basic WhatsApp flow
- **Scalable:** Manual process works for 1-100 orders/day
- **Flexible:** Easy to pivot to different courier partners

---

**Last Updated:** 2026-01-06  
**Version:** 1.0 (Wizard of Oz MVP)
