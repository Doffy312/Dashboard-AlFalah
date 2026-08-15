import { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import { UploadCloud, Link as LinkIcon, Trash2, CheckCircle2 } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { label: 'Kegiatan Terlaksana', type: 'terlaksana' },
  { label: 'Artikel & Edukasi', type: 'edukasi' },
  { label: 'Agenda Mendatang', type: 'mendatang' },
];

const ArticleFormModal = ({ isOpen, onClose, onSubmit, initialData, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Kegiatan Terlaksana',
    type: 'terlaksana',
    date: new Date().toISOString().split('T')[0],
    author: 'Humas Masjid Al-Falah',
    image: '',
    summary: '',
    content: ''
  });

  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'url'
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Legitimate form reset on modal open
      setFormData({
        title: initialData.title || '',
        category: initialData.category || 'Kegiatan Terlaksana',
        type: initialData.type || 'terlaksana',
        date: initialData.date || new Date().toISOString().split('T')[0],
        author: initialData.author || 'Humas Masjid Al-Falah',
        image: initialData.image || '',
        summary: initialData.summary || '',
        content: initialData.content || ''
      });
      if (initialData.image && initialData.image.startsWith('http')) {
        setUploadMode('url');
      } else {
        setUploadMode('file');
      }
    } else {
      setFormData({
        title: '',
        category: 'Kegiatan Terlaksana',
        type: 'terlaksana',
        date: new Date().toISOString().split('T')[0],
        author: 'Humas Masjid Al-Falah',
        image: '',
        summary: '',
        content: ''
      });
      setUploadMode('file');
    }
  }, [initialData, isOpen]);

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    const matched = CATEGORY_OPTIONS.find(c => c.label === selectedCategory);
    setFormData(prev => ({
      ...prev,
      category: selectedCategory,
      type: matched ? matched.type : 'terlaksana'
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation max 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('Ukuran file foto terlalu besar. Maksimal 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
      toast.success('Foto berhasil diunggah!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Berita / Artikel" : "Tambah Berita & Kegiatan Baru"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-md">
        {/* Judul Berita */}
        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">
            Judul Berita / Artikel <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface dark:text-white font-body-md"
            placeholder="Contoh: Pelaksanaan Kajian Akbar & Doa Bersama"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        {/* Kategori & Tanggal */}
        <div className="flex flex-col sm:flex-row gap-md">
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">Kategori</label>
            <select
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface dark:text-white font-body-md"
              value={formData.category}
              onChange={handleCategoryChange}
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.label} value={opt.label} className="bg-[#121c24] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-xs flex-1">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">
              Tanggal Publikasi <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              required
              className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface dark:text-white font-body-md"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
        </div>

        {/* Penulis / Sumber */}
        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Penulis / Sumber</label>
          <input
            type="text"
            required
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface dark:text-white font-body-md"
            placeholder="Contoh: Humas Masjid Al-Falah"
            value={formData.author}
            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
          />
        </div>

        {/* Upload Foto Header (File Upload Maks 5MB & URL Toggle) */}
        <div className="flex flex-col gap-xs">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-on-surface-variant dark:text-white/70">
              Foto / Header Berita (Maksimal 5 MB)
            </label>
            <div className="flex items-center gap-1 bg-surface-variant p-0.5 rounded-lg border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                  uploadMode === 'file' ? 'bg-primary text-on-primary font-medium' : 'text-on-surface-variant hover:text-white'
                }`}
              >
                <UploadCloud size={13} />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                  uploadMode === 'url' ? 'bg-primary text-on-primary font-medium' : 'text-on-surface-variant hover:text-white'
                }`}
              >
                <LinkIcon size={13} />
                <span>URL Gambar</span>
              </button>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
            className="hidden"
          />

          {uploadMode === 'file' ? (
            <div className="flex flex-col gap-2">
              {formData.image ? (
                <div className="relative h-40 w-full rounded-xl overflow-hidden border border-white/10 bg-black/30 group">
                  <img
                    src={formData.image}
                    alt="Preview Berita"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-medium hover:bg-primary-hover transition-colors flex items-center gap-1"
                    >
                      <UploadCloud size={14} /> Ganti Foto
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/80 text-white text-xs font-medium hover:bg-rose-600 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-emerald-500/90 text-white text-[11px] font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Foto Terpasang
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-outline-variant hover:border-primary/60 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer bg-surface-variant/20 hover:bg-surface-variant/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface dark:text-white m-0">
                      Klik untuk memilih file foto
                    </p>
                    <p className="text-xs text-on-surface-variant dark:text-white/50 m-0 mt-0.5">
                      Format: PNG, JPG, WEBP, GIF (Ukuran Maksimal: 5 MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                type="url"
                className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface dark:text-white font-body-md"
                placeholder="https://images.unsplash.com/photo-... atau /images/berita.webp"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              />
              {formData.image && (
                <div className="h-32 w-full rounded-xl overflow-hidden border border-white/10 bg-black/20">
                  <img
                    src={formData.image}
                    alt="Preview URL"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ringkasan Singkat */}
        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">Ringkasan Singkat</label>
          <textarea
            rows={2}
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface dark:text-white font-body-md resize-none"
            placeholder="Ringkasan 1-2 kalimat untuk kartu depan berita..."
            value={formData.summary}
            onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
          />
        </div>

        {/* Isi Berita Lengkap */}
        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface-variant dark:text-white/70">
            Isi Berita / Artikel Lengkap <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={5}
            required
            className="w-full px-md py-sm bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface dark:text-white font-body-md resize-y"
            placeholder="Tuliskan isi berita lengkap di sini..."
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-md mt-md pt-md border-t border-outline-variant">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-lg py-sm rounded-xl border border-outline text-on-surface-variant dark:text-white/70 hover:bg-surface-variant transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-lg py-sm rounded-xl bg-primary text-on-primary font-medium hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              initialData ? "Simpan Perubahan" : "Publikasikan Berita"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ArticleFormModal;
