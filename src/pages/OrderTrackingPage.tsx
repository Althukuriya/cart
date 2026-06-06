import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Package, CheckCircle, Truck, XCircle, Clock } from 'lucide-react';
import { ordersApi } from '../lib/api';
import { useOrderHistory } from '../contexts/OrderHistoryContext';
import type { Order } from '../types';
import { formatPrice, formatDate } from '../lib/utils';

const STATUS_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: Package, desc: 'Your order has been placed successfully' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, desc: 'Your order has been confirmed' },
  { key: 'shipped', label: 'Shipped', icon: Truck, desc: 'Your order is on the way' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, desc: 'Your order has been delivered' },
];

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';
  const [orderId, setOrderId] = useState(initialOrderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);
  const { getOrder: getLocalOrder, orders: localOrders } = useOrderHistory();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setNotFound(false);
    setSearched(true);

    // First check localStorage (instant, always available)
    const localOrder = getLocalOrder(orderId.trim());
    if (localOrder) {
      setOrder(localOrder);
      setLoading(false);
      // Also try to fetch latest status from API in background
      ordersApi.getById(orderId.trim()).then(apiOrder => {
        if (apiOrder && apiOrder.status !== localOrder.status) {
          setOrder({ ...localOrder, ...apiOrder });
        }
      }).catch(() => {});
      return;
    }

    // Fallback to API
    try {
      const data = await ordersApi.getById(orderId.trim());
      if (data) {
        setOrder(data);
        setNotFound(false);
      } else {
        setOrder(null);
        setNotFound(true);
      }
    } catch (err) {
      console.error('Failed to fetch order:', err);
      setOrder(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      handleSearch();
    }
  }, []);

  const getStatusIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return STATUS_STEPS.findIndex(s => s.key === status);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">Track Your Order</h1>
      <p className="text-gray-500 text-center mb-8">Enter your Order ID to check the delivery status</p>

      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            placeholder="Enter Order ID (e.g., ORD-XXXX)"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button type="submit" disabled={loading} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60">
          {loading ? '...' : 'Track'}
        </button>
      </form>

      {/* Recent orders from browser storage */}
      {localOrders.length > 0 && !searched && (
        <div className="max-w-md mx-auto mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" /> Your Recent Orders
          </h3>
          <div className="space-y-2">
            {localOrders.slice(0, 5).map(o => (
              <button
                key={o.orderId}
                onClick={() => { setOrderId(o.orderId); }}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-emerald-50 rounded-lg text-left transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{o.orderId}</p>
                  <p className="text-xs text-gray-500">{formatDate(o.orderDate || o.createdAt)} - {o.items.length} item{o.items.length > 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    o.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                    o.status === 'cancelled' ? 'bg-rose-100 text-rose-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>{o.status}</span>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(o.totalAmount)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {notFound && (
        <div className="text-center py-8">
          <p className="text-gray-500">No order found with ID "{orderId}"</p>
          <p className="text-sm text-gray-400 mt-1">Please check your Order ID and try again</p>
        </div>
      )}

      {order && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-bold text-gray-900">{order.orderId}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                order.status === 'cancelled' ? 'bg-rose-100 text-rose-600' :
                order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                'bg-amber-100 text-amber-600'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>

            {order.status === 'cancelled' ? (
              <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-lg">
                <XCircle className="h-6 w-6 text-rose-500" />
                <div>
                  <p className="font-semibold text-rose-700">Order Cancelled</p>
                  <p className="text-sm text-rose-600">This order has been cancelled</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {STATUS_STEPS.map((step, i) => {
                  const currentIdx = getStatusIndex(order.status);
                  const isCompleted = i <= currentIdx;
                  const isCurrent = i === currentIdx;
                  return (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'} ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}>
                          <step.icon className="h-4 w-4" />
                        </div>
                        {i < STATUS_STEPS.length - 1 && <div className={`w-0.5 h-6 ${i < currentIdx ? 'bg-emerald-600' : 'bg-gray-200'}`} />}
                      </div>
                      <div className="pb-4">
                        <p className={`text-sm font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                        <p className={`text-xs ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.image && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{item.productName} x {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Delivery Address</h3>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-900">{order.customerName}</p>
              <p>{order.address}{order.landmark ? `, Near ${order.landmark}` : ''}</p>
              <p>{order.city}, {order.state} - {order.pincode}</p>
              <p>Phone: {order.phone}</p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/collection" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Continue Shopping</Link>
          </div>
        </div>
      )}

      {!order && !notFound && !searched && localOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Enter your Order ID to track your order</p>
        </div>
      )}
    </div>
  );
}
