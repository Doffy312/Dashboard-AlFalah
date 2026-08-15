import heroWebp from '../../assets/hero.webp';

const LandingHero = ({ orgName = 'Masjid Al-Falah', description, heroImage }) => {
  const handleScroll = (e, target) => {
    e.preventDefault();
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const imageSrc = heroImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuBYxD30ADrE-5DUDU7lorxjn9WSLy5EsYhQzQ7BND1_fRTc1EWvPRhYg1Gd1F97qucuzxPuzqfSYucAnLlCbxBFenqk6NNuqGKZnR0S3BmUuD_XVEAKv16f3L3JJ7QqLTtXlvvIx4anHS2X_m_bXRylLhJ5d6f1ZdmvB5Ui4dQ-PGtiihjrj-UNyw-FtKVM2ktAhr58YVoHb7jGG34nwxUzsvfTvnTuWuFx-feKc4jkDicw2gyUHWxR";

  return (
    <section
      id="beranda"
      className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-[140px] lp-reveal"
    >
      {/* Text Content */}
      <div className="space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#adc6ff]/5 border border-[#adc6ff]/10 text-[#adc6ff] text-xs uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#adc6ff] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#adc6ff]" />
          </span>
          Digital Sanctuary
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight lp-text-gradient">
          Menuju Cahaya,<br />Membangun Umat
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-[#c2c6d6] leading-relaxed max-w-xl">
          {description ||
            `Selamat datang di ${orgName} Digital Sanctuary. Ruang suci modern yang memadukan tradisi spiritual abadi dengan kemudahan digital kontemporer untuk perjalanan ibadah Anda.`}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 pt-4">
          <button
            onClick={(e) => handleScroll(e, '#profil')}
            className="bg-[#adc6ff] text-[#002e6a] px-8 sm:px-10 py-4 rounded-full uppercase tracking-widest text-sm font-semibold hover:scale-[1.02] transition-transform shadow-lg shadow-[#adc6ff]/20"
          >
            Mulai Perjalanan
          </button>
          <button
            onClick={(e) => handleScroll(e, '#profil')}
            className="lp-border bg-white/5 hover:bg-white/10 text-[#e0e3e5] px-8 sm:px-10 py-4 rounded-full uppercase tracking-widest text-sm transition-all"
          >
            Visi Kami
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative">
        <div className="absolute -inset-4 bg-[#adc6ff]/10 blur-[100px] rounded-full" />
        <div className="relative rounded-3xl overflow-hidden lp-border lp-glass p-2">
          <img
            alt={`${orgName} Sanctuary Visual`}
            className="w-full aspect-[4/3] object-cover rounded-2xl opacity-90"
            src={imageSrc}
            width="800"
            height="600"
            fetchpriority="high"
            decoding="async"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = heroWebp;
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
