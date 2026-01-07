import React, { useState } from 'react';
import { View } from '../types';
import Button from '../components/Button';
import { UserIcon, LockClosedIcon, GoogleIcon } from '../components/icons/NavigationIcons';
import { BrandLogo } from '../components/icons/BrandLogo';
import AnimatedBackButton from '../components/AnimatedBackButton';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface LoginProps {
  setView: (view: View) => void;
}

const LoginPage: React.FC<LoginProps> = ({ setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      // Redirect will be handled by the parent component or we can default to customerPortal
      setView('customerPortal');
    } catch (error: any) {
      toast.error('Login failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Welcome back!');
      setView('customerPortal');
    } catch (error: any) {
      toast.error('Google login failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent z-10"></div>
        <img src="https://picsum.photos/id/1012/800/1200" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute bottom-10 left-10 z-20 text-white max-w-md">
          <h2 className="text-4xl font-bold mb-4">Welcome back to KithLy.</h2>
          <p className="text-lg opacity-90">Continue connecting with your community back home.</p>
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
            <h1 className="text-3xl font-bold text-kithly-dark">Sign In</h1>
            <p className="text-gray-500 mt-2">Access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-kithly-primary focus:border-kithly-primary bg-white"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3.5 text-lg shadow-xl" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
              <GoogleIcon className="w-5 h-5" />
              Sign in with Google
            </button>

            <p className="text-center text-gray-600 mt-6">
              Don't have an account?{' '}
              <button onClick={() => setView('registerCustomer')} className="text-kithly-primary font-bold hover:underline">Sign up</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
