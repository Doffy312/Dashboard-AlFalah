import React, { useState, useRef } from 'react';

const ProgramCompletionModal = ({ isOpen, onClose, onSubmit, program }) => {
  const [reportFile, setReportFile] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const reportInputRef = useRef(null);
  const photoInputRef = useRef(null);

  if (!isOpen) return null;

  const handleReportChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReportFile(file);
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    // Combine with existing
    const allFiles = [...photoFiles, ...files];
    if (allFiles.length > 3) {
      setError('Maksimal 3 foto dokumentasi yang diperbolehkan.');
      return;
    }
    setPhotoFiles(allFiles);
    setError('');
  };

  const removePhoto = (index) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportFile) {
      setError('Dokumen Laporan Kegiatan wajib diunggah.');
      return;
    }
    if (photoFiles.length === 0) {
      setError('Minimal 1 foto dokumentasi wajib diunggah (Maksimal 3).');
      return;
    }
    if (photoFiles.length > 3) {
      setError('Maksimal 3 foto dokumentasi yang diperbolehkan.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('report', reportFile);
    photoFiles.forEach(file => {
      formData.append('photos', file);
    });

    try {
      await onSubmit(formData);
      setReportFile(null);
      setPhotoFiles([]);
      onClose();
    } catch (err) {
      setError('Terjadi kesalahan saat mengunggah file. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isSubmitting ? onClose : undefined}></div>
      <div className="relative bg-surface border border-outline rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between p-md border-b border-outline bg-surface-variant/50">
          <h2 className="font-display-sm text-display-sm text-on-surface m-0">Penyelesaian Program</h2>
          {!isSubmitting && (
            <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>
        
        <div className="p-md overflow-y-auto">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl mb-6 flex gap-3 items-start">
            <span className="material-symbols-outlined mt-0.5">info</span>
            <div>
              <p className="font-semibold text-sm mb-1">Upload Bukti Kegiatan</p>
              <p className="text-sm opacity-90">Untuk menandai program <strong>"{program?.name}"</strong> sebagai selesai, Anda diwajibkan untuk mengunggah dokumen laporan dan foto dokumentasi guna transparansi.</p>
            </div>
          </div>

          <form id="completionForm" onSubmit={handleSubmit} className="flex flex-col gap-md">
            {error && (
              <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm border border-red-500/20">
                {error}
              </div>
            )}

            {/* Input Dokumen */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface">Laporan Kegiatan (Word/PDF) *</label>
              <div 
                onClick={() => reportInputRef.current?.click()}
                className={`border-2 border-dashed ${reportFile ? 'border-primary bg-primary/5' : 'border-outline hover:border-primary/50 hover:bg-surface-variant'} rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all`}
              >
                <span className={`material-symbols-outlined text-3xl mb-2 ${reportFile ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {reportFile ? 'description' : 'upload_file'}
                </span>
                {reportFile ? (
                  <p className="font-medium text-sm text-on-surface">{reportFile.name}</p>
                ) : (
                  <>
                    <p className="font-medium text-sm text-on-surface">Klik untuk unggah dokumen</p>
                    <p className="text-xs text-on-surface-variant mt-1">Maks. 10MB (.doc, .docx, .pdf)</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={reportInputRef} 
                  onChange={handleReportChange} 
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf" 
                  className="hidden" 
                />
              </div>
            </div>

            {/* Input Foto */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface">Foto Dokumentasi (Maks 3 Gambar) *</label>
              <div 
                onClick={() => photoFiles.length < 3 ? photoInputRef.current?.click() : null}
                className={`border-2 border-dashed ${photoFiles.length > 0 ? 'border-primary bg-primary/5' : 'border-outline hover:border-primary/50 hover:bg-surface-variant'} ${photoFiles.length >= 3 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all`}
              >
                <span className={`material-symbols-outlined text-3xl mb-2 ${photoFiles.length > 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                  add_photo_alternate
                </span>
                <p className="font-medium text-sm text-on-surface">Klik untuk unggah foto ({photoFiles.length}/3)</p>
                <p className="text-xs text-on-surface-variant mt-1">Maks. 10MB per file (.jpg, .png)</p>
                
                <input 
                  type="file" 
                  ref={photoInputRef} 
                  onChange={handlePhotoChange} 
                  accept="image/jpeg,image/png,image/jpg" 
                  multiple 
                  className="hidden" 
                />
              </div>
              
              {/* Preview Foto */}
              {photoFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {photoFiles.map((file, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-outline aspect-video bg-surface-variant">
                      <img src={URL.createObjectURL(file)} alt={`Preview ${idx+1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); removePhoto(idx); }} 
                          className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="p-md border-t border-outline bg-surface-variant/50 flex justify-end gap-sm">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="px-lg py-2 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button 
            type="submit" 
            form="completionForm"
            disabled={isSubmitting}
            className="px-lg py-2 rounded-full font-label-md text-label-md bg-emerald-500 text-white shadow-sm hover:shadow-md hover:bg-emerald-600 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                Menyimpan...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Selesaikan Program
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramCompletionModal;
