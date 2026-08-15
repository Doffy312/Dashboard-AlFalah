import { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import { useJemaahList } from '../../hooks/useJemaah';
import { useQurbanYears, useQurbanGroups } from '../../hooks/useQurban';
import { User, Search, CheckCircle2, UserCheck, X } from 'lucide-react';

const QurbanForm = ({ isOpen, onClose, onSubmit, initialData, defaultGroup }) => {
  const { data: jemaahList = [] } = useJemaahList({});
  const { data: qurbanYears = [] } = useQurbanYears();

  const [searchJemaah, setSearchJemaah] = useState('');
  const [isNewGroup, setIsNewGroup] = useState(false);

  const [formData, setFormData] = useState({
    jemaahId: '',
    qurbanTahunId: '',
    jenisHewan: 'Sapi',
    qurbanKelompokId: '',
    namaKelompokBaru: '',
    status: 'Proses',
    catatan: '',
  });

  // Active or selected year fallback
  useEffect(() => {
    if (qurbanYears.length > 0 && !formData.qurbanTahunId && !initialData) {
      const active = qurbanYears.find((y) => y.statusAktif) || qurbanYears[0];
      setFormData((prev) => ({ ...prev, qurbanTahunId: active.id }));
    }
  }, [qurbanYears, initialData]);

  // Load groups for the selected year
  const { data: groupList = [] } = useQurbanGroups(formData.qurbanTahunId);

  useEffect(() => {
    if (initialData) {
      setFormData({
        jemaahId: initialData.jemaahId || '',
        qurbanTahunId: initialData.qurbanTahunId || '',
        jenisHewan: initialData.jenisHewan || 'Sapi',
        qurbanKelompokId: initialData.qurbanKelompokId || '',
        namaKelompokBaru: '',
        status: initialData.status || 'Proses',
        catatan: initialData.catatan || '',
      });
      setIsNewGroup(false);
      setSearchJemaah('');
    } else {
      const activeYear = qurbanYears.find((y) => y.statusAktif) || qurbanYears[0];
      setFormData({
        jemaahId: '',
        qurbanTahunId: activeYear?.id || '',
        jenisHewan: defaultGroup?.jenisHewan || 'Sapi',
        qurbanKelompokId: defaultGroup?.id || '',
        namaKelompokBaru: '',
        status: 'Proses',
        catatan: '',
      });
      setIsNewGroup(false);
      setSearchJemaah('');
    }
  }, [initialData, defaultGroup, isOpen]);

  // Selected Jemaah object lookup
  const selectedJemaah = useMemo(() => {
    return jemaahList.find((j) => j.id === formData.jemaahId);
  }, [jemaahList, formData.jemaahId]);

  // Filtered Jemaah list
  const filteredJemaahList = useMemo(() => {
    if (!searchJemaah) return jemaahList;
    const q = searchJemaah.toLowerCase();
    return jemaahList.filter(
      (j) =>
        j.name.toLowerCase().includes(q) ||
        (j.phone && j.phone.includes(q)) ||
        (j.category && j.category.toLowerCase().includes(q))
    );
  }, [jemaahList, searchJemaah]);

  const handleGroupSelectChange = (e) => {
    const val = e.target.value;
    if (val === '__NEW__') {
      setIsNewGroup(true);
      setFormData((prev) => ({ ...prev, qurbanKelompokId: '' }));
    } else {
      setIsNewGroup(false);
      setFormData((prev) => ({ ...prev, qurbanKelompokId: val, namaKelompokBaru: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.jemaahId) {
      alert('Pilih Jemaah (Mudhohi) terlebih dahulu dari daftar!');
      return;
    }
    if (!formData.qurbanTahunId) {
      alert('Pilih Periode Tahun Qurban terlebih dahulu');
      return;
    }

    onSubmit({
      jemaahId: formData.jemaahId,
      qurbanTahunId: formData.qurbanTahunId,
      jenisHewan: formData.jenisHewan,
      qurbanKelompokId: isNewGroup ? null : formData.qurbanKelompokId || null,
      namaKelompokBaru: isNewGroup ? formData.namaKelompokBaru : null,
      status: formData.status,
      catatan: formData.catatan,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Data PeQurban' : 'Tambah PeQurban Baru'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-md">
        
        {/* ─── 1. PILIH JEMAAH (MUDHOHI) ─── */}
        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-sm">
              <User size={16} className="text-emerald-500" /> Pilih Jemaah (Mudhohi) <span className="text-rose-500">*</span>
            </span>
            {selectedJemaah && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 size={13} /> Terpilih
              </span>
            )}
          </label>

          {/* Selected Jemaah Card Banner */}
          {selectedJemaah ? (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface dark:text-white m-0">
                    {selectedJemaah.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant dark:text-white/60 m-0">
                    {selectedJemaah.category || 'Umum'} • {selectedJemaah.phone || 'No HP -'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, jemaahId: '' })}
                className="p-1.5 rounded-lg bg-surface-variant hover:bg-rose-500/20 text-on-surface-variant hover:text-rose-500 transition-colors"
                title="Ganti Jemaah"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Search Bar */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-3.5 text-on-surface-variant/50" />
                <input
                  type="text"
                  placeholder="Ketik nama atau nomor telepon jemaah..."
                  value={searchJemaah}
                  onChange={(e) => setSearchJemaah(e.target.value)}
                  className="w-full pl-10 pr-md py-2.5 bg-surface-variant border border-outline rounded-xl outline-none focus:border-emerald-500 text-on-surface font-body-md"
                />
              </div>

              {/* Interactive List View */}
              <div className="max-h-48 overflow-y-auto rounded-xl border border-outline/50 bg-surface divide-y divide-outline/20">
                {filteredJemaahList.length === 0 ? (
                  <div className="p-4 text-center text-xs text-on-surface-variant/70 italic">
                    Tidak ada jemaah ditemukan. Silakan tambahkan jemaah di menu Jemaah terlebih dahulu.
                  </div>
                ) : (
                  filteredJemaahList.map((j) => (
                    <div
                      key={j.id}
                      onClick={() => setFormData({ ...formData, jemaahId: j.id })}
                      className={`p-2.5 px-3 hover:bg-emerald-500/10 cursor-pointer flex items-center justify-between transition-colors ${
                        formData.jemaahId === j.id ? 'bg-emerald-500/15 font-semibold' : ''
                      }`}
                    >
                      <div>
                        <span className="text-sm font-medium text-on-surface dark:text-white block">
                          {j.name}
                        </span>
                        <span className="text-xs text-on-surface-variant dark:text-white/60">
                          {j.phone || 'No HP -'} • RT/RW {j.address ? j.address.substring(0, 20) : '-'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-surface-variant text-on-surface-variant">
                        {j.category || 'Umum'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── 2. TAHUN QURBAN & JENIS HEWAN ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">
              Periode Tahun Qurban <span className="text-rose-500">*</span>
            </label>
            <select
              required
              className="w-full px-md py-2.5 bg-surface-variant border border-outline rounded-xl outline-none focus:border-emerald-500 text-on-surface font-body-md cursor-pointer"
              value={formData.qurbanTahunId}
              onChange={(e) => setFormData({ ...formData, qurbanTahunId: e.target.value, qurbanKelompokId: '' })}
            >
              {qurbanYears.length === 0 ? (
                <option value="">(Tahun Aktif {new Date().getFullYear()})</option>
              ) : (
                qurbanYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    Tahun {y.tahun} {y.statusAktif ? '(Aktif)' : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">
              Jenis Hewan Qurban <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mt-0.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, jenisHewan: 'Sapi' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  formData.jenisHewan === 'Sapi'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300 shadow-sm'
                    : 'bg-surface-variant border-outline text-on-surface-variant hover:bg-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">pets</span> Sapi (7 Org)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, jenisHewan: 'Kambing', qurbanKelompokId: '' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  formData.jenisHewan === 'Kambing'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'bg-surface-variant border-outline text-on-surface-variant hover:bg-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">cruelty_free</span> Kambing
              </button>
            </div>
          </div>
        </div>

        {/* ─── 3. KELOMPOK SAPI ─── */}
        {formData.jenisHewan === 'Sapi' && (
          <div className="flex flex-col gap-xs p-md rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <label className="font-label-md text-amber-800 dark:text-amber-200 font-semibold flex items-center justify-between">
              <span>Kelompok Sapi</span>
              <span className="text-xs font-normal opacity-80">(Maksimal 7 Anggota)</span>
            </label>

            <select
              value={isNewGroup ? '__NEW__' : formData.qurbanKelompokId}
              onChange={handleGroupSelectChange}
              className="w-full px-md py-2 bg-surface border border-outline rounded-xl outline-none focus:border-amber-500 text-on-surface font-body-md cursor-pointer"
            >
              <option value="">-- Otomatis Pilih Kelompok Tersedia --</option>
              {groupList
                .filter((g) => g.jenisHewan === 'Sapi')
                .map((g) => (
                  <option
                    key={g.id}
                    value={g.id}
                    disabled={g.isFull && g.id !== initialData?.qurbanKelompokId}
                  >
                    {g.namaKelompok} ({g.memberCount}/7 anggota){' '}
                    {g.isFull ? ' - [PENUH]' : ''}
                  </option>
                ))}
              <option value="__NEW__">➕ + Buat Kelompok Sapi Baru</option>
            </select>

            {isNewGroup && (
              <div className="flex flex-col gap-xs mt-2">
                <input
                  type="text"
                  required
                  placeholder="Masukkan Nama Kelompok Baru (cth: Kelompok Sapi Al-Falah 1)"
                  value={formData.namaKelompokBaru}
                  onChange={(e) => setFormData({ ...formData, namaKelompokBaru: e.target.value })}
                  className="w-full px-md py-2 bg-surface border border-amber-500 rounded-xl outline-none text-on-surface font-body-md"
                />
              </div>
            )}
          </div>
        )}

        {/* ─── 4. STATUS PEMBAYARAN ─── */}
        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">
            Status Pequrban / Pembayaran
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Proses', 'Lunas', 'Selesai'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFormData({ ...formData, status: st })}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  formData.status === st
                    ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-md'
                    : 'bg-surface-variant border-outline text-on-surface-variant hover:bg-surface'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* ─── 5. CATATAN ─── */}
        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            rows="2"
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-emerald-500 text-on-surface font-body-md resize-none"
            placeholder="Catatan khusus, bagian paha/daging, dll..."
            value={formData.catatan}
            onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex gap-sm mt-md">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-outline bg-surface-variant hover:bg-surface text-on-surface font-label-md transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 py-3 rounded-xl font-label-md text-slate-950 font-bold transition-all shadow-md active:scale-95 bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20"
          >
            {initialData ? 'Simpan Perubahan' : 'Simpan Data PeQurban'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default QurbanForm;
