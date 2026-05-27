import React, { createContext, useContext, useState, useCallback } from 'react';
import type { CartItem, PaymentMethod } from '@/types';

interface CartContextType {
  items: CartItem[];
  discount: number;
  paymentMethod: PaymentMethod;
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  setDiscount: (discount: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  subtotal: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscountState] = useState(0);
  const [paymentMethod, setPaymentMethodState] = useState<PaymentMethod>('cash');

  const addItem = useCallback((item: Omit<CartItem, 'qty'> & { qty?: number }) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId
            ? { ...i, qty: i.qty + (item.qty || 1) }
            : i
        );
      }
      return [...prev, { ...item, qty: item.qty || 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.productId !== productId));
      return;
    }
    setItems(prev =>
      prev.map(i => (i.productId === productId ? { ...i, qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountState(0);
  }, []);

  const setDiscount = useCallback((discount: number) => {
    setDiscountState(Math.max(0, discount));
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = Math.max(0, subtotal - discount);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        discount,
        paymentMethod,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        setDiscount,
        setPaymentMethod: setPaymentMethodState,
        subtotal,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
