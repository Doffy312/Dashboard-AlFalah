import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const ZiswafForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Zakat Fitrah',
    donorName: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        date: initialData.date,
        type: initialData.type,
        donorName: initialData.donorName,
        amount: initialData.amount,
        description: initialData.description || ''
      });
    } else {
       
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'Zakat Fitrah',
        donorName: '',
        amount: '',
        description: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, amount: parseFloat(formData.amount) });
    onClose();
  };

  const types = ['Zakat Fitrah', 'Zakat Mal', 'Infaq', 'Sedekah', 'Wakaf'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit ZISWAF" : "Tambah ZISWAF"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-md">
        
        <div className="flex flex-col sm:flex-row gap-md">
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Tanggal</label>
            <input 
              type="date" required
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
              value={formData.date}
              onChange={(e) =>  
    setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Jenis</label>
            <select 
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md appearance-none cursor-pointer"
              value={formData.type}
              onChange={(e) =>  
    setFormData({...formData, type: e.target.value})}
            >
              {types.map(t => <option key={t} value={t} className="bg-surface">{t}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Nama Muzakki/Donatur</label>
          <input 
            type="text" required
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
            placeholder="Contoh: Hamba Allah"
            value={formData.donorName}
            onChange={(e) =>  
    setFormData({...formData, donorName: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Nominal (Rp)</label>
          <input 
            type="number" required min="0" step="1"
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
            placeholder="0"
            value={formData.amount}
            onChange={(e) =>  
    setFormData({...formData, amount: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Keterangan (Opsional)</label>
          <textarea 
            rows="2"
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md resize-none"
            placeholder="Catatan tambahan..."
            value={formData.description}
            onChange={(e) =>  
    setFormData({...formData, description: e.target.value})}
          ></textarea>
        </div>

        <div className="flex gap-sm mt-md">
          <button type="button" onClick={onClose} className="flex-1 py-[12px] rounded-xl border border-outline bg-surface-variant hover:bg-surface text-on-surface font-label-md transition-colors">Batal</button>
          <button type="submit" className="flex-1 py-[12px] rounded-xl font-label-md text-white transition-all shadow-md active:scale-95 bg-primary hover:bg-primary/90 shadow-primary/20">Simpan Data</button>
        </div>
      </form>
    </Modal>
  );
};

export default ZiswafForm;
