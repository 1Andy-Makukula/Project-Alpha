import React, { useState, useEffect } from 'react';
import { View, PaymentMethod, Transaction } from '../types';
import {
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  getTransactions
} from '../services/paymentService';
import CustomerHeader from '../components/CustomerHeader';
import Footer from '../components/Footer';
import AnimatedBackButton from '../components/AnimatedBackButton';
import Button from '../components/Button';
import {
  CreditCardIcon,
  PlusCircleIcon,
  TrashIcon,
  CheckCircleIcon,
  SmartphoneIcon
} from '../components/icons/NavigationIcons';
import { toast } from 'sonner';

interface PaymentsPageProps {
  setView: (view: View) => void;
}

const PaymentsPage: React.FC<PaymentsPageProps> = ({ setView }) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: 'card',
    cardNumber: '',
    expiry: '',
    cvc: '',
    mobileNumber: '',
    provider: 'MTN'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const methodsData = await getPaymentMethods('user_1');
    const transactionsData = await getTransactions('user_1');
    setMethods(methodsData);
    setTransactions(transactionsData);
  };

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newMethod.type === 'card') {
      await addPaymentMethod('user_1', {
        type: 'card',
        cardLast4: newMethod.cardNumber.slice(-4),
        cardBrand: 'Visa', // Simulated
        cardExpiry: newMethod.expiry
      });
    } else {
      await addPaymentMethod('user_1', {
        type: 'mobile_money',
        mobileProvider: newMethod.provider,
        mobileNumber: newMethod.mobileNumber
      });
    }

    toast.success('Payment method added successfully');
    setShowAddModal(false);
    setNewMethod({
      type: 'card',
      cardNumber: '',
      expiry: '',
      cvc: '',
      mobileNumber: '',
      provider: 'MTN'
    });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      await removePaymentMethod(id);
      toast.success('Payment method removed');
      loadData();
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultPaymentMethod('user_1', id);
    loadData();
    toast.success('Default payment method updated');
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Payments & Transactions</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Payment Methods</h2>
              <Button
                onClick={() => setShowAddModal(true)}
                variant="secondary"
                className="flex items-center gap-2 text-sm"
              >
                <PlusCircleIcon className="w-4 h-4" /> Add New
              </Button>
            </div>

            <div className="space-y-4">
              {methods.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
                  <CreditCardIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No payment methods added yet</p>
                </div>
              ) : (
                methods.map(method => (
                  <div key={method.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${method.type === 'card' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>
                        {method.type === 'card' ? <CreditCardIcon className="w-6 h-6" /> : <SmartphoneIcon className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 flex items-center gap-2">
                          {method.type === 'card' ? (
                            <>
                              {method.cardBrand} •••• {method.cardLast4}
                            </>
                          ) : (
                            <>
                              {method.mobileProvider} • {method.mobileNumber}
                            </>
                          )}
                          {method.isDefault && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Default</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {method.type === 'card' ? `Expires ${method.cardExpiry}` : 'Mobile Money'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          className="text-sm text-gray-500 hover:text-kithly-primary"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(method.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Transaction History */}
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">Transaction History</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No transactions yet</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          Order #{tx.orderId}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {tx.currency} {tx.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                            tx.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Balance Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-kithly-primary to-kithly-secondary rounded-2xl p-6 text-white shadow-lg mb-6">
              <p className="text-white/80 text-sm font-medium mb-1">Total Spent (This Month)</p>
              <h2 className="text-3xl font-bold">ZMK 1,650.00</h2>
              <div className="mt-6 flex gap-2">
                <div className="flex-1 bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-xs text-white/80">Orders</p>
                  <p className="font-bold text-lg">12</p>
                </div>
                <div className="flex-1 bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-xs text-white/80">Saved</p>
                  <p className="font-bold text-lg">ZMK 120</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Payment Method</h2>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setNewMethod({ ...newMethod, type: 'card' })}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${newMethod.type === 'card' ? 'border-kithly-primary bg-blue-50 text-kithly-primary' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                Credit/Debit Card
              </button>
              <button
                onClick={() => setNewMethod({ ...newMethod, type: 'mobile_money' })}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${newMethod.type === 'mobile_money' ? 'border-kithly-primary bg-blue-50 text-kithly-primary' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                Mobile Money
              </button>
            </div>

            <form onSubmit={handleAddMethod} className="space-y-4">
              {newMethod.type === 'card' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="0000 0000 0000 0000"
                      value={newMethod.cardNumber}
                      onChange={e => setNewMethod({ ...newMethod, cardNumber: e.target.value })}
                      className="w-full rounded-lg border-gray-300 focus:ring-kithly-primary focus:border-kithly-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={newMethod.expiry}
                        onChange={e => setNewMethod({ ...newMethod, expiry: e.target.value })}
                        className="w-full rounded-lg border-gray-300 focus:ring-kithly-primary focus:border-kithly-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                      <input
                        type="text"
                        required
                        placeholder="123"
                        value={newMethod.cvc}
                        onChange={e => setNewMethod({ ...newMethod, cvc: e.target.value })}
                        className="w-full rounded-lg border-gray-300 focus:ring-kithly-primary focus:border-kithly-primary"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                    <select
                      value={newMethod.provider}
                      onChange={e => setNewMethod({ ...newMethod, provider: e.target.value })}
                      className="w-full rounded-lg border-gray-300 focus:ring-kithly-primary focus:border-kithly-primary"
                    >
                      <option value="MTN">MTN Mobile Money</option>
                      <option value="Airtel">Airtel Money</option>
                      <option value="Zamtel">Zamtel Kwacha</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+260..."
                      value={newMethod.mobileNumber}
                      onChange={e => setNewMethod({ ...newMethod, mobileNumber: e.target.value })}
                      className="w-full rounded-lg border-gray-300 focus:ring-kithly-primary focus:border-kithly-primary"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Save Method
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

export default PaymentsPage;
