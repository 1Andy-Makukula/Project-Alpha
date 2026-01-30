# KithLy Concierge & Delivery Workflow Guide

## Overview
This document details the "KithLy Concierge" delivery model, a manual dispatch system designed to facilitate doorstep deliveries in the KithLy Marketplace. This model operates on an arbitrage basis, where KithLy charges a premium delivery fee and manages the dispatch manually via third-party couriers (e.g., Yango), retaining the profit margin.

## 🔄 The Workflow Loop

### 1. Sender Experience (Checkout)
- **Luxury Toggle:** On the checkout page, the sender can choose between "Store Pickup" (Free) and "Doorstep Delivery" (Premium).
- **Zone-Based Pricing:** If delivery is selected, the system calculates a fee based on the distance from the shop to the delivery zone (Zone A, B, or C).
- **Payment:** The total (Item Price + Delivery Fee) is paid upfront.

### 2. Shop Experience (Merchant Portal)
- **Order Notification:** The shop receives the order with a status of `paid`.
- **Preparation:** The shop prepares the item.
- **Ready for Dispatch:**
    - If it's a **Pickup** order, the shop waits for the recipient to show the collection code.
    - If it's a **Delivery** order, the shop clicks "Ready for Dispatch".
    - **Validation:** The system prevents dispatch until the recipient has pinned their location (see below).
- **Handover:** Once a driver arrives, the shop clicks "Confirm Handover to Driver" to update the status to `dispatched`.

### 3. Recipient Experience (Pin Location)
- **Notification:** The recipient receives a WhatsApp message (simulated) with a link to pin their location.
- **Pinning Interface:**
    - The recipient opens the link (simulated via "Debug Open Pin Page" button on Order Success or via WhatsApp link).
    - They drag a map marker to their exact location.
    - They add specific notes (e.g., "Green gate, call when outside").
- **Confirmation:** Submitting this updates the order with `deliveryCoordinates` and `deliveryNotes`.

### 4. Admin/Dispatcher Experience (Simulated)
- **Role:** The "KithLy Dispatcher" (Admin) monitors orders marked `ready_for_dispatch`.
- **Booking:** The Admin manually books a ride (e.g., Yango) using the pinned coordinates.
- **Assignment:** The Admin assigns the driver details (Name, Car, Plate) to the order.
- **Dispatch:** The order status moves to `dispatched`.

### 5. Final Delivery
- **Tracking:** The Sender sees the driver details and status "Driver En Route" on their dashboard.
- **Completion:** Once delivered, the order is marked as `collected` (manually or via driver confirmation).

## 🧩 Technical Implementation

### Key Components
- **`CheckoutPage.tsx`:** Handles the delivery toggle and fee calculation.
- **`OrderSuccessPage.tsx`:** Displays the appropriate status (Collection Code vs. Delivery Info) and provides the "Pin Location" link.
- **`PinLocationPage.tsx`:** A dedicated page using `react-leaflet` for capturing coordinates.
- **`ShopPortal.tsx`:** Manages the shop's view, including the "Ready for Dispatch" validation and handover logic.
- **`CustomerDashboard.tsx`:** Displays order history, including driver details for dispatched orders.
- **`App.tsx`:** Central state management for `orders`, `activeOrderId`, and `handleUpdateOrder`.

### Data Model Updates (`Order` Interface)
```typescript
interface Order {
  // ... existing fields
  deliveryMethod: 'pickup' | 'delivery';
  deliveryFee: number;
  deliveryZone?: 'Zone A' | 'Zone B' | 'Zone C';
  deliveryCoordinates?: { lat: number; lng: number };
  deliveryNotes?: string;
  driverDetails?: {
    name: string;
    carModel: string;
    plateNumber: string;
    phone: string;
  };
  status: 'paid' | 'ready_for_dispatch' | 'dispatched' | 'collected';
}
```

### Icons Used
- `CarIcon`: For delivery status and driver details.
- `MapPinIcon`: For the location pinning interface.
- `StoreIcon`: For the pickup option.

## 🧪 Testing the Loop
1. **Create Order:** Go to Checkout, select "Doorstep Delivery", and pay.
2. **Pin Location:** On the Success Page, click "(Debug) Open Pin Page". Pin a location and confirm.
3. **Shop Dispatch:** Go to Shop Portal. Find the order. Click "Ready for Dispatch".
4. **Assign Driver:** (Simulated) The system automatically assigns a driver and moves status to `dispatched`.
5. **Verify:** Go to Customer Dashboard. Verify the order shows "Driver En Route" and displays driver details.
