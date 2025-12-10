
import React from 'react';
import { CheckCircleIcon, ClockIcon } from './icons/NavigationIcons';

export interface Order {
    id: string;
    customerName: string;
    customerAvatar: string;
    paidOn: string;
    collectedOn: string | null;
    total: number;
    itemCount: number;
    status: 'paid' | 'collected';
    collectionCode: string;
    shopName?: string;
    message?: string;
    items: any[];
    verificationMethod?: 'scan' | 'manual'; // NEW FIELD
}

interface OrderCardProps {
    order: Order;
    onMarkAsCollected: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onMarkAsCollected }) => {
    const isCollected = order.status === 'collected';

    return (
        <div className={`bg-white rounded-2xl p-5 border transition-all ${isCollected ? 'border-green-100 opacity-80' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    <img src={order.customerAvatar} alt={order.customerName} className="w-10 h-10 rounded-full object-cover bg-gray-100"/>
                    <div>
                        <p className="font-bold text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.id}</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${isCollected ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                     {isCollected ? <CheckCircleIcon className="w-3 h-3"/> : <ClockIcon className="w-3 h-3"/>}
                     <span>{isCollected ? 'Collected' : 'Pending Pickup'}</span>
                </div>
            </div>
            
            <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-2">
                <div className="text-sm">
                     <p className="text-gray-500">{order.itemCount} items</p>
                     <p className="font-bold text-gray-900 text-lg">ZMK {order.total.toFixed(2)}</p>
                </div>

                {isCollected ? (
                    <div className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">
                        Verified via {order.verificationMethod === 'scan' ? 'Secure Scan' : 'Manual Entry'}
                    </div>
                ) : (
                    <button 
                        onClick={() => onMarkAsCollected(order.id)} 
                        className="text-xs font-bold text-kithly-primary hover:underline bg-orange-50 px-3 py-2 rounded-lg border border-orange-100"
                    >
                        Scan to Verify
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderCard;
