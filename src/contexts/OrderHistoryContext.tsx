import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Order } from '../types';

interface OrderHistoryContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrder: (orderId: string) => Order | null;
  clearHistory: () => void;
}

const OrderHistoryContext = createContext<OrderHistoryContextType | undefined>(undefined);

const STORAGE_KEY = 'shopcraft_order_history';

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveOrders(orders: Order[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {}
}

export function OrderHistoryProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  const addOrder = (order: Order) => {
    setOrders(prev => {
      const updated = [order, ...prev.filter(o => o.orderId !== order.orderId)];
      saveOrders(updated);
      return updated;
    });
  };

  const getOrder = (orderId: string): Order | null => {
    return orders.find(o => o.orderId === orderId) || null;
  };

  const clearHistory = () => {
    setOrders([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <OrderHistoryContext.Provider value={{ orders, addOrder, getOrder, clearHistory }}>
      {children}
    </OrderHistoryContext.Provider>
  );
}

export function useOrderHistory() {
  const ctx = useContext(OrderHistoryContext);
  if (!ctx) throw new Error('useOrderHistory must be used within OrderHistoryProvider');
  return ctx;
}
