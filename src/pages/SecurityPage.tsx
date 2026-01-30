import React, { useState, useEffect } from 'react';
import { View, SecuritySettings } from '../types';
import {
  getSecuritySettings,
  updateTwoFactor,
  changePassword,
  getActiveSessions,
  revokeSession
} from '../services/securityService';
import CustomerHeader from '../components/CustomerHeader';
import Footer from '../components/Footer';
import AnimatedBackButton from '../components/AnimatedBackButton';
import Button from '../components/Button';
import {
  ShieldCheckIcon,
  LockIcon,
  SmartphoneIcon,
  GlobeIcon,
  CheckCircleIcon
} from '../components/icons/NavigationIcons';
import { toast } from 'sonner';

interface SecurityPageProps {
  setView: (view: View) => void;
}

const SecurityPage: React.FC<SecurityPageProps> = ({ setView }) => {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getSecuritySettings('user_1');
    setSettings(data);
  };

  const handleToggle2FA = async () => {
    if (!settings) return;
    const newState = !settings.twoFactorAuth.enabled;
    await updateTwoFactor('user_1', newState);
    loadSettings();
    toast.success(`Two-factor authentication ${newState ? 'enabled' : 'disabled'}`);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    await changePassword('user_1', passwords.current, passwords.new);
    toast.success('Password changed successfully');
    setShowPasswordModal(false);
    setPasswords({ current: '', new: '', confirm: '' });
    loadSettings();
  };

  const handleRevokeSession = async (sessionId: string) => {
    await revokeSession('user_1', sessionId);
    loadSettings();
    toast.success('Session revoked');
  };

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <CustomerHeader
        setView={setView}
        cartItemCount={0}
        onCartClick={() => { }}
        targetCity="Lusaka"
        setTargetCity={() => { }}
      />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h1>

        <div className="space-y-6">
          {/* Password Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <LockIcon className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <h2 className="text-lg font-bold text-gray-900">Password</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Last changed: {new Date(settings.passwordLastChanged).toLocaleDateString()}
                </p>
                <Button
                  onClick={() => setShowPasswordModal(true)}
                  variant="secondary"
                  className="mt-4"
                >
                  Change Password
                </Button>
              </div>
            </div>
          </div>

          {/* 2FA Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-50 rounded-full text-green-600">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Two-Factor Authentication</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.twoFactorAuth.enabled}
                      onChange={handleToggle2FA}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                {settings.twoFactorAuth.enabled && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100 flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-800">
                      2FA is currently enabled via {settings.twoFactorAuth.method.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Active Sessions</h2>
            <div className="space-y-4">
              {settings.sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-gray-400">
                      {session.deviceType === 'mobile' ? (
                        <SmartphoneIcon className="w-8 h-8" />
                      ) : (
                        <GlobeIcon className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {session.deviceName}
                        {session.isCurrent && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            Current
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {session.location} • {new Date(session.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwords.current}
                  onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:ring-kithly-primary focus:border-kithly-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.new}
                  onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:ring-kithly-primary focus:border-kithly-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.confirm}
                  onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:ring-kithly-primary focus:border-kithly-primary"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={() => setShowPasswordModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50">
        <AnimatedBackButton onClick={() => setView('profile')} label="Back" />
      </div>

      <Footer setView={setView} />
    </div>
  );
};

export default SecurityPage;
