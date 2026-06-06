import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Copy, Check } from 'lucide-react';
import { useOrderHistory } from '../contexts/OrderHistoryContext';
import { formatPrice, formatDate } from '../lib/utils';
import { useState } from 'react';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const { getOrder, orders } = useOrderHistory();
  const [copied, setCopied] = useState(false);

  const order = getOrder(orderId);

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4">
          <CheckCircle className="h-12 w-12 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500">Your order has been confirmed with Cash on Delivery</p>
      </div>

      {orderId && (
        <div className="bg-gray-50 rounded-xl p-6 text-center mb-6">
          <p className="text-sm text-gray-500 mb-1">Order ID</p>
          <div className="flex items-center justify-center gap-2">
            <p className="font-bold text-gray-900 text-xl tracking-wide">{orderId}</p>
            <button onClick={handleCopyId} className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors" title="Copy Order ID">
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Save this Order ID to track your order status.</p>
        </div>
      )}

      {order && (
        <div className="space-y-4 mb-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {item.image && <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity} x {formatPrice(item.price)}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-lg">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-2">Delivery Address</h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-900">{order.customerName}</p>
              <p>{order.address}{order.landmark ? `, Near ${order.landmark}` : ''}</p>
              <p>{order.city}, {order.state} - {order.pincode}</p>
              <p>Phone: {order.phone}</p>
              <p>Email: {order.email}</p>
            </div>
          </div>

          {/* Order Date */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-2">Order Details</h2>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Order Date</span><span className="text-gray-900">{formatDate(order.orderDate || order.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="text-gray-900">Cash on Delivery</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-600">Placed</span></div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-2 mb-6">
        <Package className="h-5 w-5 text-emerald-600 shrink-0" />
        <p className="text-sm text-emerald-700 font-medium">Cash on Delivery - Pay on receipt</p>
      </div>

      {orders.length > 1 && (
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-700 font-medium">You have {orders.length} orders saved in your browser. Track them anytime from the Track Order page.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={`/track-order?orderId=${orderId}`} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
          Track Order <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/collection" className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:border-emerald-600 hover:text-emerald-600 transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
