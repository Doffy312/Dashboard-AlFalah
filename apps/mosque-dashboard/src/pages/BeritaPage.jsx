import { useState, useMemo } from 'react';
import { 
  useArticles, 
  useCreateArticle, 
  useUpdateArticle, 
  useDeleteArticle 
} from '../hooks/useArticles';
import { authClient } from '../lib/auth-client';
import { MOCK_NEWS_ARTICLES } from '../lib/mockArticles';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ArticleFormModal from '../components/article/ArticleFormModal';
import ArticleDetailModal from '../components/article/ArticleDetailModal';

export default function BeritaPage() {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const { data: articlesFromApi, isLoading, isError } = useArticles();
  
  // Use DB articles if available; fallback to Landing Page mock articles if DB is empty
  const articles = useMemo(() => {
    if (articlesFromApi && articlesFromApi.length > 0) {
      return articlesFromApi;
    }
    return MOCK_NEWS_ARTICLES;
  }, [articlesFromApi]);

  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  const deleteMutation = useDeleteArticle();

  const { data: session } = authClient.useSession();
  const userRole = session?.user?.role || 'Ketua';
  const canManage = ['Ketua', 'Sekretaris', 'Pengurus'].includes(userRole);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [articleToView, setArticleToView] = useState(null);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = articles.length;
    const terlaksana = articles.filter(a => a.category === 'Kegiatan Terlaksana' || a.type === 'terlaksana').length;
    const edukasi = articles.filter(a => a.category === 'Artikel & Edukasi' || a.type === 'edukasi').length;
    const mendatang = articles.filter(a => a.category === 'Agenda Mendatang' || a.type === 'mendatang').length;
    return { total, terlaksana, edukasi, mendatang };
  }, [articles]);

  // Filtered List
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchSearch = 
        article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategory = selectedCategory === 'Semua' || article.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [articles, searchTerm, selectedCategory]);

  const handleEdit = (article) => {
    setEditingArticle(article);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (articleToDelete) {
      deleteMutation.mutate(articleToDelete.id);
      setArticleToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingArticle) {
        await updateMutation.mutateAsync({ id: editingArticle.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsFormOpen(false);
      setEditingArticle(null);
    } catch {
      // Toast notification is handled by the hook, keep modal open for user editing
    }
  };

  const handleViewDetail = (article) => {
    setArticleToView(article);
    setIsDetailOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const categories = ['Semua', 'Kegiatan Terlaksana', 'Artikel & Edukasi', 'Agenda Mendatang'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-3xl">newspaper</span>
            Berita &amp; Artikel
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Kelola pengumuman, dokumentasi kegiatan, dan artikel edukasi yang tampil di Landing Page.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setEditingArticle(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Tambah Berita
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">article</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Total Berita</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-on-surface">{stats.total}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">task_alt</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Kegiatan Terlaksana</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-emerald-400">{stats.terlaksana}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">menu_book</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Artikel &amp; Edukasi</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-blue-400">{stats.edukasi}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">event_upcoming</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Agenda Mendatang</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-amber-400">{stats.mendatang}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface border border-outline-variant rounded-2xl p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
          <input
            type="text"
            placeholder="Cari judul berita, penulis, ringkasan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Category Filter Pills & View Switcher */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 bg-surface-variant/40 p-1 rounded-xl border border-outline-variant/40">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-primary text-slate-950 shadow-md font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-surface-variant/40 p-1 rounded-xl border border-outline-variant/40">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-primary text-slate-950 shadow-md font-bold' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Tampilan Grid Kartu"
            >
              <span className="material-symbols-outlined text-lg">grid_view</span>
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' 
                  ? 'bg-primary text-slate-950 shadow-md font-bold' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Tampilan Tabel Data"
            >
              <span className="material-symbols-outlined text-lg">table_rows</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-surface border border-outline-variant rounded-2xl p-8 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-on-surface-variant">Memuat data berita & artikel...</p>
        </div>
      ) : isError ? (
        <div className="bg-surface border border-outline-variant rounded-2xl p-8 text-center text-error space-y-2">
          <span className="material-symbols-outlined text-3xl">error</span>
          <p className="text-sm font-semibold">Gagal memuat data berita.</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded-2xl p-12 text-center text-on-surface-variant space-y-3">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">newspaper</span>
          <p className="text-sm font-semibold text-on-surface">Tidak ada berita ditemukan</p>
          <p className="text-xs max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'Semua'
              ? 'Coba sesuaikan kata kunci pencarian atau filter kategori Anda.' 
              : 'Belum ada berita atau artikel yang dipublikasikan.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-variant/30 text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                  <th className="py-3.5 px-4 sm:px-6">Gambar</th>
                  <th className="py-3.5 px-4">Judul Berita</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Penulis</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-xs sm:text-sm">
                {filteredArticles.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-variant/40 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-variant border border-outline-variant shrink-0">
                        {row.image ? (
                          <img src={row.image} alt={row.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-lg">newspaper</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-on-surface max-w-xs">
                      <div className="line-clamp-2">{row.title}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border ${
                        row.category === 'Kegiatan Terlaksana' 
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : row.category === 'Artikel & Edukasi'
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}>
                        {row.category || 'Berita'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant">
                      {row.author || 'Takmir'}
                    </td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant whitespace-nowrap">
                      {formatDate(row.date)}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetail(row)}
                          className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1 transition-all"
                          title="Lihat Detail"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                          <span>Detail</span>
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => handleEdit(row)}
                              className="px-2.5 py-1.5 rounded-lg bg-surface-variant/80 hover:bg-surface-variant text-on-surface border border-outline-variant text-xs font-bold transition-all flex items-center gap-1"
                              title="Edit Berita"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(row)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1"
                              title="Hapus Berita"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredArticles.map((article) => (
            <div 
              key={article.id}
              className="group flex flex-col rounded-2xl bg-surface border border-outline-variant overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Card Image Header */}
              <div className="relative h-48 w-full bg-surface-variant overflow-hidden">
                {article.image ? (
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                    <span className="material-symbols-outlined text-5xl">newspaper</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-sm ${
                  article.category === 'Kegiatan Terlaksana'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : article.category === 'Artikel & Edukasi'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {article.category || 'Berita'}
                </span>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-xs text-on-surface-variant line-clamp-2 mt-2 leading-relaxed">
                    {article.summary || article.content}
                  </p>
                </div>

                {/* Card Meta & Actions */}
                <div className="pt-3 border-t border-outline-variant/50 flex items-center justify-between text-xs text-on-surface-variant">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-sm">calendar_today</span>
                      {formatDate(article.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-sm">person</span>
                      {article.author?.split(' ')[0] || 'Takmir'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleViewDetail(article)}
                      className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all"
                      title="Lihat Pratinjau"
                    >
                      <span className="material-symbols-outlined text-base">visibility</span>
                    </button>
                    {canManage && (
                      <>
                        <button
                          onClick={() => handleEdit(article)}
                          className="p-1.5 rounded-lg hover:bg-surface-variant/80 text-on-surface-variant transition-colors"
                          title="Edit Berita"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(article)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Hapus Berita"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal (Create & Edit) */}
      <ArticleFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingArticle(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingArticle}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Detail Preview Modal */}
      <ArticleDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setArticleToView(null);
        }}
        article={articleToView}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setArticleToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Hapus Berita"
        message={`Apakah Anda yakin ingin menghapus berita "${articleToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
