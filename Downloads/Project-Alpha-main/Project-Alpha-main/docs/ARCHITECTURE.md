# KithLy Frontend Architecture

## High-Level Overview

This document outlines the frontend architecture of the KithLy application. The primary goal of this architecture is to decouple the UI from the backend services, allowing for parallel development and easier maintenance. We achieve this through a **Service Layer Pattern**.

**The pattern consists of three main parts:**

1.  **UI Components (Pages & Components):** These are the React components that the user interacts with. They are responsible for rendering the UI and capturing user input. They should be as "dumb" as possible, meaning they don't contain business logic.
2.  **Service Context (`ServiceContext.tsx`):** This is a React Context that provides a consistent API for the UI components to interact with the backend. It acts as a single source of truth for all backend-related functions (e.g., fetching data, creating orders).
3.  **Service Implementation (`firebaseStub.ts` / `firebaseReal.ts`):** This is where the actual backend logic resides. We started with a `firebaseStub.ts` that mocks the backend using `localStorage`. This allows the UI to be developed and tested without a live backend. The backend team's primary task is to create a `firebaseReal.ts` that implements the same interface but with real Firebase calls.

## Data Flow Diagram

The data flow in the application is unidirectional, which makes it easier to reason about and debug.

```
[Firebase/Backend] <--> [Service Implementation (e.g., firebaseReal.ts)]
        ^
        | (Data exchange)
        v
[Service Context (ServiceContext.tsx)]
        ^
        | (Provides services via custom hook `useServices`)
        v
[App.tsx (Main state management)]
        ^
        | (Props drilling)
        v
[Page Components (e.g., CustomerPortal.tsx)]
        ^
        | (Props drilling)
        v
[UI Components (e.g., ProductCard.tsx)]
```

-   **`App.tsx`** is the root component that holds the main application state (e.g., `cart`, `orders`, `currentView`).
-   Data is fetched from the **Service Layer** in `App.tsx` and then passed down to child components via props.
-   User actions in **UI Components** trigger functions that are passed down from `App.tsx`. These functions then call the **Service Layer** to update the data.

## Tech Stack

-   **React 18:** The core UI library. (Note: We've noted that a downgrade to v18 may be required for full compatibility with some dependencies).
-   **TypeScript:** For static typing and improved developer experience.
-   **Tailwind CSS:** For utility-first styling.
-   **Vite:** As the build tool and development server.
-   **JSDoc:** For inline documentation and code clarity.

## Key Decisions

-   **Using a "Stub" Service:** The decision to use a `firebaseStub.ts` was made to accelerate frontend development. It allowed the UI team to build and test the entire application's functionality without waiting for the backend to be completed. This approach also provides a clear "contract" for the backend team to follow, as defined in `ServiceContext.tsx`.
-   **Centralized State in `App.tsx`:** For this stage of the project, we opted to keep the global state in the `App.tsx` component using React's built-in hooks (`useState`, `useMemo`). This avoids the need for a third-party state management library (like Redux or Zustand) and simplifies the data flow. As the application grows, this state can be refactored into more granular contexts or a dedicated state management solution.
-   **Client-Side Routing:** The application uses a simple state-based routing system managed in `App.tsx`. This is sufficient for the current needs of the application and avoids the complexity of a full routing library like React Router.
