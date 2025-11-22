
import React, { useEffect, useState } from 'react';
import { View } from '../App';
import { Order } from '../components/OrderCard';
import Button from '../components/Button';
import confetti from 'canvas-confetti';
import { CheckCircleIcon, ChatBubbleIcon, QRIcon, MapPinIcon, DocumentTextIcon } from '../components/icons/NavigationIcons';
import { GiftIcon } from '../components/icons/FeatureIcons';
import Footer from '../components/Footer';
import { db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

interface OrderSuccessPageProps {
    setView: (view: View) => void;
    newOrders: Order[];
}

const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ setView, newOrders }) => {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [updatedOrders, setUpdatedOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (newOrders.length > 0) {
            const unsubscribers = newOrders.map(order => {
                const docRef = doc(getFirestore(), 'orders', order.id);
                return onSnapshot(docRef, (doc) => {
                    const updatedOrder = { ...doc.data(), id: doc.id } as Order;
                    if (updatedOrder.collectionCode) {
                        setUpdatedOrders(prev => {
                            const existing = prev.find(o => o.id === updatedOrder.id);
                            if (existing) {
                                return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                            }
                            return [...prev, updatedOrder];
                        });
                    }
                });
            });
            return () => unsubscribers.forEach(unsub => unsub());
        } else {
            setIsLoading(false);
        }
    }, [newOrders]);

    useEffect(() => {
        if (newOrders.length > 0 && updatedOrders.length === newOrders.length) {
            setIsLoading(false);
        }
    }, [updatedOrders, newOrders]);

    useEffect(() => {
        if (!isLoading) {
            // Fire confetti on mount only if there are orders
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#F85A47', '#008080', '#FFD700']
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
        }
    }, [isLoading]);

    const handleShareWhatsApp = (order: Order) => {
        const text = `Hey ${order.customerName}! I've sent you a gift from ${order.shopName} via Kithly. \n\nYou can collect it using this code: *${order.collectionCode}*. \n\nEnjoy! ❤️`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleCopyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-kithly-background flex flex-col">
            <header className="py-4 bg-white shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 flex justify-center">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView('landing')}>
                        <span className="text-2xl font-bold gradient-text">KithLy</span>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-6 py-12 max-w-3xl">
                {isLoading ? (
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-100/50 ring-8 ring-yellow-50">
                            <QRIcon className="w-12 h-12 text-yellow-500 animate-pulse" />
                        </div>
                        <h1 className="text-4xl font-bold text-kithly-dark mb-2">Payment Received!</h1>
                        <p className="text-lg text-gray-500">Generating your Gift Code...</p>
                    </div>
                ) : updatedOrders.length > 0 ? (
                    <>
                        <div className="text-center mb-12 animate-fade-in">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100/50 ring-8 ring-green-50">
                                <CheckCircleIcon className="w-12 h-12 text-green-500" />
                            </div>
                            <h1 className="text-4xl font-bold text-kithly-dark mb-2">Payment Successful!</h1>
                            <p className="text-lg text-gray-500">Your care package is ready for collection.</p>
                        </div>

                        <div className="space-y-8">
                            {updatedOrders.map((order, index) => (
                                <div 
                                    key={order.id} 
                                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in transform transition-all duration-500 hover:shadow-2xl"
                                    style={{ animationDelay: `${index * 150}ms` }}
                                >
                                    {/* Card Header */}
                                    <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                                                <GiftIcon className="w-6 h-6 text-kithly-primary"/>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Order ID</p>
                                                <p className="font-bold text-kithly-dark text-lg">{order.id}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Amount</p>
                                            <p className="font-bold text-kithly-dark text-lg">ZMK {order.total.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <div className="flex flex-col lg:flex-row gap-8 items-center">
                                            {/* Digital Card Preview */}
                                            <div className="w-full lg:w-1/2 bg-gradient-to-br from-kithly-primary to-kithly-secondary rounded-2xl p-6 text-white shadow-2xl shadow-orange-200 relative overflow-hidden group h-64 flex flex-col justify-between">
                                                {/* Decorative Circles */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"></div>
                                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
                                                
                                                <div className="relative z-10">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="bg-white/20 backdrop-blur-md rounded-lg p-2">
                                                            <GiftIcon className="w-6 h-6 text-white" />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 border border-white/30 px-2 py-1 rounded">Gift Card</span>
                                                    </div>
                                                    
                                                    <h3 className="text-2xl font-bold leading-tight mb-1">For {order.customerName}</h3>
                                                    <p className="text-sm text-white/80">Sent with love via KithLy</p>
                                                </div>
                                                
                                                <div className="relative z-10 mt-4">
                                                    <div className="bg-white text-kithly-dark rounded-xl p-3 shadow-lg flex justify-between items-center group/code cursor-pointer" onClick={() => handleCopyCode(order.collectionCode, order.id)}>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Pickup Code</p>
                                                            <p className="text-2xl font-mono font-bold tracking-widest">{order.collectionCode}</p>
                                                        </div>
                                                        <div className="text-xs font-bold text-kithly-primary bg-orange-50 px-2 py-1 rounded transition-colors group-hover/code:bg-kithly-primary group-hover/code:text-white">
                                                            {copiedId === order.id ? 'COPIED' : 'COPY'}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center text-xs text-white/90 mt-3 font-medium">
                                                        <MapPinIcon className="w-3.5 h-3.5 mr-1.5" />
                                                        Collect at {order.shopName}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-5">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-xl mb-2">What's Next?</h4>
                                                    <p className="text-gray-600 leading-relaxed">
                                                        Share the <strong>Pickup Code</strong> with {order.customerName}. They can walk into {order.shopName} immediately to collect their gift.
                                                    </p>
                                                </div>
                                                
                                                <Button 
                                                    onClick={() => handleShareWhatsApp(order)}
                                                    className="w-full flex items-center justify-center space-x-3 !bg-[#25D366] hover:!bg-[#1da851] text-white border-none shadow-lg shadow-green-100 !py-4"
                                                >
                                                    <ChatBubbleIcon className="w-6 h-6" />
                                                    <span className="text-lg">Share via WhatsApp</span>
                                                </Button>
                                                
                                                <div className="flex items-center justify-center text-xs text-gray-400 gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    Shop notified & Items reserved
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 text-center flex flex-col sm:flex-row justify-center gap-4">
                            <Button variant="primary" onClick={() => setView('customerDashboard')} className="px-8 py-4 text-lg shadow-xl shadow-orange-200">
                                View in Dashboard
                            </Button>
                            <Button variant="secondary" onClick={() => setView('customerPortal')} className="px-8 py-4 text-lg bg-white">
                                Send Another Gift
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <DocumentTextIcon className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Recent Orders Found</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
                            If you refreshed the page, your order has been securely saved to your history.
                        </p>
                        <Button variant="primary" onClick={() => setView('customerDashboard')} className="px-8 py-3">
                            Go to Dashboard
                        </Button>
                    </div>
                )}
            </main>
            
            <Footer setView={setView} />
        </div>
    );
};

export default OrderSuccessPage;
