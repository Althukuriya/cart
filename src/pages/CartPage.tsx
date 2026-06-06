import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../lib/utils';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalAmount, totalItems, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse our collection and add items</p>
        <Link to="/collection" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700">
          Start Shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const shipping = 0;
  const total = totalAmount + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart ({totalItems})</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.product.id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl">
              <Link to={`/product/${item.product.slug || item.product.id}`} className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-50">
                <img src={item.product.images?.[0] || 'https://images.pexels.com/photos/3561339/pexels-photo-3561339.jpeg'} alt={item.product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1">
                <Link to={`/product/${item.product.slug || item.product.id}`} className="font-medium text-gray-900 hover:text-emerald-600">{item.product.name}</Link>
                <p className="text-sm text-gray-400 mt-0.5">SKU: {item.product.sku || 'N/A'}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 text-gray-500"><Minus className="h-3 w-3" /></button>
                    <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 text-gray-500"><Plus className="h-3 w-3" /></button>
                  </div>
                  <span className="font-bold text-gray-900">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.product.id)} className="p-2 text-gray-400 hover:text-rose-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-rose-600 hover:text-rose-700 font-medium">Clear Cart</button>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 h-fit sticky top-24">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm mb-4">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="text-gray-900 font-medium">{formatPrice(totalAmount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="text-emerald-600 font-medium">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="text-gray-900 font-medium">COD</span></div>
          </div>
          <div className="border-t border-gray-200 pt-4 flex justify-between mb-4">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-gray-900 text-lg">{formatPrice(total)}</span>
          </div>
          <Link to="/checkout" className="block w-full py-3 bg-emerald-600 text-white text-center rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
            Proceed to Checkout
          </Link>
          <Link to="/collection" className="block text-center text-sm text-gray-500 hover:text-emerald-600 mt-2">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
