# KithLy Project: Next Steps

This document outlines the immediate actions required to get the application running with a live backend, as well as the future roadmap for features that are currently mocked.

## Immediate Actions

These are the first steps the technical team should take to transition the project from its current mocked state to a production-ready application.

### 1. Downgrade React to v18 (If Necessary)

During development, some dependencies showed better compatibility with React 18. If you encounter issues with `npm install` or `npm start`, downgrade React:

```bash
npm install react@^18.2.0 react-dom@^18.2.0
```

### 2. Implement the Real Backend Service

-   Create a new file: `src/services/firebaseReal.ts`.
-   This file should export a `db` and `notify` object that conforms to the `ServiceContextType` interface defined in `src/context/ServiceContext.tsx`.
-   Use the Firebase JS SDK (`firebase/firestore`, `firebase/auth`) to implement the methods for data fetching and manipulation.

### 3. Swap the Stub Service for the Real Service

In `src/context/ServiceProvider.tsx`, you will find a commented-out line. The goal is to be able to switch between the mock and the real service.

```typescript
// In ServiceProvider.tsx

// import { db as mockDB } from '../services/firebaseStub';
import { db as realDB } from '../services/firebaseReal'; // Import your new service

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Logic to switch between them, e.g., using an environment variable
  const useRealBackend = process.env.NODE_ENV === 'production';

  const services = useMemo(() => ({
    db: useRealBackend ? realDB : mockDB,
    notify: useRealBackend ? realNotify : mockNotify // Assuming a real notify service
  }), [useRealBackend]);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};
```

### 4. Set Up Vercel Environment Variables

To manage the switch between the mock and real services, and to store sensitive information, you should use environment variables.

-   Create a `.env.local` file in the root of the `kithLy` project for local development.
-   In your Vercel project settings, add the following environment variables:
    -   `VITE_FIREBASE_API_KEY`: Your Firebase project's API key.
    -   `VITE_FIREBASE_AUTH_DOMAIN`: Your Firebase project's auth domain.
    -   `VITE_FIREBASE_PROJECT_ID`: Your Firebase project's ID.
    -   `VITE_USE_MOCK_DB`: Set to `false` in production to use the real backend.

## Future Roadmap

The following features are currently mocked in the frontend and will require backend logic to be fully implemented.

-   **Authentication:**
    -   Implement user registration and login using Firebase Authentication.
    -   Create protected routes for the customer and shop dashboards.

-   **"Proof of Joy" Photo Storage:**
    -   The concept of customers uploading a photo as "proof of joy" will require Firebase Storage.
    -   Implement a secure way for users to upload images and associate them with an order.

-   **SMS Notifications:**
    -   The `notify.sendSMS` function is currently a stub.
    -   Integrate a real SMS gateway like **Twilio** or **Africa's Talking**. This will likely require a Firebase Function to securely handle the API keys and send the SMS.

-   **Payment Gateway Integration:**
    -   The checkout process is currently simulated.
    -   Integrate a payment gateway (e.g., Stripe, Paystack) to handle real transactions. This will also require a secure, server-side implementation.

-   **Shop & Product Management:**
    -   Build out the UI and backend logic for shop owners to add, edit, and delete their products.
    -   Implement inventory management (e.g., decrementing stock after a purchase).

-   **Search & Filtering:**
    -   The current search is a simple client-side filter.
    -   For a large number of products, you'll need a more robust search solution like Algolia or Elasticsearch, or use Firestore's native indexing capabilities.
