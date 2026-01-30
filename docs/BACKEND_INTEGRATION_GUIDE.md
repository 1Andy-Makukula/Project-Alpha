# KithLy Backend Integration Guide

This document outlines the backend requirements, data models, and API endpoints necessary to support the KithLy frontend application, specifically focusing on the "KithLy Concierge" delivery model and the "Vusi Cash Flow" logic.

## 1. Core Concepts & Workflows

### 1.1. The "KithLy Concierge" Model
*   **Arbitrage Model:** KithLy charges the customer a premium delivery fee (e.g., K150) upfront but pays the courier (Yango) a lower rate (e.g., K80-K100) later.
*   **Manual Dispatch:** The initial phase relies on a manual dispatch process where an Admin books the ride. The backend must support this "human-in-the-loop" workflow.
*   **Roles:**
    *   **Customer (Sender):** Places order, pays premium delivery fee.
    *   **Recipient:** Receives gift, pins location via link.
    *   **Shop:** Prepares order, marks as "Ready", hands over to driver.
    *   **Admin (KithLy HQ):** Receives "Ready" notification, books Yango, inputs driver details.
    *   **Driver:** Physical courier (managed via Admin).

### 1.2. Order Status Flow
The `status` field in the `Order` model is critical.
1.  `paid`: Customer has paid. Order is active.
2.  `ready_for_dispatch`: Shop has prepared items and clicked "Ready for Dispatch". **(Trigger for Admin Notification)**
3.  `dispatched`: Admin has assigned a driver. Driver details are now visible to Shop and Customer.
4.  `collected`:
    *   **Pickup:** Customer scanned QR code at shop.
    *   **Delivery:** Shop clicked "Confirm Handover" after verifying driver.

## 2. Data Models

### 2.1. Order
```typescript
interface Order {
  id: string; // UUID
  shopId: number;
  customerId: string; // UUID
  recipient: {
    name: string;
    phone: string;
    email: string;
  };
  items: OrderItem[];
  total: number;
  deliveryFee: number; // New field for zone-based fee
  deliveryMethod: 'pickup' | 'delivery';
  status: 'paid' | 'ready_for_dispatch' | 'dispatched' | 'collected';

  // Delivery Specifics
  deliveryZone?: 'A' | 'B' | 'C';
  deliveryCoordinates?: { lat: number; lng: number }; // From PinLocationPage
  deliveryNotes?: string; // "Green gate, behind school"

  // Driver Details (Populated by Admin)
  driverDetails?: {
    name: string;
    carModel: string;
    plateNumber: string;
    phone: string;
  };

  // Verification
  collectionCode: string; // 6-digit code
  verificationMethod?: 'scan' | 'manual';

  timestamps: {
    created: Date;
    paid: Date;
    ready: Date;
    dispatched: Date;
    collected: Date;
  };
}
```

### 2.2. Shop
```typescript
interface Shop {
  id: number;
  name: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  // ... other existing fields
}
```

## 3. API Endpoints

### 3.1. Customer APIs
*   `POST /api/orders`: Create a new order.
    *   **Payload:** Cart items, recipient details, delivery method (`pickup` | `delivery`), payment token.
    *   **Logic:** Calculate total + delivery fee. If delivery, trigger "Pin Location" link generation (e.g., via WhatsApp API).
*   `GET /api/orders/:id`: Get order details (for tracking).
*   `POST /api/orders/:id/pin-location`: Update delivery coordinates and notes.
    *   **Payload:** `{ lat, lng, notes }`
    *   **Trigger:** Notify Admin that location is set (if order is ready).

### 3.2. Shop APIs
*   `GET /api/shop/:id/orders`: List active orders.
*   `POST /api/orders/:id/ready`: Mark order as "Ready for Dispatch".
    *   **Action:** Update status to `ready_for_dispatch`.
    *   **Notification:** Send alert to Admin Dashboard (Email/SMS/Push).
*   `POST /api/orders/:id/handover`: Confirm handover to driver.
    *   **Action:** Update status to `collected`.
    *   **Validation:** Ensure status was `dispatched`.

### 3.3. Admin APIs (Internal)
*   `GET /api/admin/dispatch-queue`: List orders with status `ready_for_dispatch`.
*   `POST /api/admin/orders/:id/assign-driver`: Assign Yango driver.
    *   **Payload:** `{ driverName, carModel, plateNumber, phone }`
    *   **Action:** Update status to `dispatched`.
    *   **Notification:** Send "Driver En Route" notification to Shop (Tablet) and Recipient (WhatsApp).

## 4. Third-Party Integrations

### 4.1. WhatsApp (Twilio / Meta API)
*   **Trigger:** Order Payment Success (Delivery).
*   **Message:** "Hi [Recipient], [Sender] sent you a gift! Pin your location here: [Link]"
*   **Link:** `https://kithly.com/pin-location?orderId={uuid}`

### 4.2. Payments (Flutterwave)
*   Ensure `deliveryFee` is captured as a separate line item for accounting (Vusi Cash Flow).

## 5. Frontend Integration Points

### 5.1. Pin Location Page
*   **Current State:** Standalone page `PinLocationPage.tsx`.
*   **Integration:** Needs to read `orderId` from URL params and `POST` to `/api/orders/:id/pin-location`.

### 5.2. Shop Portal
*   **Current State:** Simulates Admin dispatch via modal.
*   **Integration:**
    *   Remove "Admin Simulation" button.
    *   Connect "Ready for Dispatch" button to `/api/orders/:id/ready`.
    *   Listen for websocket/polling updates for `driverDetails` to appear.

### 5.3. Checkout
*   **Current State:** Calculates Zone fee locally.
*   **Integration:** Fetch dynamic zone pricing from backend if needed (e.g., `GET /api/delivery-zones`).

## 6. Security Considerations
*   **Shop Tablet:** Ensure session persistence but restrict access to Shop-specific data.
*   **Admin Panel:** Strict RBAC. Only "Dispatchers" can assign drivers.
*   **Public Links:** The "Pin Location" link should be signed or use a temporary token to prevent unauthorized access to order details.
