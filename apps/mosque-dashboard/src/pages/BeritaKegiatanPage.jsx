import { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { 
  Newspaper, 
  Search, 
  ArrowRight, 
  X, 
  Share2, 
  Check, 
  Tag
} from 'lucide-react';
import LandingHeader from '../components/landing/LandingHeader';
import LandingFooter from '../components/landing/LandingFooter';
import { useSettings } from '../contexts/SettingsContext';
import { useArticles } from '../hooks/useArticles';
import { MOCK_NEWS_ARTICLES } from '../lib/mockArticles';

const QRInfaqModal = lazy(() => import('../components/landing/QRInfaqModal'));

const LANDING_QUERY_OPTIONS = { staleTime: 60000, gcTime: 300000, refetchOnWindowFocus: false };

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const BASE_CATEGORIES = ['Semua', 'Kegiatan Terlaksana', 'Artikel & Edukasi', 'Agenda Mendatang', 'Kajian', 'Pengumuman'];

export default function BeritaKegiatanPage() {
  const { profile } = useSettings();
  const orgName = profile?.orgName || 'Masjid Al-Falah';

  const { data: articlesFromApi } = useArticles(LANDING_QUERY_OPTIONS);
  const articlesList = (articlesFromApi && articlesFromApi.length > 0) ? articlesFromApi : MOCK_NEWS_ARTICLES;

  const [selectedNews, setSelectedNews] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDonasiType, setActiveDonasiType] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Auto-open modal if URL contains ?id= or ?article= parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const articleParam = params.get('id') || params.get('article');
    if (articleParam && Array.isArray(articlesList) && articlesList.length > 0) {
      const match = articlesList.find(a => String(a.id) === String(articleParam) || a.title === articleParam);
      if (match) {
        setSelectedNews(match);
      }
    }
  }, [articlesList]);

  // Handle Share / Copy Link feature
  const handleShareArticle = async (article) => {
    if (!article) return;

    const shareUrl = article.id 
      ? `${window.location.origin}${window.location.pathname}?id=${article.id}`
      : window.location.href;

    const shareData = {
      title: article.title || 'Artikel',
      text: article.summary || article.title || '',
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link artikel berhasil disalin!');
        return;
      }

      // Legacy fallback for non-HTTPS or older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        showToast('Link artikel berhasil disalin!');
      } else {
        showToast('Gagal menyalin link artikel.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        showToast('Gagal menyalin link artikel.');
      }
    }
  };

  // Build complete list of categories (base options + dynamic categories from items)
  const categories = useMemo(() => {
    const list = [...BASE_CATEGORIES];
    if (Array.isArray(articlesList)) {
      articlesList.forEach(item => {
        if (item.category && !list.some(c => c.toLowerCase() === item.category.toLowerCase())) {
          list.push(item.category);
        }
      });
    }
    return list;
  }, [articlesList]);

  // Filter articles based on category & search term
  const filteredArticles = useMemo(() => {
    return articlesList.filter(article => {
      // 1. Smart Category Matching Logic
      let matchCat = false;
      if (activeCategory === 'Semua') {
        matchCat = true;
      } else {
        const articleCat = (article.category || '').toLowerCase();
        const articleType = (article.type || '').toLowerCase();
        const articleTitle = (article.title || '').toLowerCase();
        const articleSummary = (article.summary || '').toLowerCase();
        const targetCat = activeCategory.toLowerCase();

        if (articleCat === targetCat) {
          matchCat = true;
        } else if (articleCat.includes(targetCat) || targetCat.includes(articleCat)) {
          matchCat = true;
        } else if (targetCat === 'kegiatan' || targetCat === 'kegiatan terlaksana') {
          matchCat = articleCat.includes('kegiatan') || articleType === 'terlaksana';
        } else if (targetCat === 'edukasi' || targetCat === 'artikel & edukasi' || targetCat === 'artikel') {
          matchCat = articleCat.includes('edukasi') || articleCat.includes('artikel') || articleType === 'edukasi';
        } else if (targetCat === 'agenda' || targetCat === 'agenda mendatang' || targetCat === 'mendatang') {
          matchCat = articleCat.includes('agenda') || articleCat.includes('mendatang') || articleType === 'mendatang';
        } else if (targetCat === 'kajian') {
          matchCat = articleCat.includes('kajian') || articleTitle.includes('kajian') || articleSummary.includes('kajian');
        } else if (targetCat === 'pengumuman') {
          matchCat = articleCat.includes('pengumuman') || articleTitle.includes('pengumuman') || articleSummary.includes('pengumuman');
        }
      }

      // 2. Comprehensive Search Query Matching Logic
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q ||
        (article.title && article.title.toLowerCase().includes(q)) ||
        (article.summary && article.summary.toLowerCase().includes(q)) ||
        (article.author && article.author.toLowerCase().includes(q)) ||
        (article.category && article.category.toLowerCase().includes(q)) ||
        (article.content && article.content.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [articlesList, activeCategory, searchQuery]);

  return (
    <div className="landing-container min-h-screen bg-[#0b131a] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header */}
      <LandingHeader 
        onOpenDonasi={() => setActiveDonasiType('Infaq')}
      />

      {/* Hero Header */}
      <section className="scroll-mt-24 pt-24 sm:pt-32 pb-6 sm:pb-12 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4 sm:mb-6">
          <Newspaper size={14} /> Warta &amp; Dokumentasi Kegiatan
        </div>

        <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 sm:mb-6 break-words">
          Berita &amp; Kegiatan
          <span className="block text-emerald-400 mt-2 sm:mt-3 break-words">{orgName}</span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6 sm:mb-8 px-2 break-words">
          Informasi kajian keagamaan, agenda takmir, pengumuman jemaah, dan laporan dokumentasi kegiatan sosial masjid.
        </p>

        {/* Glow Sphere Decorations — same as beranda */}
        <div className="hero-decoration">
          <div className="glow-sphere sphere-1 absolute -top-10 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="glow-sphere sphere-2 absolute top-20 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="py-4 sm:py-6 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          {/* Category Tabs: Auto-fit Responsive Grid on Mobile for 100% Text Visibility & Zero Clipping */}
          <div className="grid grid-cols-2 xs:grid-cols-3 md:flex md:flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat, idx) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center text-center gap-1.5 leading-snug ${
                  categories.length % 2 !== 0 && idx === 0 ? 'col-span-2 xs:col-span-1' : ''
                } ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                <Tag size={12} className="shrink-0" />
                <span className="break-words">{cat}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berita atau kegiatan..."
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-8 sm:py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto min-h-[300px]">
        {filteredArticles.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center text-slate-400 space-y-3">
            <Newspaper size={40} className="mx-auto text-slate-500 mb-2" />
            <h3 className="text-lg font-bold text-white">Berita tidak ditemukan</h3>
            <p className="text-xs">Tidak ada artikel atau kegiatan yang sesuai dengan kriteria pencarian.</p>
            {(activeCategory !== 'Semua' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('Semua');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                Reset Filter &amp; Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <div 
                key={article.id}
                onClick={() => setSelectedNews(article)}
                className="group bg-white/5 border border-white/10 hover:border-amber-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 overflow-hidden relative bg-slate-900">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      width="400"
                      height="250"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/berita_kajian_akbar.webp';
                      }}
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold rounded-md border border-amber-500/20">
                      {article.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="text-xs text-slate-400 mb-2">
                      <span>{formatDate(article.date)}</span>
                    </div>
                    <h3 className="font-bold text-white text-sm line-clamp-2 mb-2 group-hover:text-amber-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNews(article);
                    }}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 group-hover:underline flex items-center gap-1.5 transition-colors"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <LandingFooter />

      {/* Article Detail Modal */}
      {selectedNews && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto" 
          onClick={() => setSelectedNews(null)}
        >
          <div 
            className="bg-[#0b131a] border border-white/15 p-6 sm:p-8 rounded-3xl max-w-2xl w-full relative space-y-6 shadow-2xl my-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start pt-1 pb-3 border-b border-white/10">
              <div className="pr-4">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-full">
                  {selectedNews.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-3 leading-snug">{selectedNews.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedNews(null)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
                aria-label="Tutup Detail Berita"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pb-2">
              <span>Penulis: <strong className="text-white">{selectedNews.author || 'Takmir Masjid'}</strong></span>
              <span>•</span>
              <span>{formatDate(selectedNews.date)}</span>
            </div>

            <div className="space-y-4 text-left">
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950/60 flex justify-center items-center p-1 max-h-[420px] w-full">
                <img 
                  src={selectedNews.image} 
                  alt={selectedNews.title}
                  loading="lazy"
                  className="w-full h-auto max-h-[400px] object-contain rounded-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=800&auto=format&fit=crop';
                  }}
                />
              </div>

              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-white/5 p-5 sm:p-6 rounded-2xl border border-white/5 space-y-3">
                {selectedNews.content}
              </div>
            </div>

            <div className="pt-4 pb-1 border-t border-white/10 flex justify-between items-center gap-3">
              <button 
                onClick={() => handleShareArticle(selectedNews)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-white/10 transition-colors"
              >
                <Share2 size={16} /> Bagikan Artikel
              </button>
              <button 
                onClick={() => setSelectedNews(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-xl font-bold text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <Check size={18} /> {toastMessage}
        </div>
      )}

      {/* Modals */}
      <Suspense fallback={null}>
        <QRInfaqModal
          isOpen={!!activeDonasiType}
          onClose={() => setActiveDonasiType(null)}
          defaultType={activeDonasiType || 'Infaq'}
          onSuccessCallback={(msg) => showToast(msg)}
        />
      </Suspense>
    </div>
  );
}
