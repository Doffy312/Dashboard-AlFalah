import React, { createContext, useState, useContext, useMemo } from 'react';
import { mockJemaah } from '../data/mockJemaah';

const JemaahContext = createContext();

export const useJemaah = () => useContext(JemaahContext);

export const JemaahProvider = ({ children }) => {
  const [jemaah, setJemaah] = useState(mockJemaah);

  const addJemaah = (data) => {
    const newJemaah = {
      ...data,
      id: `JM-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    };
    setJemaah([newJemaah, ...jemaah]);
  };

  const updateJemaah = (id, updatedData) => {
    setJemaah(jemaah.map(j => 
      j.id === id ? { ...j, ...updatedData } : j
    ));
  };

  const deleteJemaah = (id) => {
    setJemaah(jemaah.filter(j => j.id !== id));
  };

  const summaries = useMemo(() => {
    const counts = {
      total: jemaah.length,
      Muzakki: 0,
      Mustahik: 0,
      Umum: 0,
      Lansia: 0,
      Yatim: 0
    };

    jemaah.forEach(j => {
      if (counts[j.category] !== undefined) {
        counts[j.category]++;
      }
    });

    return counts;
  }, [jemaah]);

  const value = {
    jemaah,
    addJemaah,
    updateJemaah,
    deleteJemaah,
    summaries
  };

  return (
    <JemaahContext.Provider value={value}>
      {children}
    </JemaahContext.Provider>
  );
};
