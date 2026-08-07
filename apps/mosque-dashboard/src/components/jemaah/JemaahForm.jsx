import { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import { useSettings } from '../../contexts/SettingsContext';

const JemaahForm = ({ isOpen, onClose, onSubmit, initialData, isPending = false }) => {
  const { customData } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    category: 'Umum',
    skills: '',
    notes: ''
  });

  const categories = useMemo(() => {
    const configured = customData?.jemaahStatus || [];
    const defaults = ['Muzakki', 'Mustahik', 'Fakir', 'Yatim', 'Lansia', 'Umum'];
    return Array.from(new Set([...configured, ...defaults]));
  }, [customData?.jemaahStatus]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        category: initialData.category || categories[0] || 'Umum',
        skills: initialData.skills || '',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        category: categories[0] || 'Umum',
        skills: '',
        notes: ''
      });
    }
  }, [initialData, isOpen, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "Edit Data Jemaah" : "Tambah Data Jemaah"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-md">
        
        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Nama Lengkap</label>
          <input 
            type="text" 
            required
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
            placeholder="Contoh: Budi Santoso"
            value={formData.name}
            onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-md">
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Email (Opsional)</label>
            <input 
              type="email" 
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
              placeholder="Contoh: budi@email.com"
              value={formData.email}
              onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-md">
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Nomor HP/WA</label>
            <input 
              type="tel" 
              required
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
              placeholder="Contoh: 0812xxxx"
              value={formData.phone}
              onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Kategori Jemaah</label>
            <select 
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md appearance-none cursor-pointer pr-10"
              value={formData.category}
              onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, category: e.target.value})}
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-surface dark:bg-surface-variant">{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Alamat Lengkap</label>
          <textarea 
            required
            rows="2"
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md resize-none"
            placeholder="Alamat rumah..."
            value={formData.address}
            onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, address: e.target.value})}
          ></textarea>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Keahlian Khusus (Opsional)</label>
          <input 
            type="text" 
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
            placeholder="Misal: Teknisi AC, Dokter, Pengajar"
            value={formData.skills}
            onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, skills: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Catatan Tambahan</label>
          <input 
            type="text" 
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
            placeholder="Misal: Butuh santunan rutin"
            value={formData.notes}
            onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <div className="flex gap-sm mt-md">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-[12px] rounded-xl border border-outline bg-surface-variant hover:bg-surface text-on-surface font-label-md transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button 
            type="submit" 
            disabled={isPending}
            className="flex-1 py-[12px] rounded-xl font-label-md text-white transition-all shadow-md active:scale-95 bg-primary hover:bg-primary/90 shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Data'}
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default JemaahForm;
