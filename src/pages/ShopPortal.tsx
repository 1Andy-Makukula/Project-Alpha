
import React, { useState, ChangeEvent, useMemo, useRef, useEffect } from 'react';
import { db } from '../services/firebase';
import { View, ShopTier } from '../types';
import { AnalysisIcon, ProductsIcon, OrdersIcon, QRIcon, SettingsIcon, LogoutIcon, UserIcon, TrendingUpIcon, DollarIcon, ReceiptIcon, DocumentTextIcon, CheckCircleIcon, HistoryIcon, PackageIcon, ExclamationTriangleIcon, CameraIcon, KeyboardIcon, BellIcon, LockClosedIcon, ChevronLeftIcon, ChevronRightIcon, PlusCircleIcon, TrashIcon, CreditCardIcon, ClockIcon, PhotoIcon, HelpCircleIcon } from '../components/icons/NavigationIcons';
import { StarIcon } from '../components/icons/FeatureIcons';
import { BrandLogo } from '../components/icons/BrandLogo';
import { AirtelIcon, MtnIcon, ZamtelIcon, VisaIcon, MastercardIcon } from '../components/icons/BrandIcons';
import Button from '../components/Button';
import AnimatedNumber from '../components/AnimatedNumber';
import ProductManagementCard from '../components/ProductManagementCard';
import OrderCard, { Order } from '../components/OrderCard';
import { generateReceipt } from '../utils/receiptGenerator';
import AnimatedBackButton from '../components/AnimatedBackButton';
import { calculateShopAnalytics, formatCurrency, formatPercentage } from '../services/analyticsService';
import AnalyticsCard from '../components/AnalyticsCard';
import RevenueChart from '../components/RevenueChart';
import PerformanceDashboard from '../components/PerformanceDashboard';

interface ShopPortalProps {
    setView: (view: View) => void;
    orders: Order[];
    onMarkAsCollected: (orderId: string, method: 'scan' | 'manual') => void;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    walletStats: { pending: number; available: number; totalOrders: number };
    notifications: any[];
    onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
}

type Menu = 'analysis' | 'products' | 'orders' | 'scan' | 'settings';

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
    stock: number;
}

interface DeletedProduct extends Product {
    deletedAt: Date;
}

interface ShopPayoutMethod {
    id: number;
    type: 'bank' | 'mobile_money' | 'card';
    provider: string;
    accountName: string;
    accountNumber: string;
    bankName?: string;
    expiry?: string;
}

interface ShopNotification {
    id: number;
    date: string;
    time: string;
    message: string;
    productId?: number; // For quick actions
    actionType?: 'restock' | 'review';
    rating?: number;
    author?: string;
}

const mockProducts: Product[] = [
    { id: 101, name: "Fresh Produce Box", price: 650.00, image: "https://picsum.photos/id/1080/400/400", category: "Produce", stock: 30 },
    { id: 102, name: "Imported Rice (5kg)", price: 400.00, image: "https://picsum.photos/id/292/400/400", category: "Pantry", stock: 8 },
    { id: 103, name: "Cooking Oil (1L)", price: 230.00, image: "https://picsum.photos/id/326/400/400", category: "Pantry", stock: 0 },
    { id: 104, name: "Artisanal Bread Loaf", price: 130.00, image: "https://picsum.photos/id/184/400/400", category: "Bakery", stock: 15 },
];

const initialNotificationHistory: ShopNotification[] = [
    { id: 0, date: 'Today', time: 'Just Now', message: 'My family loved the gift! ❤️', actionType: 'review', rating: 5, author: 'Michael O.' },
    { id: 1, date: '2024-10-24', time: '10:05', message: 'New order #KLY-8ADG4 received.' },
    { id: 2, date: '2024-10-23', time: '15:30', message: 'Weekly payout of ZMK 4,500.00 processed.' },
    { id: 3, date: '2024-10-22', time: '08:00', message: 'Low stock alert for "Imported Rice (5kg)".', productId: 102, actionType: 'restock' },
];

const mockPayoutMethods: ShopPayoutMethod[] = [
    { id: 1, type: 'bank', provider: 'bank', bankName: 'First National Bank', accountName: 'Mama\'s Kitchen Ltd', accountNumber: '**** 1234' },
    { id: 2, type: 'mobile_money', provider: 'mtn', accountName: 'Jane Doe', accountNumber: '096 555 0000' },
];

const initialProductFormState: Omit<Product, 'id'> = {
    name: '',
    price: 0,
    category: '',
    image: '',
    stock: 0,
};

// Helper to render the status card in Settings
const renderTierStatus = (tier: ShopTier) => {
    const descriptions = {
        'Select': "You are a Top Rated Partner. You enjoy premium placement and zero fees.",
        'Verified': "You are a Verified Business. Customers trust your legal status.",
        'Independent': "You are a Verified Individual Creator. Customers love your unique personal touch.",
        'Sandbox': "Your account is under review. Please complete verification to get a Badge."
    };

    const colors = {
        'Select': 'bg-yellow-50 border-yellow-200 text-yellow-800',
        'Verified': 'bg-blue-50 border-blue-200 text-blue-800',
        'Independent': 'bg-emerald-50 border-emerald-200 text-emerald-800',
        'Sandbox': 'bg-gray-50 border-gray-200 text-gray-800',
    };

    return (
        <div className={`p-6 rounded-xl border ${colors[tier]} mb-8`}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold flex items-center">
                    <span className="mr-2">Badge Status:</span>
                    <span className="uppercase tracking-wider">{tier}</span>
                </h3>
                {tier === 'Select' && <StarIcon className="w-6 h-6 text-yellow-500 fill-current" />}
            </div>
            <p className="text-sm opacity-90">
                {descriptions[tier]}
            </p>
        </div>
    );
};

