
import React, { useState, useEffect } from 'react';
import CustomerHeader from '../components/CustomerHeader';
import Footer from '../components/Footer';
import { View } from '../App';
import { GiftIcon } from '../components/icons/FeatureIcons';
import { UserIcon, SettingsIcon, LogoutIcon, XIcon, CreditCardIcon, TrendingUpIcon, QRIcon, CheckCircleIcon, ClockIcon, PencilIcon, TrashIcon, PlusCircleIcon, ExclamationTriangleIcon, BellIcon, LockClosedIcon, CloudArrowDownIcon, PhoneArrowDownIcon, GoogleIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon, DocumentTextIcon, ChatBubbleIcon, HistoryIcon } from '../components/icons/NavigationIcons';
import { VisaIcon, MastercardIcon, AirtelIcon, MtnIcon, ZamtelIcon } from '../components/icons/BrandIcons';
import { Order } from '../components/OrderCard';
import AnimatedNumber from '../components/AnimatedNumber';
import Button from '../components/Button';
import BackToTopButton from '../components/BackToTopButton';
import { ToastType } from '../components/Toast';
import confetti from 'canvas-confetti';
import { generateReceipt } from '../utils/receiptGenerator';

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

const mockContacts: Contact[] = [
    { id: 1, name: 'Mum', email: 'mum@example.com', phone: '+1234567890' },
    { id: 2, name: 'Dad', email: 'dad@example.com', phone: '+0987654321' },
    { id: 3, name: 'Sis', email: 'sis@example.com', phone: '+1122334455' },
];

const mockPaymentMethods: PaymentMethod[] = [
    { id: 1, type: 'card', provider: 'visa', detail: '4242', expiry: '12/26' },
    { id: 2, type: 'mobile_money', provider: 'mtn', detail: '096 555 1234' },
];

const mockReceivedGifts = [
    { id: 1, itemName: "Handcrafted Vase", from: "Adanna E.", date: "2024-07-28", image: "https://picsum.photos/id/10/200/200"},
    { id: 2, itemName: "Gourmet Chocolate Box", from: "Michael O.", date: "2024-07-25", image: "https://picsum.photos/id/43/200/200"},
];

const mockLikedItems = [
    { id: 105, name: "Organic Milk (1L)", price: 110.00, image: "https://picsum.photos/id/493/400/400", shop: "Mama's Kitchen" },
    { id: 104, name: "Artisanal Bread Loaf", price: 130.00, image: "https://picsum.photos/id/184/400/400", shop: "Mama's Kitchen" },
];

