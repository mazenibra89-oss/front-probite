
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Probite Special Burger',
    category: 'Makanan',
    hpp: 15000,
    margin: 40,
    price: 21000,
    stock: 50,
    image: 'https://picsum.photos/seed/burger/400/400'
  },
  {
    id: '2',
    name: 'Crunchy Chicken Wings',
    category: 'Makanan',
    hpp: 12000,
    margin: 50,
    price: 18000,
    stock: 30,
    image: 'https://picsum.photos/seed/wings/400/400'
  },
  {
    id: '3',
    name: 'Iced Matcha Latte',
    category: 'Minuman',
    hpp: 8000,
    margin: 100,
    price: 16000,
    stock: 100,
    image: 'https://picsum.photos/seed/matcha/400/400'
  },
  {
    id: '4',
    name: 'Cold Brew Coffee',
    category: 'Minuman',
    hpp: 10000,
    margin: 80,
    price: 18000,
    stock: 25,
    image: 'https://picsum.photos/seed/coffee/400/400'
  }
];

export const CATEGORIES = ['Semua', 'Makanan', 'Minuman', 'Cemilan'];

export const THEME = {
  cream: '#F5E6D3',
  red: '#C0392B',
  green: '#27AE60',
  white: '#FFFFFF',
  dark: '#2D3436'
};
