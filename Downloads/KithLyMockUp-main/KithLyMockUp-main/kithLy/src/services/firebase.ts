/**
 * @desc Firebase configuration and initialization for KithLy
 * @todo Replace with real Firebase configuration when ready to connect backend
 */

// Mock Firebase auth object
export const auth = {
  currentUser: null,
  // Add other auth methods as needed for your app
};

// Re-export the database stub
export { db } from './firebaseStub';
