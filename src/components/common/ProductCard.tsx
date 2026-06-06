import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../../types';
import { formatPrice, getDiscountPercent, PEXEL_IMAGES } from '../../lib/utils';
import { useCart } from '../../contexts/CartContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, lastAdded } = useCart();
  const discount = getDiscountPercent(product.price, product.comparePrice);
  const image = product.images?.[0] || PEXEL_IMAGES.placeholder;

  return (
    <div className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all">
      <div className="relative aspect-square overflow-hidden bg-gray-50 rounded-t-xl">
        <Link to={`/product/${product.slug || product.id}`}>
          <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
        </Link>
        {discount > 0 && <span className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">{discount}%</span>}
      </div>
      <div className="p-4">
        <Link to={`/product/${product.slug || product.id}`} className="block">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-emerald-600">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
        {product.stock > 0 ? (
          <button onClick={() => addToCart(product)} className={`mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            lastAdded === product.id
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
          }`}>
            <ShoppingCart className="h-4 w-4" />
            {lastAdded === product.id ? 'Added!' : 'Add'}
          </button>
        ) : (
          <button disabled className="mt-3 w-full py-2 px-4 rounded-lg text-sm font-medium bg-gray-100 text-gray-400">Out of Stock</button>
        )}
      </div>
    </div>
  );
}
