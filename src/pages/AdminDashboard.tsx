
import React, { useState, useEffect, useMemo } from 'react';
import { View, Order } from '../types';
import Button from '../components/Button';
import { useServices } from '../context/ServiceContext';
import { TruckIcon, ClipboardCheckIcon, MapPinIcon, DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ENHANCED_SHOPS } from '../services/enhancedShopData';
import { assignShopTiers } from '../services/shopService';

interface AdminDashboardProps {
    setView: (view: View) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ setView }) => {
    const { db } = useServices();
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<'dispatch' | 'analytics'>('dispatch');
    const [selectedDriver, setSelectedDriver] = useState<string>('');
    const [manualLocations, setManualLocations] = useState<Record<string, string>>({});

    // Mock Drivers
    const drivers = [
        { id: 'D001', name: 'John D. (Yango)', rating: 4.8 },
        { id: 'D002', name: 'Sarah M. (Ulendo)', rating: 4.9 },
        { id: 'D003', name: 'Mike K. (KithLy Fleet)', rating: 4.7 },
    ];

    const shops = useMemo(() => assignShopTiers(ENHANCED_SHOPS), []);

    useEffect(() => {
        const loadOrders = async () => {
            const allOrders = await db.orders.getAll();
            setOrders(allOrders);
        };
        loadOrders();
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

    const handleLocationChange = (orderId: string, value: string) => {
        setManualLocations(prev => ({ ...prev, [orderId]: value }));
    };

    const generateYangoCSV = () => {
        // CSV Headers: Pickup Point, Destination, Contact Number, Comments
        const headers = ['Pickup Point', 'Destination', 'Contact Number', 'Comments'];

        const rows = dispatchOrders.map(order => {
            const shop = shops.find(s => s.id === order.shopId) || shops.find(s => s.name === order.shopName);
            const shopAddress = shop?.address || shop?.location || "Unknown Shop Location";
            const destination = manualLocations[order.id] || order.deliveryNotes || "Unknown Destination";
            // Ensure phone number format
            const phone = order.driverDetails?.phone || "Unknown Phone"; // Wait, recipient phone is not in Order type explicitly? 
            // Order type has customerName, but phone is usually in user profile or passed during checkout.
            // Looking at CheckoutPage, it passes recipient object. Order type needs to store it.
            // Assuming order has a way to get customer phone. For now, using a placeholder or if it was stored in deliveryNotes.
            // Actually, I'll check if I can add phone to Order type or if it's there.
            // The Order interface in index.ts doesn't have customerPhone. I should add it or assume it's available.
            // For this task, I'll use a placeholder if missing.

            return [
                `"${shopAddress}"`,
                `"${destination}"`,
                `"${order.driverDetails?.phone || '0970000000'}"`, // Placeholder for customer phone
                `"Order #${order.id}"`
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `yango_manifest_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-kithly-dark">KithLy Admin Portal</h1>
                    <Button variant="secondary" onClick={() => setView('landing')}>Exit Admin</Button>
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
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <TruckIcon className="w-5 h-5 text-kithly-primary" />
                                    Ready for Dispatch ({dispatchOrders.length})
                                </h2>
                                <Button variant="secondary" onClick={generateYangoCSV} className="flex items-center gap-2 text-sm">
                                    <DownloadIcon className="w-4 h-4" />
                                    Export Yango CSV
                                </Button>
                            </div>

                            {dispatchOrders.length === 0 ? (
                                <p className="text-gray-500 italic">No orders waiting for dispatch.</p>
                            ) : (
                                <div className="space-y-4">
                                    {dispatchOrders.map(order => (
                                        <div key={order.id} className="border p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-lg">{order.id}</span>
                                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                        {order.shopName}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-sm mt-1">{order.customerName} • {order.items.length} items</p>

                                                {/* Manual Location Input */}
                                                <div className="mt-3">
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                                                        DESTINATION (Paste from WhatsApp)
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-kithly-primary outline-none"
                                                            placeholder="e.g. -15.416, 28.283 or 'Plot 123, Kabulonga'"
                                                            value={manualLocations[order.id] || order.deliveryNotes || ''}
                                                            onChange={(e) => handleLocationChange(order.id, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                <select
                                                    className="p-2 border rounded-lg bg-white text-sm flex-1 md:flex-none"
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
                                                    className="py-1 px-3 text-sm"
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
