
import React, { useState, useMemo } from 'react';
import { View, CartItem } from '../types';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { FlutterwaveIcon } from '../components/icons/BrandIcons';
import { useFlutterwavePayment } from '../services/flutterwaveService';
import { ToastType } from '../components/Toast';
import AnimatedBackButton from '../components/AnimatedBackButton';
import { StoreIcon, CarIcon, ClockIcon, ExclamationTriangleIcon } from '../components/icons/NavigationIcons';
import { calculateDistance, getUserLocation } from '../services/geolocationService';
import { ENHANCED_SHOPS } from '../services/enhancedShopData';
import ShopMap from '../components/ShopMap';
import { Coordinates } from '../types';

interface CheckoutPageProps {
    setView: (view: View) => void;
    cart: CartItem[];
    onCheckout: (
        recipient: { name: string; email: string; phone: string },
        message: string,
        deliveryMethod: string,
        deliveryType: 'collection' | 'delivery',
        additionalDetails?: { pickupTime?: string; orderType?: 'request' | 'instant' }
    ) => void;
    showToast: (message: string, type: ToastType) => void;
}

const KITHLY_FEE_RATE = 0.05; // 5%
const PROCESSING_FEE_RATE = 0.029; // 2.9%
const DELIVERY_RATE_PER_KM = 15; // K15 per km

