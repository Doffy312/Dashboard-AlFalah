import { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const TabFinance = ({ setHasUnsavedChanges, tabDataRef }) => {
  const { finance } = useSettings();

  const [categories, setCategories] = useState([...finance.categories]);
  const [newCat, setNewCat] = useState({ name: '', type: 'income' });
  const [bankInfo, setBankInfo] = useState({ ...finance.bankInfo });

  // Sync from context when it changes (e.g. cancel/reset)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategories([...finance.categories]);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBankInfo({ ...finance.bankInfo });
  }, [finance]);

  // Expose current data to parent via ref
  useEffect(() => {
    if (tabDataRef) {
      tabDataRef.current = () => ({ categories, bankInfo });
    }
  }, [categories, bankInfo, tabDataRef]);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategories([...categories, { id: Date.now(), ...newCat }]);
    setNewCat({ name: '', type: 'income' });
    setHasUnsavedChanges(true);
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm('Hapus kategori ini?')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <h3 className="text-title-md font-bold text-white m-0">Konfigurasi Keuangan</h3>
        <p className="text-body-sm text-on-surface-variant m-0 mt-1">
          Atur kategori transaksi dan informasi rekening bank.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kategori Transaksi */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">category</span>
            Kategori Transaksi
          </h4>
          
          <form onSubmit={handleAddCategory} className="flex flex-wrap gap-2">
            <input 
              type="text" 
              value={newCat.name}
              onChange={e => setNewCat({...newCat, name: e.target.value})}
              className="glass-input flex-1 min-w-[140px] px-3 py-2 rounded-lg text-white font-body-sm"
              placeholder="Nama kategori baru..."
            />
            <select 
              value={newCat.type}
              onChange={e => setNewCat({...newCat, type: e.target.value})}
              className="glass-input shrink-0 px-3 py-2 rounded-lg text-white font-body-sm appearance-none pr-10"
            >
              <option value="income" className="bg-surface">Pemasukan</option>
              <option value="expense" className="bg-surface">Pengeluaran</option>
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
                    <span className="text-sm text-white">{cat.name}</span>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
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
                    <span className="text-sm text-white">{cat.name}</span>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
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
          <h4 className="font-label-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">account_balance</span>
            Informasi Rekening Bank
          </h4>
          <div className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-white">Nama Bank</label>
              <input 
                type="text" 
                name="bankName"
                value={bankInfo.bankName}
                onChange={handleBankChange}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md"
                placeholder="Misal: Bank Syariah Indonesia (BSI)"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-white">Nomor Rekening</label>
              <input 
                type="text" 
                name="accountNumber"
                value={bankInfo.accountNumber}
                onChange={handleBankChange}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md"
                placeholder="Masukkan nomor rekening"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-white">Atas Nama (Pemilik Rekening)</label>
              <input 
                type="text" 
                name="accountHolder"
                value={bankInfo.accountHolder}
                onChange={handleBankChange}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md"
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
    </div>
  );
};

export default TabFinance;
