import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const InventarisForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    location: 'Ruang Utama',
    condition: 'Baik',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        quantity: initialData.quantity,
        date: initialData.date,
        location: initialData.location,
        condition: initialData.condition,
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        name: '',
        quantity: '',
        date: new Date().toISOString().split('T')[0],
        location: 'Ruang Utama',
        condition: 'Baik',
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const conditions = ['Baik', 'Rusak Ringan', 'Rusak Berat'];
  const locations = ['Ruang Utama', 'Selaser', 'Tempat Wudu', 'Gudang', 'Halaman', 'Lainnya'];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "Edit Data Inventaris" : "Tambah Inventaris Baru"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-md">
        
        <div className="flex flex-col sm:flex-row gap-md">
          <div className="flex flex-col gap-xs flex-[2]">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Nama Barang</label>
            <input 
              type="text" 
              required
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
              placeholder="Contoh: AC Daikin 2PK"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Jumlah</label>
            <input 
              type="number" 
              required
              min="1"
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
              placeholder="0"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-md">
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Tanggal Perolehan</label>
            <input 
              type="date" 
              required
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Lokasi</label>
            <select 
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md appearance-none cursor-pointer"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            >
              {locations.map(loc => (
                <option key={loc} value={loc} className="bg-surface dark:bg-on-surface">{loc}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Kondisi</label>
          <div className="flex gap-2">
            {conditions.map(cond => (
              <label key={cond} className={`flex-1 flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all font-label-md text-[13px] ${formData.condition === cond ? 'border-primary bg-primary/10 text-primary dark:text-primary-fixed' : 'border-outline text-on-surface-variant hover:bg-surface-variant'}`}>
                <input 
                  type="radio" 
                  name="condition" 
                  value={cond} 
                  checked={formData.condition === cond}
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                  className="hidden"
                />
                {cond}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Catatan</label>
          <textarea 
            rows="2"
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md resize-none"
            placeholder="Merk, asal barang, rincian kerusakan..."
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          ></textarea>
        </div>

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
            Simpan Data
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default InventarisForm;
