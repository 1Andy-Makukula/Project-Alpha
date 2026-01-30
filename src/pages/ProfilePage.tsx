import React, { useState } from 'react';
import { View, UserProfile } from '../types';
import CustomerHeader from '../components/CustomerHeader';
import Footer from '../components/Footer';
import AnimatedBackButton from '../components/AnimatedBackButton';
import Button from '../components/Button';
import {
  UserIcon,
  MapPinIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  BellIcon,
  PencilIcon
} from '../components/icons/NavigationIcons';
import { toast } from 'sonner';

interface ProfilePageProps {
  setView: (view: View) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ setView }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user_1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+260 97 123 4567',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
    addresses: [
      {
        id: 'addr_1',
        label: 'Home',
        street: 'Plot 123, Independence Avenue',
        city: 'Lusaka',
        country: 'Zambia',
        isDefault: true
      }
    ],
    createdAt: new Date().toISOString()
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <CustomerHeader
        setView={setView}
        cartItemCount={0}
        onCartClick={() => { }}
        targetCity="Lusaka"
        setTargetCity={() => { }}
      />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1 space-y-2">
            <button className="w-full text-left px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100 font-medium text-kithly-primary flex items-center gap-3">
              <UserIcon className="w-5 h-5" /> Personal Info
            </button>
            <button
              onClick={() => setView('contacts')}
              className="w-full text-left px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100 font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-3"
            >
              <UserIcon className="w-5 h-5" /> Contacts
            </button>
            <button
              onClick={() => setView('payments')}
              className="w-full text-left px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100 font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-3"
            >
              <CreditCardIcon className="w-5 h-5" /> Payments
            </button>
            <button
              onClick={() => setView('security')}
              className="w-full text-left px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100 font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-3"
            >
              <ShieldCheckIcon className="w-5 h-5" /> Security
            </button>
            <button
              onClick={() => setView('notifications')}
              className="w-full text-left px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100 font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-3"
            >
              <BellIcon className="w-5 h-5" /> Notifications
            </button>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm text-kithly-primary font-medium flex items-center gap-1 hover:underline"
                >
                  <PencilIcon className="w-4 h-4" /> {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <form onSubmit={handleSave}>
                <div className="flex items-center gap-6 mb-8">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-50"
                  />
                  {isEditing && (
                    <Button type="button" variant="secondary" className="text-sm">
                      Change Photo
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                      className="w-full rounded-lg border-gray-300 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled={!isEditing}
                      value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                      className="w-full rounded-lg border-gray-300 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full rounded-lg border-gray-300 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex justify-end">
                    <Button type="submit" variant="primary">
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </div>

            {/* Addresses Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Saved Addresses</h2>
                <button className="text-sm text-kithly-primary font-medium flex items-center gap-1 hover:underline">
                  + Add New
                </button>
              </div>

              <div className="space-y-4">
                {profile.addresses.map(addr => (
                  <div key={addr.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-kithly-primary transition-colors cursor-pointer group">
                    <div className="p-2 bg-gray-50 rounded-full text-gray-500 group-hover:text-kithly-primary group-hover:bg-blue-50">
                      <MapPinIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900">{addr.label}</h3>
                        {addr.isDefault && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{addr.street}</p>
                      <p className="text-sm text-gray-500">{addr.city}, {addr.country}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50">
        <AnimatedBackButton onClick={() => setView('customerPortal')} label="Back" />
      </div>

      <Footer setView={setView} />
    </div>
  );
};

export default ProfilePage;
