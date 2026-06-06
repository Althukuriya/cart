const API_BASE = 'https://script.google.com/macros/s/AKfycbx_37Z3oxqTtRaROYUyQ1qrFglxbaQQuQwKwIfomG-3qEinY0HvHKKrH6DvBy0i2wQ4/exec';

// Admin credentials (local fallback when Google Sheets is not configured)
const ADMIN_EMAIL = 'admin@store.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Store Admin';

import { PEXEL_IMAGES } from './utils';

// ─── Sample fallback data ──────────────────────────────

const SAMPLE_CATEGORIES = [
  { id: 'cat-1', name: 'Electronics', slug: 'electronics', image: PEXEL_IMAGES.electronics, description: 'Latest gadgets and electronics', sort_order: 1 },
  { id: 'cat-2', name: 'Clothing', slug: 'clothing', image: PEXEL_IMAGES.clothing, description: 'Fashion and apparel', sort_order: 2 },
  { id: 'cat-3', name: 'Home & Kitchen', slug: 'home-kitchen', image: PEXEL_IMAGES.home, description: 'Home essentials', sort_order: 3 },
  { id: 'cat-4', name: 'Beauty & Care', slug: 'beauty', image: PEXEL_IMAGES.beauty, description: 'Beauty and personal care', sort_order: 4 },
  { id: 'cat-5', name: 'Sports', slug: 'sports', image: PEXEL_IMAGES.sports, description: 'Sports and fitness', sort_order: 5 },
];

const SAMPLE_PRODUCTS = [
  { id: 'p-1', sku: 'ELEC-001', name: 'Wireless Bluetooth Headphones', slug: 'wireless-bluetooth-headphones', description: 'Premium noise-cancelling wireless headphones with 30-hour battery life. Crystal clear audio with deep bass.', price: 1499, comparePrice: 2999, stock: 50, images: ['https://images.pexels.com/photos/339465/pexels-photo-339465.jpeg?auto=compress&cs=tinysrgb&w=600'], category: 'electronics', featured: true, status: 'active' as const, shippingInfo: 'Free delivery within 5-7 business days', returnPolicy: '7-day easy returns' },
  { id: 'p-2', sku: 'ELEC-002', name: 'Smart Watch Pro', slug: 'smart-watch-pro', description: 'Advanced smartwatch with health monitoring, GPS tracking, and 7-day battery life.', price: 2499, comparePrice: 4999, stock: 30, images: ['https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=600'], category: 'electronics', featured: true, status: 'active' as const, shippingInfo: 'Free delivery within 5-7 business days', returnPolicy: '7-day easy returns' },
  { id: 'p-3', sku: 'CLO-001', name: 'Premium Cotton T-Shirt', slug: 'premium-cotton-tshirt', description: 'Ultra-soft 100% organic cotton t-shirt. Breathable and comfortable for all-day wear.', price: 599, comparePrice: 999, stock: 200, images: ['https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg?auto=compress&cs=tinysrgb&w=600'], category: 'clothing', featured: true, status: 'active' as const, shippingInfo: 'Free delivery within 5-7 business days', returnPolicy: '7-day easy returns' },
  { id: 'p-4', sku: 'CLO-002', name: 'Classic Denim Jeans', slug: 'classic-denim-jeans', description: 'Timeless straight-fit denim jeans made from premium stretch fabric for maximum comfort.', price: 1299, comparePrice: 2499, stock: 100, images: ['https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600'], category: 'clothing', featured: false, status: 'active' as const, shippingInfo: 'Free delivery within 5-7 business days', returnPolicy: '7-day easy returns' },
  { id: 'p-5', sku: 'HOME-001', name: 'Ceramic Coffee Mug Set', slug: 'ceramic-coffee-mug-set', description: 'Set of 4 handcrafted ceramic mugs. Microwave and dishwasher safe. 300ml capacity each.', price: 799, comparePrice: 1499, stock: 75, images: ['https://images.pexels.com/photos/606540/pexels-photo-606540.jpeg?auto=compress&cs=tinysrgb&w=600'], category: 'home-kitchen', featured: true, status: 'active' as const, shippingInfo: 'Free delivery within 5-7 business days', returnPolicy: '7-day easy returns' },
  { id: 'p-6', sku: 'BEAUTY-001', name: 'Natural Face Serum', slug: 'natural-face-serum', description: 'Vitamin C enriched face serum with hyaluronic acid. Brightens and hydrates skin naturally.', price: 499, comparePrice: 999, stock: 150, images: ['https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=600'], category: 'beauty', featured: false, status: 'active' as const, shippingInfo: 'Free delivery within 5-7 business days', returnPolicy: '7-day easy returns' },
  { id: 'p-7', sku: 'SPORT-001', name: 'Yoga Mat Premium', slug: 'yoga-mat-premium', description: 'Extra thick 6mm non-slip yoga mat. Eco-friendly TPE material with alignment markings.', price: 899, comparePrice: 1799, stock: 60, images: ['https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=600'], category: 'sports', featured: false, status: 'active' as const, shippingInfo: 'Free delivery within 5-7 business days', returnPolicy: '7-day easy returns' },
  { id: 'p-8', sku: 'ELEC-003', name: 'Portable Bluetooth Speaker', slug: 'portable-bluetooth-speaker', description: 'Waterproof portable speaker with 360-degree sound. 12-hour battery life with USB-C charging.', price: 999, comparePrice: 1999, stock: 80, images: ['https://images.pexels.com/photos/1279365/pexels-photo-1279365.jpeg?auto=compress&cs=tinysrgb&w=600'], category: 'electronics', featured: true, status: 'active' as const, shippingInfo: 'Free delivery within 5-7 business days', returnPolicy: '7-day easy returns' },
];

