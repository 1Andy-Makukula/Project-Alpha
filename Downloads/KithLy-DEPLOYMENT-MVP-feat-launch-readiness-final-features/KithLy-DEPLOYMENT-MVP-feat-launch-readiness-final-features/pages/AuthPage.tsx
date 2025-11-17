import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [role, setRole] = useState<'buyer' | 'shop_owner'>('buyer');
  const [agreedToTerms, setAgreedToTerms] = useState(false); // New state for legal
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      alert(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !agreedToTerms) { // Check for legal agreement on signup
      setError('You must agree to the Terms of Service and Privacy Policy to sign up.');
      return;
    }
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const body = isLogin ? { email, password } : { email, password, first_name: firstName, role };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLogin && data.token && data.user) {
        login(data.token, data.user);
        if (data.user.role === 'shop_owner') {
          navigate('/portal/shop');
        } else {
          navigate('/dashboard');
        }
      } else if (!isLogin) {
        alert('Signup successful! Please log in.');
        setIsLogin(true);
        setAgreedToTerms(false);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-center">
          {isLogin ? 'Welcome Back to KithLy' : 'Join KithLy'}
        </h2>
        {error && <p className="p-2 mb-4 text-center text-white bg-red-500 rounded">{error}</p>}

        {/* Google Login Button Placeholder */}
        {/* <div className="my-4 text-center text-gray-500">OR</div> */}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full p-3 border rounded"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border rounded"
          />

          {isLogin ? (
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot Password?
              </button>
            </div>
          ) : (
            <>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'buyer' | 'shop_owner')}
                className="w-full p-3 border rounded"
              >
                <option value="buyer">Diaspora Gifter / Receiver</option>
                <option value="shop_owner">Local Shop Owner</option>
              </select>

              {/* Legal Checkbox */}
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  I agree to the
                  <Link to="/terms" target="_blank" className="ml-1 text-blue-600 hover:underline">
                    Terms of Service
                  </Link>
                  <span className="mx-1">and</span>
                  <Link to="/privacy" target="_blank" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>.
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading || (!isLogin && !agreedToTerms)}
            className="w-full p-3 text-white transition duration-200 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 font-medium text-blue-600 hover:text-blue-500"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}
