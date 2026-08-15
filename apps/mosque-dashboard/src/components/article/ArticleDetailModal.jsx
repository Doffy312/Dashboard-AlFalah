import Modal from '../common/Modal';
import { Calendar, User, Tag } from 'lucide-react';

const ArticleDetailModal = ({ isOpen, onClose, article }) => {
  if (!article) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pratinjau Berita & Artikel"
    >
      <div className="flex flex-col gap-lg text-on-surface dark:text-white">
        {/* Banner Image */}
        {article.image && (
          <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden bg-black/30 border border-white/10">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white shadow-lg backdrop-blur-md">
                <Tag size={12} />
                {article.category || 'Berita'}
              </span>
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold leading-snug">
            {article.title}
          </h2>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-xs sm:text-sm text-on-surface-variant dark:text-white/70 border-b border-white/10 pb-4">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-primary" />
              <span>{formatDate(article.date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-primary" />
              <span>{article.author || 'Takmir Masjid'}</span>
            </div>
          </div>
        </div>

        {/* Summary Box */}
        {article.summary && (
          <div className="p-md rounded-xl bg-primary/10 border border-primary/20 text-emerald-300/90 text-sm italic">
            "{article.summary}"
          </div>
        )}

        {/* Article Body Content */}
        <div className="prose prose-invert max-w-none text-sm sm:text-base text-on-surface-variant dark:text-white/80 leading-relaxed whitespace-pre-line space-y-4">
          {article.content}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-md border-t border-outline-variant">
          <button
            onClick={onClose}
            className="px-lg py-2 rounded-xl bg-surface-variant hover:bg-white/10 text-white text-sm font-medium transition-colors"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ArticleDetailModal;
