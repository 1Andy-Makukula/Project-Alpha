import React, { useState, useMemo } from 'react';
import { View, CartItem } from '../App';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { FlutterwaveIcon } from '../components/icons/BrandIcons';

interface CheckoutPageProps {
    setView: (view: View) => void;
    cart: CartItem[];
    onCheckout: (recipient: { name: string; email: string; phone: string }, message: string) => void;
}

const KITHLY_FEE_RATE = 0.05; // 5%
const PROCESSING_FEE_RATE = 0.029; // 2.9%

const CheckoutPage: React.FC<CheckoutPageProps> = ({ setView, cart, onCheckout }) => {
    const [recipient, setRecipient] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [message, setMessage] = useState('');

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCheckout(recipient, message);
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
                     <button onClick={() => setView('shopView')} className="text-sm font-semibold text-kithly-dark hover:text-kithly-primary">
                        &larr; Back to Shop
                    </button>
                </div>
            </header>
            
            <main className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left side: Form */}
                    <div>
                        <h1 className="text-3xl font-bold text-kithly-dark mb-6">Checkout</h1>
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                <h2 className="text-xl font-semibold mb-4">Add a Custom E-Message (Optional)</h2>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Your message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={4}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Write a personal message for the recipient..."
                                        className="mt-1 block w-full bg-kithly-light border-transparent rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent"
                                    />
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
                                Pay ${total.toFixed(2)}
                            </Button>
                        </form>
                    </div>

                    {/* Right side: Order Summary */}
                    <div className="lg:sticky lg:top-24 h-fit">
                        <div className="bg-kithly-background rounded-2xl p-8">
                            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                                {cart.map(item => (
                                    <div key={item.product.id} className="flex items-center space-x-4 text-sm">
                                        <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover"/>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-kithly-dark">{item.product.name}</p>
                                            <p className="text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-6 border-t space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <p className="text-gray-600">Subtotal</p>
                                    <p className="font-semibold">${subtotal.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-gray-600">KithLy Fee ({KITHLY_FEE_RATE * 100}%)</p>
                                    <p className="font-semibold">${kithlyFee.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-gray-600">Processing Fee (~{PROCESSING_FEE_RATE * 100}%)</p>
                                    <p className="font-semibold">${processingFee.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between items-center pt-4 mt-2 border-t">
                                    <p className="text-lg font-bold text-kithly-dark">Total</p>
                                    <p className="text-2xl font-bold gradient-text">${total.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CheckoutPage;