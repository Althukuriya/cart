import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, FolderOpen, Settings, LogOut, Menu, X, Plus, Edit2, Trash2, Search, Download, Eye, Save } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { productsApi, categoriesApi, ordersApi, settingsApi, isSheetsAvailable, type SiteSettings, getDefaultSettings } from '../../lib/api';
import { formatPrice, formatDate, slugify } from '../../lib/utils';

type TabId = 'dashboard' | 'products' | 'orders' | 'categories' | 'settings';

const NAV_ITEMS: { id: TabId; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'categories', label: 'Categories', icon: FolderOpen },
  { id: 'settings', label: 'Site Settings', icon: Settings },
];

export default function AdminDashboard() {
  const { admin, logout, isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  useEffect(() => {
    if (!isAuthenticated) navigate('/admin');
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileNavOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-gray-700">
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-gray-900">ShopCraft Admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">{admin?.name}</span>
          <button onClick={logout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-rose-600 transition-colors">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex">
        <aside className="hidden lg:block w-60 bg-white border-r border-gray-200 min-h-[calc(100vh-52px)] sticky top-[52px]">
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <item.icon className="h-4 w-4" /> {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
            <div className="fixed top-0 left-0 bottom-0 w-60 bg-white shadow-xl p-4">
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-gray-900">Admin</span>
                <button onClick={() => setMobileNavOpen(false)} className="p-2 text-gray-500"><X className="h-4 w-4" /></button>
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map(item => (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileNavOpen(false); }} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <item.icon className="h-4 w-4" /> {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 lg:p-6 min-w-0">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────
function DashboardTab() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [products, orders] = await Promise.all([productsApi.getAll(), ordersApi.getAll()]);
        const prods = Array.isArray(products) ? products : [];
        const ords = Array.isArray(orders) ? orders : [];
        setStats({
          products: prods.length,
          orders: ords.length,
          revenue: ords.reduce((s: number, o: any) => s + (Number(o.totalAmount) || 0), 0),
          pending: ords.filter((o: any) => o.status === 'placed').length,
        });
        setRecentOrders(ords.slice(0, 5));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const cards = [
    { label: 'Total Products', value: stats.products, icon: Package, color: 'emerald' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'blue' },
    { label: 'Revenue', value: formatPrice(stats.revenue), icon: LayoutDashboard, color: 'amber' },
    { label: 'Pending Orders', value: stats.pending, icon: ShoppingBag, color: 'rose' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      {!isSheetsAvailable() && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          Google Sheets backend not connected. Using local sample data. Configure your Apps Script to enable real-time sync.
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{c.label}</span>
              <c.icon className={`h-5 w-5 text-${c.color}-500`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-5 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Recent Orders</h2></div>
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> :
         recentOrders.length === 0 ? <div className="p-8 text-center text-gray-400">No orders yet</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((o: any) => (
                  <tr key={o.orderId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{o.orderId}</td>
                    <td className="px-4 py-3 text-gray-600">{o.customerName}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(o.totalAmount)}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      o.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                      o.status === 'cancelled' ? 'bg-rose-100 text-rose-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Products ──────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: 0, comparePrice: 0, stock: 0, sku: '', category: '', images: '' as string, featured: false, status: 'active' as 'active' | 'inactive' });
  const [error, setError] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const data = await productsApi.getAll();
      setProducts(Array.isArray(data) ? data : []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', price: 0, comparePrice: 0, stock: 0, sku: '', category: '', images: '', featured: false, status: 'active' }); setShowForm(true); setError(''); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || '', price: p.price, comparePrice: p.comparePrice || 0, stock: p.stock, sku: p.sku || '', category: p.category || '', images: (p.images || []).join('\n'), featured: !!p.featured, status: p.status || 'active' });
    setShowForm(true); setError('');
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const images = form.images.split('\n').map(s => s.trim()).filter(Boolean);
      const payload = { name: form.name, slug: slugify(form.name), description: form.description, price: Number(form.price), comparePrice: Number(form.comparePrice), stock: Number(form.stock), sku: form.sku, category: form.category, images, featured: form.featured, status: form.status, shippingInfo: 'Free delivery within 5-7 business days', returnPolicy: '7-day easy returns' };
      if (editing) {
        await productsApi.update(editing.id, payload);
      } else {
        await productsApi.add(payload);
      }
      setShowForm(false); await fetchProducts();
    } catch (err: any) { setError(err.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await productsApi.delete(id);
    await fetchProducts();
  };

  const handleExport = () => {
    const csv = ['Name,SKU,Price,ComparePrice,Stock,Category,Status', ...products.map(p => [`"${p.name}"`, p.sku, p.price, p.comparePrice || '', p.stock, p.category || '', p.status].join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'products.csv'; a.click();
  };

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"><Download className="h-4 w-4" /></button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add Product</button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl my-8 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing ? 'Edit' : 'Add'} Product</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && <p className="text-rose-600 text-sm bg-rose-50 p-3 rounded-lg">{error}</p>}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">SKU</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Price *</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} min={0} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Compare Price</label><input type="number" value={form.comparePrice} onChange={e => setForm({ ...form, comparePrice: Number(e.target.value) })} className={inputClass} min={0} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label><input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} className={inputClass} min={0} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className={inputClass}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputClass + ' resize-none'} rows={3} /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (one per line)</label><textarea value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} className={inputClass + ' resize-none'} rows={3} placeholder="https://...&#10;https://..." /></div>
                <div className="flex items-center gap-2"><input type="checkbox" id="feat" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 text-emerald-600 rounded border-gray-300" /><label htmlFor="feat" className="text-sm font-medium text-gray-700">Featured</label></div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name} className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> :
         filtered.length === 0 ? <div className="p-8 text-center text-gray-400">No products found</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">{p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}</div>
                      <div className="min-w-0"><p className="font-medium text-gray-900 truncate">{p.name}</p><p className="text-xs text-gray-400">{p.sku || '-'}</p></div>
                    </div></td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3"><span className={`text-sm font-medium ${p.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{p.stock}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span></td>
                    <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-emerald-600"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Orders ──────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const data = await ordersApi.getAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.orderId?.toLowerCase().includes(search.toLowerCase()) || o.customerName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (orderId: string, status: string) => {
    await ordersApi.updateStatus(orderId, status);
    await fetchOrders();
    if (selectedOrder?.orderId === orderId) setSelectedOrder((prev: any) => ({ ...prev, status }));
  };

  const handleExport = () => {
    const csv = ['OrderID,Date,Customer,Phone,Email,City,State,Amount,Status', ...filtered.map(o => [o.orderId, o.orderDate || o.createdAt, `"${o.customerName}"`, o.phone, o.email, o.city, o.state, o.totalAmount, o.status].join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'orders.csv'; a.click();
  };

  const statuses = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"><Download className="h-4 w-4" /> Export</button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, name..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> :
         filtered.length === 0 ? <div className="p-8 text-center text-gray-400">No orders found</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">View</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(o => (
                  <tr key={o.orderId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{o.orderId}</td>
                    <td className="px-4 py-3"><div><p className="text-gray-900">{o.customerName}</p><p className="text-xs text-gray-400">{o.email}</p></div></td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <select value={o.status} onChange={e => updateStatus(o.orderId, e.target.value)} className={`text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer ${
                        o.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                        o.status === 'cancelled' ? 'bg-rose-100 text-rose-600' :
                        o.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(o.orderDate || o.createdAt)}</td>
                    <td className="px-4 py-3 text-right"><button onClick={() => setSelectedOrder(o)} className="p-1.5 text-gray-400 hover:text-emerald-600"><Eye className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg my-8 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Order: {selectedOrder.orderId}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><p className="text-xs font-medium text-gray-500 uppercase mb-1">Customer</p>
                <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                <p className="text-sm text-gray-600">{selectedOrder.email}</p>
                <p className="text-sm text-gray-600">Phone: {selectedOrder.phone}</p>
              </div>
              <div><p className="text-xs font-medium text-gray-500 uppercase mb-1">Address</p>
                <p className="text-sm text-gray-600">{selectedOrder.address}{selectedOrder.landmark ? `, Near ${selectedOrder.landmark}` : ''}</p>
                <p className="text-sm text-gray-600">{selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
              </div>
              <div><p className="text-xs font-medium text-gray-500 uppercase mb-1">Items</p>
                {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-50">
                    <span className="text-gray-700">{item.productName || item.product_name} x {item.quantity}</span>
                    <span className="font-medium text-gray-900">{formatPrice((item.price || 0) * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-bold"><span>Total</span><span>{formatPrice(selectedOrder.totalAmount)}</span></div>
              </div>
              <div><p className="text-xs font-medium text-gray-500 uppercase mb-1">Status</p>
                <select value={selectedOrder.status} onChange={e => updateStatus(selectedOrder.orderId, e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Categories ─────────────────────────────────────────
function CategoriesTab() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', image: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const data = await categoriesApi.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch { setCategories([]); }
    finally { setLoading(false); }
  }

  const openAdd = () => { setEditing(null); setForm({ name: '', image: '', description: '' }); setShowForm(true); setError(''); };
  const openEdit = (c: any) => { setEditing(c); setForm({ name: c.name, image: c.image || '', description: c.description || '' }); setShowForm(true); setError(''); };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = { name: form.name, slug: slugify(form.name), image: form.image, description: form.description };
      if (editing) {
        await categoriesApi.update(editing.id, payload);
      } else {
        await categoriesApi.add(payload);
      }
      setShowForm(false); await fetchCategories();
    } catch (err: any) { setError(err.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await categoriesApi.delete(id); await fetchCategories();
  };

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add Category</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md my-8 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing ? 'Edit' : 'Add'} Category</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <p className="text-rose-600 text-sm bg-rose-50 p-3 rounded-lg">{error}</p>}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label><input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputClass + ' resize-none'} rows={2} /></div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name} className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> :
         categories.length === 0 ? <div className="p-8 text-center text-gray-400">No categories yet</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-3">
                      {c.image && <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100"><img src={c.image} alt="" className="w-full h-full object-cover" /></div>}
                      <span className="font-medium text-gray-900">{c.name}</span>
                    </div></td>
                    <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                    <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-emerald-600"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Site Settings ──────────────────────────────────────
function SettingsTab() {
  const defaults = getDefaultSettings();
  const [form, setForm] = useState<SiteSettings>({ ...defaults });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await settingsApi.get();
        setForm(data);
      } catch { /* use defaults */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      await settingsApi.update(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Save failed');
    }
    finally { setSaving(false); }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";
  const imgClass = "w-full h-32 object-cover rounded-lg bg-gray-100 border border-gray-200";

  if (loading) return <div className="p-8 text-center text-gray-400">Loading settings...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <button onClick={handleSave} disabled={saving} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${saved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60'}`}>
          <Save className="h-4 w-4" /> {saved ? 'Saved!' : saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {error && <p className="text-rose-600 text-sm bg-rose-50 p-3 rounded-lg mb-4">{error}</p>}

      {/* Hero Banner Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <h2 className="font-bold text-gray-900 mb-4">Hero Banner</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
            <input value={form.heroImage} onChange={e => setForm({ ...form, heroImage: e.target.value })} className={inputClass} />
          </div>
          <div className="row-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
            {form.heroImage && <img src={form.heroImage} alt="Hero" className={imgClass} />}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
            <input value={form.heroTitle} onChange={e => setForm({ ...form, heroTitle: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
            <input value={form.heroSubtitle} onChange={e => setForm({ ...form, heroSubtitle: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Badge Text</label>
            <input value={form.heroBadge} onChange={e => setForm({ ...form, heroBadge: e.target.value })} className={inputClass} placeholder="e.g. Cash on Delivery Available" />
          </div>
        </div>
      </div>

      {/* Collection Banner */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <h2 className="font-bold text-gray-900 mb-4">Collection Banner</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
            <input value={form.collectionBannerImage} onChange={e => setForm({ ...form, collectionBannerImage: e.target.value })} className={inputClass} />
          </div>
          <div className="row-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
            {form.collectionBannerImage && <img src={form.collectionBannerImage} alt="Collection Banner" className={imgClass} />}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title</label>
            <input value={form.collectionBannerTitle} onChange={e => setForm({ ...form, collectionBannerTitle: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Subtitle</label>
            <input value={form.collectionBannerSubtitle} onChange={e => setForm({ ...form, collectionBannerSubtitle: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
            <input value={form.collectionBannerCta} onChange={e => setForm({ ...form, collectionBannerCta: e.target.value })} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Store Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <h2 className="font-bold text-gray-900 mb-4">Store Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label><input value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Store Tagline</label><input value={form.storeTagline} onChange={e => setForm({ ...form, storeTagline: e.target.value })} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label><input value={form.footerText} onChange={e => setForm({ ...form, footerText: e.target.value })} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Announcement Bar Text</label><input value={form.announcements} onChange={e => setForm({ ...form, announcements: e.target.value })} className={inputClass} placeholder="Leave empty to hide" /></div>
        </div>
      </div>

      {/* Contact & Policies */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <h2 className="font-bold text-gray-900 mb-4">Contact & Policies</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label><input value={form.supportEmail} onChange={e => setForm({ ...form, supportEmail: e.target.value })} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label><input value={form.supportPhone} onChange={e => setForm({ ...form, supportPhone: e.target.value })} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number (with country code)</label><input value={form.whatsappNumber} onChange={e => setForm({ ...form, whatsappNumber: e.target.value })} className={inputClass} placeholder="919876543210" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Order Notification Email</label><input value={form.ownerEmail} onChange={e => setForm({ ...form, ownerEmail: e.target.value })} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Shipping Info</label><input value={form.shippingInfo} onChange={e => setForm({ ...form, shippingInfo: e.target.value })} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Return Policy</label><input value={form.returnPolicy} onChange={e => setForm({ ...form, returnPolicy: e.target.value })} className={inputClass} /></div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${saved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60'}`}>
          <Save className="h-4 w-4" /> {saved ? 'Saved!' : saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
