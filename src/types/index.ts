export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sort_order?: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sort_order?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  images: string[];
  category?: string;
  tags?: string[];
  featured?: boolean;
  shippingInfo?: string;
  returnPolicy?: string;
  status?: 'active' | 'inactive';
}

export interface ProductReview {
  id: string;
  productId: string;
  rating: number;
  title: string;
  body: string;
  reviewerName: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderId: string;
  orderDate: string;
  customerName: string;
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}
