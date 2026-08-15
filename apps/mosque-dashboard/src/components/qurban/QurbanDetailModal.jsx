import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { User, Phone, MapPin, Calendar, Tag, Layers, FileText } from 'lucide-react';

const QurbanDetailModal = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Data PeQurban">
      <div className="flex flex-col gap-md">
        {/* Profile Card Header */}
        <div className="p-md rounded-xl bg-surface-variant/40 border border-outline/30 flex items-center gap-md">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <User size={24} />
          </div>
          <div>
            <h3 className="font-title-md font-bold text-on-surface dark:text-white m-0">
              {data.jemaahName || 'Nama Jemaah'}
            </h3>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-white/60 mt-1">
              <span className="flex items-center gap-1">
                <Phone size={12} /> {data.jemaahPhone || '-'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {data.jemaahAddress || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
          <div className="p-sm rounded-lg bg-surface border border-outline/30 flex items-center gap-sm">
            <Calendar size={18} className="text-primary" />
            <div>
              <span className="text-[11px] text-on-surface-variant dark:text-white/60 block">Tahun Qurban</span>
              <span className="font-semibold text-sm text-on-surface dark:text-white">{data.tahun}</span>
            </div>
          </div>

          <div className="p-sm rounded-lg bg-surface border border-outline/30 flex items-center gap-sm">
            <Tag size={18} className="text-amber-500" />
            <div>
              <span className="text-[11px] text-on-surface-variant dark:text-white/60 block">Jenis Hewan</span>
              <span className="font-semibold text-sm text-on-surface dark:text-white">{data.jenisHewan}</span>
            </div>
          </div>

          <div className="p-sm rounded-lg bg-surface border border-outline/30 flex items-center gap-sm sm:col-span-2">
            <Layers size={18} className="text-purple-500" />
            <div>
              <span className="text-[11px] text-on-surface-variant dark:text-white/60 block">Kelompok Qurban</span>
              <span className="font-semibold text-sm text-on-surface dark:text-white">
                {data.namaKelompok ? data.namaKelompok : (data.jenisHewan === 'Kambing' ? 'Perorangan (Kambing)' : 'Belum Ditentukan')}
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between p-sm rounded-lg bg-surface border border-outline/30">
          <span className="text-xs font-medium text-on-surface-variant dark:text-white/70">Status Pequrban</span>
          <StatusBadge
            type={
              data.status === 'Lunas'
                ? 'Active'
                : data.status === 'Selesai'
                ? 'Success'
                : 'Pending'
            }
            text={data.status}
          />
        </div>

        {/* Catatan */}
        <div className="p-sm rounded-lg bg-surface border border-outline/30 flex flex-col gap-1">
          <span className="text-[11px] font-medium text-on-surface-variant dark:text-white/60 flex items-center gap-1">
            <FileText size={12} /> Catatan / Permintaan Khusus
          </span>
          <p className="text-xs text-on-surface dark:text-white m-0 whitespace-pre-wrap">
            {data.catatan || 'Tidak ada catatan.'}
          </p>
        </div>

        <div className="flex justify-end mt-sm">
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-surface-variant hover:bg-surface border border-outline text-on-surface font-label-md transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default QurbanDetailModal;
