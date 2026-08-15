import { useState, useMemo } from 'react';
import { 
  useArticles, 
  useCreateArticle, 
  useUpdateArticle, 
  useDeleteArticle 
} from '../hooks/useArticles';
import { authClient } from '../lib/auth-client';
import { MOCK_NEWS_ARTICLES } from '../lib/mockArticles';
import DataTable from '../components/common/DataTable';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ArticleFormModal from '../components/article/ArticleFormModal';
import ArticleDetailModal from '../components/article/ArticleDetailModal';
import { 
  Newspaper, 
  Plus, 
  LayoutGrid, 
  List, 
  Edit2, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  CheckCircle2, 
  BookOpen, 
  CalendarDays,
  Search
} from 'lucide-react';

const BeritaPage = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const { data: articlesFromApi, isLoading } = useArticles();
  
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

  const handleSubmit = (data) => {
    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, ...data });
    } else {
      createMutation.mutate(data);
    }
    setIsFormOpen(false);
    setEditingArticle(null);
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

  // Columns for Table View
  const columns = [
    { 
      header: 'Gambar', 
      cell: (row) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-variant border border-white/10 shrink-0">
          {row.image ? (
            <img src={row.image} alt={row.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
              <Newspaper size={18} />
            </div>
          )}
        </div>
      ),
      width: '8%'
    },
    { header: 'Judul Berita', accessor: 'title', width: '32%' },
    { 
      header: 'Kategori', 
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {row.category || 'Berita'}
        </span>
      ), 
      width: '20%' 
    },
    { header: 'Penulis', accessor: 'author', width: '15%' },
    { header: 'Tanggal', cell: (row) => formatDate(row.date), width: '12%' },
    {
      header: 'Aksi',
      cell: (row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleViewDetail(row)} 
            className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-400 transition-colors" 
            title="Lihat Detail Pratinjau"
          >
            <Eye size={16} />
          </button>
          {canManage && (
            <>
              <button 
                onClick={() => handleEdit(row)} 
                className="p-1.5 rounded-lg hover:bg-surface-variant text-on-surface-variant dark:text-white/70 hover:text-white transition-colors"
                title="Edit Berita"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => handleDeleteClick(row)} 
                className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
                title="Hapus Berita"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      ),
      width: '13%'
    }
  ];

  return (
    <div className="flex flex-col gap-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-sm font-display-sm text-on-surface dark:text-white m-0 flex items-center gap-3">
            <Newspaper className="text-primary" size={32} />
            Berita & Artikel
          </h1>
          <p className="font-body-md text-on-surface-variant dark:text-white/70 m-0 mt-xs">
            Kelola pengumuman, dokumentasi kegiatan, dan artikel edukasi yang tampil di Landing Page.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setEditingArticle(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-lg py-3 bg-primary text-on-primary font-medium rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 shrink-0"
          >
            <Plus size={20} />
            <span>Tambah Berita</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        <div className="p-md rounded-2xl bg-surface/80 dark:bg-surface-variant/80 border border-white/10 backdrop-blur-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <Newspaper size={24} />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant dark:text-white/60 m-0">Total Berita & Artikel</p>
            <h3 className="text-2xl font-bold text-on-surface dark:text-white m-0">{stats.total}</h3>
          </div>
        </div>

        <div className="p-md rounded-2xl bg-surface/80 dark:bg-surface-variant/80 border border-white/10 backdrop-blur-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant dark:text-white/60 m-0">Kegiatan Terlaksana</p>
            <h3 className="text-2xl font-bold text-on-surface dark:text-white m-0">{stats.terlaksana}</h3>
          </div>
        </div>

        <div className="p-md rounded-2xl bg-surface/80 dark:bg-surface-variant/80 border border-white/10 backdrop-blur-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant dark:text-white/60 m-0">Artikel & Edukasi</p>
            <h3 className="text-2xl font-bold text-on-surface dark:text-white m-0">{stats.edukasi}</h3>
          </div>
        </div>

        <div className="p-md rounded-2xl bg-surface/80 dark:bg-surface-variant/80 border border-white/10 backdrop-blur-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <CalendarDays size={24} />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant dark:text-white/60 m-0">Agenda Mendatang</p>
            <h3 className="text-2xl font-bold text-on-surface dark:text-white m-0">{stats.mendatang}</h3>
          </div>
        </div>
      </div>

      {/* Control Bar: Search Input, Category Filter Tabs & View Mode Switcher (Aligned Perfectly) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-md">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-full lg:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant/60">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface dark:text-white placeholder-on-surface-variant/50 transition-all text-sm"
            placeholder="Cari berita, penulis, ringkasan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters & View Switcher */}
        <div className="flex items-center justify-between lg:justify-end gap-md flex-wrap sm:flex-nowrap">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 bg-surface-variant/80 p-1.5 rounded-xl border border-outline max-w-full overflow-x-auto no-scrollbar">
            {['Semua', 'Kegiatan Terlaksana', 'Artikel & Edukasi', 'Agenda Mendatang'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant dark:text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-surface-variant p-1.5 rounded-xl border border-outline shrink-0">
            <button 
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-white/5'}`}
              onClick={() => setViewMode('grid')}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-white/5'}`}
              onClick={() => setViewMode('table')}
              title="Tampilan Tabel Data"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-xl text-center text-primary font-medium">Memuat data berita...</div>
      ) : filteredArticles.length === 0 ? (
        <div className="p-2xl text-center rounded-2xl bg-surface/50 border border-white/10 text-on-surface-variant dark:text-white/60">
          Tidak ada berita yang ditemukan.
        </div>
      ) : viewMode === 'table' ? (
        <DataTable data={filteredArticles} columns={columns} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {filteredArticles.map((article) => (
            <div 
              key={article.id}
              className="group flex flex-col rounded-2xl bg-surface/80 dark:bg-surface-variant/80 border border-white/10 overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/5"
            >
              {/* Card Image Header */}
              <div className="relative h-48 w-full bg-black/40 overflow-hidden">
                {article.image ? (
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    <Newspaper size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white shadow-md backdrop-blur-sm">
                  {article.category || 'Berita'}
                </span>
              </div>

              {/* Card Content */}
              <div className="p-lg flex-1 flex flex-col justify-between gap-md">
                <div>
                  <h3 className="text-lg font-bold text-on-surface dark:text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-xs text-on-surface-variant dark:text-white/70 line-clamp-2 mt-2 leading-relaxed">
                    {article.summary || article.content}
                  </p>
                </div>

                {/* Card Meta & Actions */}
                <div className="pt-md border-t border-white/10 flex items-center justify-between text-xs text-on-surface-variant dark:text-white/60">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-primary" />
                      {formatDate(article.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={13} className="text-primary" />
                      {article.author?.split(' ')[0] || 'Takmir'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleViewDetail(article)}
                      className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                      title="Lihat Pratinjau"
                    >
                      <Eye size={16} />
                    </button>
                    {canManage && (
                      <>
                        <button
                          onClick={() => handleEdit(article)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                          title="Edit Berita"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(article)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Hapus Berita"
                        >
                          <Trash2 size={16} />
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
};

export default BeritaPage;
