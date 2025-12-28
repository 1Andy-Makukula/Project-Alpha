import React, { useState, useEffect } from 'react';
import { View, AppNotification } from '../types';
import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats
} from '../services/notificationService';
import CustomerHeader from '../components/CustomerHeader';
import Footer from '../components/Footer';
import AnimatedBackButton from '../components/AnimatedBackButton';
import {
  BellIcon,
  CheckCircleIcon,
  TrashIcon,
  CreditCardIcon,
  StoreIcon
} from '../components/icons/NavigationIcons';
import { GiftIcon } from '../components/icons/FeatureIcons';

interface NotificationPageProps {
  setView: (view: View) => void;
}

const NotificationPage: React.FC<NotificationPageProps> = ({ setView }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getAllNotifications('user_1'); // Mock user ID
    const statistics = await getNotificationStats('user_1');
    setNotifications(data);
    setStats(statistics);
  };

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    loadData();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead('user_1');
    loadData();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    loadData();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <GiftIcon className="w-6 h-6 text-blue-500" />;
      case 'payment': return <CreditCardIcon className="w-6 h-6 text-green-500" />;
      case 'promotion': return <StoreIcon className="w-6 h-6 text-purple-500" />;
      default: return <BellIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.read);

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 text-sm mt-1">
              You have {stats?.unread || 0} unread notifications
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-kithly-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'unread' ? 'bg-kithly-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              Unread
            </button>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-kithly-primary hover:underline font-medium"
            >
              Mark all as read
            </button>
          </div>
        )}

        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <BellIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
              <p className="text-gray-500 mt-2">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white p-4 rounded-xl shadow-sm border-l-4 transition-all hover:shadow-md ${notification.read ? 'border-gray-200 opacity-75' : 'border-kithly-primary'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-50 rounded-full flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">{notification.message}</p>

                    <div className="flex gap-4 mt-3">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkRead(notification.id)}
                          className="text-xs font-medium text-kithly-primary hover:text-kithly-secondary flex items-center gap-1"
                        >
                          <CheckCircleIcon className="w-3 h-3" /> Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-xs font-medium text-red-500 hover:text-red-600 flex items-center gap-1"
                      >
                        <TrashIcon className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50">
        <AnimatedBackButton onClick={() => setView('customerPortal')} label="Back" />
      </div>

      <Footer setView={setView} />
    </div>
  );
};

export default NotificationPage;
