import { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const DEFAULT_SIGNATURES = {
  bendaharaName: 'Ahmad Dahlan',
  bendaharaTitle: 'Bendahara DKM',
  bendaharaSignature: '',
  ketuaName: 'H. Abdullah',
  ketuaTitle: 'Ketua DKM',
  ketuaSignature: '',
};

const TabFinance = ({ setHasUnsavedChanges, tabDataRef }) => {
  const { finance } = useSettings();

  const [categories, setCategories] = useState([...finance.categories]);
  const [newCat, setNewCat] = useState({ name: '', type: 'income' });
  const [bankInfo, setBankInfo] = useState({ ...finance.bankInfo });
  const [signatures, setSignatures] = useState({ ...DEFAULT_SIGNATURES, ...(finance.signatures || {}) });

  // Sync from context when it changes (e.g. cancel/reset)
  useEffect(() => {
    setCategories([...finance.categories]);
    setBankInfo({ ...finance.bankInfo });
    setSignatures({ ...DEFAULT_SIGNATURES, ...(finance.signatures || {}) });
  }, [finance]);

  // Expose current data to parent via ref
  useEffect(() => {
    if (tabDataRef) {
      tabDataRef.current = () => ({ categories, bankInfo, signatures });
    }
  }, [categories, bankInfo, signatures, tabDataRef]);

  const handleSignatureTextChange = (field, value) => {
    setSignatures(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSignatureUpload = (field, file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file tanda tangan terlalu besar. Maksimal 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setSignatures(prev => ({ ...prev, [field]: reader.result }));
      setHasUnsavedChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = (field) => {
    setSignatures(prev => ({ ...prev, [field]: '' }));
    setHasUnsavedChanges(true);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    setCategories([...categories, { id: Date.now(), ...newCat }]);
    setNewCat({ name: '', type: 'income' });
    setHasUnsavedChanges(true);
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm('Hapus kategori ini?')) {
      setCategories(categories.filter(c => c.id !== id));
      setHasUnsavedChanges(true);
    }
  };

  const handleBankChange = (e) => {
    setBankInfo({ ...bankInfo, [e.target.name]: e.target.value });
    setHasUnsavedChanges(true);
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div className="border-b border-outline-variant pb-4 mb-2">
        <h3 className="text-title-md font-bold text-on-surface m-0">Konfigurasi Keuangan</h3>
        <p className="text-body-sm text-on-surface-variant m-0 mt-1">
          Atur kategori transaksi dan informasi rekening bank.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kategori Transaksi */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">category</span>
            Kategori Transaksi
          </h4>
          
          <form onSubmit={handleAddCategory} className="flex flex-wrap gap-2">
            <input 
              type="text" 
              value={newCat.name}
              onChange={e => setNewCat({...newCat, name: e.target.value})}
              className="glass-input flex-1 min-w-[140px] px-3 py-2 rounded-lg text-on-surface font-body-sm"
              placeholder="Nama kategori baru..."
            />
            <select 
              value={newCat.type}
              onChange={e => setNewCat({...newCat, type: e.target.value})}
              className="glass-input shrink-0 px-3 py-2 rounded-lg text-on-surface font-body-sm appearance-none pr-10"
            >
              <option value="income" className="bg-surface text-on-surface">Pemasukan</option>
              <option value="expense" className="bg-surface text-on-surface">Pengeluaran</option>
            </select>
            <button type="submit" className="bg-primary shrink-0 hover:bg-primary/90 text-white px-3 py-2 rounded-lg transition-colors">
              Tambah
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {/* Income List */}
            <div className="bg-surface-variant/30 rounded-xl p-4 border border-outline-variant">
              <h5 className="font-label-md text-primary mb-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                Kategori Pemasukan
              </h5>
              <ul className="space-y-2 m-0 p-0 list-none">
                {incomeCategories.map(cat => (
                  <li key={cat.id} className="flex justify-between items-center bg-surface-variant/50 px-3 py-2 rounded-lg group">
                    <span className="text-sm text-on-surface">{cat.name}</span>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-on-surface-variant hover:text-error opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </li>
                ))}
                {incomeCategories.length === 0 && (
                  <li className="text-xs text-on-surface-variant italic">Belum ada kategori.</li>
                )}
              </ul>
            </div>

            {/* Expense List */}
            <div className="bg-surface-variant/30 rounded-xl p-4 border border-outline-variant">
              <h5 className="font-label-md text-error mb-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                Kategori Pengeluaran
              </h5>
              <ul className="space-y-2 m-0 p-0 list-none">
                {expenseCategories.map(cat => (
                  <li key={cat.id} className="flex justify-between items-center bg-surface-variant/50 px-3 py-2 rounded-lg group">
                    <span className="text-sm text-on-surface">{cat.name}</span>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-on-surface-variant hover:text-error opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </li>
                ))}
                {expenseCategories.length === 0 && (
                  <li className="text-xs text-on-surface-variant italic">Belum ada kategori.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Informasi Rekening */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">account_balance</span>
            Informasi Rekening Bank
          </h4>
          <div className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-on-surface">Nama Bank</label>
              <input 
                type="text" 
                name="bankName"
                value={bankInfo.bankName}
                onChange={handleBankChange}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-on-surface font-body-md"
                placeholder="Misal: Bank Syariah Indonesia (BSI)"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-on-surface">Nomor Rekening</label>
              <input 
                type="text" 
                name="accountNumber"
                value={bankInfo.accountNumber}
                onChange={handleBankChange}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-on-surface font-body-md"
                placeholder="Masukkan nomor rekening"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-on-surface">Atas Nama (Pemilik Rekening)</label>
              <input 
                type="text" 
                name="accountHolder"
                value={bankInfo.accountHolder}
                onChange={handleBankChange}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-on-surface font-body-md"
                placeholder="Misal: Masjid Al-Falah"
              />
            </div>
            <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg flex gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">info</span>
              <p className="text-xs text-primary/90 m-0">
                Informasi rekening ini akan ditampilkan pada halaman Landing Page dan laporan donasi/infak untuk memudahkan jemaah berdonasi secara transfer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tanda Tangan & Otorisasi Kuitansi */}
      <div className="flex flex-col gap-4 border-t border-outline-variant pt-6">
        <div>
          <h4 className="font-label-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">draw</span>
            Tanda Tangan & Otorisasi Kuitansi / Invoice
          </h4>
          <p className="text-body-sm text-on-surface-variant m-0 mt-1">
            Unggah tanda tangan digital dan atur nama penandatangan resmi (Bendahara & Ketua DKM) untuk kuitansi keuangan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bendahara */}
          <div className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h5 className="font-label-md text-primary font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">person</span>
                Pejabat Bendahara
              </h5>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Penandatangan Utama</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-on-surface">Nama Bendahara</label>
              <input
                type="text"
                value={signatures.bendaharaName || ''}
                onChange={(e) => handleSignatureTextChange('bendaharaName', e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-lg text-on-surface font-body-sm"
                placeholder="Contoh: Ahmad Dahlan, S.E."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-on-surface">Jabatan</label>
              <input
                type="text"
                value={signatures.bendaharaTitle || ''}
                onChange={(e) => handleSignatureTextChange('bendaharaTitle', e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-lg text-on-surface font-body-sm"
                placeholder="Bendahara DKM"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-on-surface">Tanda Tangan / Cap Digital</label>
              {signatures.bendaharaSignature ? (
                <div className="relative border border-outline rounded-lg p-3 bg-white flex flex-col items-center justify-center min-h-[110px] group">
                  <img
                    src={signatures.bendaharaSignature}
                    alt="Tanda Tangan Bendahara"
                    className="max-h-24 max-w-full object-contain filter contrast-125"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <label className="px-3 py-1 bg-white text-on-surface rounded-md text-xs font-medium cursor-pointer hover:bg-slate-100 shadow-sm">
                      Ganti
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={(e) => handleSignatureUpload('bendaharaSignature', e.target.files?.[0])}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSignature('bendaharaSignature')}
                      className="px-3 py-1 bg-rose-600 text-white rounded-md text-xs font-medium hover:bg-rose-700 shadow-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-outline-variant hover:border-primary/60 rounded-lg p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-surface-variant/20 hover:bg-surface-variant/40 transition-colors text-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-[28px]">upload_file</span>
                  <span className="text-xs font-medium text-on-surface">Klik untuk unggah tanda tangan</span>
                  <span className="text-[10px] text-on-surface-variant">Format PNG/JPG transparan (Maks. 2MB)</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={(e) => handleSignatureUpload('bendaharaSignature', e.target.files?.[0])}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Ketua DKM */}
          <div className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h5 className="font-label-md text-primary font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                Ketua DKM
              </h5>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-700 dark:text-slate-300 font-medium">Mengetahui</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-on-surface">Nama Ketua DKM</label>
              <input
                type="text"
                value={signatures.ketuaName || ''}
                onChange={(e) => handleSignatureTextChange('ketuaName', e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-lg text-on-surface font-body-sm"
                placeholder="Contoh: H. Abdullah, Lc."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-on-surface">Jabatan</label>
              <input
                type="text"
                value={signatures.ketuaTitle || ''}
                onChange={(e) => handleSignatureTextChange('ketuaTitle', e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-lg text-on-surface font-body-sm"
                placeholder="Ketua DKM"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-on-surface">Tanda Tangan / Cap Digital</label>
              {signatures.ketuaSignature ? (
                <div className="relative border border-outline rounded-lg p-3 bg-white flex flex-col items-center justify-center min-h-[110px] group">
                  <img
                    src={signatures.ketuaSignature}
                    alt="Tanda Tangan Ketua"
                    className="max-h-24 max-w-full object-contain filter contrast-125"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <label className="px-3 py-1 bg-white text-on-surface rounded-md text-xs font-medium cursor-pointer hover:bg-slate-100 shadow-sm">
                      Ganti
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={(e) => handleSignatureUpload('ketuaSignature', e.target.files?.[0])}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSignature('ketuaSignature')}
                      className="px-3 py-1 bg-rose-600 text-white rounded-md text-xs font-medium hover:bg-rose-700 shadow-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-outline-variant hover:border-primary/60 rounded-lg p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-surface-variant/20 hover:bg-surface-variant/40 transition-colors text-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-[28px]">upload_file</span>
                  <span className="text-xs font-medium text-on-surface">Klik untuk unggah tanda tangan</span>
                  <span className="text-[10px] text-on-surface-variant">Format PNG/JPG transparan (Maks. 2MB)</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={(e) => handleSignatureUpload('ketuaSignature', e.target.files?.[0])}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabFinance;
