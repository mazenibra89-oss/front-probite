import { useState, useEffect } from 'react';
import { Product, Transaction, OrderStatus, CartItem } from './types';
import { INITIAL_PRODUCTS } from './constants';

// Persistence Keys
const PRODUCTS_KEY = 'probite_products';
const TRANSACTIONS_KEY = 'probite_transactions';

export const useProbiteStore = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(TRANSACTIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addProduct = (p: Omit<Product, 'id'>) => {
    const newProduct = { ...p, id: Math.random().toString(36).substr(2, 9) };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const processCheckout = (cart: CartItem[], city: string) => {
    const queueNum = `PBT-${(transactions.length + 1).toString().padStart(3, '0')}`;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalProfit = cart.reduce((sum, item) => sum + ((item.price - item.hpp) * item.quantity), 0);

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      queueNumber: queueNum,
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        profit: (item.price - item.hpp) * item.quantity
      })),
      total,
      totalProfit,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      city // simpan kota
    };

    // Update Stocks
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(ci => ci.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    }));

    setTransactions([...transactions, newTransaction]);
    return newTransaction;
  };

  const updateTransactionStatus = (id: string, status: OrderStatus) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  return {
    products,
    transactions,
    addProduct,
    updateProduct,
    deleteProduct,
    processCheckout,
    updateTransactionStatus
  };
};
