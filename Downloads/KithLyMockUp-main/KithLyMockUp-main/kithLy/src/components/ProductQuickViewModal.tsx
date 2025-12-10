
import React, { useState } from 'react';
import { Product } from '../types';
import Button from './Button';
import { XIcon } from './icons/NavigationIcons';

interface ProductQuickViewModalProps {
    product: Product;
    onClose: () => void;
    onAddToCart: (product: Product, quantity: number) => void;
}

const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({ product, onClose, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const isOutOfStock = product.stock === 0;

    const handleQuantityChange = (amount: number) => {
        const newQuantity = Math.max(1, Math.min(quantity + amount, product.stock));
        setQuantity(newQuantity);
    };

    const handleAddToCartClick = () => {
        if (!isOutOfStock) {
            onAddToCart(product, quantity);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="fixed inset-0" onClick={onClose} />
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row shadow-2xl relative animate-modal-scale-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                {/* Image Section */}
                <div className="w-full md:w-1/2 p-4">
                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        {product.stock > 0 && product.stock <= 10 && (
                            <span className="absolute top-3 left-3 text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">Low Stock</span>
                        )}
                        {isOutOfStock && (
                            <span className="absolute top-3 left-3 text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">Out of Stock</span>
                        )}
                    </div>
                </div>

                {/* Details Section */}
                <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
                    <div>
                        <span className="text-sm font-semibold text-kithly-primary bg-kithly-light px-3 py-1 rounded-full">{product.category}</span>
                        <h1 className="text-3xl font-bold text-kithly-dark mt-3">{product.name}</h1>
                        <p className="text-3xl font-bold gradient-text mt-4">ZMK {product.price.toFixed(2)}</p>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <h3 className="font-semibold text-kithly-dark mb-2">Description</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{product.description || "No description available."}</p>
                        </div>
                    </div>

                    <div className="mt-auto pt-6">
                        {!isOutOfStock && (
                            <div className="flex items-center space-x-4 mb-6">
                                <p className="font-semibold">Quantity:</p>
                                <div className="flex items-center rounded-lg border border-gray-300">
                                    <button onClick={() => handleQuantityChange(-1)} className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100 rounded-l-md transition">-</button>
                                    <span className="px-6 py-2 text-md font-semibold text-kithly-dark">{quantity}</span>
                                    <button onClick={() => handleQuantityChange(1)} className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100 rounded-r-md transition">+</button>
                                </div>
                            </div>
                        )}

                        <Button
                            variant="primary"
                            className="w-full !py-4 text-lg"
                            onClick={handleAddToCartClick}
                            disabled={isOutOfStock}
                        >
                            {isOutOfStock ? 'Out of Stock' : `Add ${quantity} to Cart`}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductQuickViewModal;
