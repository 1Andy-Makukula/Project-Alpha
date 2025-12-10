
import React, { useEffect, useState } from 'react';
import { View } from '../types';
import { Order } from '../components/components/OrderCard';
import Button from '../components/components/Button';
import confetti from 'canvas-confetti';
import { CheckCircleIcon, ChatBubbleIcon, QRIcon, MapPinIcon, DocumentTextIcon } from '../components/components/icons/NavigationIcons';
import { GiftIcon } from '../components/components/icons/FeatureIcons';
import Footer from '../components/components/Footer';
import { QRCodeSVG } from 'qrcode.react';
import AnimatedBackButton from '../components/components/AnimatedBackButton';

interface OrderSuccessPageProps {
    setView: (view: View) => void;
    newOrders: Order[];
}

const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ setView, newOrders }) => {
    // Manage QR toggle state for each order
    const [qrMode, setQrMode] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (newOrders.length > 0) {
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
    }, [newOrders]);

    const toggleQrMode = (orderId: string) => {
        setQrMode(prev => ({
            ...prev,
            [orderId]: !prev[orderId] // Toggle between QR and Text code
        }));
    };

    const handleShareWhatsApp = (order: Order) => {
        const text = `Hey! I sent you a gift on Kithly. You can collect it at ${order.shopName} using this code: ${order.collectionCode}. \n\nView details here: https://kithly.com/collect/${order.collectionCode} \n\nEnjoy!`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <div className="flex-grow container mx-auto px-4 py-12 max-w-3xl">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce-gentle">
                        <CheckCircleIcon className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
                    <p className="text-lg text-gray-600">
                        Your gift has been sent. Share the collection code with the recipient.
                    </p>
                </div>

                <div className="space-y-8">
                    {newOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="bg-kithly-dark text-white p-6 flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <GiftIcon className="w-6 h-6 text-kithly-primary" />
                                    <div>
                                        <h3 className="font-bold text-lg">{order.shopName}</h3>
                                        <p className="text-xs opacity-80">Order {order.id}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">ZMK {order.total.toFixed(2)}</p>
                                    <p className="text-xs opacity-80">{order.itemCount} Items</p>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col items-center">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Collection Token</p>
                                
                                <div className="mb-8 relative group">
                                    {qrMode[order.id] ? (
                                        <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-inner">
                                            <QRCodeSVG 
                                                value={order.collectionCode} 
                                                size={200}
                                                fgColor="#F85A47"
                                                bgColor="#FFFFFF"
                                                level="H"
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-orange-50 p-8 rounded-xl border-2 border-orange-100 shadow-inner w-64 h-64 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-mono font-bold text-kithly-dark tracking-wider">{order.collectionCode}</span>
                                            <span className="text-xs text-orange-600 font-bold mt-2 uppercase">Show to Shopkeeper</span>
                                        </div>
                                    )}
                                    
                                    <button 
                                        onClick={() => toggleQrMode(order.id)}
                                        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-md px-3 py-1 rounded-full text-xs font-bold text-gray-600 hover:text-kithly-primary transition-colors flex items-center gap-1"
                                    >
                                        {qrMode[order.id] ? <DocumentTextIcon className="w-3 h-3" /> : <QRIcon className="w-3 h-3" />}
                                        <span>{qrMode[order.id] ? 'Show Code' : 'Show QR'}</span>
                                    </button>
                                </div>

                                <div className="w-full max-w-sm space-y-3">
                                    <Button onClick={() => handleShareWhatsApp(order)} className="w-full flex items-center justify-center gap-2 shadow-lg shadow-green-100 !bg-[#25D366] hover:!bg-[#20ba5a] border-none">
                                        <ChatBubbleIcon className="w-5 h-5 text-white" />
                                        <span className="text-white">Share via WhatsApp</span>
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                    <MapPinIcon className="w-3 h-3" />
                                    Recipient: <span className="font-bold text-gray-700">{order.customerName}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex justify-center">
                    <Button variant="secondary" onClick={() => setView('customerDashboard')}>
                        Go to Dashboard
                    </Button>
                </div>
            </div>
            
            <div className="fixed bottom-8 left-8 z-50">
                <AnimatedBackButton onClick={() => setView('customerPortal')} label="Shop More" className="shadow-xl shadow-orange-900/10" />
            </div>

            <Footer setView={setView} />
        </div>
    );
};

export default OrderSuccessPage;
