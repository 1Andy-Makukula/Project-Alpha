
import React, { useState, useEffect, useMemo } from 'react';
import CustomerHeader from '../components/CustomerHeader';
import Footer from '../components/Footer';
import { View } from '../types';
import { GiftIcon, StarIcon } from '../components/icons/FeatureIcons';
import { 
    UserIcon, SettingsIcon, LogoutIcon, XIcon, CreditCardIcon, 
    TrendingUpIcon, QRIcon, CheckCircleIcon, ClockIcon, PencilIcon, 
    TrashIcon, PlusCircleIcon, BellIcon, LockClosedIcon, 
    CloudArrowDownIcon, PhoneArrowDownIcon, GoogleIcon, 
    ChevronLeftIcon, ChevronRightIcon, SearchIcon, DocumentTextIcon, 
    ChatBubbleIcon, HistoryIcon, HeartIcon 
} from '../components/icons/NavigationIcons';
import { VisaIcon, MastercardIcon, AirtelIcon, MtnIcon, ZamtelIcon } from '../components/icons/BrandIcons';
import { Order } from '../components/OrderCard';
import AnimatedNumber from '../components/AnimatedNumber';
import Button from '../components/Button';
import BackToTopButton from '../components/BackToTopButton';
import AnimatedBackButton from '../components/AnimatedBackButton';
import { ToastType } from '../components/Toast';
import confetti from 'canvas-confetti';
import { generateReceipt } from '../utils/receiptGenerator';
import { QRCodeSVG } from 'qrcode.react';

// --- INTERFACES & MOCK DATA ---

interface CustomerDashboardProps {
  setView: (view: View) => void;
  cartItemCount: number;
  onCartClick: () => void;
  orders: Order[];
  checkoutSuccess?: boolean;
  onDismissSuccess?: () => void;
  showToast: (message: string, type: ToastType) => void;
  targetCity: string;
  setTargetCity: (city: string) => void;
  onSendReview: (review: { rating: number; message: string; orderId: string }) => void;
}

type Tab = 'dashboard' | 'orders' | 'contacts' | 'gifts' | 'settings';

