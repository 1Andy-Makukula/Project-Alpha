
import React, { useState, useMemo, useEffect } from 'react';
import { View, CartItem } from '../App';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { FlutterwaveIcon } from '../components/icons/BrandIcons';
import { ToastType } from '../components/Toast';
import AnimatedBackButton from '../components/AnimatedBackButton';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

interface CheckoutPageProps {
    setView: (view: View) => void;
    cart: CartItem[];
    onCheckout: (recipient: { name: string; email: string; phone: string }, message: string) => Promise<string>;
    showToast: (message: string, type: ToastType) => void;
    clearCart: () => void;
}

const KITHLY_FEE_RATE = 0.05; // 5%
const PROCESSING_FEE_RATE = 0.029; // 2.9%

const CheckoutPage: React.FC<CheckoutPageProps> = ({ setView, cart, onCheckout, showToast, clearCart }) => {
    const [recipient, setRecipient] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [message, setMessage] = useState('');
    const [orderId, setOrderId] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRecipient(prev => ({...prev, [name]: value}));
    };

    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }, [cart]);

    const kithlyFee = subtotal * KITHLY_FEE_RATE;
    const processingFee = subtotal * PROCESSING_FEE_RATE;
    const total = subtotal + kithlyFee + processingFee;

    const config = {
        public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: orderId,
        amount: total,
        currency: 'ZMK',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
            email: recipient.email,
            phone_number: recipient.phone,
            name: recipient.name,
        },
        customizations: {
            title: 'KithLy',
            description: 'Payment for items in cart',
            logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
        },
    };

    const handleFlutterwavePayment = useFlutterwave(config);

    useEffect(() => {
        if (orderId) {
            handleFlutterwavePayment({
                callback: (response) => {
                    console.log(response);
                    if (response.status === 'successful') {
                        closePaymentModal(); // this will close the modal
                        clearCart();
                        setView('orderSuccess');
                    }
                },
                onClose: () => {},
            });
        }
    }, [orderId, handleFlutterwavePayment, setView, clearCart]);

    const handleSubmit = async () => {
        const newOrderId = await onCheckout(recipient, message);
        setOrderId(newOrderId);
    };

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-kithly-background text-center">
                <h1 className="text-2xl font-bold text-kithly-dark">Your cart is empty!</h1>
                <p className="text-gray-600 mt-2">Add some items to your cart before proceeding to checkout.</p>
                <Button variant="primary" onClick={() => setView('customerPortal')} className="mt-6">
                    Continue Shopping
                </Button>
            </div>
        );
    }
    
    return (
        <div className="bg-white min-h-screen">
            <header className="py-4 border-b">
                <div className="container mx-auto px-6 flex justify-between items-center">
                     <div className="text-2xl font-bold cursor-pointer" onClick={() => setView('landing')}>
                        <span className="gradient-text">KithLy</span>
                    </div>
                    <AnimatedBackButton onClick={() => setView('shopView')} label="Back to Shop" className="!w-auto !h-auto !py-2 !px-4" />
                </div>
            </header>
            
            <main className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left side: Form */}
                    <div>
                        <h1 className="text-3xl font-bold text-kithly-dark mb-6">Checkout</h1>
                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                            <section>
                                <h2 className="text-xl font-semibold mb-4">Recipient Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input type="text" id="name" name="name" value={recipient.name} onChange={handleInputChange} required className="mt-1 block w-full bg-kithly-light border-transparent rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent"/>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                        <input type="email" id="email" name="email" value={recipient.email} onChange={handleInputChange} required className="mt-1 block w-full bg-kithly-light border-transparent rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent"/>
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <input type="tel" id="phone" name="phone" value={recipient.phone} onChange={handleInputChange} required className="mt-1 block w-full bg-kithly-light border-transparent rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent"/>
                                    </div>
                                </div>
                            </section>

                            <section className="border-t pt-6">
                                <h2 className="text-xl font-semibold mb-4">Personal Note</h2>
                                <div className="bg-[#FFFBF0] p-6 rounded-xl border border-[#FFE4B5] shadow-sm relative">
                                    <div className="absolute -top-3 left-6 bg-[#FFFBF0] px-2 text-sm font-medium text-[#D97706]">
                                        Message Card
                                    </div>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={4}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Write a heartfelt message... e.g., 'Happy Birthday! Enjoy the treats!'"
                                        className="w-full bg-transparent border-none p-0 text-gray-700 placeholder-gray-400 focus:ring-0 text-lg italic leading-relaxed font-serif resize-none"
                                    />
                                    <div className="text-right mt-2 text-xs text-[#D97706] font-medium">
                                        Includes free digital card
                                    </div>
                                </div>
                            </section>
                            
                            <section className="border-t pt-6">
                                <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                                <div className="p-4 border rounded-lg bg-kithly-light">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">Pay securely with Flutterwave</p>
                                        <FlutterwaveIcon />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">After clicking "Pay", you would be redirected to Flutterwave to complete your purchase securely.</p>
                                </div>
                            </section>
                            
                            <Button type="submit" variant="primary" className="w-full text-lg py-4">
                                Pay ZMK {total.toFixed(2)}
                            </Button>
                        </form>
                    </div>

                    {/* Right side: Order Summary */}
                    <div className="lg:sticky lg:top-24 h-fit order-first lg:order-last">
                        <div className="bg-kithly-background rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                                {cart.map(item => (
                                    <div key={item.product.id} className="flex items-center space-x-4 text-sm">
                                        <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover"/>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-kithly-dark">{item.product.name}</p>
                                            <p className="text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold">ZMK {(item.product.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-6 border-t space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <p className="text-gray-600">Subtotal</p>
                                    <p className="font-semibold">ZMK {subtotal.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-gray-600">KithLy Fee ({KITHLY_FEE_RATE * 100}%)</p>
                                    <p className="font-semibold">ZMK {kithlyFee.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-gray-600">Processing Fee (~{PROCESSING_FEE_RATE * 100}%)</p>
                                    <p className="font-semibold">ZMK {processingFee.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between items-center pt-4 mt-2 border-t">
                                    <p className="text-lg font-bold text-kithly-dark">Total</p>
                                    <p className="text-2xl font-bold gradient-text">ZMK {total.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer setView={setView} />
        </div>
    );
};

export default CheckoutPage;