const CheckoutPage: React.FC<CheckoutPageProps> = ({ setView, cart, onCheckout, showToast }) => {
    const [recipient, setRecipient] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [message, setMessage] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('in-app');
    const [deliveryType, setDeliveryType] = useState<'collection' | 'delivery'>('collection');
    const [deliveryDistance, setDeliveryDistance] = useState<number>(0);
    const [deliveryLocation, setDeliveryLocation] = useState('');
    const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const shopId = cart[0]?.product.shopId;
    const shop = useMemo(() => ENHANCED_SHOPS.find(s => s.id === shopId), [shopId]);

    // --- Operational Logic State ---
    const [pickupTime, setPickupTime] = useState('ASAP');
    const [customPickupTime, setCustomPickupTime] = useState('');

    // --- Derived State ---
    const hasMadeToOrderItems = useMemo(() => {
        return cart.some(item => item.product.type === 'made_to_order');
    }, [cart]);

    const isRestaurant = shop?.category === 'Restaurant' || shop?.category === 'Food';

    const shopStatus = useMemo(() => {
        if (!shop?.openingHours) return { isOpen: true };

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;

        const [openStr, closeStr] = shop.openingHours.split(' - ');
        const [openH, openM] = openStr.split(':').map(Number);
        const [closeH, closeM] = closeStr.split(':').map(Number);

        const openTime = openH * 60 + openM;
        const closeTime = closeH * 60 + closeM;

        const isOpen = currentTime >= openTime && currentTime < closeTime;

        return {
            isOpen,
            openTime: openStr,
            closeTime: closeStr,
            nextOpen: openStr // Simplified for MVP
        };
    }, [shop]);

    const handleCalculateDistance = async () => {
        setIsCalculating(true);
        try {
            const location = await getUserLocation();
            setUserCoordinates(location);
            if (location && shop?.coordinates) {
                const dist = calculateDistance(shop.coordinates, location);
                // Add 20% buffer for road curvature and round up
                setDeliveryDistance(Math.ceil(dist * 1.2));
                showToast("Distance calculated from your location!", "success");
            } else {
                showToast("Could not determine location. Please enter manually.", "error");
            }
        } catch (error) {
            showToast("Error calculating distance.", "error");
        }
        setIsCalculating(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRecipient(prev => ({ ...prev, [name]: value }));
    };

    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }, [cart]);

    const kithlyFee = subtotal * KITHLY_FEE_RATE;

    const getZoneInfo = (distance: number) => {
        if (distance <= 5) return { name: 'Zone A (Short Range)', price: 75 };
        if (distance <= 10) return { name: 'Zone B (Mid Range)', price: 120 };
        return { name: 'Zone C (Long Range)', price: 180 };
    };

    const zoneInfo = getZoneInfo(deliveryDistance);
    const deliveryFee = deliveryType === 'delivery' ? zoneInfo.price : 0;
    const processingFee = (subtotal + kithlyFee + deliveryFee) * PROCESSING_FEE_RATE;
    const total = subtotal + kithlyFee + processingFee + deliveryFee;

    const finalPickupTime = pickupTime === 'schedule' ? customPickupTime : pickupTime;

    const fwConfig = {
        public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: Date.now().toString(),
        amount: total,
        currency: 'ZMW',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
            email: recipient.email,
            phone_number: recipient.phone,
            name: recipient.name,
        },
        customizations: {
            title: 'KithLy Payment',
            description: `Payment for items in cart`,
            logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
        },
        callback: (response: any) => {
             console.log(response);
             if(response.status === "successful") {
                onCheckout(
                    recipient,
                    message,
                    deliveryMethod,
                    deliveryType,
                    {
                        pickupTime: isRestaurant ? finalPickupTime : undefined,
                        orderType: hasMadeToOrderItems ? 'request' : 'instant'
                    }
                );
             } else {
                showToast("Payment Failed", "error");
             }
        },
        onClose: () => {
             showToast("Payment Cancelled", "info");
        },
    };

    const { handlePayment } = useFlutterwavePayment(fwConfig);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Baker's Protocol Validation
        if (hasMadeToOrderItems) {
            const confirmed = window.confirm(
                `This order contains items that require preparation time (Lead Time: ${cart.find(i => i.product.leadTime)?.product.leadTime || '48h'}).\n\nYour payment will be held in Pending Escrow until the shop accepts your request.\n\nProceed?`
            );
            if (!confirmed) return;
        }

        // Trigger Flutterwave Payment
        handlePayment();
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
                </div>
            </header>

            <main className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left side: Form */}
                    <div>
                        <h1 className="text-3xl font-bold text-kithly-dark mb-6">Checkout</h1>

                        {/* Shop Closed Warning */}
                        {!shopStatus.isOpen && (
                            <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex items-start gap-3">
                                <ClockIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-blue-800">Shop is currently closed (Hours: {shop?.openingHours})</p>
                                    <p className="text-sm text-blue-700">
                                        Your order will be processed tomorrow at {shopStatus.nextOpen}.
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <section>
                                <h2 className="text-xl font-semibold mb-4">Recipient Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input type="text" id="name" name="name" value={recipient.name} onChange={handleInputChange} required className="mt-1 block w-full bg-kithly-light border-transparent rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent" />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                        <input type="email" id="email" name="email" value={recipient.email} onChange={handleInputChange} required className="mt-1 block w-full bg-kithly-light border-transparent rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent" />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <input type="tel" id="phone" name="phone" value={recipient.phone} onChange={handleInputChange} required className="mt-1 block w-full bg-kithly-light border-transparent rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent" />
                                    </div>
                                </div>

                            </section>

                            {/* Restaurant: Pickup Time Selection */}
                            {isRestaurant && (
                                <section className="border-t pt-6">
                                    <h2 className="text-xl font-semibold mb-4">Pickup / Ready Time</h2>
                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">When should this be ready?</label>
                                        <div className="space-y-3">
                                            <label className="flex items-center p-3 border bg-white rounded-lg cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="pickupTime"
                                                    value="ASAP"
                                                    checked={pickupTime === 'ASAP'}
                                                    onChange={(e) => setPickupTime(e.target.value)}
                                                    className="form-radio h-4 w-4 text-kithly-primary"
                                                />
                                                <span className="ml-3 text-sm font-medium text-gray-700">ASAP (30-45 mins)</span>
                                            </label>
                                            <label className="flex items-center p-3 border bg-white rounded-lg cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="pickupTime"
                                                    value="schedule"
                                                    checked={pickupTime === 'schedule'}
                                                    onChange={(e) => setPickupTime(e.target.value)}
                                                    className="form-radio h-4 w-4 text-kithly-primary"
                                                />
                                                <span className="ml-3 text-sm font-medium text-gray-700">Schedule for Later</span>
                                            </label>
                                        </div>
                                        {pickupTime === 'schedule' && (
                                            <div className="mt-3 animate-fadeIn">
                                                <input
                                                    type="time"
                                                    value={customPickupTime}
                                                    onChange={(e) => setCustomPickupTime(e.target.value)}
                                                    className="block w-full bg-white border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

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
                                <h2 className="text-xl font-semibold mb-4">Delivery Options</h2>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryType('collection')}
                                        className={`p-4 border rounded-xl flex flex-col items-center justify-center transition-all ${deliveryType === 'collection'
                                            ? 'border-kithly-accent bg-orange-50 text-kithly-dark ring-1 ring-kithly-accent'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <StoreIcon className="w-8 h-8 mb-2 text-gray-700" />
                                        <span className="font-semibold">Store Pickup</span>
                                        <span className="text-xs text-gray-500 mt-1">Recipient collects at Shop</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryType('delivery')}
                                        className={`p-4 border rounded-xl flex flex-col items-center justify-center transition-all ${deliveryType === 'delivery'
                                            ? 'border-kithly-accent bg-orange-50 text-kithly-dark ring-1 ring-kithly-accent'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <CarIcon className="w-8 h-8 mb-2 text-kithly-primary" />
                                        <span className="font-semibold">Doorstep Delivery</span>
                                        <span className="text-xs text-gray-500 mt-1">Premium delivery via KithLy Concierge</span>
                                    </button>
                                </div>

                                {deliveryType === 'delivery' && (
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4 animate-fadeIn">
                                        {/* Map Section */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Shop Location & Route
                                            </label>
                                            <ShopMap
                                                shopCoordinates={shop?.coordinates || { lat: -15.4167, lng: 28.2833 }}
                                                userCoordinates={userCoordinates}
                                                shopName={shop?.name || 'Shop'}
                                            />
                                        </div>

                                        {/* Location Input */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Delivery Location
                                            </label>
                                            <input
                                                type="text"
                                                value={deliveryLocation}
                                                onChange={(e) => setDeliveryLocation(e.target.value)}
                                                className="block w-full bg-white border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent"
                                                placeholder="Paste Google Maps Link or type address"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Delivery Distance (km)
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={deliveryDistance}
                                                    onChange={(e) => setDeliveryDistance(parseFloat(e.target.value) || 0)}
                                                    className="block w-full bg-white border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-kithly-accent"
                                                    placeholder="Enter distance in km"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={handleCalculateDistance}
                                                    disabled={isCalculating}
                                                    className="whitespace-nowrap"
                                                >
                                                    {isCalculating ? 'Calculating...' : '📍 Auto-Calculate'}
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Rate: Zone-Based Flat Fee. Auto-calculation uses your current location.
                                            </p>

                                            {/* Zone Display */}
                                            <div className="mt-3 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100 flex justify-between items-center">
                                                <span className="font-medium">Selected Zone:</span>
                                                <span className="font-bold">{zoneInfo.name}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Zone A (0-5km): K75 | Zone B (5-10km): K120 | Zone C (10km+): K180
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <h2 className="text-xl font-semibold mb-4 mt-6">Notification Method</h2>
                                <div className="space-y-3">
                                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="deliveryMethod"
                                            value="in-app"
                                            checked={deliveryMethod === 'in-app'}
                                            onChange={(e) => setDeliveryMethod(e.target.value)}
                                            className="form-radio h-4 w-4 text-kithly-primary"
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700">In-App Notification</span>
                                    </label>
                                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="deliveryMethod"
                                            value="facebook"
                                            checked={deliveryMethod === 'facebook'}
                                            onChange={(e) => setDeliveryMethod(e.target.value)}
                                            className="form-radio h-4 w-4 text-kithly-primary"
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700">Facebook Message</span>
                                    </label>
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

                            <Button type="submit" variant="primary" className={`w-full text-lg py-4 ${hasMadeToOrderItems ? 'bg-kithly-dark hover:bg-gray-800' : ''}`}>
                                {hasMadeToOrderItems ? 'Request Order' : `Pay ZMK ${total.toFixed(2)}`}
                            </Button>
                            {hasMadeToOrderItems && (
                                <p className="text-center text-xs text-gray-500 mt-2">
                                    * This is a request. Money is held in escrow until accepted.
                                </p>
                            )}
                        </form>
                    </div>

                    {/* Right side: Order Summary */}
                    <div className="lg:sticky lg:top-24 h-fit order-first lg:order-last">
                        <div className="bg-kithly-background rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                                {cart.map(item => (
                                    <div key={item.product.id} className="flex items-center space-x-4 text-sm">
                                        <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover" />
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
                                {deliveryType === 'delivery' && (
                                    <div className="flex justify-between text-kithly-accent">
                                        <p>Delivery Fee ({zoneInfo.name})</p>
                                        <p className="font-semibold">ZMK {deliveryFee.toFixed(2)}</p>
                                    </div>
                                )}
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
            </main >

            <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50">
                <AnimatedBackButton onClick={() => setView('shopView')} label="Back to Shop" className="shadow-xl shadow-orange-900/10" />
            </div>

            <Footer setView={setView} />
        </div >
    );
};

export default CheckoutPage;
