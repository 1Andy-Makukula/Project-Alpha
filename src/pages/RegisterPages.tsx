
import React, { useState } from 'react';
import { View } from '../types';
import Button from '../components/Button';
import { UserIcon, LockClosedIcon, GoogleIcon, PhoneArrowDownIcon, ProductsIcon } from '../components/icons/NavigationIcons';
import CountryCodePicker from '../components/CountryCodePicker';
import { BrandLogo } from '../components/icons/BrandLogo';
import AnimatedBackButton from '../components/AnimatedBackButton';

interface RegisterProps {
    setView: (view: View) => void;
}

// Shared Layout Component
const AuthLayout: React.FC<{
    title: string;
    subtitle: string;
    image: string;
    children: React.ReactNode;
    setView: (view: View) => void
}> = ({ title, subtitle, image, children, setView }) => (
    <div className="min-h-screen flex bg-white">
        {/* Left Side - Image (Hidden on mobile) */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent z-10"></div>
            <img src={image} alt="Background" className="w-full h-full object-cover" />
            <div className="absolute bottom-10 left-10 z-20 text-white max-w-md">
                <h2 className="text-4xl font-bold mb-4">Distance means nothing when you can send love instantly.</h2>
                <p className="text-lg opacity-90">Join Kithly and start connecting with your community back home.</p>
            </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-16 relative">
            <div className="fixed top-4 left-4 md:top-8 md:left-8 z-50">
                <AnimatedBackButton onClick={() => setView('landing')} label="Home" className="!w-auto !h-auto !py-2 !px-4 !text-xs shadow-xl" />
            </div>

            <div className="w-full max-w-md space-y-8 mt-12 lg:mt-0">
                <div className="text-center">
                    <div className="inline-block mb-4">
                        <BrandLogo className="w-16 h-16" />
                    </div>
                    <h1 className="text-3xl font-bold text-kithly-dark">{title}</h1>
                    <p className="text-gray-500 mt-2">{subtitle}</p>
                </div>

                {children}
            </div>
        </div>
    </div>
);

// --- Customer Registration ---
export const RegisterCustomer: React.FC<RegisterProps> = ({ setView }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, validation and API call happens here
        setView('customerDashboard'); // Simulate login success
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Send gifts and groceries to loved ones."
            image="https://picsum.photos/id/1027/800/1200"
            setView={setView}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-kithly-primary focus:border-kithly-primary bg-white"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                        </div>
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-kithly-primary focus:border-kithly-primary bg-white"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <LockClosedIcon className="w-5 h-5" />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-kithly-primary focus:border-kithly-primary bg-white"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <LockClosedIcon className="w-5 h-5" />
                        </div>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            required
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-kithly-primary focus:border-kithly-primary bg-white"
                            value={formData.confirmPassword}
                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <input type="text" name="address" id="address" placeholder="123 Main St" className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-kithly-accent focus:border-kithly-accent sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                        <input type="text" name="city" id="city" placeholder="Lusaka" className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-kithly-accent focus:border-kithly-accent sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                        <input type="text" name="country" id="country" placeholder="Zambia" className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-kithly-accent focus:border-kithly-accent sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="id-upload" className="block text-sm font-medium text-gray-700">ID Document</label>
                        <input type="file" name="id-upload" id="id-upload" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-kithly-light file:text-kithly-primary hover:file:bg-kithly-accent" />
                    </div>
                </div>

                <Button type="submit" variant="primary" className="w-full py-3.5 text-lg shadow-xl">
                    Create Account
                </Button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>

                <button type="button" onClick={() => setView('customerDashboard')} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <GoogleIcon className="w-5 h-5" />
                    Sign up with Google
                </button>

                <p className="text-center text-gray-600 mt-6">
                    Already have an account?{' '}
                    <button onClick={() => setView('customerPortal')} className="text-kithly-primary font-bold hover:underline">Log in</button>
                </p>
            </form>
        </AuthLayout>
    );
};

// --- Shop Registration ---
export const RegisterShop: React.FC<RegisterProps> = ({ setView }) => {
    const [formData, setFormData] = useState({ shopName: '', ownerName: '', phone: '', email: '', password: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Mock registration - in production, this would call Firebase auth
            console.log("Registering shop:", formData.email);
            // Simulate async operation
            await new Promise(resolve => setTimeout(resolve, 500));
            // Success! Now redirect
            setView('shopPortal');
        } catch (error: any) {
            alert("Registration failed: " + error.message);
        }
    };

    return (
        <AuthLayout
            title="Partner with KithLy"
            subtitle="Grow your business and connect with global customers."
            image="https://picsum.photos/id/1060/800/1200"
            setView={setView}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <ProductsIcon className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Shop Business Name"
                            required
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-kithly-primary focus:border-kithly-primary bg-white"
                            value={formData.shopName}
                            onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Owner's Full Name"
                            required
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-kithly-primary focus:border-kithly-primary bg-white"
                            value={formData.ownerName}
                            onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <CountryCodePicker
                            onPhoneNumberChange={(phoneNumber) => setFormData({ ...formData, phone: phoneNumber })}
                        />
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                            </div>
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-kithly-primary focus:border-kithly-primary bg-white"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <LockClosedIcon className="w-5 h-5" />
                        </div>
                        <input
                            type="password"
                            placeholder="Create Password"
                            required
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-kithly-primary focus:border-kithly-primary bg-white"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                </div>

                <Button type="submit" variant="primary" className="w-full py-3.5 text-lg shadow-xl">
                    Register Shop
                </Button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or</span>
                    </div>
                </div>

                <button type="button" onClick={() => setView('shopPortal')} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <GoogleIcon className="w-5 h-5" />
                    Continue with Google
                </button>

                <p className="text-center text-gray-600 mt-6">
                    Already have a shop account?{' '}
                    <button onClick={() => setView('shopPortal')} className="text-kithly-primary font-bold hover:underline">Log in</button>
                </p>
            </form>
        </AuthLayout>
    );
};