interface Contact {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface PaymentMethod {
    id: number;
    type: 'card' | 'mobile_money';
    provider: 'visa' | 'mastercard' | 'airtel' | 'mtn' | 'zamtel';
    detail: string; // Last 4 for card, Phone for mobile
    expiry?: string; // Card only
}

// --- NEW TYPE FOR REVIEW DATA ---
interface ReviewData {
    rating: number;
    message: string;
    orderId: string;
}

const mockContacts: Contact[] = [
    { id: 1, name: 'Mum', email: 'mum@example.com', phone: '+260 977 123 456' },
    { id: 2, name: 'Dad', email: 'dad@example.com', phone: '+260 966 654 321' },
    { id: 3, name: 'Sis', email: 'sis@example.com', phone: '+260 955 112 233' },
];

const mockPaymentMethods: PaymentMethod[] = [
    { id: 1, type: 'card', provider: 'visa', detail: '4242', expiry: '12/26' },
    { id: 2, type: 'mobile_money', provider: 'mtn', detail: '096 555 1234' },
];

const mockReceivedGifts = [
    { id: 1, itemName: "Handcrafted Vase", from: "Adanna E.", date: "2024-07-28", image: "https://images.unsplash.com/photo-1581783342308-f792ca93d4f2?auto=format&fit=crop&q=80&w=200"},
    { id: 2, itemName: "Gourmet Chocolate Box", from: "Michael O.", date: "2024-07-25", image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&q=80&w=200"},
];

const mockLikedItems = [
    { id: 105, name: "Organic Milk (1L)", price: 110.00, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=400", shop: "Mama's Kitchen" },
    { id: 104, name: "Artisanal Bread Loaf", price: 130.00, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400", shop: "Lusaka Bakery" },
];

const mockNotificationHistory = [
    { id: 1, date: '2024-10-24', time: '14:30', message: 'Your order #KLY-8ADG4 is ready for pickup.' },
    { id: 2, date: '2024-10-23', time: '09:15', message: 'New offer: 20% off at Mama\'s Kitchen.' },
    { id: 3, date: '2024-10-20', time: '18:45', message: 'Order #KLY-9BHF5 was successfully collected.' },
];

// --- PRE-WRITTEN QUICK MESSAGES ---
const QUICK_MESSAGES = [
    "The packaging was beautiful! 🎁",
    "My family loved the gift! ❤️",
    "Delivery was perfectly on time! ⏱️",
    "Items were fresh and lovely! 🌸",
    "Excellent service, will order again! ⭐"
];

// --- MAIN COMPONENT ---

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ 
    setView, cartItemCount, onCartClick, orders, checkoutSuccess, onDismissSuccess, showToast, targetCity, setTargetCity, onSendReview 
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [showSuccess, setShowSuccess] = useState(checkoutSuccess);
    
    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // State for Contacts
    const [contacts, setContacts] = useState<Contact[]>(mockContacts);
    const [contactSearchQuery, setContactSearchQuery] = useState('');
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isImportContactsModalOpen, setIsImportContactsModalOpen] = useState(false);
    const [contactModalMode, setContactModalMode] = useState<'add' | 'edit'>('add');
    const [currentContact, setCurrentContact] = useState<Contact | null>(null);
    const [isDeleteContactModalOpen, setIsDeleteContactModalOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

    // State for Payment Methods
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] = useState(false);
    const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<PaymentMethod | null>(null);

    // State for Gifts
    const [activeGiftTab, setActiveGiftTab] = useState('bought');

    // State for Orders
    const [viewingOrderQR, setViewingOrderQR] = useState<Order | null>(null);
    const [isQrView, setIsQrView] = useState(true); // Toggle for QR vs Text
    const [activeOrderListTab, setActiveOrderListTab] = useState<'active' | 'history'>('active');
    
    // State for "Send Thanks" Review Modal
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [currentOrderToReview, setCurrentOrderToReview] = useState<Order | null>(null);
    const [review, setReview] = useState<ReviewData>({ rating: 5, message: '', orderId: '' });

    // Settings Tab State
    const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
    
    // Notification Settings State
    const [notifPreferences, setNotifPreferences] = useState({
        pickup: true,
        shopUpdates: true,
        marketing: false
    });

    // --- EFFECTS ---
    useEffect(() => {
        if (checkoutSuccess) {
            setShowSuccess(true);
            // FIRE CONFETTI!
            const duration = 3000;
            const end = Date.now() + duration;
            const frame = () => {
                confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#F85A47', '#008080', '#FFD700'] });
                confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#F85A47', '#008080', '#FFD700'] });
                if (Date.now() < end) requestAnimationFrame(frame);
            };
            frame();
            const timer = setTimeout(() => handleDismiss(), 8000);
            return () => clearTimeout(timer);
        }
    }, [checkoutSuccess]);

    const handleDismiss = () => {
        setShowSuccess(false);
        if (onDismissSuccess) onDismissSuccess();
    };
    
    const handleShareWhatsApp = (order: Order) => {
        const text = `Hey! I sent you a gift on Kithly. You can collect it at ${order.shopName} using this code: ${order.collectionCode}. \n\nView details here: https://aistudio.google.com/apps/drive/1U4z7Tar-JrVX_J-7luIvuA1sUgJ6oCOb?showPreview=true&showAssistant=true \n\nEnjoy!`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };
    
    // --- Review Handlers ---
    const openReviewModal = (order: Order) => {
        setCurrentOrderToReview(order);
        setReview({ rating: 5, message: '', orderId: order.id });
        setIsReviewModalOpen(true);
    };

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this submits the review to the API
        console.log("Submitting review:", review);
        onSendReview(review);
        showToast(`Thank you! Your ${review.rating}-star review has been sent to the shop.`, 'success');
        setIsReviewModalOpen(false);
    };

    const addQuickMessage = (msg: string) => {
        setReview(prev => ({
            ...prev,
            message: prev.message ? `${prev.message} ${msg}` : msg
        }));
    };

    const addHeart = () => {
        setReview(prev => ({ ...prev, message: prev.message + " ❤️" }));
    }

    // --- Contact Handlers ---
    const openContactModal = (mode: 'add' | 'edit', contact?: Contact) => {
        setContactModalMode(mode);
        setCurrentContact(contact || { id: 0, name: '', email: '', phone: '' });
        setIsContactModalOpen(true);
    };

    const closeContactModal = () => {
        setIsContactModalOpen(false);
        setCurrentContact(null);
    };

    const handleContactSave = (contact: Contact) => {
        if (contactModalMode === 'add') {
            setContacts(prev => [...prev, { ...contact, id: Date.now() }]);
            showToast("Contact added", 'success');
        } else {
            setContacts(prev => prev.map(c => c.id === contact.id ? contact : c));
            showToast("Contact updated", 'success');
        }
        closeContactModal();
    };
    
    const handleImportContacts = (newContacts: Contact[]) => {
        setContacts(prev => [...prev, ...newContacts]);
        setIsImportContactsModalOpen(false);
        showToast(`${newContacts.length} contacts imported`, 'success');
    };
    
    const openDeleteContactModal = (contact: Contact) => {
        setContactToDelete(contact);
        setIsDeleteContactModalOpen(true);
    };

    const closeDeleteContactModal = () => {
        setContactToDelete(null);
        setIsDeleteContactModalOpen(false);
    };

    const confirmDeleteContact = () => {
        if (contactToDelete) {
            setContacts(prev => prev.filter(c => c.id !== contactToDelete.id));
            showToast("Contact deleted", 'info');
        }
        closeDeleteContactModal();
    };

     // --- Payment Method Handlers ---
    const handlePaymentSave = (newMethod: Omit<PaymentMethod, 'id'>) => {
        setPaymentMethods(prev => [...prev, { ...newMethod, id: Date.now() }]);
        setIsPaymentModalOpen(false);
        showToast("Payment method added", 'success');
    };

    const openDeletePaymentModal = (method: PaymentMethod) => {
        setPaymentMethodToDelete(method);
        setIsDeletePaymentModalOpen(true);
    };

    const closeDeletePaymentModal = () => {
        setPaymentMethodToDelete(null);
        setIsDeletePaymentModalOpen(false);
    };

    const confirmDeletePayment = () => {
        if (paymentMethodToDelete) {
            setPaymentMethods(prev => prev.filter(p => p.id !== paymentMethodToDelete.id));
             showToast("Payment method removed", 'info');
        }
        closeDeletePaymentModal();
    };
    
    const toggleNotification = (key: keyof typeof notifPreferences) => {
        setNotifPreferences(prev => ({ ...prev, [key]: !prev[key] }));
        showToast("Preferences saved", 'info');
    };

    const getPaymentIcon = (provider: string) => {
        switch(provider) {
            case 'visa': return <VisaIcon className="w-10 h-auto"/>;
            case 'mastercard': return <MastercardIcon className="w-10 h-auto"/>;
            case 'airtel': return <AirtelIcon className="w-10 h-10"/>;
            case 'mtn': return <MtnIcon className="w-10 h-10"/>;
            case 'zamtel': return <ZamtelIcon className="w-10 h-10"/>;
            default: return <CreditCardIcon className="w-10 h-10 text-gray-400"/>;
        }
    };


    // --- TAB RENDERERS ---
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
                const uniqueRecipients = new Set(orders.map(o => o.customerName)).size;
                const recentOrders = orders.slice(0, 3);
                return (
                    <div className="animate-fade-in space-y-8">
                        {/* Stats Card */}
                        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border-t-4 border-kithly-primary relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-64 h-64 bg-kithly-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider relative z-10">Your KithLy Impact</h3>
                            <p className="text-4xl md:text-5xl font-extrabold text-gray-900 my-4 relative z-10">
                                <AnimatedNumber value={totalSpent} formatter={(v) => `ZMK ${v.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`} />
                            </p>
                            <p className="text-gray-600 mb-8 text-sm md:text-base relative z-10">Total amount sent to support loved ones.</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100 relative z-10">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-kithly-secondary/10 rounded-xl text-kithly-secondary">
                                        <GiftIcon className="w-6 h-6"/>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold"><AnimatedNumber value={orders.length} /></p>
                                        <p className="text-sm text-gray-500">Gifts Sent</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-kithly-accent/10 rounded-xl text-kithly-accent">
                                        <UserIcon className="w-6 h-6"/>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold"><AnimatedNumber value={uniqueRecipients} /></p>
                                        <p className="text-sm text-gray-500">Recipients</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-red-50 rounded-xl text-red-500">
                                        <CheckCircleIcon className="w-6 h-6"/>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold"><AnimatedNumber value={mockLikedItems.length} /></p>
                                        <p className="text-sm text-gray-500">Favorites</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
                                <Button variant="secondary" onClick={() => setActiveTab('orders')} className="text-sm py-1.5 px-4">View All</Button>
                            </div>
                            <div className="space-y-4">
                                {recentOrders.length > 0 ? recentOrders.map(order => (
                                    <div key={order.id} className="bg-white p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                                        <div className="mb-3 sm:mb-0 flex items-center space-x-4">
                                            <div className="bg-gray-100 p-3 rounded-lg">
                                                <GiftIcon className="w-6 h-6 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{order.shopName}</p>
                                                <p className="text-sm text-gray-500">
                                                    Order {order.id} • {new Date(order.paidOn).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                                            <p className="font-bold text-lg text-kithly-primary">ZMK {order.total.toFixed(2)}</p>
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${order.status === 'collected' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {order.status === 'collected' ? 'Completed' : 'Awaiting Pickup'}
                                            </span>
                                        </div>
                                        {order.status === 'collected' && (
                                            <Button variant="secondary" onClick={() => openReviewModal(order)} className="text-xs flex items-center gap-1 py-2 px-3 mt-2 sm:mt-0 sm:ml-4">
                                                <HeartIcon className="w-4 h-4 text-kithly-primary" /> Send Thanks
                                            </Button>
                                        )}
                                    </div>
                                )) : <p className="text-gray-500 italic">No recent orders to display.</p>}
                            </div>
                        </div>
                    </div>
                );
            case 'orders':
                const activeOrders = orders.filter(o => o.status === 'paid');
                const historyOrders = orders.filter(o => o.status === 'collected').sort((a, b) => new Date(b.collectedOn || '').getTime() - new Date(a.collectedOn || '').getTime());

                return (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold mb-6 text-gray-900">Orders & Pickup</h2>
                         <div className="border-b border-gray-200 mb-6 overflow-x-auto">
                            <nav className="-mb-px flex space-x-8">
                                <button onClick={() => setActiveOrderListTab('active')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${activeOrderListTab === 'active' ? 'border-kithly-primary text-kithly-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                    Active Orders ({activeOrders.length})
                                </button>
                                 <button onClick={() => setActiveOrderListTab('history')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${activeOrderListTab === 'history' ? 'border-kithly-primary text-kithly-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                    History
                                </button>
                            </nav>
                        </div>

                        {activeOrderListTab === 'active' && (
                            <div className="space-y-6">
                                {activeOrders.length > 0 ? activeOrders.map(order => (
                                    <div key={order.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
                                        <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="flex items-start space-x-4">
                                                 <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                                                    <img src={order.items[0]?.image || 'https://picsum.photos/200'} alt="Order Item" className="w-full h-full object-cover"/>
                                                 </div>
                                                 <div>
                                                    <h3 className="font-bold text-xl text-gray-900">{order.shopName}</h3>
                                                    <p className="text-sm text-gray-500 mb-1">Order ID: <span className="font-mono text-gray-700">{order.id}</span></p>
                                                    <div className="text-sm text-gray-600 space-y-1 mt-2">
                                                        <p>{order.itemCount} Items</p>
                                                        <p className="font-semibold text-kithly-primary">Total: ZMK {order.total.toFixed(2)}</p>
                                                    </div>
                                                 </div>
                                            </div>
                                            <div className="flex flex-col items-end space-y-3 w-full lg:w-auto">
                                                <div className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                                                    <ClockIcon className="w-3.5 h-3.5" />
                                                    <span>Awaiting Collection</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-end">
                                                    <Button variant="secondary" onClick={() => handleShareWhatsApp(order)} className="flex items-center justify-center space-x-2 !py-2.5">
                                                        <ChatBubbleIcon className="w-4 h-4" />
                                                        <span>Share Gift</span>
                                                    </Button>
                                                    <Button variant="primary" onClick={() => { setViewingOrderQR(order); setIsQrView(true); }} className="flex items-center justify-center space-x-2 shadow-lg shadow-orange-200 !py-2.5">
                                                        <QRIcon className="w-4 h-4" />
                                                        <span>Pickup Code</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                     <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                            <QRIcon className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900">No Active Orders</h3>
                                        <p className="text-gray-500 mt-1">You haven't sent any gifts recently.</p>
                                        <button onClick={() => setView('customerPortal')} className="mt-6 px-6 py-2 bg-kithly-light text-kithly-primary rounded-full font-bold hover:bg-orange-100 transition-colors">
                                            Start Gifting
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeOrderListTab === 'history' && (
                             <div className="space-y-4">
                                 {historyOrders.length > 0 ? historyOrders.map(order => (
                                     <div key={order.id} className="bg-white p-5 rounded-xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between opacity-90 hover:opacity-100 transition-all hover:shadow-md">
                                        <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                                            <div className="p-2 bg-green-100 text-green-600 rounded-full">
                                                <CheckCircleIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{order.shopName}</p>
                                                <p className="text-xs text-gray-500">Order: {order.id}</p>
                                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                                    Collected on {new Date(order.collectedOn!).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 ml-14 sm:ml-0">
                                            <div className="text-left sm:text-right mr-2">
                                                <p className="font-bold text-lg text-gray-900">ZMK {order.total.toFixed(2)}</p>
                                                <p className="text-xs text-gray-500">{order.itemCount} items</p>
                                            </div>
                                            
                                            {/* NEW: Send Thanks Button (Addition C) */}
                                            <Button variant="secondary" onClick={() => openReviewModal(order)} className="text-xs flex items-center gap-1 py-2 px-3">
                                                <HeartIcon className="w-4 h-4 text-kithly-primary" /> Send Thanks
                                            </Button>

                                            <button 
                                                onClick={() => generateReceipt(order)}
                                                className="sm:ml-2 p-2 text-gray-400 hover:text-kithly-primary hover:bg-gray-100 rounded-full transition-colors"
                                                title="Download Receipt"
                                            >
                                                <DocumentTextIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                     </div>
                                 )) : (
                                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                            <HistoryIcon className="w-8 h-8" />
                                        </div>
                                        <p className="text-center text-gray-500">No past orders yet.</p>
                                    </div>
                                 )}
                             </div>
                        )}
                    </div>
                );
            case 'contacts':
                const filteredContacts = contacts.filter(contact =>
                    contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
                    contact.email.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
                    contact.phone.includes(contactSearchQuery)
                );

                 return (
                    <div className="animate-fade-in">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                             <h2 className="text-3xl font-bold text-gray-900">Contacts</h2>
                             <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                                <Button variant="secondary" onClick={() => setIsImportContactsModalOpen(true)} className="w-full sm:w-auto justify-center">
                                    <span className="flex items-center space-x-2"><CloudArrowDownIcon className="w-5 h-5" /> <span>Import</span></span>
                                </Button>
                                <Button variant="primary" onClick={() => openContactModal('add')} className="w-full sm:w-auto justify-center">
                                    <span className="flex items-center space-x-2"><PlusCircleIcon className="w-5 h-5" /> <span>Add New</span></span>
                                </Button>
                             </div>
                        </div>
                        <p className="text-gray-500 mb-6">Manage your recipients for a faster checkout experience.</p>
                        
                        <div className="mb-8 relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400 group-focus-within:text-kithly-primary transition-colors" />
                            </div>
                            <input
                                type="text"
                                name="contactSearch"
                                placeholder="Search by name, email, or phone..."
                                className="pl-10 block w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent transition-all shadow-sm hover:shadow-md"
                                value={contactSearchQuery}
                                onChange={(e) => setContactSearchQuery(e.target.value)}
                            />
                        </div>

                        {filteredContacts.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredContacts.map(contact => (
                                    <div key={contact.id} className="bg-white p-5 rounded-2xl flex justify-between items-start shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
                                        <div>
                                            <p className="font-bold text-lg text-gray-900 group-hover:text-kithly-primary transition-colors">{contact.name}</p>
                                            <p className="text-sm text-gray-500">{contact.email}</p>
                                            <p className="text-sm text-gray-500 mt-1 bg-gray-50 px-2 py-0.5 rounded inline-block">{contact.phone}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => openContactModal('edit', contact)} className="p-2 text-gray-400 hover:text-kithly-primary hover:bg-gray-100 rounded-full" aria-label="Edit contact"><PencilIcon className="w-5 h-5" /></button>
                                            <button onClick={() => openDeleteContactModal(contact)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full" aria-label="Delete contact"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <UserIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No Contacts Found</h3>
                                <p className="text-gray-500 mt-1">
                                    {contactSearchQuery ? `No matches for "${contactSearchQuery}"` : "You haven't added any contacts yet."}
                                </p>
                                {contactSearchQuery && (
                                    <button onClick={() => setContactSearchQuery('')} className="mt-4 text-kithly-primary font-semibold hover:underline">
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        )}
                        
                        {isContactModalOpen && <ContactModal mode={contactModalMode} contact={currentContact} onSave={handleContactSave} onClose={closeContactModal} />}
                        {isImportContactsModalOpen && <ImportContactsModal onImport={handleImportContacts} onClose={() => setIsImportContactsModalOpen(false)} />}
                        {isDeleteContactModalOpen && <DeleteContactModal contact={contactToDelete} onConfirm={confirmDeleteContact} onClose={closeDeleteContactModal} />}
                    </div>
                );
            case 'gifts':
                 const giftTabs = [ {id: 'bought', name: 'Bought Items'}, {id: 'received', name: 'Received Gifts'}, {id: 'liked', name: 'Liked Items'} ];
                 return (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold mb-6 text-gray-900">My Gifts</h2>
                        <div className="border-b border-gray-200 mb-6 overflow-x-auto">
                            <nav className="-mb-px flex space-x-8">
                                {giftTabs.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveGiftTab(tab.id)}
                                     className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${activeGiftTab === tab.id ? 'border-kithly-primary text-kithly-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        {activeGiftTab === 'bought' && (
                             <div className="space-y-4">
                               {orders.length > 0 ? orders.flatMap(o => o.items).map((item, index) => (
                                   <div key={index} className="bg-white p-4 rounded-xl flex items-center space-x-4 border border-gray-100 hover:shadow-sm">
                                       <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src="https://placehold.co/100x100/f3f4f6/a1a1a1?text=Item"; }} />
                                       <div className="flex-grow">
                                            <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                       </div>
                                       <p className="font-bold text-sm text-kithly-primary">ZMK {(item.price * item.quantity).toFixed(2)}</p>
                                   </div>
                               )) : (
                                   <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed">No items bought yet.</div>
                                )}
                           </div>
                        )}
                        {activeGiftTab === 'received' && (
                             <div className="space-y-4">
                                {mockReceivedGifts.length > 0 ? mockReceivedGifts.map(gift => (
                                    <div key={gift.id} className="bg-white p-4 rounded-xl flex items-center space-x-4 border border-gray-100 hover:shadow-sm">
                                        <img src={gift.image} alt={gift.itemName} className="w-16 h-16 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src="https://placehold.co/100x100/f3f4f6/a1a1a1?text=Gift"; }} />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm text-gray-900">{gift.itemName}</p>
                                            <p className="text-xs text-gray-500">From: {gift.from} on {gift.date}</p>
                                        </div>
                                    </div>
                                )) : (
                                     <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
                                        <GiftIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">No received gifts yet.</p>
                                     </div>
                                )}
                            </div>
                        )}
                        {activeGiftTab === 'liked' && (
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {mockLikedItems.length > 0 ? mockLikedItems.map(item => (
                                    <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-lg transition-all">
                                        <div className="relative h-48 w-full overflow-hidden">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src="https://placehold.co/400x300/f3f4f6/a1a1a1?text=Product"; }}/>
                                        </div>
                                        <div className="p-4">
                                            <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.shop}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="font-bold text-sm text-kithly-primary">ZMK {item.price.toFixed(2)}</p>
                                                <button className="p-1.5 bg-red-50 rounded-full" aria-label="Unlike item"><UserIcon className="text-red-500 w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed">No liked items yet.</div>
                                )}
                             </div>
                        )}
                    </div>
                );
            case 'settings':
                const settingsTabs = [
                    { id: 'profile', name: 'Profile', icon: <UserIcon className="w-5 h-5"/> },
                    { id: 'payment', name: 'Payment Methods', icon: <CreditCardIcon className="w-5 h-5"/> },
                    { id: 'notifications', name: 'Notifs', icon: <BellIcon className="w-5 h-5"/> },
                    { id: 'security', name: 'Security', icon: <LockClosedIcon className="w-5 h-5"/> },
                ];

                 return (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold mb-2 text-gray-900">Settings</h2>
                         <p className="text-sm text-gray-500 mb-8">Manage your profile preferences and account settings.</p>

                         <div className="flex space-x-2 overflow-x-auto pb-2 mb-8 scrollbar-hide bg-white p-1.5 rounded-xl shadow-sm w-full md:w-fit border border-gray-100">
                            {settingsTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveSettingsTab(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                                        activeSettingsTab === tab.id
                                            ? 'bg-kithly-light text-kithly-primary shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {tab.icon}
                                    <span>{tab.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md min-h-[400px] border border-gray-100">
                            {activeSettingsTab === 'profile' && (
                                <div className="animate-fade-in">
                                    <h3 className="text-xl font-semibold mb-4 pb-2 border-b">Profile Information</h3>
                                    <form className="space-y-6 max-w-lg" onSubmit={(e) => { e.preventDefault(); showToast("Profile updated", 'success'); }}>
                                        <div>
                                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                            <input id="fullName" type="text" defaultValue="Ada Lovelace" className="mt-1 block w-full bg-kithly-light border-transparent rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent transition-shadow"/>
                                        </div>
                                        <div>
                                            <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">Email Address</label>
                                            <input id="emailAddress" type="email" defaultValue="ada.lovelace@example.com" className="mt-1 block w-full bg-kithly-light border-transparent rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent transition-shadow"/>
                                        </div>
                                        <div className="pt-2">
                                            <Button type="submit" variant="primary">Update Profile</Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                             {activeSettingsTab === 'payment' && (
                                <div className="animate-fade-in">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-2 border-b gap-4">
                                        <h3 className="text-xl font-semibold">Saved Payment Methods</h3>
                                        <Button variant="secondary" onClick={() => setIsPaymentModalOpen(true)} className="w-full sm:w-auto justify-center">
                                            <span className="flex items-center space-x-2"><PlusCircleIcon className="w-5 h-5" /> <span>Add New Method</span></span>
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {paymentMethods.map(method => (
                                            <div key={method.id} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-100 hover:border-gray-300 transition-colors hover:bg-white hover:shadow-sm">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-14 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm p-1 border border-gray-100">
                                                        {getPaymentIcon(method.provider)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 capitalize">
                                                            {method.provider.replace('_', ' ')}
                                                            {method.type === 'card' ? ` ending in ${method.detail}` : ''}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {method.type === 'card' ? `Expires ${method.expiry}` : method.detail}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button onClick={() => openDeletePaymentModal(method)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" aria-label="Remove payment method"><TrashIcon className="w-5 h-5" /></button>
                                            </div>
                                        ))}
                                        {paymentMethods.length === 0 && (
                                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                                                No payment methods added yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                             {activeSettingsTab === 'notifications' && (
                                <div className="animate-fade-in">
                                    <h3 className="text-xl font-semibold mb-6 pb-2 border-b">Notifications</h3>
                                    
                                    <div className="mb-8">
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">History</h4>
                                        <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {mockNotificationHistory.map((notif) => (
                                                        <tr key={notif.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <div className="flex flex-col">
                                                                    <span>{notif.date}</span>
                                                                    <span className="text-xs text-gray-400">{notif.time}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-900">{notif.message}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Preferences</h4>
                                        <div className="space-y-6">
                                             {[
                                                { key: 'pickup', label: 'Pickup Notifications', desc: 'Get notified when items are ready' },
                                                { key: 'shopUpdates', label: 'Shop Updates', desc: 'New items from favorite shops' },
                                                { key: 'marketing', label: 'Marketing & Updates', desc: 'Platform news and tips' }
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between">
                                                    <div className="pr-4">
                                                        <p className="font-medium text-gray-900">{item.label}</p>
                                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => toggleNotification(item.key as any)}
                                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-kithly-accent focus:ring-offset-2 ${notifPreferences[item.key as keyof typeof notifPreferences] ? 'bg-kithly-primary' : 'bg-gray-300'}`}
                                                    >
                                                        <span aria-hidden="true" className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifPreferences[item.key as keyof typeof notifPreferences] ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSettingsTab === 'security' && (
                                <div className="animate-fade-in">
                                    <h3 className="text-xl font-semibold mb-4 pb-2 border-b">Change Password</h3>
                                    <form className="space-y-4 max-w-lg" onSubmit={(e) => { e.preventDefault(); showToast("Password changed successfully!", 'success'); }}>
                                        <div>
                                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                                            <input id="currentPassword" type="password" className="mt-1 block w-full bg-kithly-light border-transparent rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent"/>
                                        </div>
                                        <div>
                                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                                            <input id="newPassword" type="password" className="mt-1 block w-full bg-kithly-light border-transparent rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent"/>
                                        </div>
                                         <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                            <input id="confirmPassword" type="password" className="mt-1 block w-full bg-kithly-light border-transparent rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent"/>
                                        </div>
                                        <div className="pt-2">
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
    
    const tabs: { id: Tab; name: string; icon: React.ReactNode }[] = [
        { id: 'dashboard', name: 'Dashboard', icon: <TrendingUpIcon /> },
        { id: 'orders', name: 'Orders', icon: <QRIcon /> },
        { id: 'contacts', name: 'Contacts', icon: <UserIcon /> },
        { id: 'gifts', name: 'My Gifts', icon: <GiftIcon /> },
        { id: 'settings', name: 'Settings', icon: <SettingsIcon /> },
    ];

    return (
        <div className="bg-kithly-background min-h-screen flex flex-col">
            <CustomerHeader 
                setView={setView} 
                searchQuery="" 
                onSearchChange={() => {}} 
                cartItemCount={cartItemCount} 
                onCartClick={onCartClick}
                onMenuClick={() => setIsSidebarOpen(true)} 
                targetCity={targetCity}
                setTargetCity={setTargetCity}
            />

             <div className="flex-1 flex relative">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Responsive Sidebar */}
                <aside 
                    className={`
                        fixed lg:sticky top-[72px] left-0 h-[calc(100vh-72px)] bg-white shadow-lg lg:shadow-none z-50 flex flex-col transition-all duration-300 ease-in-out border-r border-gray-100
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
                        ${isCollapsed ? 'w-20' : 'w-64'}
                    `}
                >
                     <nav className="flex-grow py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center px-3 py-3 text-left text-sm font-semibold rounded-xl transition-all duration-200 group
                                    ${activeTab === tab.id ? 'gradient-bg text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}
                                    ${isCollapsed ? 'justify-center' : 'space-x-3'}
                                `}
                                title={isCollapsed ? tab.name : ''}
                            >
                                <span className={`w-6 h-6 flex-shrink-0 ${activeTab !== tab.id ? 'group-hover:text-kithly-primary transition-colors' : ''}`}>{tab.icon}</span>
                                {!isCollapsed && <span className="truncate">{tab.name}</span>}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={() => setView('landing')}
                            className={`w-full flex items-center px-3 py-3 text-left text-sm font-semibold rounded-xl text-gray-600 hover:bg-gray-100 transition-colors duration-200
                                ${isCollapsed ? 'justify-center' : 'space-x-3'}
                            `}
                            title={isCollapsed ? "Logout" : ''}
                        >
                            <LogoutIcon className="w-6 h-6 flex-shrink-0" />
                            {!isCollapsed && <span>Logout</span>}
                        </button>
                    </div>

                    {/* Collapse Toggle (Desktop Only) */}
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)} 
                        className="hidden lg:flex absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 shadow-md text-gray-500 hover:text-kithly-primary z-10 hover:scale-110 transition-transform"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
                    </button>
                </aside>

                <main className={`flex-1 px-4 md:px-8 py-8 overflow-x-hidden transition-all duration-300 w-full relative`}>
                    {showSuccess && (
                        <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 mb-8 rounded-r-xl relative animate-fade-in shadow-sm flex items-start">
                            <div className="py-1"><CheckCircleIcon className="h-6 w-6 text-green-500 mr-4" /></div>
                            <div className="flex-grow">
                                <p className="font-bold">Order Placed Successfully!</p>
                                <p className="text-sm">The shop has been notified and will prepare your items for pickup.</p>
                            </div>
                             <button onClick={handleDismiss} className="p-1.5 text-green-600 hover:bg-green-200 rounded-lg transition-colors" aria-label="Dismiss success message">
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    
                    <div className="max-w-6xl mx-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>
            
            {viewingOrderQR && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setViewingOrderQR(null)} role="dialog" aria-modal="true" aria-labelledby="qr-modal-title">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setViewingOrderQR(null)} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" aria-label="Close modal">
                            <XIcon className="w-5 h-5 text-gray-600" />
                        </button>
                        
                        <h3 id="qr-modal-title" className="text-2xl font-bold text-gray-900 mb-2">Pickup Code</h3>
                        <p className="text-gray-500 mb-6 text-sm">Show this code to the shopkeeper to collect your items.</p>
                        
                        {/* TOGGLE CONTROLS */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-gray-100 p-1.5 rounded-xl flex text-xs font-bold shadow-inner">
                                <button 
                                    onClick={() => setIsQrView(true)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${isQrView ? 'bg-white text-kithly-primary shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <QRIcon className="w-4 h-4" />
                                    Scan QR
                                </button>
                                <button 
                                    onClick={() => setIsQrView(false)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${!isQrView ? 'bg-white text-kithly-primary shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <DocumentTextIcon className="w-4 h-4" />
                                    Show Code
                                </button>
                            </div>
                        </div>
                        
                        {/* Content Area */}
                        <div className="flex justify-center mb-6 min-h-[200px] items-center">
                            {isQrView ? (
                                <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-sm animate-fade-in">
                                     <QRCodeSVG 
                                        value={viewingOrderQR.collectionCode} 
                                        size={180}
                                        fgColor="#F85A47"
                                        bgColor="#FFFFFF"
                                        level="H"
                                        className="mx-auto"
                                    />
                                </div>
                            ) : (
                                <div className="bg-orange-50/50 p-10 rounded-2xl border-2 border-orange-100 flex flex-col items-center justify-center h-[216px] w-[216px] animate-fade-in">
                                     <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">Code</p>
                                     <div className="text-3xl font-mono font-bold text-kithly-dark tracking-widest break-all">
                                        {viewingOrderQR.collectionCode}
                                     </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-kithly-light/50 py-3 px-6 rounded-xl border border-kithly-primary/20 mb-6">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Collection Code</p>
                            <p className="text-xl font-mono font-bold text-kithly-primary tracking-widest mt-1">{viewingOrderQR.collectionCode}</p>
                        </div>
                        
                        <div className="mt-4 border-t border-gray-100 pt-4">
                             <p className="font-bold text-gray-900">{viewingOrderQR.shopName}</p>
                             <p className="text-sm text-gray-500">{viewingOrderQR.itemCount} items • ZMK {viewingOrderQR.total.toFixed(2)}</p>
                        </div>
                         <div className="mt-6">
                             <Button variant="secondary" onClick={() => handleShareWhatsApp(viewingOrderQR)} className="w-full flex items-center justify-center space-x-2 shadow-sm hover:shadow-md">
                                <ChatBubbleIcon className="w-5 h-5" />
                                <span>Share on WhatsApp</span>
                             </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- NEW MODAL: Send Thanks / Review Modal (Addition C) --- */}
            {isReviewModalOpen && currentOrderToReview && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh]">
                        <form onSubmit={handleReviewSubmit} className="flex flex-col h-full">
                            <div className="p-6 sm:p-8 overflow-y-auto flex-grow">
                                <h3 className="text-2xl font-bold text-kithly-dark mb-2">How Was Your Gift?</h3>
                                <p className="text-gray-600 mb-6">
                                    Send a quick rating and message to <span className="font-bold">{currentOrderToReview.shopName}</span>.
                                </p>
                                
                                <div className="text-center mb-6">
                                    <h4 className="font-semibold text-gray-700 mb-2">Your Rating</h4>
                                    <div className="flex justify-center space-x-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                type="button"
                                                key={star}
                                                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                                onClick={() => setReview(prev => ({ ...prev, rating: star }))}
                                            >
                                                <StarIcon
                                                    className={`w-10 h-10 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Custom Message Area */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <label htmlFor="review-message" className="block text-sm font-medium text-gray-700">Your Message (Optional)</label>
                                        <button 
                                            type="button" 
                                            onClick={addHeart}
                                            className="text-xs flex items-center bg-red-50 text-red-600 px-2 py-1 rounded-full hover:bg-red-100 transition-colors border border-red-100"
                                        >
                                            <HeartIcon className="w-3 h-3 mr-1 text-red-500" /> Add Heart
                                        </button>
                                    </div>
                                    <textarea 
                                        id="review-message"
                                        rows={3}
                                        value={review.message}
                                        onChange={(e) => setReview(prev => ({ ...prev, message: e.target.value }))}
                                        placeholder="Write your own message..."
                                        className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent focus:border-kithly-accent sm:text-sm transition-all resize-none"
                                    />
                                </div>

                                {/* Quick Messages Chips */}
                                <div className="mt-6">
                                    <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Or pick a quick message:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {QUICK_MESSAGES.map((msg, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => addQuickMessage(msg)}
                                                className="bg-white hover:bg-kithly-light border border-gray-200 hover:border-kithly-primary/30 text-gray-700 text-xs px-3 py-2 rounded-full transition-all active:scale-95 shadow-sm"
                                            >
                                                {msg}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3 border-t border-gray-100 flex-shrink-0">
                                <Button type="button" variant="secondary" onClick={() => setIsReviewModalOpen(false)}>Cancel</Button>
                                <Button type="submit" variant="primary">Send Thanks</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-40">
                <AnimatedBackButton onClick={() => setView('customerPortal')} label="Shop" />
            </div>

            {isPaymentModalOpen && <PaymentModal onSave={handlePaymentSave} onClose={() => setIsPaymentModalOpen(false)} />}
            {isDeletePaymentModalOpen && <DeletePaymentModal method={paymentMethodToDelete} onConfirm={confirmDeletePayment} onClose={closeDeletePaymentModal} />}
            {isContactModalOpen && <ContactModal mode={contactModalMode} contact={currentContact} onSave={handleContactSave} onClose={closeContactModal} />}
            {isImportContactsModalOpen && <ImportContactsModal onImport={handleImportContacts} onClose={() => setIsImportContactsModalOpen(false)} />}
            {isDeleteContactModalOpen && <DeleteContactModal contact={contactToDelete} onConfirm={confirmDeleteContact} onClose={closeDeleteContactModal} />}
            
            <Footer setView={setView} />
            <BackToTopButton />
        </div>
    );
};

// --- MODALS (Preserved Logic, Refined UI) ---

const ImportContactsModal: React.FC<{onImport: (contacts: Contact[]) => void; onClose: () => void}> = ({ onImport, onClose }) => {
    const [importing, setImporting] = useState(false);

    const mockImport = (source: string) => {
        setImporting(true);
        setTimeout(() => {
            const newContacts = [
                { id: Date.now(), name: `Auntie (${source})`, email: 'auntie@example.com', phone: '+260977123456' },
                { id: Date.now() + 1, name: `Uncle (${source})`, email: 'uncle@example.com', phone: '+260966654321' },
            ];
            onImport(newContacts);
            setImporting(false);
        }, 1500);
    };

    const handlePhoneImport = async () => {
        setImporting(true);
        // Note: The navigator.contacts API is typically restricted to secure contexts 
        // (HTTPS) and requires user gesture/permission. This mock is for demonstration.
        if ('contacts' in navigator && 'ContactsManager' in window) {
             try {
                // @ts-ignore
                const props = ['name', 'email', 'tel'];
                // @ts-ignore
                const opts = { multiple: true };
                // @ts-ignore
                const contacts = await navigator.contacts.select(props, opts);
                
                if (contacts.length > 0) {
                     const mappedContacts = contacts.map((c: any, index: number) => ({
                        id: Date.now() + index,
                        name: c.name?.[0] || 'Unknown',
                        email: c.email?.[0] || '',
                        phone: c.tel?.[0] || ''
                     }));
                     onImport(mappedContacts);
                } else {
                     mockImport("Phone (Mocked Fail)"); // Fallback for permission denial or empty result
                }
            } catch (ex) {
                 console.log("Contact import cancelled or failed", ex);
                 mockImport("Phone (Mocked Error)"); // Fallback for real error
            } finally {
                setImporting(false);
            }
        } else {
             mockImport("Phone (Mocked)");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-4 animate-fade-in backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="import-modal-title">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-8 relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close import modal"><XIcon className="w-5 h-5"/></button>
                <h3 id="import-modal-title" className="text-2xl font-bold mb-2 text-gray-900">Import Contacts</h3>
                <p className="text-gray-500 mb-8">Choose a source to import your contacts from.</p>
                {importing ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kithly-primary"></div>
                        <p className="mt-4 text-gray-600">Importing contacts...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <button onClick={() => mockImport('Google')} className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all group shadow-sm hover:shadow-md">
                            <div className="p-2.5 bg-red-50 text-red-600 rounded-full mr-4 group-hover:bg-red-100 transition-colors">
                                <GoogleIcon className="w-6 h-6"/>
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-900">Google Contacts</p>
                                <p className="text-xs text-gray-500">Import from your Google account</p>
                            </div>
                        </button>
                        <button onClick={() => mockImport('iCloud')} className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all group shadow-sm hover:shadow-md">
                             <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full mr-4 group-hover:bg-blue-100 transition-colors">
                                <CloudArrowDownIcon className="w-6 h-6"/>
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-900">iCloud</p>
                                <p className="text-xs text-gray-500">Import from Apple iCloud</p>
                            </div>
                        </button>
                        <button onClick={handlePhoneImport} className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all group shadow-sm hover:shadow-md">
                             <div className="p-2.5 bg-green-50 text-green-600 rounded-full mr-4 group-hover:bg-green-100 transition-colors">
                                <PhoneArrowDownIcon className="w-6 h-6"/>
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-900">Phone Contacts</p>
                                <p className="text-xs text-gray-500">Import directly from this device (mocked)</p>
                            </div>
                        </button>
                    </div>
                )}
                <div className="mt-8">
                    <Button variant="secondary" onClick={onClose} className="w-full">Cancel</Button>
                </div>
            </div>
        </div>
    );
};

const ContactModal: React.FC<{mode: any, contact: any, onSave: any, onClose: any}> = ({ mode, contact, onSave, onClose }) => {
    const [formData, setFormData] = useState(contact || { id: 0, name: '', email: '', phone: ''});
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, [e.target.name]: e.target.value});
    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-4 animate-fade-in backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <form onSubmit={(e) => {e.preventDefault(); onSave(formData);}}>
                    <div className="p-8">
                        <h3 id="contact-modal-title" className="text-2xl font-bold mb-6 text-gray-900">{mode === 'add' ? 'Add New Contact' : 'Edit Contact'}</h3>
                        <div className="space-y-5">
                             <div>
                                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input id="contactName" type="text" name="name" placeholder="e.g., Auntie Mary" value={formData.name} onChange={handleChange} required className="block w-full bg-kithly-light rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-primary transition-shadow"/>
                             </div>
                             <div>
                                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input id="contactEmail" type="email" name="email" placeholder="email@example.com" value={formData.email} onChange={handleChange} required className="block w-full bg-kithly-light rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-primary transition-shadow"/>
                             </div>
                             <div>
                                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input id="contactPhone" type="tel" name="phone" placeholder="+260..." value={formData.phone} onChange={handleChange} required className="block w-full bg-kithly-light rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-primary transition-shadow"/>
                             </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3 border-t border-gray-100">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary">{mode === 'add' ? 'Add Contact' : 'Save Changes'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteContactModal: React.FC<{contact: any, onConfirm: any, onClose: any}> = ({ contact, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-4 animate-fade-in backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="delete-contact-title">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-8 h-8 text-red-500"/>
            </div>
            <h3 id="delete-contact-title" className="text-2xl font-bold text-gray-900">Delete Contact?</h3>
            <p className="mt-2 text-gray-500">Are you sure you want to remove <span className="font-bold text-gray-800">{contact?.name}</span>? This cannot be undone.</p>
            <div className="mt-8 flex justify-center space-x-4">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={onConfirm}>Delete</Button>
            </div>
        </div>
    </div>
);

const PaymentModal: React.FC<{onSave: any, onClose: any}> = ({ onSave, onClose }) => {
    const [type, setType] = useState<'card'|'mobile_money'>('card');
    const [details, setDetails] = useState({holder:'', num:'', exp:'', cvc:'', net:'mtn', phone:''});
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setDetails({...details, [e.target.name]: e.target.value});
    }

    const handleSave = () => {
        if (type === 'card') {
            if (details.num.length < 4 || !details.exp || !details.cvc) {
                // In a real app, show error toast
                console.error("Card details incomplete");
                return;
            }
            onSave({
                type, 
                provider: details.num.startsWith('4') ? 'visa' : 'mastercard', // Simple mock detection
                detail: details.num.slice(-4), 
                expiry: details.exp
            });
        } else {
            if (!details.phone) {
                // In a real app, show error toast
                console.error("Mobile Money details incomplete");
                return;
            }
            onSave({
                type, 
                provider: details.net, 
                detail: details.phone, 
            });
        }
    }

    return (
       <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-4 animate-fade-in backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
               <div className="p-8">
                    <h3 id="payment-modal-title" className="text-2xl font-bold mb-6 text-gray-900">Add Payment Method</h3>
                    
                    <div className="flex mb-6 bg-gray-100 p-1 rounded-xl">
                       <button onClick={()=>setType('card')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${type==='card'?'bg-white shadow text-kithly-primary':'text-gray-500 hover:text-gray-700'}`}>Card</button>
                       <button onClick={()=>setType('mobile_money')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${type==='mobile_money'?'bg-white shadow text-kithly-primary':'text-gray-500 hover:text-gray-700'}`}>Mobile Money</button>
                    </div>

                    {type === 'card' ? (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="cardNumber" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Card Number</label>
                                <div className="relative">
                                    <CreditCardIcon className="absolute left-3 top-3.5 text-gray-400 w-5 h-5"/>
                                    <input 
                                        id="cardNumber" 
                                        name="num"
                                        placeholder="0000 0000 0000 0000" 
                                        className="w-full pl-10 p-3 bg-kithly-light rounded-lg focus:outline-none focus:ring-2 focus:ring-kithly-primary" 
                                        onChange={handleChange}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={16}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                     <label htmlFor="cardExpiry" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Expiry</label>
                                     <input 
                                        id="cardExpiry" 
                                        name="exp"
                                        placeholder="MM/YY" 
                                        className="w-full p-3 bg-kithly-light rounded-lg focus:outline-none focus:ring-2 focus:ring-kithly-primary" 
                                        onChange={handleChange}
                                        type="text"
                                        maxLength={5}
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                     <label htmlFor="cardCVC" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CVC</label>
                                     <input 
                                        id="cardCVC" 
                                        name="cvc"
                                        placeholder="123" 
                                        className="w-full p-3 bg-kithly-light rounded-lg focus:outline-none focus:ring-2 focus:ring-kithly-primary" 
                                        onChange={handleChange}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={4}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="mobileNetwork" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Network</label>
                                <select 
                                    id="mobileNetwork" 
                                    name="net"
                                    className="w-full p-3 bg-kithly-light rounded-lg focus:outline-none focus:ring-2 focus:ring-kithly-primary" 
                                    onChange={handleChange} 
                                    value={details.net}
                                >
                                    <option value="mtn">MTN Mobile Money</option>
                                    <option value="airtel">Airtel Money</option>
                                    <option value="zamtel">Zamtel Kwacha</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="mobilePhone" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                                <input 
                                    id="mobilePhone" 
                                    name="phone"
                                    placeholder="+260..." 
                                    className="w-full p-3 bg-kithly-light rounded-lg focus:outline-none focus:ring-2 focus:ring-kithly-primary" 
                                    onChange={handleChange}
                                    type="tel"
                                    required
                                />
                            </div>
                        </div>
                    )}
               </div>
               <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3 border-t border-gray-100">
                   <Button variant="secondary" onClick={onClose}>Cancel</Button>
                   <Button variant="primary" onClick={handleSave}>Save Method</Button>
               </div>
           </div>
       </div>
    )
}

const DeletePaymentModal: React.FC<{method: any, onConfirm: any, onClose: any}> = ({ method, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-4 animate-fade-in backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="delete-payment-title">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-8 h-8 text-red-500"/>
            </div>
            <h3 id="delete-payment-title" className="text-2xl font-bold text-gray-900">Remove Method?</h3>
            <p className="mt-2 text-gray-500">Are you sure you want to remove this payment method?</p>
            <div className="mt-8 flex justify-center space-x-4">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={onConfirm}>Remove</Button>
            </div>
        </div>
    </div>
);

export default CustomerDashboard;
