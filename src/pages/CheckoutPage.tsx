import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useOrderHistory } from '../contexts/OrderHistoryContext';
import { formatPrice, INDIAN_STATES, generateOrderId } from '../lib/utils';
import { ordersApi } from '../lib/api';
import type { CustomerInfo, Order } from '../types';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const { addOrder } = useOrderHistory();
  const navigate = useNavigate();
  const [step, setStep] = useState<'address' | 'review'>('address');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: '', phone: '', altPhone: '', email: '',
    address: '', landmark: '', city: '', state: '', pincode: '',
  });

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const shipping = 0;
  const total = totalAmount + shipping;

  const validateAddress = (): boolean => {
    const { fullName, phone, email, address, city, state, pincode } = customer;
    if (!fullName.trim()) { setError('Full name is required'); return false; }
    if (!phone.trim() || phone.length < 10) { setError('Valid phone number is required'); return false; }
    if (!email.trim() || !email.includes('@')) { setError('Valid email is required'); return false; }
    if (!address.trim()) { setError('Address is required'); return false; }
    if (!city.trim()) { setError('City is required'); return false; }
    if (!state.trim()) { setError('State is required'); return false; }
    if (!pincode.trim() || pincode.length !== 6) { setError('Valid 6-digit pincode is required'); return false; }
    setError('');
    return true;
  };

  const handleContinue = () => {
    if (validateAddress()) setStep('review');
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError('');
    try {
      const orderId = generateOrderId();
      const now = new Date().toISOString();
      const orderItems = items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0] || '',
      }));

      const orderData = {
        orderId,
        customerName: customer.fullName,
        phone: customer.phone,
        altPhone: customer.altPhone,
        email: customer.email,
        address: customer.address,
        landmark: customer.landmark,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
        items: orderItems,
        totalAmount: total,
        status: 'placed' as const,
      };

      // Save to API (Google Sheets) - non-blocking, won't fail the order
      ordersApi.create(orderData).catch(err => console.warn('API order save failed:', err));

      // Save full order to localStorage (always succeeds)
      const fullOrder: Order = {
        id: `local-${Date.now()}`,
        orderId,
        orderDate: now,
        customerName: customer.fullName,
        phone: customer.phone,
        altPhone: customer.altPhone,
        email: customer.email,
        address: customer.address,
        landmark: customer.landmark,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
        items: orderItems,
        totalAmount: total,
        status: 'placed',
        createdAt: now,
        updatedAt: now,
      };
      addOrder(fullOrder);

      clearCart();
      navigate(`/order-success?orderId=${orderId}`);
    } catch (err: any) {
      console.error('Order failed:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Cart
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="flex items-center gap-2 mb-8">
        {['Address', 'Review'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s.toLowerCase() || (s === 'Review' && step === 'review') ? 'bg-emerald-600 text-white' : i < (step === 'address' ? 0 : 1) ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</div>
            <span className={`text-sm font-medium ${step === s.toLowerCase() ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
            {i < 1 && <div className="w-8 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {step === 'address' && (
        <div className="space-y-5">
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Truck className="h-5 w-5 text-emerald-600" /> Delivery Address</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className={labelClass}>Full Name *</label><input required value={customer.fullName} onChange={e => setCustomer({ ...customer, fullName: e.target.value })} className={inputClass} placeholder="Enter your full name" /></div>
              <div><label className={labelClass}>Phone Number *</label><input required value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} className={inputClass} placeholder="10-digit phone number" type="tel" /></div>
              <div><label className={labelClass}>Alternative Phone</label><input value={customer.altPhone} onChange={e => setCustomer({ ...customer, altPhone: e.target.value })} className={inputClass} placeholder="Alternative phone (optional)" type="tel" /></div>
              <div className="md:col-span-2"><label className={labelClass}>Email Address *</label><input required value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} className={inputClass} placeholder="your@email.com" type="email" /></div>
              <div className="md:col-span-2"><label className={labelClass}>Full Delivery Address *</label><textarea required value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} className={inputClass + ' resize-none'} rows={3} placeholder="House no., street, area" /></div>
              <div><label className={labelClass}>Landmark</label><input value={customer.landmark} onChange={e => setCustomer({ ...customer, landmark: e.target.value })} className={inputClass} placeholder="Nearby landmark (optional)" /></div>
              <div><label className={labelClass}>City *</label><input required value={customer.city} onChange={e => setCustomer({ ...customer, city: e.target.value })} className={inputClass} placeholder="City" /></div>
              <div><label className={labelClass}>State *</label>
                <select required value={customer.state} onChange={e => setCustomer({ ...customer, state: e.target.value })} className={inputClass}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Pincode *</label><input required value={customer.pincode} onChange={e => setCustomer({ ...customer, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} className={inputClass} placeholder="6-digit pincode" type="text" /></div>
            </div>
          </div>

          {error && <p className="text-rose-600 text-sm font-medium bg-rose-50 p-3 rounded-lg">{error}</p>}

          <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-sm text-emerald-700 font-medium">Cash on Delivery - Pay when you receive your order</p>
          </div>

          <button onClick={handleContinue} className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
            Review Order
          </button>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-5">
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Delivery Address</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">{customer.fullName}</p>
              <p>{customer.address}</p>
              {customer.landmark && <p>Near {customer.landmark}</p>}
              <p>{customer.city}, {customer.state} - {customer.pincode}</p>
              <p>Phone: {customer.phone}{customer.altPhone && ` / ${customer.altPhone}`}</p>
              <p>Email: {customer.email}</p>
            </div>
            <button onClick={() => setStep('address')} className="mt-3 text-sm text-emerald-600 font-medium hover:text-emerald-700">Edit Address</button>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img src={item.product.images?.[0] || 'https://images.pexels.com/photos/3561339/pexels-photo-3561339.jpeg?auto=compress&cs=tinysrgb&w=400'} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(totalAmount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="text-emerald-600 font-medium">FREE</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment Method</span><span>Cash on Delivery</span></div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                <span>Total</span><span className="text-lg">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {error && <p className="text-rose-600 text-sm font-medium bg-rose-50 p-3 rounded-lg">{error}</p>}

          <button onClick={handlePlaceOrder} disabled={submitting} className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? 'Placing Order...' : 'Place Order (COD)'}
          </button>
        </div>
      )}
    </div>
  );
}
