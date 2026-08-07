/**
 * LandingNews — Berita & Kegiatan section
 * Shows real programs from the database when available, otherwise falls back to
 * default mosque activity cards.
 */

const FALLBACK_CARDS = [
  {
    id: 'fallback-1',
    category: 'Kajian & Dakwah',
    title: 'Kajian Milenial Masa Kini',
    description: 'Diskusi interaktif membahas isu kontemporer dari sudut pandang Islam yang relevan.',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLtK4Xcw9FfrY1Ep4fUUL9JpN6b-ey1ciGfCMV4Xj2sGLb23Hmm1OJOgAoCqRh5r_IrzCLR5KiEZzve_gokZkZ6BjoD18434ArMORe4PBYA4b2-6U10uFZv5gSlvKDZu2YshF5qCh7PL2nlTYLjRm-kpDEzc-7r3DRAqBvZ68CXY4aW41_X7dKsR7l3XDFCFjOndGvNPgEnS5ZONCQLVH1v_DNvjBooUr-NKdm3FFVj3-YsnYFyQjPyhvQ',
    icon: null,
  },
  {
    id: 'fallback-2',
    category: 'Sosial',
    title: 'Bakti Sosial Digital 2024',
    description: 'Penyaluran bantuan secara transparan melalui sistem pintar terverifikasi.',
    image: null,
    icon: 'volunteer_activism',
  },
  {
    id: 'fallback-3',
    category: 'Pendidikan',
    title: 'Tahsin Online AI Integrated',
    description: "Kelas perbaikan bacaan Al-Qur'an dengan feedback instan berbasis teknologi AI.",
    image: null,
    icon: 'menu_book',
  },
];

const CATEGORY_ICONS = ['auto_stories', 'volunteer_activism', 'menu_book', 'mosque', 'groups'];

const LandingNews = ({ programs = [] }) => {
  // If we have programs from the database, build card objects
  let cards = [];
  
  if (Array.isArray(programs) && programs.length > 0) {
    cards = programs.slice(0, 3).map((prog, i) => {
      let statusLabel = 'Kegiatan';
      if (prog.status === 'Berjalan') statusLabel = 'Program Berjalan';
      else if (prog.status === 'Direncanakan') statusLabel = 'Mendatang';
      else if (prog.status === 'Selesai') statusLabel = 'Terlaksana';
      else if (prog.category) statusLabel = prog.category;

      let formattedDate = null;
      if (prog.startDate) {
        const d = new Date(prog.startDate);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      }

      return {
        id: prog.id || `prog-${i}`,
        category: statusLabel,
        title: prog.name || prog.title || 'Kegiatan Masjid',
        description: prog.description || 'Program kerja dan kegiatan kemakmuran masjid.',
        image: prog.imageUrl || null,
        icon: CATEGORY_ICONS[i % CATEGORY_ICONS.length],
        date: formattedDate
      };
    });
  }

  // Fill up remaining slots with fallback cards so it's always 3 items
  if (cards.length < 3) {
    const needed = 3 - cards.length;
    cards = [...cards, ...FALLBACK_CARDS.slice(0, needed)];
  }

  return (
    <section id="kegiatan" className="mb-[140px]">
      {/* Header */}
      <div className="flex items-end justify-between mb-16 sm:mb-20 lp-reveal">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-[#e0e3e5]">
            Berita &amp; Kegiatan
          </h2>
          <div className="w-12 h-0.5 bg-[#adc6ff]" />
        </div>
        <span className="text-[#adc6ff] text-sm uppercase tracking-widest hidden sm:inline">
          Program Terintegrasi
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className={`group lp-reveal ${i === 1 ? 'lp-delay-1' : i === 2 ? 'lp-delay-2' : ''}`}
          >
            {/* Image / Icon Area */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden lp-border mb-6">
              {card.image ? (
                <>
                  <img
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src={card.image}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      if (e.target.nextElementSibling) {
                        e.target.nextElementSibling.classList.remove('hidden');
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] to-transparent opacity-60 pointer-events-none" />
                </>
              ) : (
                <div className="lp-glass w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-[#adc6ff]/30 group-hover:scale-110 transition-transform duration-500">
                    {card.icon || 'event'}
                  </span>
                </div>
              )}
            </div>

            {/* Text */}
            <div className="px-2">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[#adc6ff] mb-3">
                <span>{card.category}</span>
                {card.date && <span className="text-[#c2c6d6]/60 font-mono text-[10px]">{card.date}</span>}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#e0e3e5] group-hover:text-[#adc6ff] transition-colors">
                {card.title}
              </h3>
              <p className="text-[#c2c6d6] text-sm leading-relaxed line-clamp-2">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LandingNews;
