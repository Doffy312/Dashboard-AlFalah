import React, { useState } from 'react';

const TabCustomData = ({ setHasUnsavedChanges }) => {
  const [jemaahStatus, setJemaahStatus] = useState(['Tetap', 'Mustahik', 'Muzakki', 'Pindahan']);
  const [prokerStatus, setProkerStatus] = useState(['Direncanakan', 'Berjalan', 'Selesai', 'Dibatalkan']);
  const [newJemaah, setNewJemaah] = useState('');
  const [newProker, setNewProker] = useState('');

  const handleAddJemaah = (e) => {
    e.preventDefault();
    if (!newJemaah.trim() || jemaahStatus.includes(newJemaah.trim())) return;
    setJemaahStatus([...jemaahStatus, newJemaah.trim()]);
    setNewJemaah('');
    setHasUnsavedChanges(true);
  };

  const handleDeleteJemaah = (status) => {
    setJemaahStatus(jemaahStatus.filter(s => s !== status));
    setHasUnsavedChanges(true);
  };

  const handleAddProker = (e) => {
    e.preventDefault();
    if (!newProker.trim() || prokerStatus.includes(newProker.trim())) return;
    setProkerStatus([...prokerStatus, newProker.trim()]);
    setNewProker('');
    setHasUnsavedChanges(true);
  };

  const handleDeleteProker = (status) => {
    setProkerStatus(prokerStatus.filter(s => s !== status));
    setHasUnsavedChanges(true);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div className="border-b border-outline-variant pb-4 mb-2">
        <h3 className="text-title-md font-bold text-white m-0">Parameter Jemaah & Proker</h3>
        <p className="text-body-sm text-on-surface-variant m-0 mt-1">
          Sesuaikan status dan label (badge) untuk data jemaah dan program kerja.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Jemaah Status */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">group</span>
            Status Jemaah
          </h4>
          <div className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant flex flex-col gap-4">
            <p className="text-xs text-on-surface-variant">
              Label status ini akan muncul sebagai opsi saat menambah atau mengubah data jemaah.
            </p>
            
            <form onSubmit={handleAddJemaah} className="flex gap-2">
              <input 
                type="text" 
                value={newJemaah}
                onChange={e => setNewJemaah(e.target.value)}
                className="glass-input flex-1 px-3 py-2 rounded-lg text-white font-body-sm"
                placeholder="Misal: Simpatisan..."
              />
              <button type="submit" className="bg-surface-variant hover:bg-surface-variant/80 border border-outline-variant text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-2 mt-2">
              {jemaahStatus.map(status => (
                <div key={status} className="bg-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-primary/30 group">
                  {status}
                  <button 
                    onClick={() => handleDeleteJemaah(status)}
                    className="hover:text-white transition-colors flex items-center opacity-70 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Proker Status */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">view_kanban</span>
            Status Program Kerja
          </h4>
          <div className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant flex flex-col gap-4">
            <p className="text-xs text-on-surface-variant">
              Label status ini akan muncul sebagai opsi saat melacak progres program kerja (Proker).
            </p>
            
            <form onSubmit={handleAddProker} className="flex gap-2">
              <input 
                type="text" 
                value={newProker}
                onChange={e => setNewProker(e.target.value)}
                className="glass-input flex-1 px-3 py-2 rounded-lg text-white font-body-sm"
                placeholder="Misal: Ditunda..."
              />
              <button type="submit" className="bg-surface-variant hover:bg-surface-variant/80 border border-outline-variant text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-2 mt-2">
              {prokerStatus.map(status => (
                <div key={status} className="bg-[#d97706]/20 text-[#d97706] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-[#d97706]/30 group">
                  {status}
                  <button 
                    onClick={() => handleDeleteProker(status)}
                    className="hover:text-white transition-colors flex items-center opacity-70 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabCustomData;
