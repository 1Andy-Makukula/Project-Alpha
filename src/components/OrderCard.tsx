
import React from 'react';
import { Order } from '../types';
import { CheckCircleIcon, ClockIcon, CarIcon } from './icons/NavigationIcons';

interface OrderCardProps {
    order: Order;
    onMarkAsCollected: (orderId: string) => void;
    onReadyForDispatch?: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onMarkAsCollected, onReadyForDispatch }) => {
    const isCollected = order.status === 'collected';
    const isDelivery = order.deliveryMethod === 'delivery';

    const getStatusBadge = () => {
        if (isCollected) return <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1"><CheckCircleIcon className="w-3 h-3" /><span>Collected</span></div>;
        if (order.status === 'dispatched') return <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1"><ClockIcon className="w-3 h-3" /><span>Driver En Route</span></div>;
        if (order.status === 'ready_for_dispatch') return <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1"><ClockIcon className="w-3 h-3" /><span>Waiting for Driver</span></div>;
        return <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1"><ClockIcon className="w-3 h-3" /><span>Pending {isDelivery ? 'Dispatch' : 'Pickup'}</span></div>;
    };

    return (
        <div className={`bg-white rounded-2xl p-5 border transition-all ${isCollected ? 'border-green-100 opacity-80' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    <img src={order.customerAvatar} alt={order.customerName} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                    <div>
                        <p className="font-bold text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.id}</p>
                    </div>
                </div>
                {getStatusBadge()}
            </div>

            {/* Driver Details Section */}
            {order.status === 'dispatched' && order.driverDetails && (
                <div className="mb-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                        <CarIcon className="w-5 h-5 text-blue-800" />
                        <p className="text-sm font-bold text-blue-800 uppercase">Driver Details</p>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">{order.driverDetails.carModel} - {order.driverDetails.plateNumber}</span>
                        <span className="text-lg text-gray-700 font-bold">{order.driverDetails.name}</span>
                        <span className="text-sm text-gray-500">{order.driverDetails.phone}</span>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-2">
                <div className="text-sm">
                    <p className="text-gray-500">{order.itemCount} items • {isDelivery ? 'Delivery' : 'Pickup'}</p>
                    <p className="font-bold text-gray-900 text-lg">ZMK {order.total.toFixed(2)}</p>
                </div>

                {isCollected ? (
                    <div className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">
                        Verified via {order.verificationMethod === 'scan' ? 'Secure Scan' : 'Manual Entry'}
                    </div>
                ) : (
                    <div className="flex gap-2">
                        {isDelivery && order.status === 'paid' && onReadyForDispatch && (
                            <button
                                onClick={() => onReadyForDispatch(order.id)}
                                className="text-xs font-bold text-white bg-kithly-primary hover:bg-kithly-primary/90 px-3 py-2 rounded-lg shadow-sm transition-colors"
                            >
                                Ready for Dispatch
                            </button>
                        )}
                        {(!isDelivery || order.status === 'dispatched') && (
                            <button
                                onClick={() => onMarkAsCollected(order.id)}
                                className={`text-xs font-bold px-3 py-2 rounded-lg border shadow-sm transition-colors ${isDelivery
                                        ? 'bg-green-600 text-white hover:bg-green-700 border-transparent'
                                        : 'text-kithly-primary hover:underline bg-orange-50 border-orange-100'
                                    }`}
                            >
                                {isDelivery ? 'Confirm Handover to Driver' : 'Scan to Verify'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderCard;
export type { Order };