// In-memory stores for local fallback
let localProducts = [...SAMPLE_PRODUCTS];
let localCategories = [...SAMPLE_CATEGORIES];
let localOrders: any[] = [];
let localOrderCounter = 0;
let sheetsAvailable = true;

// ─── Google Apps Script API Call ────────────────────────
// Google Apps Script Web Apps redirect POST requests (302).
// To handle this properly, we use FormData which follows
// the redirect correctly, or we use GET with URL params for reads.

async function apiGet<T>(action: string, params?: Record<string, string>): Promise<T> {
  try {
    const url = new URL(API_BASE);
    url.searchParams.set('action', action);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    const result = JSON.parse(text);

    if (result.status === 'error') throw new Error(result.message || result.error || 'API error');
    sheetsAvailable = true;
    return (result.data !== undefined ? result.data : result) as T;
  } catch (err) {
    sheetsAvailable = false;
    console.warn(`Google Sheets GET failed (${action}):`, err);
    throw err;
  }
}

async function apiPost<T>(action: string, payload?: Record<string, any>): Promise<T> {
  try {
    // Use FormData to handle Google Apps Script's 302 redirect
    // FormData POSTs survive the redirect; JSON POSTs get converted to GET
    const formData = new FormData();
    formData.append('action', action);
    if (payload) {
      formData.append('payload', JSON.stringify(payload));
    }

    const response = await fetch(API_BASE, {
      method: 'POST',
      body: formData,
      redirect: 'follow',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    const result = JSON.parse(text);

    if (result.status === 'error') throw new Error(result.message || result.error || 'API error');
    sheetsAvailable = true;
    return (result.data !== undefined ? result.data : result) as T;
  } catch (err) {
    sheetsAvailable = false;
    console.warn(`Google Sheets POST failed (${action}):`, err);
    throw err;
  }
}

// ─── Products API ──────────────────────────────────────

export const productsApi = {
  async getAll() {
    try {
      const data = await apiGet<any[]>('getProducts');
      if (Array.isArray(data) && data.length > 0) {
        localProducts = data;
        return data;
      }
    } catch {}
    return localProducts;
  },
  async getByCategory(category: string) {
    try {
      const data = await apiGet<any[]>('getProductsByCategory', { category });
      if (Array.isArray(data)) return data;
    } catch {}
    return localProducts.filter(p => p.category === category || p.category?.toLowerCase() === category.toLowerCase());
  },
  async search(query: string) {
    try {
      const data = await apiGet<any[]>('searchProducts', { query });
      if (Array.isArray(data)) return data;
    } catch {}
    const q = query.toLowerCase();
    return localProducts.filter(p =>
      p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
  },
  async add(product: any) {
    try {
      const result = await apiPost<{ id: string }>('addProduct', { adminKey: 'shopcraft-admin-key-2024', product });
      return result;
    } catch {
      const newProduct = { ...product, id: `p-${Date.now()}`, slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') };
      localProducts = [newProduct, ...localProducts];
      return { id: newProduct.id };
    }
  },
  async update(id: string, updates: any) {
    try {
      return await apiPost<{ success: boolean }>('updateProduct', { adminKey: 'shopcraft-admin-key-2024', productId: id, updates });
    } catch {
      localProducts = localProducts.map(p => p.id === id ? { ...p, ...updates } : p);
      return { success: true };
    }
  },
  async delete(id: string) {
    try {
      return await apiPost<{ success: boolean }>('deleteProduct', { adminKey: 'shopcraft-admin-key-2024', productId: id });
    } catch {
      localProducts = localProducts.filter(p => p.id !== id);
      return { success: true };
    }
  },
};

// ─── Categories API ─────────────────────────────────────

export const categoriesApi = {
  async getAll() {
    try {
      const data = await apiGet<any[]>('getCategories');
      if (Array.isArray(data) && data.length > 0) {
        localCategories = data;
        return data;
      }
    } catch {}
    return localCategories;
  },
  async add(category: any) {
    try {
      return await apiPost<{ id: string }>('addCategory', { adminKey: 'shopcraft-admin-key-2024', category });
    } catch {
      const newCat = { ...category, id: `cat-${Date.now()}`, slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') };
      localCategories = [...localCategories, newCat];
      return { id: newCat.id };
    }
  },
  async update(id: string, updates: any) {
    try {
      return await apiPost<{ success: boolean }>('updateCategory', { adminKey: 'shopcraft-admin-key-2024', categoryId: id, updates });
    } catch {
      localCategories = localCategories.map(c => c.id === id ? { ...c, ...updates } : c);
      return { success: true };
    }
  },
  async delete(id: string) {
    try {
      return await apiPost<{ success: boolean }>('deleteCategory', { adminKey: 'shopcraft-admin-key-2024', categoryId: id });
    } catch {
      localCategories = localCategories.filter(c => c.id !== id);
      return { success: true };
    }
  },
};

// ─── Orders API ─────────────────────────────────────────

export const ordersApi = {
  async create(order: any) {
    try {
      return await apiPost<{ orderId: string }>('createOrder', order);
    } catch {
      localOrderCounter++;
      const orderId = order.orderId || `ORD-${Date.now().toString(36).toUpperCase()}-${localOrderCounter}`;
      const newOrder = {
        ...order,
        id: `order-${Date.now()}`,
        orderId,
        orderDate: new Date().toISOString(),
        status: order.status || 'placed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localOrders = [newOrder, ...localOrders];
      return { orderId };
    }
  },
  async getAll() {
    try {
      const data = await apiPost<any[]>('getOrders', { adminKey: 'shopcraft-admin-key-2024' });
      if (Array.isArray(data)) {
        localOrders = data;
        return data;
      }
    } catch {}
    return localOrders;
  },
  async getByEmail(email: string) {
    try {
      const data = await apiGet<any[]>('getOrdersByEmail', { email });
      if (Array.isArray(data)) return data;
    } catch {}
    return localOrders.filter(o => o.email === email);
  },
  async getById(orderId: string) {
    try {
      const data = await apiGet<any>('getOrder', { orderId });
      if (data) return data;
    } catch {}
    return localOrders.find(o => o.orderId === orderId) || null;
  },
  async updateStatus(orderId: string, status: string) {
    try {
      return await apiPost<{ success: boolean }>('updateOrderStatus', { adminKey: 'shopcraft-admin-key-2024', orderId, status });
    } catch {
      localOrders = localOrders.map(o =>
        o.orderId === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
      );
      return { success: true };
    }
  },
};

// ─── Auth API ───────────────────────────────────────────

export const authApi = {
  async login(email: string, password: string) {
    try {
      const result = await apiPost<{ adminId: string; name: string; email: string }>('adminLogin', { email, password });
      return result;
    } catch {
      // Local fallback authentication
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        return { adminId: 'admin-1', name: ADMIN_NAME, email: ADMIN_EMAIL };
      }
      throw new Error('Invalid email or password');
    }
  },
};

// ─── Site Settings API ──────────────────────────────────

export interface SiteSettings {
  storeName: string;
  storeTagline: string;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  collectionBannerImage: string;
  collectionBannerTitle: string;
  collectionBannerSubtitle: string;
  collectionBannerCta: string;
  shippingInfo: string;
  returnPolicy: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  ownerEmail: string;
  announcements: string;
  footerText: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  storeName: 'ShopCraft',
  storeTagline: 'Your destination for quality products. Cash on Delivery available.',
  heroImage: PEXEL_IMAGES.hero,
  heroTitle: 'Quality Products at Best Prices',
  heroSubtitle: 'Shop with confidence. Free delivery and easy returns available across India.',
  heroBadge: 'Cash on Delivery Available',
  collectionBannerImage: PEXEL_IMAGES.hero,
  collectionBannerTitle: 'New Collection',
  collectionBannerSubtitle: 'Discover our latest arrivals with premium quality and exclusive deals.',
  collectionBannerCta: 'Explore',
  shippingInfo: 'Free delivery within 5-7 business days',
  returnPolicy: '7-day easy returns',
  supportEmail: 'althukuriya83@gmail.com',
  supportPhone: '+91 98765 43210',
  whatsappNumber: '919876543210',
  ownerEmail: 'althukuriya83@gmail.com',
  announcements: '',
  footerText: 'All rights reserved.',
};

let localSettings: SiteSettings = { ...DEFAULT_SETTINGS };

export const settingsApi = {
  async get(): Promise<SiteSettings> {
    try {
      const data = await apiGet<SiteSettings>('getSettings');
      if (data && typeof data === 'object') {
        localSettings = { ...DEFAULT_SETTINGS, ...data };
        return localSettings;
      }
    } catch {}
    return localSettings;
  },
  async update(settings: Partial<SiteSettings>) {
    try {
      await apiPost<{ success: boolean }>('updateSettings', { adminKey: 'shopcraft-admin-key-2024', settings });
      localSettings = { ...localSettings, ...settings };
      return { success: true };
    } catch {
      localSettings = { ...localSettings, ...settings };
      return { success: true };
    }
  },
};

export function getDefaultSettings(): SiteSettings {
  return { ...DEFAULT_SETTINGS };
}

export function isSheetsAvailable() {
  return sheetsAvailable;
}
