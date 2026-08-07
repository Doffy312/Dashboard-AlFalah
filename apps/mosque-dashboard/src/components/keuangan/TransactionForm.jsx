import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const TransactionForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const defaultCategories = {
    Pemasukan: ['Infaq', 'Zakat', 'Wakaf', 'Donasi Khusus'],
    Pengeluaran: ['Operasional', 'Pembangunan', 'Sosial', 'Kegiatan']
  };

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Pemasukan',
    category: 'Infaq',
    amount: '',
    description: '',
    programId: ''
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  useEffect(() => {
    if (initialData) {
      const isCustom = !defaultCategories[initialData.type]?.includes(initialData.category) && initialData.category !== 'Program Kerja';
      setFormData({
        date: initialData.date,
        type: initialData.type,
        category: isCustom ? 'CUSTOM' : initialData.category,
        amount: initialData.amount,
        description: initialData.description,
        programId: initialData.programId || ''
      });
      setIsCustomCategory(isCustom);
      setCustomCategoryInput(isCustom ? initialData.category : '');
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'Pemasukan',
        category: 'Infaq',
        amount: '',
        description: '',
        programId: ''
      });
      setIsCustomCategory(false);
      setCustomCategoryInput('');
    }
  }, [initialData, isOpen]);

  const handleTypeChange = (newType) => {
    const defaultCat = defaultCategories[newType][0];
    setFormData({ ...formData, type: newType, category: defaultCat });
    setIsCustomCategory(false);
    setCustomCategoryInput('');
  };

  const handleCategoryChange = (val) => {
    if (val === 'CUSTOM') {
      setIsCustomCategory(true);
      setFormData({ ...formData, category: 'CUSTOM' });
    } else {
      setIsCustomCategory(false);
      setFormData({ ...formData, category: val });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let finalCategory = formData.category;
    if (isCustomCategory || formData.category === 'CUSTOM') {
      finalCategory = customCategoryInput.trim();
      if (!finalCategory) {
        alert('Silakan masukkan nama kategori kustom.');
        return;
      }
    }

    onSubmit({
      ...formData,
      category: finalCategory
    });
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "Edit Transaksi" : "Tambah Transaksi Baru"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-md">
        
        {/* Type Toggle */}
        <div className="flex bg-surface-variant p-1 rounded-xl">
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg font-label-md transition-all ${formData.type === 'Pemasukan' ? 'bg-emerald-500 text-white shadow-md' : 'text-on-surface-variant hover:bg-white/10'}`}
            onClick={() => handleTypeChange('Pemasukan')}
          >
            Pemasukan
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg font-label-md transition-all ${formData.type === 'Pengeluaran' ? 'bg-rose-500 text-white shadow-md' : 'text-on-surface-variant hover:bg-white/10'}`}
            onClick={() => handleTypeChange('Pengeluaran')}
          >
            Pengeluaran
          </button>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Tanggal</label>
          <input 
            type="date" 
            required
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
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
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
            placeholder="Contoh: 500000"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Kategori</label>
          <select 
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md appearance-none pr-10"
            value={isCustomCategory ? 'CUSTOM' : formData.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={formData.category === 'Program Kerja'}
          >
            {formData.category === 'Program Kerja' ? (
              <option value="Program Kerja">Program Kerja</option>
            ) : (
              <>
                {(defaultCategories[formData.type] || []).map(cat => (
                  <option key={cat} value={cat} className="bg-surface dark:bg-surface-variant">{cat}</option>
                ))}
                <option value="CUSTOM" className="bg-surface dark:bg-surface-variant font-semibold text-primary">
                  + Tambah Kategori Baru...
                </option>
              </>
            )}
          </select>
        </div>

        {isCustomCategory && formData.category !== 'Program Kerja' && (
          <div className="flex flex-col gap-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <label className="font-label-md text-primary dark:text-primary">Nama Kategori Baru</label>
            <input 
              type="text" 
              required
              className="w-full px-md py-sm bg-surface border border-primary rounded-xl outline-none text-on-surface font-body-md"
              placeholder="Contoh: Sedekah Subuh / Renovasi"
              value={customCategoryInput}
              onChange={(e) => setCustomCategoryInput(e.target.value)}
            />
          </div>
        )}

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Deskripsi</label>
          <textarea 
            required
            rows="3"
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md resize-none"
            placeholder="Deskripsi transaksi..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          ></textarea>
        </div>

        {initialData?.category === 'Program Kerja' && (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-500 dark:text-indigo-300">
            ℹ️ Transaksi ini dibuat secara otomatis dari <strong>Program Kerja Selesai</strong>. Perubahan nama atau anggaran dapat dilakukan melalui modul Program Kerja.
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
            disabled={initialData?.category === 'Program Kerja'}
            className={`flex-1 py-[12px] rounded-xl font-label-md text-white transition-all shadow-md active:scale-95 ${
              initialData?.category === 'Program Kerja' 
                ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            Simpan
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default TransactionForm;