const ShopPortal: React.FC<ShopPortalProps> = ({ setView, orders, onMarkAsCollected, showToast, walletStats, notifications: incomingNotifications, onUpdateOrder }) => {
    // MOCK: In reality, this comes from the user's profile context
    const currentShopTier: ShopTier = 'Select';

    const [activeMenu, setActiveMenu] = useState<Menu>('analysis');
    const [isCollapsed, setIsCollapsed] = useState(false); // Desktop

    // State for the settings form
    const [activeSettingsTab, setActiveSettingsTab] = useState('shopInfo');
    const [shopProfile, setShopProfile] = useState({
        name: "Mama's Kitchen",
        description: "Authentic home-cooked meals and groceries. We bring the taste of home to your loved ones, with fresh ingredients and traditional recipes passed down through generations.",
        profilePic: "https://picsum.photos/id/40/200/200",
        coverPhoto: "https://picsum.photos/id/1060/800/400",
        openTime: "08:00",
        closeTime: "18:00"
    });

    const [payoutMethods, setPayoutMethods] = useState<ShopPayoutMethod[]>(mockPayoutMethods);
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
    const [isDeletePayoutModalOpen, setIsDeletePayoutModalOpen] = useState(false);
    const [payoutMethodToDelete, setPayoutMethodToDelete] = useState<ShopPayoutMethod | null>(null);

    const [passwordFields, setPasswordFields] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(shopProfile.profilePic);
    const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(shopProfile.coverPhoto);

    // State for Products CRUD
    const [products, setProducts] = useState<Product[]>([]);
    const [deletedProducts, setDeletedProducts] = useState<DeletedProduct[]>([]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productModalMode, setProductModalMode] = useState<'add' | 'edit'>('add');
    const [currentProduct, setCurrentProduct] = useState<Omit<Product, 'id'> | Product>(initialProductFormState);
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);

    // State for Notifications
    const [notifications, setNotifications] = useState<ShopNotification[]>(initialNotificationHistory);
    const hasCheckedStock = useRef(false);

    useEffect(() => {
        const loadProducts = async () => {
             try {
                const fetchedProducts = await db.products.getAll();
                setProducts(fetchedProducts as Product[]);
             } catch(e) {
                showToast("Failed to load products", "error");
             }
        };
        loadProducts();
    }, []);

    useEffect(() => {
        if (incomingNotifications && incomingNotifications.length > 0) {
            setNotifications(prev => {
                const existingIds = new Set(prev.map(n => n.id));
                const newNotifs = incomingNotifications.filter((n: any) => !existingIds.has(n.id)) as ShopNotification[];
                return [...newNotifs, ...prev];
            });
        }
    }, [incomingNotifications]);

    // State for Orders page
    const [activeOrderTab, setActiveOrderTab] = useState<'pickup' | 'history' | 'requests'>('pickup');
    const [isDemoMode, setIsDemoMode] = useState(false); // Demo Mode State

    // State for QR Scan page
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'manual' | 'success' | 'error'>('idle');
    const [verifiedOrder, setVerifiedOrder] = useState<Order | null>(null);
    const [manualCode, setManualCode] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isManualWarningOpen, setIsManualWarningOpen] = useState(false);

    // NEW STATE: Proof of Joy
    const [currentVerificationMethod, setCurrentVerificationMethod] = useState<'scan' | 'manual'>('scan');
    const [isProofOfJoyModalOpen, setIsProofOfJoyModalOpen] = useState(false);
    const [proofOfJoyImage, setProofOfJoyImage] = useState<string | null>(null);

    // Notification Settings State
    const [notifPreferences, setNotifPreferences] = useState({
        newOrders: true,
        pickup: true,
        payouts: true,
        marketing: false,
        lowStock: true, // Added lowStock preference
    });

    // Dispatch Logic State
    const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
    const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
    const [driverDetails, setDriverDetails] = useState({
        name: '',
        carModel: '',
        plateNumber: '',
        phone: ''
    });

    const handleReadyForDispatch = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        if (order.deliveryMethod === 'delivery' && !order.deliveryCoordinates) {
            showToast("Cannot dispatch: Recipient hasn't pinned location yet.", 'error');
            return;
        }

        onUpdateOrder(orderId, { status: 'ready_for_dispatch' });
        showToast("Order marked as Ready for Dispatch! Admin notified.", 'success');
    };

    const handleOpenDispatchModal = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            setDispatchOrder(order);
            setIsDispatchModalOpen(true);
        }
    };

    const handleConfirmDispatch = (e: React.FormEvent) => {
        e.preventDefault();
        if (dispatchOrder) {
            onUpdateOrder(dispatchOrder.id, {
                status: 'dispatched',
                driverDetails: driverDetails
            });
            setIsDispatchModalOpen(false);
            setDispatchOrder(null);
            setDriverDetails({ name: '', carModel: '', plateNumber: '', phone: '' });
            showToast("Driver assigned and dispatched!", 'success');
        }
    };

    // --- Baker's Protocol Handlers ---
    const handleAcceptRequest = (orderId: string) => {
        onUpdateOrder(orderId, { status: 'paid', approvalStatus: 'approved' });
        showToast("Order Accepted! Funds released from Escrow.", 'success');
    };

    const handleDeclineRequest = (orderId: string) => {
        // In a real app, this would trigger a refund
        onUpdateOrder(orderId, { status: 'collected', approvalStatus: 'rejected' }); // Using 'collected' as a pseudo-closed state for now, or just hide it
        showToast("Order Declined. Funds returned to customer.", 'info');
    };

    // --- Substitution Logic ---
    const handleSubstituteItem = () => {
        if (window.confirm("Simulate item substitution?\n\nThis will notify the customer to approve the change.")) {
            showToast("Substitution request sent to customer via WhatsApp.", 'success');
        }
    };

    // Calculate comprehensive shop analytics
    const shopAnalytics = useMemo(() => {
        return calculateShopAnalytics(orders, products);
    }, [orders, products]);

    const settingsTabs = [
        { id: 'shopInfo', name: 'Shop Profile', icon: <UserIcon className="w-5 h-5" /> },
        { id: 'payout', name: 'Payouts', icon: <DollarIcon className="w-5 h-5" /> },
        { id: 'notifications', name: 'Notifications', icon: <BellIcon className="w-5 h-5" /> },
        { id: 'security', name: 'Security', icon: <LockClosedIcon className="w-5 h-5" /> },
    ];

    // Check for low stock on mount
    useEffect(() => {
        if (hasCheckedStock.current) return;

        const lowStockItems = products.filter(p => p.stock <= 10);

        if (lowStockItems.length > 0) {
            const newNotifications = lowStockItems.map(p => ({
                id: Date.now() + Math.random(),
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                message: p.stock === 0
                    ? `OUT OF STOCK: "${p.name}" is completely sold out.`
                    : `LOW STOCK: "${p.name}" has only ${p.stock} units remaining.`,
                productId: p.id,
                actionType: 'restock' as const
            }));

            // Update notification history (prepend new ones)
            setNotifications(prev => [...newNotifications, ...prev]);

            // Show a consolidated toast
            if (lowStockItems.length === 1) {
                const p = lowStockItems[0];
                showToast(p.stock === 0 ? `Alert: ${p.name} is out of stock!` : `Alert: ${p.name} is running low (${p.stock} left).`, 'error');
            } else {
                showToast(`Warning: ${lowStockItems.length} products are low on stock.`, 'error');
            }
        }

        hasCheckedStock.current = true;
    }, [products, showToast]); // Run when products change or on mount

    const handleQuickRestock = (productId: number) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            handleOpenProductModal('edit', product);
        } else {
            showToast("Product not found", 'error');
        }
    };

    // ... [Existing Handlers for Input, File, Form, Payouts, Password, Notifications] ...
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setShopProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const fileUrl = URL.createObjectURL(files[0]);
            if (name === 'profilePic') {
                setProfilePicPreview(fileUrl);
            } else if (name === 'coverPhoto') {
                setCoverPhotoPreview(fileUrl);
            }
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Saving profile:", shopProfile);
        showToast("Profile saved successfully!", 'success');
    };

    const handleAddPayoutMethod = (method: Omit<ShopPayoutMethod, 'id'>) => {
        setPayoutMethods(prev => [...prev, { ...method, id: Date.now() }]);
        setIsPayoutModalOpen(false);
        showToast("Payout method added", 'success');
    };

    const openDeletePayoutModal = (method: ShopPayoutMethod) => {
        setPayoutMethodToDelete(method);
        setIsDeletePayoutModalOpen(true);
    };

    const confirmDeletePayout = () => {
        if (payoutMethodToDelete) {
            setPayoutMethods(prev => prev.filter(p => p.id !== payoutMethodToDelete.id));
            showToast("Payout method removed", 'info');
        }
        setIsDeletePayoutModalOpen(false);
        setPayoutMethodToDelete(null);
    };

    const getPayoutIcon = (provider: string) => {
        switch (provider) {
            case 'airtel': return <AirtelIcon className="w-10 h-10" />;
            case 'mtn': return <MtnIcon className="w-10 h-10" />;
            case 'zamtel': return <ZamtelIcon className="w-10 h-10" />;
            case 'visa': return <VisaIcon className="w-10 h-auto" />;
            case 'mastercard': return <MastercardIcon className="w-10 h-auto" />;
            case 'bank': return <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600"><DollarIcon className="w-6 h-6" /></div>;
            default: return <CreditCardIcon className="w-10 h-10 text-gray-400" />;
        }
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordFields(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordFields.newPassword !== passwordFields.confirmPassword) {
            showToast("New passwords do not match.", 'error');
            return;
        }
        if (passwordFields.newPassword.length < 8) {
            showToast("New password must be at least 8 characters.", 'error');
            return;
        }
        showToast("Password changed successfully!", 'success');
        setPasswordFields({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const toggleNotification = (key: keyof typeof notifPreferences) => {
        setNotifPreferences(prev => ({ ...prev, [key]: !prev[key] }));
        showToast("Preferences updated", 'info');
    };

    // --- Product CRUD Handlers ---

    const handleOpenProductModal = (mode: 'add' | 'edit', product?: Product) => {
        setProductModalMode(mode);
        if (mode === 'edit' && product) {
            setCurrentProduct(product);
            setProductImagePreview(product.image);
        } else {
            setCurrentProduct(initialProductFormState);
            setProductImagePreview(null);
        }
        setIsProductModalOpen(true);
    };

    const handleCloseProductModal = () => {
        setIsProductModalOpen(false);
        setCurrentProduct(initialProductFormState);
        setProductImagePreview(null);
    };

    const handleProductInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setCurrentProduct(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleProductImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const fileUrl = URL.createObjectURL(e.target.files[0]);
            setProductImagePreview(fileUrl);
            setCurrentProduct(prev => ({ ...prev!, image: fileUrl }));
        }
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (productModalMode === 'add') {
            const newProductData = {
                ...currentProduct as Omit<Product, 'id'>,
            };
            try {
                const addedProduct = await db.products.add(newProductData as any);
                setProducts(prev => [addedProduct as any, ...prev]);
                showToast("Product added successfully", 'success');
            } catch (e) {
                showToast("Failed to add product", 'error');
            }
        } else { // 'edit' mode
             // Note: db.products.update is not implemented in stub/real yet, assuming local update for now or add to service
            setProducts(prev => prev.map(p => p.id === (currentProduct as Product).id ? (currentProduct as Product) : p));
            showToast("Product updated", 'success');
        }
        // Reset check ref so updated stock triggers notification if needed
        hasCheckedStock.current = false;
        handleCloseProductModal();
    };

    const handleDeleteProduct = (productId: number) => {
        setProductToDelete(productId);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteProduct = async () => {
        if (productToDelete !== null) {
            const product = products.find(p => p.id === productToDelete);
            if (product) {
                try {
                    await db.products.delete(productToDelete);
                    setDeletedProducts(prev => [{ ...product, deletedAt: new Date() }, ...prev]);
                    setProducts(prev => prev.filter(p => p.id !== productToDelete));
                    showToast("Moved to trash. Will permanently delete in 24h.", 'info');
                } catch(e) {
                    showToast("Failed to delete product", 'error');
                }
            }
        }
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
    };

    const handleRestoreProduct = (product: DeletedProduct) => {
        const { deletedAt, ...rest } = product; // remove deletedAt
        setProducts(prev => [rest, ...prev]);
        setDeletedProducts(prev => prev.filter(p => p.id !== product.id));
        showToast("Product restored to active stock", 'success');
    };

    const handlePermanentDelete = (id: number) => {
        setDeletedProducts(prev => prev.filter(p => p.id !== id));
        showToast("Permanently deleted", 'info');
    };

    const cancelDeleteProduct = () => {
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
    };

    const filteredOrders = useMemo(() => {
        if (activeOrderTab === 'requests') {
            return orders.filter(order => order.status === 'pending' || order.approvalStatus === 'pending');
        }
        if (activeOrderTab === 'pickup') {
            // Sort by pickupTime if available (Kitchen Display)
            return orders
                .filter(order => order.status === 'paid' || order.status === 'ready_for_dispatch')
                .sort((a, b) => {
                    if (a.pickupTime && b.pickupTime) return a.pickupTime.localeCompare(b.pickupTime);
                    if (a.pickupTime) return -1;
                    if (b.pickupTime) return 1;
                    return 0;
                });
        }
        // For history, sort by collectedOn date, most recent first
        return orders
            .filter(order => order.status === 'collected' || order.status === 'dispatched')
            .sort((a, b) => new Date(b.collectedOn || b.paidOn).getTime() - new Date(a.collectedOn || a.paidOn).getTime());
    }, [orders, activeOrderTab]);


    // --- QR Scan and Verification Logic ---
    useEffect(() => {
        let stream: MediaStream;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;

                    const timeoutId = setTimeout(() => {
                        const orderToScan = orders.find(o => o.status === 'paid');
                        if (orderToScan) {
                            handleVerification(orderToScan.collectionCode, 'scan');
                        } else {
                            setScanStatus('error');
                            setTimeout(() => setScanStatus('idle'), 3000);
                        }
                    }, 3500);

                    return () => clearTimeout(timeoutId);
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                showToast("Camera access denied. Please use manual entry.", 'error');
                setScanStatus('idle');
            }
        };

        if (activeMenu === 'scan' && scanStatus === 'scanning') {
            startCamera();
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [activeMenu, scanStatus, orders]);

    const handleVerification = async (code: string, method: 'scan' | 'manual') => {
        const cleanInput = code.trim().toUpperCase();
        try {
            const foundOrder = await db.orders.get(cleanInput);

            if (foundOrder && foundOrder.status === 'paid') {
                setCurrentVerificationMethod(method);
                setVerifiedOrder(foundOrder as Order);
                setScanStatus('success');
                showToast(`Verification successful. Finalizing handover.`, 'info');
                setIsManualWarningOpen(false);
            } else {
                throw new Error("Order not found or already collected.");
            }
        } catch (error) {
            console.error("Verification failed:", error);
            if (method === 'manual') {
                showToast("Invalid or expired code.", 'error');
            } else {
                setScanStatus('error');
                setTimeout(() => setScanStatus('idle'), 3000);
            }
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode.trim()) {
            handleVerification(manualCode.trim(), 'manual');
        }
    };

    const handleProofOfJoyChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofOfJoyImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const finalizeHandover = (withPhoto: boolean) => {
        if (!verifiedOrder) return;
        onMarkAsCollected(verifiedOrder.id, currentVerificationMethod);

        if (withPhoto) {
            showToast("Order completed and Photo Proof uploaded!", 'success');
        } else {
            showToast("Order completed! Funds released.", 'success');
        }

        setScanStatus('idle');
        setVerifiedOrder(null);
        setManualCode('');
        setProofOfJoyImage(null);
        setIsProofOfJoyModalOpen(false);
    }


    const renderContent = () => {
        switch (activeMenu) {
            case 'analysis':
                // ... [Analysis Data] ...
                const analysisData = { revenue: 32500.75, totalOrders: 82, kithlyTakeRate: 0.05, processingFeeRate: 0.029, growthRate: 0.15 };
                const totalFees = (analysisData.revenue * analysisData.kithlyTakeRate) + (analysisData.revenue * analysisData.processingFeeRate);

                const salesData = [4500, 6000, 5500, 8000, 7000, 9000, 12500];
                const maxSales = Math.max(...salesData);
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const topProducts = [
                    { name: "Fresh Produce Box", sales: 120, revenue: 78000, percentage: 85 },
                    { name: "Imported Rice (5kg)", sales: 85, revenue: 34000, percentage: 60 },
                    { name: "Free-Range Eggs (12)", sales: 60, revenue: 9000, percentage: 40 },
                    { name: "Artisanal Bread Loaf", sales: 45, revenue: 5850, percentage: 30 },
                ];

                return (
                    <div className="animate-fade-in space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">Dashboard Analysis</h2>
                                <p className="text-gray-500 mt-1">Comprehensive overview of your shop's performance and insights.</p>
                            </div>
                        </div>

                        {/* Enhanced Performance Dashboard */}
                        <PerformanceDashboard analytics={shopAnalytics} />

                        {/* Revenue Chart */}
                        <RevenueChart data={shopAnalytics.dailyRevenue} />

                        {/* Quick Analytics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <AnalyticsCard
                                title="Today's Revenue"
                                value={formatCurrency(shopAnalytics.todayRevenue)}
                                change={shopAnalytics.yesterdayRevenue > 0
                                    ? ((shopAnalytics.todayRevenue - shopAnalytics.yesterdayRevenue) / shopAnalytics.yesterdayRevenue) * 100
                                    : 0}
                                changeLabel="vs yesterday"
                                icon={<DollarIcon className="w-6 h-6" />}
                                iconBgColor="bg-green-100"
                                iconColor="text-green-600"
                                borderColor="border-green-100"
                            />

                            <AnalyticsCard
                                title="Week Revenue"
                                value={formatCurrency(shopAnalytics.weekRevenue)}
                                change={shopAnalytics.revenueTrend}
                                changeLabel="vs last week"
                                icon={<TrendingUpIcon className="w-6 h-6" />}
                                iconBgColor="bg-blue-100"
                                iconColor="text-blue-600"
                                borderColor="border-blue-100"
                            />

                            <AnalyticsCard
                                title="Total Orders"
                                value={shopAnalytics.totalOrders}
                                subtitle={`${shopAnalytics.weekOrders} this week`}
                                icon={<PackageIcon className="w-6 h-6" />}
                                iconBgColor="bg-purple-100"
                                iconColor="text-purple-600"
                                borderColor="border-purple-100"
                            />

                            <AnalyticsCard
                                title="Avg Order Value"
                                value={formatCurrency(shopAnalytics.averageOrderValue)}
                                change={shopAnalytics.averageOrderValueTrend}
                                changeLabel="vs last week"
                                icon={<ReceiptIcon className="w-6 h-6" />}
                                iconBgColor="bg-orange-100"
                                iconColor="text-orange-600"
                                borderColor="border-orange-100"
                            />
                        </div>

                        {/* Wallet Stats Section */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Wallet & Payouts</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* AVAILABLE (GREEN) */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
                                    <div className="absolute right-0 top-0 h-full w-1 bg-green-500"></div>
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Available Payout</h3>
                                        <div className="bg-green-100 text-green-600 p-2 rounded-full"><DollarIcon className="w-6 h-6" /></div>
                                    </div>
                                    <p className="text-3xl font-bold mt-2 text-gray-900">
                                        ZMK <AnimatedNumber value={walletStats.available} formatter={(v) => v.toFixed(2)} />
                                    </p>
                                    <p className="text-xs text-green-600 mt-2 font-medium flex items-center">
                                        <CheckCircleIcon className="w-3 h-3 mr-1" /> Ready for withdrawal
                                    </p>
                                </div>
                                {/* PENDING (ORANGE) with Tooltip */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 transition-transform hover:-translate-y-1 duration-300 group relative">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1">
                                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pending Collection</h3>
                                            <div className="relative group/tooltip cursor-help">
                                                <HelpCircleIcon className="w-4 h-4 text-gray-400 hover:text-kithly-primary" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                                                    Funds are released once the recipient collects the item and the QR code is verified.
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-orange-100 text-orange-600 p-2 rounded-full"><ClockIcon className="w-6 h-6" /></div>
                                    </div>
                                    <p className="text-3xl font-bold mt-2 text-gray-900">
                                        ZMK <AnimatedNumber value={walletStats.pending} formatter={(v) => v.toFixed(2)} />
                                    </p>
                                    <p className="text-xs text-orange-600 mt-2 font-medium">Locked until scanned</p>
                                </div>

                                {/* Platform Fees Card - Enhanced Transparency */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-semibold text-gray-500">Fees Paid</h3>
                                        <div className="bg-gray-100 text-gray-600 p-2 rounded-full"><ReceiptIcon className="w-6 h-6" /></div>
                                    </div>
                                    <p className="text-3xl font-bold mt-2 text-gray-800">
                                        ZMK <AnimatedNumber value={totalFees} formatter={(v) => v.toFixed(2)} />
                                    </p>
                                    <div className="text-xs text-gray-500 mt-2 space-y-1">
                                        <div className="flex justify-between"><span>Kithly (5%):</span> <span>ZMK {(analysisData.revenue * 0.05).toFixed(2)}</span></div>
                                        <div className="flex justify-between"><span>Processing (2.9%):</span> <span>ZMK {(analysisData.revenue * 0.029).toFixed(2)}</span></div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-semibold text-gray-500">Total Orders</h3>
                                        <div className="bg-blue-50 text-blue-600 p-2 rounded-full"><PackageIcon className="w-6 h-6" /></div>
                                    </div>
                                    <p className="text-3xl font-bold mt-2 text-gray-800">
                                        <AnimatedNumber value={walletStats.totalOrders} />
                                    </p>
                                    <div className="flex items-center mt-2 text-xs font-semibold text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded-md w-fit">
                                        <TrendingUpIcon className="w-3 h-3 mr-1" />
                                        <span>+15% vs last week</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Chart Area */}
                            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Overview</h3>
                                <div className="relative h-64 w-full flex items-end justify-between gap-2 px-2 overflow-x-auto">
                                    {/* Grid Lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 min-w-full">
                                        <div className="w-full border-t border-gray-400"></div>
                                        <div className="w-full border-t border-gray-400"></div>
                                        <div className="w-full border-t border-gray-400"></div>
                                        <div className="w-full border-t border-gray-400"></div>
                                    </div>

                                    {salesData.map((value, index) => (
                                        <div key={index} className="relative flex flex-col items-center flex-1 h-full justify-end group min-w-[40px]">
                                            <div
                                                className="w-full max-w-[40px] bg-gradient-to-t from-kithly-primary to-kithly-accent rounded-t-lg transition-all duration-500 hover:brightness-110"
                                                style={{ height: `${(value / maxSales) * 85}%` }}
                                            >
                                                {/* Tooltip */}
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                    ZMK {value}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500 mt-2 font-medium">{days[index]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Products */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-6">Top Performing Products</h3>
                                <div className="space-y-6">
                                    {topProducts.map((product, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-semibold text-gray-700 truncate mr-2">{product.name}</span>
                                                <span className="text-gray-500 whitespace-nowrap">{product.sales} sold</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                <div
                                                    className="bg-kithly-primary h-2.5 rounded-full transition-all duration-1000"
                                                    style={{ width: `${product.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            // ... [Other Cases: Products, Orders, Scan, Settings] ...
            case 'products': return (
                <div className="animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <h2 className="text-3xl font-bold text-gray-800">Products</h2>
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => setIsTrashModalOpen(true)} className="flex items-center gap-2 px-4">
                                <TrashIcon className="h-5 w-5 text-gray-600" />
                                <span>Trash Bin</span>
                                {deletedProducts.length > 0 && (
                                    <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                                        {deletedProducts.length}
                                    </span>
                                )}
                            </Button>
                            <Button variant="primary" onClick={() => handleOpenProductModal('add')}>
                                <span className="flex items-center space-x-2">
                                    <PlusCircleIcon className="h-5 w-5" />
                                    <span>Add Product</span>
                                </span>
                            </Button>
                        </div>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map(product => (
                                <ProductManagementCard
                                    key={product.id}
                                    product={product}
                                    onEdit={() => handleOpenProductModal('edit', product)}
                                    onDelete={() => handleDeleteProduct(product.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-md border border-dashed border-gray-300">
                            <ProductsIcon className="mx-auto w-16 h-16 text-gray-300" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-700">No products yet</h3>
                            <p className="mt-2 text-sm text-gray-500">Get started by adding your first product.</p>
                            <div className="mt-6">
                                <Button variant="primary" onClick={() => handleOpenProductModal('add')}>Add New Product</Button>
                            </div>
                        </div>
                    )}
                </div>
            );

            case 'orders':
                const orderTabs = [
                    { id: 'requests', name: 'Requests', icon: <BellIcon className="w-5 h-5" /> },
                    { id: 'pickup', name: 'Kitchen / Dispatch', icon: <PackageIcon className="w-5 h-5" /> },
                    { id: 'history', name: 'History', icon: <HistoryIcon className="w-5 h-5" /> },
                ];
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold mb-8 text-gray-800">Manage Orders</h2>
                        {/* ... Orders Tab Content ... */}
                        <div className="mb-8">
                            <div className="border-b border-gray-200 overflow-x-auto">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                    {orderTabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveOrderTab(tab.id as any)}
                                            className={`whitespace-nowrap flex items-center space-x-2 py-4 px-1 border-b-2 font-semibold text-sm transition-colors duration-200
                                                ${activeOrderTab === tab.id
                                                    ? 'border-kithly-primary text-kithly-primary'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`
                                            }
                                        >
                                            {tab.icon}
                                            <span>{tab.name}</span>
                                            <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${activeOrderTab === tab.id ? 'bg-kithly-primary/10 text-kithly-primary' : 'bg-gray-100 text-gray-600'}`}>
                                                {tab.id === 'requests'
                                                    ? orders.filter(o => o.status === 'pending').length
                                                    : tab.id === 'pickup'
                                                        ? orders.filter(o => o.status === 'paid' || o.status === 'ready_for_dispatch').length
                                                        : orders.filter(o => o.status === 'collected' || o.status === 'dispatched').length}
                                            </span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {filteredOrders.length > 0 ? (
                            <div className="space-y-6">
                                {filteredOrders.map(order => (
                                    <React.Fragment key={order.id}>
                                        {activeOrderTab === 'requests' ? (
                                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-blue-500 border-gray-100">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">New Request</span>
                                                        <h3 className="text-lg font-bold text-gray-900 mt-2">{order.items[0]?.name} {order.items.length > 1 && `+ ${order.items.length - 1} more`}</h3>
                                                        <p className="text-sm text-gray-500">Requested by {order.customerName}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-bold text-gray-900">ZMK {order.total.toFixed(2)}</p>
                                                        <p className="text-xs text-gray-500">Held in Escrow</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 mt-4">
                                                    <Button onClick={() => handleAcceptRequest(order.id)} variant="primary" className="flex-1 bg-green-600 hover:bg-green-700">Accept Order</Button>
                                                    <Button onClick={() => handleDeclineRequest(order.id)} variant="secondary" className="flex-1 text-red-600 hover:bg-red-50">Decline</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                {order.pickupTime && (
                                                    <div className="absolute -top-3 left-4 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full border border-orange-200 z-10 flex items-center gap-1">
                                                        <ClockIcon className="w-3 h-3" />
                                                        Due: {order.pickupTime}
                                                    </div>
                                                )}
                                                <OrderCard
                                                    order={order}
                                                    onMarkAsCollected={() => {
                                                        if (order.deliveryMethod === 'delivery') {
                                                            if (window.confirm(`Confirm handover to driver ${order.driverDetails?.name}?`)) {
                                                                onUpdateOrder(order.id, { status: 'collected', collectedOn: new Date().toISOString(), verificationMethod: 'manual' });
                                                                showToast("Order handed over to driver!", 'success');
                                                            }
                                                        } else {
                                                            setActiveMenu('scan');
                                                            showToast("Please scan the customer's QR code to verify.", 'info');
                                                        }
                                                    }}
                                                    onReadyForDispatch={handleReadyForDispatch}
                                                />
                                                {/* Admin Simulation Button (Visible for Demo) */}
                                                {(isDemoMode || order.status === 'ready_for_dispatch') && order.deliveryMethod === 'delivery' && order.status !== 'dispatched' && (
                                                    <div className="text-right -mt-4 mb-6">
                                                        <button
                                                            onClick={() => handleOpenDispatchModal(order.id)}
                                                            className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                                                        >
                                                            (Admin) Assign Driver
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-md border border-dashed border-gray-300">
                                <DocumentTextIcon className="mx-auto w-16 h-16 text-gray-300" />
                                <h3 className="mt-4 text-xl font-semibold text-gray-700">No Orders Here</h3>
                                <p className="mt-2 text-sm text-gray-500">There are currently no orders in this category.</p>
                            </div>
                        )}
                    </div>
                );
            case 'scan':
                // ... Scan Logic is same as before ...
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold mb-8 text-gray-800">Verify Pickup</h2>
                        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 max-w-4xl mx-auto">
                            {scanStatus === 'idle' && (
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-kithly-dark">Ready to Verify?</h3>
                                    <p className="mt-2 text-gray-500 max-w-md mx-auto">Scan the customer's QR code to release items and unlock funds.</p>
                                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <button onClick={() => setScanStatus('scanning')} className="p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-kithly-primary hover:bg-kithly-background transition-all duration-300 group">
                                            <CameraIcon className="w-16 h-16 mx-auto text-gray-400 group-hover:text-kithly-primary transition-colors" />
                                            <p className="mt-4 font-semibold text-lg text-kithly-dark">Scan QR Code</p>
                                            <p className="text-sm text-gray-500 mt-1">Use your device camera.</p>
                                        </button>
                                        <button onClick={() => setIsManualWarningOpen(true)} className="p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-kithly-primary hover:bg-kithly-background transition-all duration-300 group">
                                            <KeyboardIcon className="w-16 h-16 mx-auto text-gray-400 group-hover:text-kithly-primary transition-colors" />
                                            <p className="mt-4 font-semibold text-lg text-kithly-dark">Enter Code Manually</p>
                                            <p className="text-sm text-gray-500 mt-1">Input the 10-digit KLY code.</p>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {scanStatus === 'scanning' && (
                                <div>
                                    <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center">
                                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none">
                                            <p className="font-semibold bg-black/50 px-3 py-1 rounded-md">Point camera at QR code</p>
                                            <div className="w-64 h-64 border-4 border-white/50 rounded-2xl mt-4 relative">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-kithly-accent animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center mt-6">
                                        <Button variant="secondary" onClick={() => setScanStatus('idle')}>Cancel Scan</Button>
                                    </div>
                                </div>
                            )}

                            {isManualWarningOpen && (
                                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center overflow-hidden">
                                        <div className="bg-orange-50 p-6 border-b border-orange-100">
                                            <ExclamationTriangleIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                                            <h3 className="text-xl font-bold text-gray-900">Security Check</h3>
                                        </div>
                                        <div className="p-6">
                                            <p className="text-sm text-gray-600 mb-4">Verify customer ID matches order name. Enter the code exactly as shown.</p>
                                            <input
                                                type="text"
                                                value={manualCode}
                                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                                placeholder="KLY..."
                                                className="w-full text-2xl font-mono font-bold text-center border-2 rounded-xl py-3 uppercase mb-6 focus:outline-none focus:border-kithly-primary"
                                                maxLength={10}
                                            />
                                            <div className="flex gap-3">
                                                <Button variant="secondary" onClick={() => setIsManualWarningOpen(false)} className="flex-1">Cancel</Button>
                                                <Button onClick={() => handleVerification(manualCode, 'manual')} className="flex-1" disabled={manualCode.length < 10}>Verify</Button>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <button onClick={handleSubstituteItem} className="text-xs text-orange-600 hover:underline w-full text-center">
                                                    Item out of stock? Propose Substitution
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {scanStatus === 'success' && verifiedOrder && (
                                <div className="text-center animate-fade-in">
                                    <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircleIcon className="w-12 h-12 text-green-600" />
                                    </div>

                                    <h3 className="text-3xl font-bold text-kithly-dark mb-2">Verification Successful!</h3>

                                    <div className="bg-green-50 p-6 rounded-2xl border border-green-200 max-w-md mx-auto mb-6">
                                        <p className="text-green-800 text-lg">
                                            Release <strong>{verifiedOrder.itemCount} items</strong> to:
                                        </p>
                                        <p className="text-2xl font-bold text-green-900 my-2">
                                            {verifiedOrder.customerName}
                                        </p>
                                        <p className="text-sm text-green-600">
                                            Order #{verifiedOrder.id}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3 max-w-xs mx-auto">
                                        <Button
                                            variant="secondary"
                                            onClick={() => setIsProofOfJoyModalOpen(true)}
                                            className="w-full flex items-center justify-center gap-2"
                                        >
                                            <PhotoIcon className="w-5 h-5" />
                                            <span>Upload Optional Photo Proof</span>
                                        </Button>

                                        <Button
                                            variant="primary"
                                            onClick={() => finalizeHandover(false)}
                                            className="w-full"
                                        >
                                            Finalize Handover & Release Funds
                                        </Button>
                                        <Button
                                            variant="tertiary"
                                            onClick={() => {
                                                setScanStatus('idle');
                                                setVerifiedOrder(null);
                                                setManualCode('');
                                            }}
                                            className="w-full"
                                        >
                                            Scan Next (Order Completed)
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {scanStatus === 'error' && (
                                <div className="text-center animate-fade-in">
                                    <ExclamationTriangleIcon className="w-24 h-24 mx-auto text-red-500" />
                                    <h3 className="mt-4 text-2xl font-bold text-kithly-dark">Verification Failed</h3>
                                    <p className="mt-2 text-gray-600">The code is invalid or the order has already been collected. Please try again.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'settings':
                return (
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md min-h-[600px]">
                        <h2 className="text-2xl font-bold mb-6">Shop Settings</h2>
                        <div className="flex space-x-2 overflow-x-auto pb-2 mb-8 scrollbar-hide bg-gray-50 p-1.5 rounded-xl w-full md:w-fit">
                            {settingsTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveSettingsTab(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeSettingsTab === tab.id
                                        ? 'bg-white text-kithly-primary shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {tab.icon}
                                    <span>{tab.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="animate-fade-in">
                            {activeSettingsTab === 'shopInfo' && (
                                <div>
                                    {/* SHOW THE TIER STATUS AT THE TOP */}
                                    {renderTierStatus(currentShopTier)}

                                    {/* Demo Mode Toggle */}
                                    <div className="mb-8 p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-purple-900">Shop Onboarding Mode</h4>
                                            <p className="text-xs text-purple-700">Enable practice features for training staff.</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsDemoMode(!isDemoMode);
                                                showToast(isDemoMode ? "Demo Mode Disabled" : "Demo Mode Enabled", 'info');
                                            }}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isDemoMode ? 'bg-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDemoMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleFormSubmit} className="space-y-8">
                                        {/* Shop Info Form Content */}
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                                                <div className="mt-1 flex items-center space-x-4">
                                                    {profilePicPreview ? (
                                                        <img src={profilePicPreview} alt="Profile preview" className="w-24 h-24 rounded-full object-cover" />
                                                    ) : (
                                                        <span className="flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 text-gray-300">
                                                            <UserIcon className="w-12 h-12" />
                                                        </span>
                                                    )}
                                                    <label htmlFor="profile-pic-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kithly-accent">
                                                        <span>Change</span>
                                                        <input id="profile-pic-upload" name="profilePic" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Photo</label>
                                                <div className="w-full h-32 bg-gray-100 rounded-lg flex justify-center items-center">
                                                    {coverPhotoPreview ? (
                                                        <img src={coverPhotoPreview} alt="Cover preview" className="w-full h-full rounded-lg object-cover" />
                                                    ) : (
                                                        <p className="text-sm text-gray-400">No cover photo</p>
                                                    )}
                                                </div>
                                                <label htmlFor="cover-photo-upload" className="mt-2 inline-block cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kithly-accent">
                                                    <span>Upload new cover</span>
                                                    <input id="cover-photo-upload" name="coverPhoto" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Shop Name</label>
                                            <input type="text" name="name" id="name" value={shopProfile.name} onChange={handleInputChange} className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-kithly-accent focus:border-kithly-accent sm:text-sm" />
                                        </div>

                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Shop Description</label>
                                            <textarea name="description" id="description" rows={4} value={shopProfile.description} onChange={handleInputChange} className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-kithly-accent focus:border-kithly-accent sm:text-sm" ></textarea>
                                        </div>

                                        {/* New Operating Hours */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">Operating Hours</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Opens At</label>
                                                    <input type="time" name="openTime" value={shopProfile.openTime} onChange={handleInputChange} className="block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Closes At</label>
                                                    <input type="time" name="closeTime" value={shopProfile.closeTime} onChange={handleInputChange} className="block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right pt-4 border-t border-gray-100">
                                            <Button type="submit" variant="primary">Save Profile</Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeSettingsTab === 'payout' && (
                                <div>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-2 border-b gap-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800">Payout Accounts</h3>
                                            <p className="text-sm text-gray-500">Manage where you receive your earnings.</p>
                                        </div>
                                        <Button variant="secondary" onClick={() => setIsPayoutModalOpen(true)} className="w-full sm:w-auto justify-center">
                                            <span className="flex items-center space-x-2"><PlusCircleIcon className="w-5 h-5 text-kithly-dark" /> <span>Add Method</span></span>
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {payoutMethods.map(method => (
                                            <div key={method.id} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-100 hover:border-gray-300 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-14 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm p-1">
                                                        {getPayoutIcon(method.provider)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-kithly-dark capitalize">
                                                            {method.type === 'bank' ? method.bankName : method.provider.replace('_', ' ')}
                                                            {method.type === 'card' && ' (Card)'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {method.accountName} &bull; {method.type === 'bank' ? `Account ending in ${method.accountNumber.slice(-4)}` : method.accountNumber}
                                                            {method.type === 'card' && `Ending in ${method.accountNumber}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button onClick={() => openDeletePayoutModal(method)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-200 rounded-full transition-colors" aria-label="Remove payout method"><TrashIcon className="w-5 h-5" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeSettingsTab === 'notifications' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Notifications</h3>

                                    <div className="mb-8">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">History</h4>
                                        <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 overflow-x-auto max-h-64 overflow-y-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-100 sticky top-0">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {notifications.map((notif) => (
                                                        <tr key={notif.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <div className="flex flex-col">
                                                                    <span>{notif.date}</span>
                                                                    <span className="text-xs text-gray-400">{notif.time}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-kithly-dark">{notif.message}</td>
                                                            <td className="px-6 py-4 text-right">
                                                                {notif.actionType === 'restock' && notif.productId && (
                                                                    <button
                                                                        onClick={() => handleQuickRestock(notif.productId!)}
                                                                        className="text-xs font-bold text-kithly-primary hover:bg-orange-50 px-3 py-1.5 rounded-lg border border-kithly-primary/30 transition-colors"
                                                                    >
                                                                        Quick Restock
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Preferences</h4>
                                        <div className="space-y-6">
                                            {[
                                                { key: 'newOrders', label: 'New Orders', desc: 'When you receive a new order' },
                                                { key: 'pickup', label: 'Pickup', desc: 'When items are collected' },
                                                { key: 'payouts', label: 'Payout Alerts', desc: 'Payouts and earnings updates' },
                                                { key: 'marketing', label: 'Marketing', desc: 'Platform updates and tips' }
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.label}</p>
                                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleNotification(item.key as any)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-kithly-accent focus:ring-offset-2 ${notifPreferences[item.key as keyof typeof notifPreferences] ? 'bg-kithly-primary' : 'bg-gray-200'}`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifPreferences[item.key as keyof typeof notifPreferences] ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeSettingsTab === 'security' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Password Management</h3>
                                    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                                            <input type="password" value={passwordFields.newPassword} onChange={handlePasswordChange} name="newPassword" className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-kithly-accent focus:border-kithly-accent sm:text-sm" required minLength={8} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                            <input type="password" value={passwordFields.confirmPassword} onChange={handlePasswordChange} name="confirmPassword" className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-kithly-accent focus:border-kithly-accent sm:text-sm" required />
                                        </div>
                                        <div className="pt-2 text-right">
                                            <Button type="submit" variant="secondary">Change Password</Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // Re-declare menuItems to ensure it's available in scope
    const menuItems: { id: Menu; name: string; icon: React.ReactNode }[] = [
        { id: 'analysis', name: 'Home', icon: <AnalysisIcon /> },
        { id: 'products', name: 'Products', icon: <ProductsIcon /> },
        { id: 'orders', name: 'Orders', icon: <OrdersIcon /> },
        { id: 'settings', name: 'Settings', icon: <SettingsIcon /> },
    ];

    return (
        <div className="flex min-h-screen bg-kithly-background pb-20 lg:pb-0">
            {/* Desktop Sidebar */}
            <aside
                className={`
                    hidden lg:flex fixed top-0 left-0 z-50 h-screen bg-white shadow-md flex-col transition-all duration-300 ease-in-out
                    ${isCollapsed ? 'w-20' : 'w-64'}
                `}
            >
                <div className={`flex items-center justify-between px-6 py-5 h-20 ${isCollapsed ? 'justify-center px-0' : ''}`}>
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView('landing')}>
                        <BrandLogo className="w-10 h-10" />
                        {!isCollapsed && <span className="text-2xl font-bold gradient-text">KithLy</span>}
                    </div>

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute -right-3 top-24 bg-white border border-gray-200 rounded-full p-1 shadow-md text-gray-500 hover:text-kithly-primary"
                    >
                        {isCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
                    </button>
                </div>

                <nav className="flex-grow px-3 py-4 space-y-1 overflow-y-auto">
                    {[...menuItems, { id: 'scan' as Menu, name: 'QR Scan', icon: <QRIcon /> }].map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveMenu(item.id); }}
                            className={`w-full flex items-center px-3 py-3 text-left font-semibold rounded-xl transition-all duration-200 group
                                ${activeMenu === item.id ? 'gradient-bg text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}
                                ${isCollapsed ? 'flex-col justify-center gap-1' : 'flex-row space-x-3'}
                            `}
                            title={isCollapsed ? item.name : ''}
                        >
                            <span className={`w-6 h-6 flex-shrink-0 ${activeMenu !== item.id ? 'group-hover:text-kithly-primary' : ''}`}>{item.icon}</span>
                            <span className={`${isCollapsed ? 'text-[10px] font-medium leading-tight' : 'text-sm truncate'}`}>
                                {item.name}
                            </span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={() => setView('landing')}
                        className={`w-full flex items-center px-3 py-3 text-left font-semibold rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors duration-200
                            ${isCollapsed ? 'flex-col justify-center gap-1' : 'space-x-3'}
                        `}
                        title={isCollapsed ? "Logout" : ''}
                    >
                        <LogoutIcon className="w-6 h-6 flex-shrink-0" />
                        <span className={`${isCollapsed ? 'text-[10px] font-medium leading-tight' : 'text-sm'}`}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)] border-t border-gray-100 z-50 px-2 py-2">
                <div className="flex justify-between items-end relative">

                    <div className="flex-1 flex justify-around">
                        {menuItems.slice(0, 2).map(item => (
                            <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`flex flex-col items-center justify-center w-16 py-1 rounded-lg transition-colors ${activeMenu === item.id ? 'text-kithly-primary' : 'text-gray-400 hover:bg-gray-50'}`}>
                                <div className={activeMenu === item.id ? 'scale-110 transition-transform mb-1' : 'mb-1'}>{item.icon}</div>
                                <span className="text-[10px] font-medium leading-none">{item.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="w-20 shrink-0"></div>

                    <div className="flex-1 flex justify-around">
                        {menuItems.slice(2, 4).map(item => (
                            <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`flex flex-col items-center justify-center w-16 py-1 rounded-lg transition-colors ${activeMenu === item.id ? 'text-kithly-primary' : 'text-gray-400 hover:bg-gray-50'}`}>
                                <div className={activeMenu === item.id ? 'scale-110 transition-transform mb-1' : 'mb-1'}>{item.icon}</div>
                                <span className="text-[10px] font-medium leading-none">{item.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center justify-center pointer-events-none">
                        <button
                            onClick={() => setActiveMenu('scan')}
                            className={`pointer-events-auto w-14 h-14 rounded-full gradient-bg flex items-center justify-center shadow-lg border-4 border-kithly-background transform transition-transform active:scale-95 ${activeMenu === 'scan' ? 'ring-2 ring-kithly-primary ring-offset-2' : ''}`}
                        >
                            <QRIcon className="w-7 h-7 text-white" />
                        </button>
                        <span className="text-[10px] font-bold text-gray-500 mt-1 bg-white/80 backdrop-blur-sm px-2 rounded-full">Scan</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className={`flex-1 p-4 md:p-8 overflow-y-auto h-screen transition-all duration-300 lg:ml-${isCollapsed ? '20' : '64'} w-full`}>
                <div className="lg:hidden flex items-center justify-center mb-6 pt-2">
                    <BrandLogo className="w-8 h-8 mr-2" />
                    <span className="font-bold text-xl text-kithly-dark">KithLy Shop</span>
                </div>

                {/* Floating Home Button - Top Left for Mobile/Tablet, Hidden on Desktop */}
                <div className="fixed top-4 left-4 z-50 lg:hidden">
                    <AnimatedBackButton onClick={() => setView('landing')} label="Home" className="shadow-xl shadow-orange-900/10 !w-auto !h-auto !py-2 !px-4 !text-xs" />
                </div>

                {renderContent()}

                {/* Modals are rendered inside renderContent or main area, reusing existing structure */}
                {isProductModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
                            <form onSubmit={handleProductSubmit}>
                                <div className="p-6 md:p-8">
                                    <h3 className="text-2xl font-bold mb-6 text-kithly-dark">{productModalMode === 'add' ? 'Add New Product' : 'Edit Product'}</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Product Image</label>
                                            <div className="w-full aspect-square rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                                                {productImagePreview ? (
                                                    <img src={productImagePreview} alt="Product preview" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="text-center text-gray-400">
                                                        <ProductsIcon className="w-12 h-12 mx-auto" />
                                                        <p className="text-xs mt-2">Upload an image</p>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            </div>
                                            <label htmlFor="product-image-upload" className="w-full text-center cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 block mt-2">
                                                <span>{productImagePreview ? 'Change Image' : 'Select Image'}</span>
                                                <input id="product-image-upload" name="image" type="file" className="sr-only" onChange={handleProductImageChange} accept="image/*" />
                                            </label>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="productName" className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                                                <input type="text" name="name" id="productName" value={currentProduct?.name || ''} onChange={handleProductInputChange} className="mt-1 block w-full bg-kithly-light border-transparent rounded-md shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent" required />
                                            </div>

                                            <div>
                                                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                                <input type="text" name="category" id="category" value={currentProduct?.category || ''} onChange={handleProductInputChange} className="mt-1 block w-full bg-kithly-light border-transparent rounded-md shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent" required />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-1">Price (ZMK)</label>
                                                    <input type="number" name="price" id="price" step="0.01" min="0" value={currentProduct?.price || ''} onChange={handleProductInputChange} className="mt-1 block w-full bg-kithly-light border-transparent rounded-md shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent" required />
                                                </div>
                                                <div>
                                                    <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                                                    <input type="number" name="stock" id="stock" min="0" value={currentProduct?.stock ?? ''} onChange={handleProductInputChange} className="mt-1 block w-full bg-kithly-light border-transparent rounded-md shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent" required />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl">
                                    <Button type="button" variant="secondary" onClick={handleCloseProductModal}>Cancel</Button>
                                    <Button type="submit" variant="primary">Save</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="mt-5 text-2xl font-bold text-kithly-dark">Delete Product?</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                This item will be moved to the Trash Bin and permanently deleted after 24 hours.
                            </p>
                            <div className="mt-8 flex justify-center space-x-4">
                                <Button variant="secondary" onClick={cancelDeleteProduct}>Cancel</Button>
                                <Button variant="danger" onClick={confirmDeleteProduct}>Move to Trash</Button>
                            </div>
                        </div>
                    </div>
                )}

                {isTrashModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-50 rounded-full">
                                        <TrashIcon className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">Trash Bin</h3>
                                        <p className="text-xs text-gray-500">Items are auto-deleted after 24 hours</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsTrashModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 flex-grow bg-gray-50/50">
                                {deletedProducts.length > 0 ? (
                                    <div className="space-y-4">
                                        {deletedProducts.map((product) => (
                                            <div key={product.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
                                                <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover grayscale opacity-75" />
                                                <div className="flex-grow text-center sm:text-left">
                                                    <h4 className="font-bold text-gray-700">{product.name}</h4>
                                                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                                        <ClockIcon className="w-3 h-3 text-orange-500" />
                                                        <span className="text-xs text-orange-600 font-medium">Expires in 24h</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => handleRestoreProduct(product)}
                                                        className="!py-2 !px-3 !text-xs"
                                                    >
                                                        Restore
                                                    </Button>
                                                    <button
                                                        onClick={() => handlePermanentDelete(product.id)}
                                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors text-xs font-bold"
                                                    >
                                                        Delete Forever
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                        <TrashIcon className="w-12 h-12 mb-2 opacity-20" />
                                        <p>Trash is empty</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                                <Button variant="secondary" onClick={() => setIsTrashModalOpen(false)}>Close</Button>
                            </div>
                        </div>
                    </div>
                )}

                {isPayoutModalOpen && (
                    <AddPayoutModal onSave={handleAddPayoutMethod} onClose={() => setIsPayoutModalOpen(false)} />
                )}

                {isDeletePayoutModalOpen && (
                    <DeletePayoutModal method={payoutMethodToDelete} onConfirm={confirmDeletePayout} onClose={() => setIsDeletePayoutModalOpen(false)} />
                )}

                {isProofOfJoyModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-kithly-primary/10 text-kithly-primary">
                                <PhotoIcon className="h-8 w-8" />
                            </div>
                            <h3 className="mt-5 text-2xl font-bold text-kithly-dark">Optional Photo Proof</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Uploading a photo of the completed package (not necessarily the recipient) helps build trust with the sender.
                            </p>

                            <div className="mt-6 space-y-4">
                                <div className="w-full aspect-video rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                                    {proofOfJoyImage ? (
                                        <img src={proofOfJoyImage} alt="Proof of collection" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400 text-sm">No photo selected</span>
                                    )}
                                    <input id="proof-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleProofOfJoyChange} accept="image/*" />
                                </div>
                                <label htmlFor="proof-upload" className="w-full text-center cursor-pointer text-kithly-primary font-semibold hover:underline block">
                                    {proofOfJoyImage ? 'Change Photo' : 'Select Photo'}
                                </label>
                            </div>

                            <div className="mt-8 flex flex-col space-y-3">
                                <Button
                                    variant="primary"
                                    onClick={() => finalizeHandover(true)}
                                    disabled={!proofOfJoyImage}
                                >
                                    Upload Photo & Finalize
                                </Button>
                                <Button variant="secondary" onClick={() => finalizeHandover(false)}>
                                    Skip Photo & Finalize Handover
                                </Button>
                                <button onClick={() => setIsProofOfJoyModalOpen(false)} className="text-sm text-gray-500 hover:text-kithly-dark pt-2">Cancel Photo Upload</button>
                            </div>
                        </div>
                    </div>
                )}

                {isDispatchModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                            <h3 className="text-xl font-bold mb-4 text-kithly-dark">Admin Dispatch Console</h3>
                            <p className="text-sm text-gray-500 mb-4">Enter Yango driver details for Order #{dispatchOrder?.id}</p>
                            <form onSubmit={handleConfirmDispatch} className="space-y-3">
                                <input required placeholder="Driver Name" className="w-full p-2 bg-gray-50 rounded border" value={driverDetails.name} onChange={e => setDriverDetails({ ...driverDetails, name: e.target.value })} />
                                <input required placeholder="Car Model (e.g. Toyota Vitz)" className="w-full p-2 bg-gray-50 rounded border" value={driverDetails.carModel} onChange={e => setDriverDetails({ ...driverDetails, carModel: e.target.value })} />
                                <input required placeholder="Plate Number" className="w-full p-2 bg-gray-50 rounded border" value={driverDetails.plateNumber} onChange={e => setDriverDetails({ ...driverDetails, plateNumber: e.target.value })} />
                                <input required placeholder="Driver Phone" className="w-full p-2 bg-gray-50 rounded border" value={driverDetails.phone} onChange={e => setDriverDetails({ ...driverDetails, phone: e.target.value })} />

                                <div className="flex justify-end space-x-3 pt-4">
                                    <Button type="button" variant="secondary" onClick={() => setIsDispatchModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" variant="primary">Dispatch Driver</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const AddPayoutModal: React.FC<{ onSave: (method: any) => void, onClose: () => void }> = ({ onSave, onClose }) => {
    const [type, setType] = useState<'bank' | 'mobile_money' | 'card'>('bank');
    const [formData, setFormData] = useState({
        provider: 'bank',
        bankName: '',
        accountName: '',
        accountNumber: '',
        expiry: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, type });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">Add Payout Method</h3>
                    <div className="flex mb-4 bg-gray-100 p-1 rounded-lg">
                        <button type="button" onClick={() => setType('bank')} className={`flex-1 py-2 rounded text-sm font-medium ${type === 'bank' ? 'bg-white shadow' : ''}`}>Bank</button>
                        <button type="button" onClick={() => setType('mobile_money')} className={`flex-1 py-2 rounded text-sm font-medium ${type === 'mobile_money' ? 'bg-white shadow' : ''}`}>Mobile</button>
                        <button type="button" onClick={() => setType('card')} className={`flex-1 py-2 rounded text-sm font-medium ${type === 'card' ? 'bg-white shadow' : ''}`}>Card</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {type === 'bank' && (
                            <>
                                <input required placeholder="Bank Name" className="w-full p-2 bg-gray-50 rounded border border-gray-200" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value, provider: 'bank' })} />
                                <input required placeholder="Account Number" className="w-full p-2 bg-gray-50 rounded border border-gray-200" value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} />
                            </>
                        )}
                        {type === 'mobile_money' && (
                            <>
                                <select className="w-full p-2 bg-gray-50 rounded border border-gray-200" value={formData.provider} onChange={e => setFormData({ ...formData, provider: e.target.value })}>
                                    <option value="mtn">MTN Mobile Money</option>
                                    <option value="airtel">Airtel Money</option>
                                    <option value="zamtel">Zamtel Kwacha</option>
                                </select>
                                <input required placeholder="Phone Number" className="w-full p-2 bg-gray-50 rounded border border-gray-200" value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} />
                            </>
                        )}
                        {type === 'card' && (
                            <>
                                <input required placeholder="Card Number" className="w-full p-2 bg-gray-50 rounded border border-gray-200" value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value, provider: 'visa' })} />
                                <input required placeholder="Expiry (MM/YY)" className="w-full p-2 bg-gray-50 rounded border border-gray-200" value={formData.expiry} onChange={e => setFormData({ ...formData, expiry: e.target.value })} />
                            </>
                        )}
                        <input required placeholder="Account Name / Holder Name" className="w-full p-2 bg-gray-50 rounded border border-gray-200" value={formData.accountName} onChange={e => setFormData({ ...formData, accountName: e.target.value })} />

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit" variant="primary">Save</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const DeletePayoutModal: React.FC<{ method: any, onConfirm: () => void, onClose: () => void }> = ({ method, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
            <h3 className="text-2xl font-bold text-kithly-dark">Remove Payout Method?</h3>
            <p className="mt-2 text-gray-500">Are you sure you want to remove this payment method?</p>
            <div className="mt-8 flex justify-center space-x-4">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={onConfirm}>Remove</Button>
            </div>
        </div>
    </div>
);

export default ShopPortal;
