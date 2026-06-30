import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const ProgramForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    pic: '',
    budget: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Direncanakan',
    description: '',
    evaluation: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        pic: '',
        budget: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Direncanakan',
        description: '',
        evaluation: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "Edit Program Kerja" : "Tambah Program Baru"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-md">
        
        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Nama Program</label>
          <input 
            type="text" 
            required
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
            placeholder="Contoh: Kajian Rutin Mingguan"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-md">
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Penanggung Jawab (PIC)</label>
            <input 
              type="text" 
              required
                className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
              placeholder="Contoh: Bpk. Ahmad"
              value={formData.pic}
              onChange={(e) => setFormData({...formData, pic: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Estimasi Anggaran (Rp)</label>
            <input 
              type="number" 
              required
              min="0"
                className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
              placeholder="Contoh: 1500000"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-md">
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Tanggal Pelaksanaan</label>
            <input 
              type="date" 
              required
                className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Status</label>
            <select 
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md appearance-none cursor-pointer"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="Direncanakan" className="bg-surface dark:bg-on-surface">Direncanakan</option>
              <option value="Sedang Berjalan" className="bg-surface dark:bg-on-surface">Sedang Berjalan</option>
              <option value="Selesai" className="bg-surface dark:bg-on-surface">Selesai</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Deskripsi Program</label>
          <textarea 
            required
            rows="3"
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md resize-none"
            placeholder="Jelaskan tujuan dan detail program..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          ></textarea>
        </div>

        {formData.status === 'Selesai' && (
          <div className="flex flex-col gap-xs p-md bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-xs">
            <label className="font-label-md text-emerald-700 dark:text-emerald-400">Evaluasi Program (Opsional)</label>
            <textarea 
              rows="2"
              className="w-full px-md py-sm bg-surface-variant border border-emerald-500/30 rounded-xl outline-none focus:border-emerald-500 text-on-surface font-body-md resize-none"
              placeholder="Catatan hasil pelaksanaan, kendala, dll..."
              value={formData.evaluation}
              onChange={(e) => setFormData({...formData, evaluation: e.target.value})}
            ></textarea>
          </div>
        )}

        <div className="flex gap-sm mt-md">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-[12px] rounded-xl border border-outline bg-surface-variant hover:bg-surface text-on-surface font-label-md transition-colors"
          >
            Batal
          </button>
          <button 
            type="submit" 
            className="flex-1 py-[12px] rounded-xl font-label-md text-white transition-all shadow-md active:scale-95 bg-primary hover:bg-primary/90 shadow-primary/20"
          >
            Simpan Program
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default ProgramForm;
