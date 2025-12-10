# KithLy Backend Integration Guide

This guide provides the backend team with all the necessary information to connect a real Firebase backend to the KithLy frontend.

## 1. Interface Contracts

The frontend is built against a specific service contract defined in `src/context/ServiceContext.tsx`. Your backend implementation **must** adhere to this interface.

### Main Service Interface (`ServiceContextType`)

This is the top-level interface that the frontend's `useServices()` hook provides to the components.

```typescript
interface ServiceContextType {
  db: {
    orders: {
      getAll: () => Promise<Order[]>;
      create: (order: Order) => Promise<Order>;
      verifyAndCollect: (orderId: string, method: 'scan' | 'manual') => Promise<boolean>;
    };
    products: {
      getAll: (shopId?: number) => Promise<Product[]>;
      add: (product: Product) => Promise<Product>;
      delete: (productId: number) => Promise<void>;
    };
  };
  notify: {
    sendSMS: (phone: string, code: string, shopName: string) => void;
  };
}
```

-   **`db.orders`**: Handles all database operations related to orders.
-   **`db.products`**: Handles product management.
-   **`notify.sendSMS`**: An abstraction for sending SMS messages.

## 2. Proposed Firebase Schema (Firestore)

Based on the data structures in `src/types/index.ts`, we propose the following Firestore collection structure.

### `users`

-   **Path:** `/users/{userId}`
-   **Description:** Stores public user information.
-   **Schema:**
    ```json
    {
      "uid": "string",
      "displayName": "string",
      "email": "string",
      "avatarUrl": "string",
      "userType": "'customer' | 'shop'",
      "createdAt": "Timestamp"
    }
    ```

### `shops`

-   **Path:** `/shops/{shopId}`
-   **Description:** Stores information about each shop.
-   **Schema:** (Corresponds to the `Shop` interface)
    ```json
    {
      "name": "string",
      "description": "string",
      "profilePic": "string",
      "coverImg": "string",
      "category": "string",
      "location": "string",
      "isVerified": "boolean",
      "rating": "number",
      "tier": "'Select' | 'Verified' | 'Independent'",
      "ownerId": "string" // FK to users collection
    }
    ```

### `products`

-   **Path:** `/products/{productId}`
-   **Description:** Stores all products.
-   **Schema:** (Corresponds to the `Product` interface)
    ```json
    {
      "name": "string",
      "price": "number",
      "image": "string",
      "category": "string",
      "stock": "number",
      "description": "string",
      "shopId": "string" // FK to shops collection
    }
    ```

### `orders`

-   **Path:** `/orders/{orderId}`
-   **Description:** Stores customer orders.
-   **Schema:** (Corresponds to the `Order` interface)
    ```json
    {
      "customerId": "string", // FK to users collection
      "shopId": "string", // FK to shops collection
      "paidOn": "Timestamp",
      "collectedOn": "Timestamp | null",
      "total": "number",
      "status": "'paid' | 'collected'",
      "collectionCode": "string",
      "items": "Array<object>"
    }
    ```

## 3. Draft of `firestore.rules`

Here is a draft of Firestore security rules to get you started. These are not exhaustive and should be reviewed for security best practices.

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read their own data, but not write to it (for now).
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if false; // Writes should be handled by a backend function.
    }

    // Shops and products are publicly readable.
    match /shops/{shopId} {
      allow read: if true;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'shop';
    }

    match /products/{productId} {
      allow read: if true;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'shop';
    }

    // Orders can only be read by the customer or the shop owner.
    match /orders/{orderId} {
      allow read: if request.auth.uid == resource.data.customerId ||
                   get(/databases/$(database)/documents/shops/$(resource.data.shopId)).data.ownerId == request.auth.uid;
      allow create: if request.auth.uid == request.resource.data.customerId;
      allow update: if get(/databases/$(database)/documents/shops/$(resource.data.shopId)).data.ownerId == request.auth.uid;
    }
  }
}
```
