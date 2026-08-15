import { useState, useMemo } from 'react';
import { useZiswafList, useCreateZiswaf, useUpdateZiswaf, useDeleteZiswaf } from '../hooks/useZiswaf';
import { authClient } from '../lib/auth-client';
import DataTable from '../components/common/DataTable';
import SearchFilter from '../components/common/SearchFilter';
import StatusBadge from '../components/common/StatusBadge';
import ZiswafForm from '../components/ziswaf/ZiswafForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency } from '../lib/utils';
import { Edit2, Trash2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const ZiswafPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Semua');

  const { data: ziswaf = [] } = useZiswafList({});
  
  const createMutation = useCreateZiswaf();
  const updateMutation = useUpdateZiswaf();
  const deleteMutation = useDeleteZiswaf();

  const { data: session } = authClient.useSession();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);

  const canEdit = ['Ketua', 'Bendahara'].includes(session?.user?.role);

  const filteredData = useMemo(() => {
    return ziswaf.filter(item => {
      const matchSearch = item.donorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'Semua' || item.type === filterType;
      return matchSearch && matchType;
    });
  }, [ziswaf, searchTerm, filterType]);

  const handleEdit = (data) => {
    setEditingData(data);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (data) => {
    setDataToDelete(data);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (dataToDelete) {
      deleteMutation.mutate(dataToDelete.id);
      setDataToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  const handleSubmit = (data) => {
    if (editingData) {
      updateMutation.mutate(
        { id: editingData.id, data },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  };

  const columns = [
    { header: 'Tanggal', accessor: 'date', width: '15%' },
    { header: 'Jenis', cell: (row) => <StatusBadge type={row.type === 'Zakat Fitrah' || row.type === 'Zakat Mal' ? 'Active' : 'Umum'} text={row.type} />, width: '15%' },
    { header: 'Donatur', accessor: 'donorName', width: '25%' },
    { header: 'Nominal', cell: (row) => formatCurrency(row.amount), width: '20%' },
    { header: 'Keterangan', accessor: 'description', width: '15%' },
    ...(canEdit ? [{
      header: 'Aksi',
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="p-1.5 rounded-lg hover:bg-surface-variant text-on-surface-variant transition-colors"><Edit2 size={16} /></button>
          <button onClick={() => handleDeleteClick(row)} className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-500 transition-colors"><Trash2 size={16} /></button>
        </div>
      ),
      width: '10%'
    }] : [])
  ];

  const { finance } = useSettings();
  const bankInfo = finance?.bankInfo || { bankName: 'BSI', accountNumber: '7123456789', accountHolder: 'Masjid Al-Falah' };

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-display-sm font-display-sm text-on-surface dark:text-white m-0">ZISWAF</h1>
          <p className="font-body-md text-on-surface-variant dark:text-white/70 m-0 mt-xs">Pengelolaan Zakat, Infaq, Sedekah, dan Wakaf.</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditingData(null); setIsFormOpen(true); }} className="hidden sm:flex py-2 px-4 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95 items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span> Tambah Penerimaan
          </button>
        )}
      </div>

      {/* Bank Account Info Card from Settings */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-variant/20 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">account_balance</span>
          </div>
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider m-0">Rekening Transfer Donasi</p>
            <p className="text-sm font-bold text-white m-0 mt-0.5">
              {bankInfo.bankName} - <span className="font-mono text-emerald-400">{bankInfo.accountNumber}</span> a.n. {bankInfo.accountHolder}
            </p>
          </div>
        </div>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(`${bankInfo.bankName} ${bankInfo.accountNumber} a.n ${bankInfo.accountHolder}`);
            alert('Informasi rekening berhasil disalin!');
          }}
          className="px-3 py-1.5 rounded-lg bg-surface-variant hover:bg-surface-variant/80 text-white text-xs font-medium flex items-center gap-1.5 border border-outline-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">content_copy</span>
          Salin Rekening
        </button>
      </div>

      <div className="flex flex-col gap-md">
        <SearchFilter 
          placeholder="Cari nama donatur..." value={searchTerm} onChange={setSearchTerm}
          filters={[
            {
              key: 'type', value: filterType,
              options: [
                { label: 'Semua Jenis', value: 'Semua' },
                { label: 'Zakat Fitrah', value: 'Zakat Fitrah' },
                { label: 'Zakat Mal', value: 'Zakat Mal' },
                { label: 'Infaq', value: 'Infaq' },
                { label: 'Sedekah', value: 'Sedekah' },
                { label: 'Wakaf', value: 'Wakaf' },
              ]
            }
          ]}
          onFilterChange={(key, val) => { if (key === 'type') setFilterType(val); }}
        />
        <DataTable columns={columns} data={filteredData} emptyMessage="Tidak ada data ZISWAF." />
      </div>

      {canEdit && (
        <button onClick={() => { setEditingData(null); setIsFormOpen(true); }} className="mobile-fab md:hidden" aria-label="Tambah ZISWAF">
          <span className="material-symbols-outlined">add</span>
        </button>
      )}

      <ZiswafForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleSubmit} initialData={editingData} />
      <ConfirmDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={confirmDelete} title="Hapus Data ZISWAF" message={`Yakin hapus penerimaan dari "${dataToDelete?.donorName}"?`} />
    </div>
  );
};

export default ZiswafPage;
