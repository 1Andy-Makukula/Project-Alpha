
import React from 'react';
import { View } from '../types';
import Button from '../components/Button';
import { BrandLogo } from '../components/icons/BrandLogo';
import AnimatedBackButton from '../components/AnimatedBackButton';

interface EmailVerificationProps {
  setView: (view: View) => void;
  email: string;
  onResendEmail: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ setView, email, onResendEmail }) => {
  const [resending, setResending] = React.useState(false);
  const [resent, setResent] = React.useState(false);

  const handleResend = async () => {
    setResending(true);
    await onResendEmail();
    setResent(true);
    setResending(false);

    setTimeout(() => setResent(false), 5000);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden gradient-bg">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center max-w-md px-8">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
              <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold mb-4">Check Your Email</h2>
            <p className="text-lg opacity-90">We've sent you a verification link to get started</p>
          </div>
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-16 relative">
        <div className="fixed top-4 left-4 md:top-8 md:left-8 z-50">
          <AnimatedBackButton
            onClick={() => setView('landing')}
            label="Home"
            className="!w-auto !h-auto !py-2 !px-4 !text-xs shadow-xl"
          />
        </div>

        <div className="w-full max-w-md space-y-8 mt-12 lg:mt-0">
          {/* Logo */}
          <div className="text-center">
            <div className="inline-block mb-6">
              <BrandLogo className="w-20 h-20" />
            </div>
            <h1 className="text-3xl font-bold text-kithly-dark mb-2">Verify Your Email</h1>
            <p className="text-gray-600">
              We sent a verification link to
            </p>
            <p className="text-kithly-primary font-bold mt-1">{email}</p>
          </div>

          {/* Instructions Card */}
          <div className="bg-kithly-light border-l-4 border-kithly-primary p-6 rounded-r-2xl">
            <h3 className="font-bold text-kithly-dark mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-kithly-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Next Steps
            </h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-kithly-primary">1.</span>
                <span>Open the email we sent you</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-kithly-primary">2.</span>
                <span>Click the "Verify Email" button</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-kithly-primary">3.</span>
                <span>Return here to complete your shop setup</span>
              </li>
            </ol>
          </div>

          {/* Resend Option */}
          <div className="text-center pt-4">
            <p className="text-gray-600 mb-4">Didn't receive the email?</p>
            <Button
              variant="secondary"
              onClick={handleResend}
              disabled={resending || resent}
              className="w-full"
            >
              {resending ? 'Sending...' : resent ? '✓ Email Sent!' : 'Resend Verification Email'}
            </Button>

            {resent && (
              <p className="text-green-600 text-sm mt-2 animate-fade-in">
                ✓ Check your inbox again
              </p>
            )}
          </div>

          {/* Help Text */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-2">
              Check your spam folder if you don't see the email
            </p>
            <button
              onClick={() => setView('landing')}
              className="text-xs text-kithly-primary font-semibold hover:underline"
            >
              Contact Support →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
