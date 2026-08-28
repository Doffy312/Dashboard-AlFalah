import { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import { useSettings } from '../../contexts/SettingsContext';

const ProgramForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { customData } = useSettings();

  const statusOptions = useMemo(() => {
    const configured = customData?.prokerStatus || [];
    const fallback = ['Direncanakan', 'Sedang Berjalan', 'Selesai', 'Dibatalkan'];
    // Use configured statuses as primary source; fallback only if nothing is configured
    const list = configured.length > 0 ? [...configured] : [...fallback];
    // Ensure the current program's status is always selectable even if not in the list
    if (initialData?.status && !list.includes(initialData.status)) {
      list.push(initialData.status);
    }
    return list;
  }, [customData?.prokerStatus, initialData?.status]);

  const defaultStatus = statusOptions[0] || 'Direncanakan';

  const [formData, setFormData] = useState({
    name: '',
    pic: '',
    budget: '',
    date: new Date().toISOString().split('T')[0],
    originalDate: null,
    status: defaultStatus,
    description: '',
    evaluation: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        pic: initialData.pic || '',
        budget: initialData.budget || '',
        date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
        originalDate: initialData.originalDate ? initialData.originalDate.split('T')[0] : null,
        status: initialData.status || defaultStatus,
        description: initialData.description || '',
        evaluation: initialData.evaluation || ''
      });
    } else {
      setFormData({
        name: '',
        pic: '',
        budget: '',
        date: new Date().toISOString().split('T')[0],
        originalDate: null,
        status: defaultStatus,
        description: '',
        evaluation: ''
      });
    }
  }, [initialData, isOpen, defaultStatus]);

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
            onChange={(e) =>  
    setFormData({...formData, name: e.target.value})}
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
              onChange={(e) =>  
    setFormData({...formData, pic: e.target.value})}
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
              onChange={(e) =>  
    setFormData({...formData, budget: e.target.value})}
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
            {initialData && (initialData.originalDate || initialData.date) && (
              (() => {
                const origDate = (initialData.originalDate || initialData.date).split('T')[0];
                if (formData.date && formData.date !== origDate) {
                  return (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[13px]">history</span>
                      Status perencanaan: &quot;Diubah&quot; (Jadwal awal: {new Date(origDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})
                    </p>
                  );
                }
                return null;
              })()
            )}
          </div>
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Status</label>
            <select 
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md appearance-none cursor-pointer pr-10"
              value={formData.status}
              onChange={(e) =>  
    setFormData({...formData, status: e.target.value})}
            >
              {statusOptions.map((st) => (
                <option key={st} value={st} className="bg-surface dark:bg-surface-variant">
                  {st}
                </option>
              ))}
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
            onChange={(e) =>  
    setFormData({...formData, description: e.target.value})}
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
              onChange={(e) =>  
    setFormData({...formData, evaluation: e.target.value})}
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
