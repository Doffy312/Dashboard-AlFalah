import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const JadwalForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    role: 'Khotib Jumat',
    personName: '',
    contact: '',
    topic: ''
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        date: initialData.date,
        role: initialData.role,
        personName: initialData.personName,
        contact: initialData.contact || '',
        topic: initialData.topic || ''
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        date: new Date().toISOString().split('T')[0],
        role: 'Khotib Jumat',
        personName: '',
        contact: '',
        topic: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const roles = ['Khotib Jumat', 'Imam Rawatib', 'Muadzin', 'Penceramah Kajian'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Jadwal Petugas" : "Tambah Jadwal Petugas"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-md">
        
        <div className="flex flex-col sm:flex-row gap-md">
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Tanggal</label>
            <input 
              type="date" required
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
              value={formData.date}
              onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Peran / Tugas</label>
            <select 
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md appearance-none cursor-pointer"
              value={formData.role}
              onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, role: e.target.value})}
            >
              {roles.map(r => <option key={r} value={r} className="bg-surface">{r}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Nama Petugas</label>
          <input 
            type="text" required
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
            placeholder="Ust. Fulan..."
            value={formData.personName}
            onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, personName: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Kontak / No. HP (Opsional)</label>
          <input 
            type="text"
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
            placeholder="0812..."
            value={formData.contact}
            onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, contact: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Topik / Tema (Opsional)</label>
          <textarea 
            rows="2"
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md resize-none"
            placeholder="Tema kajian/khutbah..."
            value={formData.topic}
            onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, topic: e.target.value})}
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

export default JadwalForm;
