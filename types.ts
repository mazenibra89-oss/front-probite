export enum OrderStatus {
  PENDING = 'Menunggu Pembayaran',
  COMPLETED = 'Selesai',
  CANCELLED = 'Dibatalkan'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  hpp: number;
  margin: number;
  price: number;
  stock: number;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  profit: number;
}

export interface Transaction {
  id: string;
  queueNumber: string;
  items: TransactionItem[];
  total: number;
  totalProfit: number;
  status: OrderStatus;
  createdAt: string;
  city: string; // kota pengiriman
}

export interface User {
  id: string;
  username: string;
  role: 'Owner' | 'Kasir';
}
