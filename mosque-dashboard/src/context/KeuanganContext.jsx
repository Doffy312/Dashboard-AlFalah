import React, { createContext, useState, useContext, useMemo } from 'react';
import { mockTransactions } from '../data/mockTransactions';

const KeuanganContext = createContext();

export const useKeuangan = () => useContext(KeuanganContext);

export const KeuanganProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(mockTransactions);

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: `TRX-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      amount: Number(transaction.amount)
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const updateTransaction = (id, updatedData) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, ...updatedData, amount: Number(updatedData.amount) } : t
    ));
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Calculate summaries
  const summaries = useMemo(() => {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let pemasukanBulanIni = 0;
    let pengeluaranBulanIni = 0;

    transactions.forEach(t => {
      const isCurrentMonth = new Date(t.date).getMonth() === currentMonth && 
                             new Date(t.date).getFullYear() === currentYear;

      if (t.type === 'Pemasukan') {
        totalPemasukan += t.amount;
        if (isCurrentMonth) pemasukanBulanIni += t.amount;
      } else {
        totalPengeluaran += t.amount;
        if (isCurrentMonth) pengeluaranBulanIni += t.amount;
      }
    });

    return {
      saldoAwal: 100000000, // Fixed initial balance for demo
      saldoSaatIni: 100000000 + totalPemasukan - totalPengeluaran,
      totalPemasukan,
      totalPengeluaran,
      pemasukanBulanIni,
      pengeluaranBulanIni
    };
  }, [transactions]);

  const value = {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    summaries
  };

  return (
    <KeuanganContext.Provider value={value}>
      {children}
    </KeuanganContext.Provider>
  );
};
