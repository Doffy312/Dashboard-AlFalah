import React, { createContext, useState, useContext, useMemo } from 'react';
import { mockInventaris } from '../data/mockInventaris';

const InventarisContext = createContext();

export const useInventaris = () => useContext(InventarisContext);

export const InventarisProvider = ({ children }) => {
  const [inventaris, setInventaris] = useState(mockInventaris);

  const addInventaris = (data) => {
    const newItem = {
      ...data,
      id: `INV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      quantity: Number(data.quantity)
    };
    setInventaris([newItem, ...inventaris]);
  };

  const updateInventaris = (id, updatedData) => {
    setInventaris(inventaris.map(item => 
      item.id === id ? { ...item, ...updatedData, quantity: Number(updatedData.quantity || item.quantity) } : item
    ));
  };

  const deleteInventaris = (id) => {
    setInventaris(inventaris.filter(item => item.id !== id));
  };

  const summaries = useMemo(() => {
    const counts = {
      total: inventaris.length,
      'Baik': 0,
      'Rusak Ringan': 0,
      'Rusak Berat': 0
    };

    inventaris.forEach(item => {
      if (counts[item.condition] !== undefined) {
        counts[item.condition]++;
      }
    });

    return counts;
  }, [inventaris]);

  const value = {
    inventaris,
    addInventaris,
    updateInventaris,
    deleteInventaris,
    summaries
  };

  return (
    <InventarisContext.Provider value={value}>
      {children}
    </InventarisContext.Provider>
  );
};
