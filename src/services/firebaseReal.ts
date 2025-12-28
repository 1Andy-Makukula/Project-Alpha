
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot
} from 'firebase/firestore';
import { app } from './firebaseConfig';
import { Order, Product, Shop, User } from '../types';

const firestore = getFirestore(app);

export const db = {
    orders: {
        getAll: async (): Promise<Order[]> => {
            const q = query(collection(firestore, 'orders'), orderBy('paidOn', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        },
        get: async (collectionCode: string): Promise<Order | null> => {
            const q = query(collection(firestore, 'orders'), where('collectionCode', '==', collectionCode));
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() } as Order;
        },
        create: async (newOrder: Order): Promise<Order> => {
            const docRef = await addDoc(collection(firestore, 'orders'), newOrder);
            return { ...newOrder, id: docRef.id };
        },
        verifyAndCollect: async (orderId: string, method: 'scan' | 'manual'): Promise<boolean> => {
            const orderRef = doc(firestore, 'orders', orderId);
            const orderSnap = await getDoc(orderRef);

            if (orderSnap.exists()) {
                const orderData = orderSnap.data() as Order;
                if (orderData.status === 'paid') {
                    await updateDoc(orderRef, {
                        status: 'collected',
                        collectedOn: new Date().toISOString(),
                        verificationMethod: method
                    });
                    return true;
                }
            }
            return false;
        },
        // Real-time listener
        subscribe: (callback: (orders: Order[]) => void) => {
            const q = query(collection(firestore, 'orders'), orderBy('paidOn', 'desc'));
            return onSnapshot(q, (snapshot) => {
                const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
                callback(orders);
            });
        }
    },
    products: {
        getAll: async (shopId?: number): Promise<Product[]> => {
            let q = collection(firestore, 'products');
            if (shopId) {
                // @ts-ignore
                q = query(q, where('shopId', '==', shopId));
            }
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: parseInt(doc.id) || Math.random(), ...doc.data() } as Product));
        },
        add: async (product: Product): Promise<Product> => {
            const docRef = await addDoc(collection(firestore, 'products'), product);
            return { ...product, id: parseInt(docRef.id) || Math.floor(Math.random() * 10000) };
        },
        delete: async (productId: number): Promise<void> => {
            // This assumes product IDs are stored as document IDs or we need to query by field 'id'
            // For simplicity, assuming document ID match or we query first.
            // Since we used random number for IDs in mock, this part is tricky in transition.
            // I'll assume we can delete by query.
            const q = query(collection(firestore, 'products'), where('id', '==', productId));
            const snapshot = await getDocs(q);
            snapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
        }
    },
    // Missing CRUD Operations
    users: {
        get: async (userId: string): Promise<User | null> => {
            const docRef = doc(firestore, 'users', userId);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as User : null;
        },
        create: async (userId: string, data: any) => {
             await updateDoc(doc(firestore, 'users', userId), data); // Assuming user doc created by auth trigger or we use setDoc
        },
        update: async (userId: string, data: any) => {
            await updateDoc(doc(firestore, 'users', userId), data);
        }
    },
    shops: {
        getAll: async (): Promise<Shop[]> => {
            const snapshot = await getDocs(collection(firestore, 'shops'));
            return snapshot.docs.map(doc => ({ id: parseInt(doc.id) || Math.random(), ...doc.data() } as Shop));
        },
        get: async (shopId: number): Promise<Shop | null> => {
            const q = query(collection(firestore, 'shops'), where('id', '==', shopId));
            const snapshot = await getDocs(q);
            return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as unknown as Shop;
        },
        create: async (shop: Shop) => {
            await addDoc(collection(firestore, 'shops'), shop);
        }
    },
    reviews: {
        add: async (review: any) => {
            await addDoc(collection(firestore, 'reviews'), review);
        },
        getByProduct: async (productId: number) => {
             const q = query(collection(firestore, 'reviews'), where('productId', '==', productId));
             const snapshot = await getDocs(q);
             return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    },
    notifications: {
        getAll: async (userId: string) => {
            const q = query(collection(firestore, 'notifications'), where('userId', '==', userId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    }
};
