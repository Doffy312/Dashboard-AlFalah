import Modal from '../common/Modal';
import { formatCurrency, getFileUrl } from '../../lib/utils';
import { FileText, Download, ExternalLink } from 'lucide-react';

const ProgramDetailModal = ({ isOpen, onClose, program }) => {
  if (!isOpen || !program) return null;

  // Handle documentationUrls safely whether it's an Array or JSON string
  const documentationList = (() => {
    if (!program.documentationUrls) return [];
    if (Array.isArray(program.documentationUrls)) return program.documentationUrls;
    if (typeof program.documentationUrls === 'string') {
      try {
        const parsed = JSON.parse(program.documentationUrls);
        return Array.isArray(parsed) ? parsed : [program.documentationUrls];
      } catch {
        return [program.documentationUrls];
      }
    }
    return [];
  })();

  const reportUrl = program.reportDocUrl ? getFileUrl(program.reportDocUrl) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Program Kerja (Selesai)">
      <div className="flex flex-col gap-lg">
        {/* Header Info */}
        <div className="flex flex-col gap-xs border-b border-outline pb-md">
          <h3 className="font-display-sm text-display-sm text-on-surface">{program.name}</h3>
          <div className="flex flex-wrap gap-md mt-2">
            <div className="bg-surface-variant px-3 py-1.5 rounded-lg text-sm text-on-surface-variant font-medium">
              PIC: <span className="text-on-surface">{program.pic}</span>
            </div>
            <div className="bg-surface-variant px-3 py-1.5 rounded-lg text-sm text-on-surface-variant font-medium flex items-center gap-1.5 flex-wrap">
              <span>Tanggal: <span className="text-on-surface">{new Date(program.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></span>
              {program.originalDate && program.originalDate.split('T')[0] !== program.date?.split('T')[0] && (
                <span 
                  className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  title={`Jadwal awal perencanaan: ${new Date(program.originalDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                >
                  (Diubah)
                </span>
              )}
            </div>
            <div className="bg-surface-variant px-3 py-1.5 rounded-lg text-sm text-on-surface-variant font-medium">
              Anggaran: <span className="text-on-surface font-bold text-emerald-500">{formatCurrency(program.budget)}</span>
            </div>
          </div>
        </div>

        {/* Description & Evaluation */}
        <div className="flex flex-col gap-md">
          <div>
            <h4 className="font-label-lg text-on-surface mb-2">Deskripsi Kegiatan</h4>
            <p className="text-on-surface-variant text-sm bg-surface-variant/50 p-4 rounded-xl leading-relaxed">
              {program.description || 'Tidak ada deskripsi.'}
            </p>
          </div>
          
          {program.evaluation && (
            <div>
              <h4 className="font-label-lg text-on-surface mb-2">Evaluasi Program</h4>
              <p className="text-emerald-700 dark:text-emerald-400 text-sm bg-emerald-500/10 p-4 rounded-xl leading-relaxed">
                {program.evaluation}
              </p>
            </div>
          )}
        </div>

        {/* Laporan Dokumen */}
        <div className="flex flex-col gap-sm">
          <h4 className="font-label-lg text-on-surface border-b border-outline pb-2">Dokumen Laporan</h4>
          {reportUrl ? (
            <a 
              href={reportUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-surface-variant hover:bg-surface border border-outline rounded-xl p-4 transition-colors group"
            >
              <div className="p-3 bg-primary/10 text-primary rounded-lg">
                <FileText size={24} />
              </div>
              <div className="flex-1">
                <p className="font-label-md text-on-surface">Laporan_Kegiatan_Selesai</p>
                <p className="text-xs text-on-surface-variant">Klik untuk mengunduh atau melihat dokumen</p>
              </div>
              <div className="p-2 text-on-surface-variant group-hover:text-primary transition-colors">
                <Download size={20} />
              </div>
            </a>
          ) : (
            <div className="bg-surface-variant border border-dashed border-outline rounded-xl p-4 text-center">
              <p className="text-sm text-on-surface-variant">Dokumen laporan belum dilampirkan.</p>
            </div>
          )}
        </div>

        {/* Foto Dokumentasi */}
        <div className="flex flex-col gap-sm">
          <h4 className="font-label-lg text-on-surface border-b border-outline pb-2">Foto Dokumentasi</h4>
          {documentationList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {documentationList.map((url, idx) => {
                const fileUrl = getFileUrl(url);
                return (
                  <a 
                    key={idx}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-video rounded-xl overflow-hidden border border-outline block bg-surface-variant"
                  >
                    <img 
                      src={fileUrl} 
                      alt={`Dokumentasi ${idx + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <span className="text-white flex items-center gap-2 font-medium text-sm">
                        <ExternalLink size={16} /> Lihat Penuh
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface-variant border border-dashed border-outline rounded-xl p-6 text-center">
              <p className="text-sm text-on-surface-variant">Foto dokumentasi belum dilampirkan.</p>
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
};

export default ProgramDetailModal;
