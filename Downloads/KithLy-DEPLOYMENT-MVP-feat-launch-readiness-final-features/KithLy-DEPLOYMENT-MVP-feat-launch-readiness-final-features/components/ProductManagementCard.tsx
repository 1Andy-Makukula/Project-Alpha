
import React from 'react';
import { PencilIcon, TrashIcon } from './icons/NavigationIcons';

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
    stock: number;
}

interface ProductManagementCardProps {
    product: Product;
    onEdit: () => void;
    onDelete: () => void;
}

const ProductManagementCard: React.FC<ProductManagementCardProps> = ({ product, onEdit, onDelete }) => {
    const getStockStatus = () => {
        if (product.stock === 0) {
            return { text: 'Out of Stock', className: 'bg-red-100 text-red-700' };
        }
        if (product.stock <= 10) {
            return { text: 'Low Stock', className: 'bg-orange-100 text-orange-700' };
        }
        return { text: 'In Stock', className: 'bg-green-100 text-green-700' };
    };

    const status = getStockStatus();

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden group relative transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5">
            <div className="relative h-56">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                    <button 
                        onClick={onEdit}
                        className="p-3 bg-white/80 rounded-full text-kithly-dark hover:bg-white hover:scale-110 transition-all duration-200"
                        aria-label="Edit product"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={onDelete}
                        className="p-3 bg-white/80 rounded-full text-red-500 hover:bg-white hover:scale-110 transition-all duration-200"
                        aria-label="Delete product"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="p-4">
                <span className="inline-block bg-kithly-light text-kithly-primary text-xs font-semibold px-2.5 py-1 rounded-full mb-2">{product.category}</span>
                <h3 className="font-bold text-lg text-kithly-dark truncate" title={product.name}>{product.name}</h3>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-xl font-black text-kithly-dark">${product.price.toFixed(2)}</p>
                    <div className="text-right">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.className}`}>
                            {status.text}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{product.stock} in stock</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductManagementCard;
