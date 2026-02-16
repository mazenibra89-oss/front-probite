import React, { useState, useEffect } from 'react';
import { Calendar, Printer, Search } from 'lucide-react';

const API_URL = 'https://api-probite.exium.my.id';

const AdminReports: React.FC = () => {
  // Ambil transaksi dan fungsi setTransactions dari Zustand
  const [transactions, setTransactions] = useState([]); // Ganti ke state lokal agar tidak tergantung Zustand
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [range, setRange] = useState<'date' | '7days' | '30days'>('date');

  // Efek untuk memastikan data terbaru dari server
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/sales/history`);
        const data = await response.json();
        setTransactions(data);
        console.log("History dimuat:", data);
      } catch (err) {
        console.error("Gagal load history:", err);
      }
    };
    fetchHistory();
  }, []);
  // ...existing code...
};

export default AdminReports;