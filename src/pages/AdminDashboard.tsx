
import React, { useState, useEffect } from 'react';
import { View, Order } from '../types';
import Button from '../components/Button';
import { useServices } from '../context/ServiceContext';
import { TruckIcon, ClipboardCheckIcon, MapPinIcon } from 'lucide-react';
import { toast } from 'sonner';

interface AdminDashboardProps {
    setView: (view: View) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ setView }) => {
    const { db } = useServices();
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<'dispatch' | 'analytics'>('dispatch');
    const [selectedDriver, setSelectedDriver] = useState<string>('');

    // Mock Drivers
    const drivers = [
        { id: 'D001', name: 'John D. (Yango)', rating: 4.8 },
        { id: 'D002', name: 'Sarah M. (Ulendo)', rating: 4.9 },
        { id: 'D003', name: 'Mike K. (KithLy Fleet)', rating: 4.7 },
    ];

    useEffect(() => {
        const loadOrders = async () => {
            const allOrders = await db.orders.getAll();
            setOrders(allOrders);
        };
        loadOrders();

        // Setup real-time listener if available
        if (db.orders.subscribe) {
            const unsubscribe = db.orders.subscribe(setOrders);
            return () => unsubscribe();
        }
    }, [db]);

    const dispatchOrders = orders.filter(o => o.deliveryMethod === 'delivery' && o.status === 'paid');

    const handleAssignDriver = async (orderId: string) => {
        if (!selectedDriver) {
            toast.error("Please select a driver");
            return;
        }

        // Ideally update order status to 'dispatched' and assign driver ID
        // For now, we'll just simulate it
        toast.success(`Order ${orderId} assigned to driver ${drivers.find(d => d.id === selectedDriver)?.name}`);

        // In real implementation:
        // await db.orders.update(orderId, { status: 'dispatched', driverId: selectedDriver });
    };

    return (
        <div className="min-h-screen bg-gray-50">
             <header className="bg-white shadow-sm p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-kithly-dark">KithLy Admin Portal</h1>
                    <Button variant="outline" onClick={() => setView('landing')}>Exit Admin</Button>
                </div>
            </header>

            <main className="container mx-auto p-6">
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setActiveTab('dispatch')}
                        className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'dispatch' ? 'bg-kithly-dark text-white' : 'bg-white text-gray-600'}`}
                    >
                        Dispatch Queue
                    </button>
                    <button
                         onClick={() => setActiveTab('analytics')}
                         className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'analytics' ? 'bg-kithly-dark text-white' : 'bg-white text-gray-600'}`}
                    >
                        Analytics
                    </button>
                </div>

                {activeTab === 'dispatch' && (
                    <div className="grid gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <TruckIcon className="w-5 h-5 text-kithly-primary" />
                                Ready for Dispatch ({dispatchOrders.length})
                            </h2>

                            {dispatchOrders.length === 0 ? (
                                <p className="text-gray-500 italic">No orders waiting for dispatch.</p>
                            ) : (
                                <div className="space-y-4">
                                    {dispatchOrders.map(order => (
                                        <div key={order.id} className="border p-4 rounded-lg flex justify-between items-center bg-gray-50">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-lg">{order.id}</span>
                                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                        {order.shopName}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-sm mt-1">{order.customerName} • {order.items.length} items</p>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                                                    <MapPinIcon className="w-3 h-3" />
                                                    <span>Delivery Zone B (Calculated)</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <select
                                                    className="p-2 border rounded-lg bg-white"
                                                    value={selectedDriver}
                                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                                >
                                                    <option value="">Assign Driver...</option>
                                                    {drivers.map(d => (
                                                        <option key={d.id} value={d.id}>{d.name} ({d.rating}★)</option>
                                                    ))}
                                                </select>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleAssignDriver(order.id)}
                                                >
                                                    Dispatch
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm text-center py-12">
                        <ClipboardCheckIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600">Analytics Dashboard</h3>
                        <p className="text-gray-400">Coming soon in next phase</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
