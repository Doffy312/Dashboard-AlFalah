import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const QurbanForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    animalType: 'Sapi',
    participantName: '',
    status: 'Lunas',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        year: initialData.year,
        animalType: initialData.animalType,
        participantName: initialData.participantName,
        status: initialData.status,
        notes: initialData.notes || ''
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        year: new Date().getFullYear(),
        animalType: 'Sapi',
        participantName: '',
        status: 'Lunas',
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, year: parseInt(formData.year, 10) });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Peserta Qurban" : "Tambah Peserta Qurban"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-md">
        
        <div className="flex flex-col sm:flex-row gap-md">
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Tahun Hijriah/Masehi</label>
            <input 
              type="number" required
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
              value={formData.year}
              onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, year: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Jenis Hewan</label>
            <select 
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md appearance-none cursor-pointer"
              value={formData.animalType}
              onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, animalType: e.target.value})}
            >
              <option value="Sapi">Sapi</option>
              <option value="Kambing">Kambing</option>
              <option value="Domba">Domba</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Nama Pekurban (Mudhohi)</label>
          <input 
            type="text" required
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
            placeholder="Contoh: Keluarga Bapak Budi"
            value={formData.participantName}
            onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, participantName: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Status Pembayaran</label>
          <select 
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md appearance-none cursor-pointer"
            value={formData.status}
            onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, status: e.target.value})}
          >
            <option value="Lunas">Lunas</option>
            <option value="Belum Lunas">Belum Lunas</option>
          </select>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Catatan (Opsional)</label>
          <textarea 
            rows="2"
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md resize-none"
            placeholder="Catatan permintaan bagian daging, dsb..."
            value={formData.notes}
            onChange={(e) => // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({...formData, notes: e.target.value})}
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

export default QurbanForm;
