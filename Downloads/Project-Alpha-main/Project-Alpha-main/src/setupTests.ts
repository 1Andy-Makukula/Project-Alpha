
import '@testing-library/jest-dom';

// Mock import.meta.env
Object.defineProperty(global, 'import', {
    value: {
        meta: {
            env: {
                VITE_FLUTTERWAVE_PUBLIC_KEY: 'test-key',
                VITE_FIREBASE_API_KEY: 'test-key',
                // Add other env vars as needed
            }
        }
    }
});
