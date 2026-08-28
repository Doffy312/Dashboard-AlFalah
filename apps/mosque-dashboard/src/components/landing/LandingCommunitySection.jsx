import { Users, Code2, Sparkles, MessageSquare, ArrowRight, Heart } from 'lucide-react';

export default function LandingCommunitySection() {
  const handleScrollToContact = (e) => {
    e.preventDefault();
    const contactSection = document.getElementById('kontak');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      // Optionally focus on subject or form
      setTimeout(() => {
        const subjectSelect = document.getElementById('subject');
        if (subjectSelect) {
          subjectSelect.value = 'Kerjasama & Masukan';
          subjectSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 300);
    }
  };

  return (
    <section id="kontribusi" className="scroll-mt-24 py-12 sm:py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Container Card */}
      <div className="relative z-10 rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-slate-900/90 via-[#06201b]/70 to-[#041713]/90 backdrop-blur-2xl p-6 sm:p-10 lg:p-14 shadow-2xl overflow-hidden">

        {/* Subtle Decorative Gradient Borders/Accents */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs sm:text-sm font-semibold tracking-wide mb-4 shadow-sm">
            <Heart size={15} className="text-emerald-400 fill-emerald-400/20" />
            <span>Inisiatif Bersama &amp; Terbuka</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Dibangun Bersama,{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Bebas Akses untuk Semua
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10 font-normal">
            Web app ini kami buat tanpa dipungut biaya sebagai sarana untuk tumbuh berkembang dan bermanfaat bagi masyarakat.
          </p>

          {/* Inner Highlight Card for Developers & Contributors */}
          <div className="w-full bg-white/[0.04] border border-white/10 hover:border-emerald-500/30 transition-colors duration-300 rounded-2xl sm:rounded-3xl p-5 sm:p-8 backdrop-blur-md text-left relative overflow-hidden shadow-lg">

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

              {/* Left Column: Icon & Text description */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner mt-1 sm:mt-0">
                  <Code2 size={26} />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 tracking-wider uppercase">
                    <Users size={14} />
                    <span>Kolaborasi Terbuka</span>
                  </div>

                  <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed">
                    Ingin ikut mengembangkan aplikasi ini? Kami membuka ruang bagi siapa saja yang ingin bergabung dalam{' '}
                    <strong className="text-white font-bold bg-emerald-500/20 px-1.5 py-0.4 rounded border border-emerald-500/30">
                      Tim Pengembang &amp; Teknologi
                    </strong>
                    —baik Anda yang sudah berpengalaman maupun yang baru ingin mulai belajar.
                  </p>

                  <p className="text-xs sm:text-sm text-emerald-200/90 italic leading-relaxed pt-1.5">
                    &ldquo;Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia (lainnya).&rdquo;{' '}
                    <span className="text-slate-400 not-italic text-[11px] sm:text-xs block sm:inline">
                      (HR. Ahmad, ath-Thabrani, ad-Daruqutni; dihasankan oleh Syaikh al-Albani dalam Shahihul Jami’ no. 3289)
                    </span>
                  </p>
                </div>
              </div>

              {/* Right Column: CTA Button */}
              <div className="w-full md:w-auto shrink-0 flex flex-col items-stretch md:items-end">
                <a
                  href="#kontak"
                  onClick={handleScrollToContact}
                  className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-95 text-center"
                >
                  <MessageSquare size={16} />
                  <span>Silahkan untuk menghubungi Pengurus</span>
                  <ArrowRight size={16} />
                </a>
              </div>

            </div>

            {/* Bottom Tagline Banner inside the card */}
            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center sm:justify-start gap-2 text-amber-300 font-bold text-xs sm:text-sm tracking-wide">
              <Sparkles size={16} className="text-amber-400 animate-pulse shrink-0" />
              <span>Mari berkarya dan bertumbuh bersama!</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
