/**
 * @file userService.ts
 * @description User profile management service
 * Handles CRUD operations for user profiles in Firestore
 */

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '../config/api.config';
import { UserProfile } from '../contexts/AuthContext';

/**
 * @desc Get user profile by ID
 */
export async function getUserById(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? (userSnap.data() as UserProfile) : null;
}

/**
 * @desc Get user profile by email
 */
export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const usersRef = collection(db, COLLECTIONS.USERS);
  const q = query(usersRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;
  return querySnapshot.docs[0].data() as UserProfile;
}

/**
 * @desc Update user profile
 */
export async function updateUser(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, updates);
}

/**
 * @desc Link user to shop (for shop owners)
 */
export async function linkUserToShop(userId: string, shopId: string): Promise<void> {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, { shopId, role: 'shop' });
}

/**
 * @desc Get all users by role
 */
export async function getUsersByRole(role: 'customer' | 'shop' | 'admin'): Promise<UserProfile[]> {
  const usersRef = collection(db, COLLECTIONS.USERS);
  const q = query(usersRef, where('role', '==', role));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as UserProfile);
}

/**
 * @desc Add address to user profile
 */
export async function addUserAddress(userId: string, address: {
  label: string;
  street: string;
  city: string;
  country: string;
  isDefault?: boolean;
}): Promise<void> {
  const user = await getUserById(userId);
  if (!user) throw new Error('User not found');

  const addresses = user.addresses || [];

  // If this is default, unset other defaults
  if (address.isDefault) {
    addresses.forEach(a => a.isDefault = false);
  }

  addresses.push({
    id: `addr_${Date.now()}`,
    ...address,
    isDefault: address.isDefault || addresses.length === 0,
  });

  await updateUser(userId, { addresses });
}

/**
 * @desc Remove address from user profile
 */
export async function removeUserAddress(userId: string, addressId: string): Promise<void> {
  const user = await getUserById(userId);
  if (!user) throw new Error('User not found');

  const addresses = (user.addresses || []).filter((a: any) => a.id !== addressId);
  await updateUser(userId, { addresses });
}
