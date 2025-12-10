
import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import { HeartIcon } from './icons/NavigationIcons';
import { Product } from '../App';

interface ProductCardProps {
    product: Product;
    onAddToCart: (imageElement: HTMLImageElement | null) => void;
    onQuickViewClick: () => void;
    isLiked: boolean;
    onLikeClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onQuickViewClick, isLiked, onLikeClick }) => {
    const [justAdded, setJustAdded] = useState(false);
    const [isAnimatingLike, setIsAnimatingLike] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 10;

    const handleAddToCartClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (isOutOfStock) return;
        onAddToCart(imageRef.current);
        setJustAdded(true);
    };

    useEffect(() => {
        if (justAdded) {
            const timer = setTimeout(() => {
                setJustAdded(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [justAdded]);

    const handleLikeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onLikeClick();
        setIsAnimatingLike(true);
    };

    useEffect(() => {
        if (isAnimatingLike) {
            const timer = setTimeout(() => setIsAnimatingLike(false), 400); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [isAnimatingLike]);

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100/80 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer" onClick={onQuickViewClick}>
            <div className="relative">
                <div className="overflow-hidden aspect-square">
                    <img ref={imageRef} src={product.image} alt={product.name} className={`w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`} />
                </div>

                {isOutOfStock && (
                     <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="font-bold text-kithly-dark px-4 py-2 rounded-lg bg-white shadow-md">Out of Stock</span>
                    </div>
                )}

                <div className="absolute top-0 right-0 p-3">
                    <button
                        onClick={handleLikeClick}
                        className={`bg-white/80 backdrop-blur-sm p-2 rounded-full transition-all duration-300
                        ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}
                        ${isAnimatingLike ? 'animate-like-pop' : ''}`}
                        aria-label="Like product"
                    >
                        <HeartIcon isLiked={isLiked} className="w-6 h-6"/>
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <Button variant="secondary" className="w-full !py-2.5 !text-xs !bg-white/90" onClick={(e) => { e.stopPropagation(); onQuickViewClick(); }}>
                        Quick View
                    </Button>
                </div>

            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-md text-kithly-dark flex-grow h-10">{product.name}</h3>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-lg font-bold text-kithly-dark">ZMK {product.price.toFixed(2)}</p>
                    {isLowStock && !isOutOfStock && (
                         <span className="text-xs font-bold text-orange-500 bg-orange-100 px-2 py-1 rounded-md">Low Stock</span>
                    )}
                </div>
            </div>
            <div className="p-4 pt-0">
                <Button
                    variant="primary"
                    className={`w-full text-sm py-3 ${justAdded ? 'bg-green-500' : ''}`}
                    onClick={handleAddToCartClick}
                    disabled={isOutOfStock || justAdded}
                >
                    {justAdded ? 'Added!' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
            </div>
        </div>
    );
};

export default ProductCard;
