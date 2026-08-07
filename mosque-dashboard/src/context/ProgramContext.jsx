import React, { createContext, useState, useContext, useMemo } from 'react';
import { mockPrograms } from '../data/mockPrograms';

const ProgramContext = createContext();

export const useProgram = () => useContext(ProgramContext);

export const ProgramProvider = ({ children }) => {
  const [programs, setPrograms] = useState(mockPrograms);

  const addProgram = (program) => {
    const newProgram = {
      ...program,
      id: `PRG-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      budget: Number(program.budget)
    };
    setPrograms([newProgram, ...programs]);
  };

  const updateProgram = (id, updatedData) => {
    setPrograms(programs.map(p => 
      p.id === id ? { ...p, ...updatedData, budget: Number(updatedData.budget || p.budget) } : p
    ));
  };

  const deleteProgram = (id) => {
    setPrograms(programs.filter(p => p.id !== id));
  };

  const updateProgramStatus = (id, status) => {
    setPrograms(programs.map(p => p.id === id ? { ...p, status } : p));
  };

  const summaries = useMemo(() => {
    let total = programs.length;
    let direncanakan = 0;
    let berjalan = 0;
    let selesai = 0;

    programs.forEach(p => {
      if (p.status === 'Direncanakan') direncanakan++;
      else if (p.status === 'Sedang Berjalan') berjalan++;
      else if (p.status === 'Selesai') selesai++;
    });

    return { total, direncanakan, berjalan, selesai };
  }, [programs]);

  const value = {
    programs,
    addProgram,
    updateProgram,
    deleteProgram,
    updateProgramStatus,
    summaries
  };

  return (
    <ProgramContext.Provider value={value}>
      {children}
    </ProgramContext.Provider>
  );
};
