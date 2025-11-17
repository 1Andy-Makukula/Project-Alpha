import React, { useState } from 'react';
import Button from './Button';
import OrderStatusBadge, { OrderStatus } from './OrderStatusBadge';
import { ChevronDownIcon, ChatBubbleIcon } from './icons/NavigationIcons';

interface ProductItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    image: string;
}

export interface Order {
    id: string;
    customerName: string;
    customerAvatar: string;
    paidOn: string;
    collectedOn: string | null;
    total: number;
    itemCount: number;
    status: OrderStatus;
    items: ProductItem[];
    collectionCode: string;
    shopName: string;
    message?: string;
}

interface OrderCardProps {
    order: Order;
    onMarkAsCollected?: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onMarkAsCollected }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl animate-fade-in" style={{ animationDelay: `${Math.random() * 0.2}s`}}>
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4 flex-grow">
                        <img src={order.customerAvatar} alt={order.customerName} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                            <p className="font-bold text-lg text-kithly-dark">{order.customerName}</p>
                            <p className="text-sm text-gray-500">
                                {order.id} &bull; 
                                <span className="font-medium">
                                    {order.status === 'paid' ? ` Paid on: ${formatDate(order.paidOn)}` : ` Collected on: ${formatDate(order.collectedOn)}`}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                         {order.message && (
                            <span title="Order includes a custom message">
                                <ChatBubbleIcon className="w-6 h-6 text-kithly-accent" />
                            </span>
                        )}
                        <OrderStatusBadge status={order.status} />
                    </div>
                </div>
                <div className="mt-6 flex justify-between items-center text-kithly-dark">
                    <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-500">Items</p>
                        <p className="text-2xl font-bold text-center">{order.itemCount}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {order.status === 'paid' && onMarkAsCollected && (
                            <Button variant="primary" onClick={() => onMarkAsCollected(order.id)}>Mark as Collected</Button>
                        )}
                        <Button variant="secondary" onClick={() => setIsExpanded(!isExpanded)}>
                            <span className="flex items-center space-x-2">
                                <span>View Details</span>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                     {order.message && (
                        <div className="mb-4 pb-4 border-b border-gray-200">
                            <h4 className="font-semibold text-kithly-dark mb-2 flex items-center space-x-2">
                                <ChatBubbleIcon className="w-5 h-5 text-kithly-primary" />
                                <span>Customer Message</span>
                            </h4>
                            <p className="text-sm text-gray-600 italic bg-white p-3 rounded-lg shadow-sm">
                                "{order.message}"
                            </p>
                        </div>
                    )}
                    <h4 className="font-semibold text-kithly-dark mb-3">Order Items</h4>
                    <ul className="space-y-3">
                        {order.items.map(item => (
                            <li key={item.id} className="flex items-center space-x-4">
                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm text-kithly-dark">{item.name}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-sm text-kithly-dark">${(item.price * item.quantity).toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;