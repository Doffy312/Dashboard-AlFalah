import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const TransactionForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Pemasukan',
    category: 'Infaq',
    amount: '',
    description: '',
    programId: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'Pemasukan',
        category: 'Infaq',
        amount: '',
        description: '',
        programId: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const categories = {
    Pemasukan: ['Infaq', 'Zakat', 'Wakaf', 'Donasi Khusus', 'Lainnya'],
    Pengeluaran: ['Operasional', 'Pembangunan', 'Sosial', 'Kegiatan', 'Lainnya']
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "Edit Transaksi" : "Tambah Transaksi Baru"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-md">
        
        {/* Type Toggle */}
        <div className="flex bg-white/10 dark:bg-black/20 p-1 rounded-xl">
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg font-label-md transition-all ${formData.type === 'Pemasukan' ? 'bg-emerald-500 text-white shadow-md' : 'text-on-surface-variant hover:bg-white/10'}`}
            onClick={() => setFormData({...formData, type: 'Pemasukan', category: 'Infaq'})}
          >
            Pemasukan
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg font-label-md transition-all ${formData.type === 'Pengeluaran' ? 'bg-rose-500 text-white shadow-md' : 'text-on-surface-variant hover:bg-white/10'}`}
            onClick={() => setFormData({...formData, type: 'Pengeluaran', category: 'Operasional'})}
          >
            Pengeluaran
          </button>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Tanggal</label>
          <input 
            type="date" 
            required
            className="w-full px-md py-sm bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-xl outline-none focus:border-primary text-on-surface dark:text-white font-body-md"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Nominal (Rp)</label>
          <input 
            type="number" 
            required
            min="0"
            className="w-full px-md py-sm bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-xl outline-none focus:border-primary text-on-surface dark:text-white font-body-md"
            placeholder="Contoh: 500000"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Kategori</label>
          <select 
            className="w-full px-md py-sm bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-xl outline-none focus:border-primary text-on-surface dark:text-white font-body-md appearance-none"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            {categories[formData.type].map(cat => (
              <option key={cat} value={cat} className="bg-surface dark:bg-on-surface">{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Deskripsi</label>
          <textarea 
            required
            rows="3"
            className="w-full px-md py-sm bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-xl outline-none focus:border-primary text-on-surface dark:text-white font-body-md resize-none"
            placeholder="Deskripsi transaksi..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          ></textarea>
        </div>

        <div className="flex gap-sm mt-md">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-[12px] rounded-xl border border-white/20 dark:border-white/10 bg-white/10 hover:bg-white/20 text-on-surface dark:text-white font-label-md transition-colors"
          >
            Batal
          </button>
          <button 
            type="submit" 
            className="flex-1 py-[12px] rounded-xl font-label-md text-white transition-all shadow-md active:scale-95 bg-primary hover:bg-primary/90"
          >
            Simpan
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default TransactionForm;