const mockNotificationHistory = [
    { id: 1, date: '2024-10-24', time: '14:30', message: 'Your order #KLY-8ADG4 is ready for pickup.' },
    { id: 2, date: '2024-10-23', time: '09:15', message: 'New offer: 20% off at Mama\'s Kitchen.' },
    { id: 3, date: '2024-10-20', time: '18:45', message: 'Order #KLY-9BHF5 was successfully collected.' },
];

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ setView, cartItemCount, onCartClick, orders, checkoutSuccess, onDismissSuccess, showToast, targetCity, setTargetCity }) => {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [showSuccess, setShowSuccess] = useState(checkoutSuccess);
    
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
    const [activeOrderListTab, setActiveOrderListTab] = useState<'active' | 'history'>('active');
    
    // Settings Tab State
    const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
    
    // Notification Settings State
    const [notifPreferences, setNotifPreferences] = useState({
        pickup: true,
        shopUpdates: true,
        marketing: false
    });

    useEffect(() => {
        if (checkoutSuccess) {
            setShowSuccess(true);
            
            // FIRE CONFETTI!
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#F85A47', '#008080', '#FFD700'] // Kithly Brand Colors
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#F85A47', '#008080', '#FFD700']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();

            const timer = setTimeout(() => {
                handleDismiss();
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [checkoutSuccess]);

    const handleDismiss = () => {
        setShowSuccess(false);
        if (onDismissSuccess) {
            onDismissSuccess();
        }
    };
    
    const handleShareWhatsApp = (order: Order) => {
        const text = `Hey! I sent you a gift on Kithly. You can collect it at ${order.shopName} using this code: ${order.collectionCode}. Enjoy!`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };
    
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

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
                const uniqueRecipients = new Set(orders.map(o => o.customerName)).size;
                const recentOrders = orders.slice(0, 3);
                return (
                    <div className="animate-fade-in space-y-8">
                        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border-t-4 border-kithly-primary">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your KithLy Impact</h3>
                            <p className="text-4xl md:text-5xl font-bold gradient-text my-2">
                                <AnimatedNumber value={totalSpent} formatter={(v) => `ZMK ${v.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`} />
                            </p>
                            <p className="text-gray-600 mb-6 text-sm md:text-base">This is the total amount you've spent sending gifts and support to your loved ones.</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-kithly-secondary/10 rounded-full text-kithly-secondary">
                                        <GiftIcon />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold"><AnimatedNumber value={orders.length} /></p>
                                        <p className="text-sm text-gray-500">Gifts Sent</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-kithly-accent/10 rounded-full text-kithly-accent">
                                        <UserIcon />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold"><AnimatedNumber value={uniqueRecipients} /></p>
                                        <p className="text-sm text-gray-500">Recipients</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-red-100 rounded-full text-red-500">
                                        <UserIcon />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold"><AnimatedNumber value={mockLikedItems.length} /></p>
                                        <p className="text-sm text-gray-500">Liked Items</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
                            <div className="space-y-4">
                                {recentOrders.length > 0 ? recentOrders.map(order => (
                                    <div key={order.id} className="bg-white p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm hover:shadow-md transition-shadow">
                                        <div className="mb-2 sm:mb-0">
                                            <p className="font-semibold">{order.id}</p>
                                            <p className="text-sm text-gray-500">
                                                From <span className="font-medium text-kithly-dark">{order.shopName}</span> on {new Date(order.paidOn).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-left sm:text-right w-full sm:w-auto">
                                            <p className="font-bold">ZMK {order.total.toFixed(2)}</p>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.status === 'collected' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {order.status === 'collected' ? 'Completed' : 'Awaiting Pickup'}
                                            </span>
                                        </div>
                                    </div>
                                )) : <p className="text-gray-500">No recent orders to display.</p>}
                            </div>
                        </div>
                    </div>
                );
            case 'orders':
                 const activeOrders = orders.filter(o => o.status === 'paid');
                const historyOrders = orders.filter(o => o.status === 'collected').sort((a, b) => new Date(b.collectedOn || '').getTime() - new Date(a.collectedOn || '').getTime());

                return (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold mb-6">Orders & Pickup</h2>
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
                                    <div key={order.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                                        <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="flex items-start space-x-4">
                                                 <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                                                    <img src={order.items[0]?.image || 'https://picsum.photos/200'} alt="Order Item" className="w-full h-full object-cover"/>
                                                 </div>
                                                 <div>
                                                    <h3 className="font-bold text-lg text-kithly-dark">{order.shopName}</h3>
                                                    <p className="text-sm text-gray-500 mb-1">Order ID: <span className="font-mono text-kithly-dark">{order.id}</span></p>
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <p>{order.itemCount} Items</p>
                                                        <p className="font-semibold">Total: ZMK {order.total.toFixed(2)}</p>
                                                    </div>
                                                 </div>
                                            </div>
                                            <div className="flex flex-col items-end space-y-2 w-full lg:w-auto">
                                                <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 mb-2">
                                                    <ClockIcon className="w-3 h-3" />
                                                    <span>Awaiting Collection</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-end">
                                                    <Button variant="secondary" onClick={() => handleShareWhatsApp(order)} className="flex items-center justify-center space-x-2 !py-2">
                                                        <ChatBubbleIcon className="w-4 h-4" />
                                                        <span>Share Gift</span>
                                                    </Button>
                                                    <Button variant="primary" onClick={() => setViewingOrderQR(order)} className="flex items-center justify-center space-x-2 shadow-lg shadow-orange-200 !py-2">
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
                                                <p className="font-bold text-kithly-dark">{order.shopName}</p>
                                                <p className="text-xs text-gray-500">Order: {order.id}</p>
                                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                                    Collected on {new Date(order.collectedOn!).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 ml-14 sm:ml-0">
                                            <div className="text-left sm:text-right">
                                                <p className="font-bold text-lg text-kithly-dark">ZMK {order.total.toFixed(2)}</p>
                                                <p className="text-xs text-gray-500">{order.itemCount} items</p>
                                            </div>
                                            <button 
                                                onClick={() => generateReceipt(order)}
                                                className="ml-4 p-2 text-gray-400 hover:text-kithly-primary hover:bg-gray-100 rounded-full transition-colors"
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
                             <h2 className="text-3xl font-bold">Contacts</h2>
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
                        
                        <div className="mb-8 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                className="pl-10 block w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent transition-all shadow-sm"
                                value={contactSearchQuery}
                                onChange={(e) => setContactSearchQuery(e.target.value)}
                            />
                        </div>

                        {filteredContacts.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredContacts.map(contact => (
                                    <div key={contact.id} className="bg-white p-5 rounded-2xl flex justify-between items-start shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                                        <div>
                                            <p className="font-bold text-lg text-kithly-dark">{contact.name}</p>
                                            <p className="text-sm text-gray-500">{contact.email}</p>
                                            <p className="text-sm text-gray-500">{contact.phone}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => openContactModal('edit', contact)} className="p-2 text-gray-400 hover:text-kithly-primary hover:bg-gray-100 rounded-full"><PencilIcon className="w-5 h-5" /></button>
                                            <button onClick={() => openDeleteContactModal(contact)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full"><TrashIcon className="w-5 h-5" /></button>
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
                    </div>
                );
            case 'gifts':
                 const giftTabs = [ {id: 'bought', name: 'Bought Items'}, {id: 'received', name: 'Received Gifts'}, {id: 'liked', name: 'Liked Items'} ];
                 return (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold mb-6">My Gifts</h2>
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
                                       <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                                       <div className="flex-grow">
                                            <p className="font-semibold text-sm text-kithly-dark">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                       </div>
                                       <p className="font-bold text-sm">ZMK {(item.price * item.quantity).toFixed(2)}</p>
                                   </div>
                               )) : (
                                   <div className="text-center py-12 text-gray-500">No items bought yet.</div>
                               )}
                           </div>
                        )}
                        {activeGiftTab === 'received' && (
                             <div className="space-y-4">
                                {mockReceivedGifts.length > 0 ? mockReceivedGifts.map(gift => (
                                    <div key={gift.id} className="bg-white p-4 rounded-xl flex items-center space-x-4 border border-gray-100 hover:shadow-sm">
                                        <img src={gift.image} alt={gift.itemName} className="w-16 h-16 rounded-lg object-cover" />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm text-kithly-dark">{gift.itemName}</p>
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
                                    <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-all">
                                        <div className="relative h-40 w-full overflow-hidden">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                                        </div>
                                        <div className="p-4">
                                            <p className="font-semibold text-sm text-kithly-dark truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.shop}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="font-bold text-sm">ZMK {item.price.toFixed(2)}</p>
                                                <button><UserIcon className="text-red-500 w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full text-center py-12 text-gray-500">No liked items yet.</div>
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
                        <h2 className="text-3xl font-bold mb-6">Settings</h2>
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
                                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                            <input type="text" defaultValue="Ada Lovelace" className="mt-1 block w-full bg-kithly-light border-transparent rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                            <input type="email" defaultValue="ada.lovelace@example.com" className="mt-1 block w-full bg-kithly-light border-transparent rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent"/>
                                        </div>
                                        <div className="pt-2">
                                            <Button variant="primary">Update Profile</Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                            {activeSettingsTab === 'payment' && (
                                <div className="animate-fade-in">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-2 border-b gap-4">
                                        <h3 className="text-xl font-semibold">Saved Payment Methods</h3>
                                        <Button variant="secondary" onClick={() => setIsPaymentModalOpen(true)} className="w-full sm:w-auto justify-center">
                                            <span className="flex items-center space-x-2"><PlusCircleIcon className="w-5 h-5 text-kithly-dark" /> <span>Add New Method</span></span>
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {paymentMethods.map(method => (
                                            <div key={method.id} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-100 hover:border-gray-300 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-14 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm p-1">
                                                        {getPaymentIcon(method.provider)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-kithly-dark capitalize">
                                                            {method.provider.replace('_', ' ')}
                                                            {method.type === 'card' ? ` ending in ${method.detail}` : ''}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {method.type === 'card' ? `Expires ${method.expiry}` : method.detail}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button onClick={() => openDeletePaymentModal(method)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-200 rounded-full transition-colors" aria-label="Remove payment method"><TrashIcon className="w-5 h-5" /></button>
                                            </div>
                                        ))}
                                        {paymentMethods.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
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
                                        <h4 className="text-lg font-medium text-kithly-dark mb-4">History</h4>
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
                                                            <td className="px-6 py-4 text-sm text-kithly-dark">{notif.message}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <h4 className="text-lg font-medium text-kithly-dark mb-4">Preferences</h4>
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
                                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-kithly-accent focus:ring-offset-2 ${notifPreferences[item.key as keyof typeof notifPreferences] ? 'bg-kithly-primary' : 'bg-gray-200'}`}
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
                                <div className="animate-fade-in">
                                    <h3 className="text-xl font-semibold mb-4 pb-2 border-b">Change Password</h3>
                                    <form className="space-y-4 max-w-lg" onSubmit={(e) => { e.preventDefault(); showToast("Password changed successfully!", 'success'); }}>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                            <input type="password" className="mt-1 block w-full bg-kithly-light border-transparent rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                                            <input type="password" className="mt-1 block w-full bg-kithly-light border-transparent rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent"/>
                                        </div>
                                        <div className="pt-2">
                                            <Button type="submit" variant="primary">Update Password</Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="bg-kithly-background min-h-screen flex flex-col">
            <CustomerHeader 
                setView={setView}
                searchQuery="" 
                onSearchChange={() => {}} 
                cartItemCount={cartItemCount}
                onCartClick={onCartClick}
                targetCity={targetCity}
                setTargetCity={setTargetCity}
            />

            <div className="flex-grow container mx-auto px-4 md:px-6 py-8 flex flex-col lg:flex-row gap-8">
                 <aside className={`lg:w-64 flex-shrink-0 space-y-6`}>
                     {/* Sidebar Content - Mobile Drawer could go here if needed, but standard sidebar for desktop */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hidden lg:block">
                         <div className="text-center mb-6">
                             <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full mb-3 overflow-hidden">
                                 <img src="https://picsum.photos/seed/customer/200/200" alt="Profile" className="w-full h-full object-cover"/>
                             </div>
                             <h3 className="font-bold text-lg">Ada Lovelace</h3>
                             <p className="text-sm text-gray-500">Member since 2024</p>
                         </div>
                         <nav className="space-y-2">
                            {[
                                { id: 'dashboard', label: 'Overview', icon: <TrendingUpIcon/> },
                                { id: 'orders', label: 'Orders', icon: <DocumentTextIcon/> },
                                { id: 'contacts', label: 'Contacts', icon: <UserIcon/> },
                                { id: 'gifts', label: 'My Gifts', icon: <GiftIcon/> },
                                { id: 'settings', label: 'Settings', icon: <SettingsIcon/> },
                            ].map(item => (
                                <button 
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as Tab)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id ? 'bg-kithly-light text-kithly-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <span className="w-5 h-5">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                             <button onClick={() => setView('landing')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all mt-4">
                                <LogoutIcon className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                         </nav>
                    </div>

                    {/* Mobile Tabs */}
                    <div className="lg:hidden flex overflow-x-auto pb-2 space-x-2 scrollbar-hide">
                         {[
                            { id: 'dashboard', label: 'Overview' },
                            { id: 'orders', label: 'Orders' },
                            { id: 'contacts', label: 'Contacts' },
                            { id: 'gifts', label: 'Gifts' },
                            { id: 'settings', label: 'Settings' },
                        ].map(item => (
                            <button 
                                key={item.id}
                                onClick={() => setActiveTab(item.id as Tab)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === item.id ? 'bg-kithly-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                 </aside>

                 <main className="flex-1">
                    {renderContent()}
                 </main>
            </div>
            
            <Footer setView={setView} />
            
            {isPaymentModalOpen && <PaymentMethodModal onSave={handlePaymentSave} onClose={() => setIsPaymentModalOpen(false)} />}
            {isDeletePaymentModalOpen && <DeletePaymentModal method={paymentMethodToDelete} onConfirm={confirmDeletePayment} onClose={closeDeletePaymentModal} />}
            
            {isContactModalOpen && <ContactModal mode={contactModalMode} contact={currentContact} onSave={handleContactSave} onClose={closeContactModal} />}
            {isImportContactsModalOpen && <ImportContactsModal onImport={handleImportContacts} onClose={() => setIsImportContactsModalOpen(false)} />}
            {isDeleteContactModalOpen && <DeleteContactModal contact={contactToDelete} onConfirm={confirmDeleteContact} onClose={closeDeleteContactModal} />}

            {showSuccess && (
                 <div className="fixed bottom-8 right-8 z-50 bg-white border-l-4 border-green-500 shadow-xl rounded-lg p-4 animate-slide-in-right max-w-sm">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <CheckCircleIcon className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Order Successful!</p>
                            <p className="text-sm text-gray-500 mt-1">Your items are reserved. Check your Orders tab for the pickup code.</p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button onClick={handleDismiss} className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none">
                                <span className="sr-only">Close</span>
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {viewingOrderQR && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-kithly-primary to-kithly-accent"></div>
                         <button onClick={() => setViewingOrderQR(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                            <XIcon className="w-5 h-5" />
                        </button>
                        
                        <h3 className="text-2xl font-bold text-kithly-dark mb-1">{viewingOrderQR.shopName}</h3>
                        <p className="text-sm text-gray-500 mb-6">Pickup Code</p>
                        
                        <div className="bg-kithly-light/30 p-6 rounded-2xl border border-kithly-primary/10 mb-6">
                             <div className="text-4xl font-mono font-bold text-kithly-dark tracking-widest">{viewingOrderQR.collectionCode}</div>
                        </div>
                        
                        <p className="text-xs text-gray-400">Show this code to the shop keeper to collect your items.</p>
                    </div>
                </div>
            )}
            
            <BackToTopButton />
        </div>
    );
};

const ContactModal: React.FC<{ mode: 'add' | 'edit', contact: Contact | null, onSave: (c: Contact) => void, onClose: () => void }> = ({ mode, contact, onSave, onClose }) => {
    const [formData, setFormData] = useState(contact || { id: 0, name: '', email: '', phone: '' });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold mb-4">{mode === 'add' ? 'Add Contact' : 'Edit Contact'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input required placeholder="Name" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kithly-accent" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input required placeholder="Email" type="email" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kithly-accent" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <input required placeholder="Phone" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kithly-accent" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    <div className="flex justify-end space-x-3 pt-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary">Save</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ImportContactsModal: React.FC<{ onImport: (contacts: Contact[]) => void, onClose: () => void }> = ({ onImport, onClose }) => {
    return (
         <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Import Contacts</h3>
                <p className="text-gray-500 mb-6">Select a provider to import from.</p>
                <div className="space-y-3">
                    <button onClick={() => onImport([{ id: Date.now(), name: 'Imported Contact', email: 'imported@example.com', phone: '0960000000' }])} className="w-full p-3 border rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors">
                        <GoogleIcon className="w-5 h-5" /> <span>Google Contacts</span>
                    </button>
                </div>
                 <button onClick={onClose} className="mt-6 text-gray-500 hover:text-gray-800">Cancel</button>
            </div>
         </div>
    )
}

const DeleteContactModal: React.FC<{ contact: Contact | null, onConfirm: () => void, onClose: () => void }> = ({ contact, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
            <h3 className="text-2xl font-bold text-kithly-dark">Delete Contact?</h3>
            <p className="mt-2 text-gray-500">Are you sure you want to remove {contact?.name}?</p>
            <div className="mt-8 flex justify-center space-x-4">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={onConfirm}>Delete</Button>
            </div>
        </div>
    </div>
);

const PaymentMethodModal: React.FC<{ onSave: (m: any) => void, onClose: () => void }> = ({ onSave, onClose }) => {
    const [type, setType] = useState<'card'|'mobile_money'>('card');
    const [formData, setFormData] = useState({
        provider: 'visa',
        detail: '',
        expiry: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, type });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold mb-4">Add Payment Method</h3>
                <div className="flex mb-4 bg-gray-100 p-1 rounded-lg">
                    <button type="button" onClick={()=>setType('card')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${type==='card'?'bg-white shadow text-kithly-primary':'text-gray-600'}`}>Card</button>
                    <button type="button" onClick={()=>setType('mobile_money')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${type==='mobile_money'?'bg-white shadow text-kithly-primary':'text-gray-600'}`}>Mobile Money</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {type === 'card' ? (
                        <>
                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" value={formData.provider} onChange={e=>setFormData({...formData, provider: e.target.value})}>
                                <option value="visa">Visa</option>
                                <option value="mastercard">Mastercard</option>
                            </select>
                            <input required placeholder="Card Number (Last 4)" maxLength={4} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" value={formData.detail} onChange={e=>setFormData({...formData, detail: e.target.value})}/>
                            <input required placeholder="Expiry (MM/YY)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" value={formData.expiry} onChange={e=>setFormData({...formData, expiry: e.target.value})}/>
                        </>
                    ) : (
                        <>
                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" value={formData.provider} onChange={e=>setFormData({...formData, provider: e.target.value})}>
                                <option value="mtn">MTN Mobile Money</option>
                                <option value="airtel">Airtel Money</option>
                                <option value="zamtel">Zamtel Kwacha</option>
                            </select>
                            <input required placeholder="Phone Number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" value={formData.detail} onChange={e=>setFormData({...formData, detail: e.target.value})}/>
                        </>
                    )}
                    
                    <div className="flex justify-end space-x-3 pt-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary">Save</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeletePaymentModal: React.FC<{ method: PaymentMethod | null, onConfirm: () => void, onClose: () => void }> = ({ method, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
            <h3 className="text-2xl font-bold text-kithly-dark">Remove Method?</h3>
            <p className="mt-2 text-gray-500">Are you sure you want to remove this payment method?</p>
            <div className="mt-8 flex justify-center space-x-4">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={onConfirm}>Remove</Button>
            </div>
        </div>
    </div>
);

export default CustomerDashboard;
