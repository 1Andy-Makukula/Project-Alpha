
import { Order } from '../components/OrderCard';
import { Product } from '../App';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export const auth = getAuth(app);

export const db = {
  orders: {
    getAll: async (): Promise<Order[]> => {
      const q = query(collection(firestore, 'orders'));
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });
      return orders;
    },

    create: async (newOrder: Omit<Order, 'id' | 'collectionCode'>): Promise<Order> => {
      const docRef = await addDoc(collection(firestore, 'orders'), newOrder);
      return { ...newOrder, id: docRef.id, collectionCode: '' };
    },

    verifyAndCollect: async (orderId: string, method: 'scan' | 'manual'): Promise<boolean> => {
        try {
            const orderRef = doc(firestore, 'orders', orderId);
            await updateDoc(orderRef, {
                status: 'collected',
                collectedOn: new Date().toISOString(),
                verificationMethod: method,
            });
            return true;
        } catch (error) {
            console.error("Error updating order: ", error);
            return false;
        }
    }
  },

  products: {
    getAll: async (shopId?: number): Promise<Product[]> => {
      const q = query(collection(firestore, 'products'));
      const querySnapshot = await getDocs(q);
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });
      return products;
    },

    add: async (product: Product): Promise<Product> => {
      const docRef = await addDoc(collection(firestore, 'products'), product);
      return { ...product, id: docRef.id };
    },

    delete: async (productId: string): Promise<void> => {
        try {
            const productRef = doc(firestore, 'products', productId);
            await updateDoc(productRef, {
                deleted: true
            });
        } catch(error) {
            console.error("Error deleting product", error);
        }
    }
  }
};
