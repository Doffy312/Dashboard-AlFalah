const LandingProfile = () => {
  return (
    <section id="profil" className="mb-[140px]">
      {/* Section Title */}
      <div className="flex flex-col items-center text-center mb-16 sm:mb-20 lp-reveal">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight text-[#e0e3e5]">
          Profil Sanctuary
        </h2>
        <div className="w-12 h-0.5 bg-[#adc6ff] rounded-full" />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Visi */}
        <div className="lp-glass p-6 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] lp-border group hover:bg-white/5 transition-all duration-500 lp-reveal">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#adc6ff]/10 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 lp-border group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[#adc6ff] text-2xl">visibility</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-[#e0e3e5]">Visi</h3>
          <p className="text-[#c2c6d6] leading-relaxed text-base sm:text-lg break-words">
            Menjadi pusat peradaban digital Islam terkemuka yang mengintegrasikan
            nilai-nilai spiritual murni dengan teknologi modern untuk kemaslahatan
            umat di era global.
          </p>
        </div>

        {/* Misi */}
        <div className="lp-glass p-6 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] lp-border group hover:bg-white/5 transition-all duration-500 lp-reveal lp-delay-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#adc6ff]/10 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 lp-border group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[#adc6ff] text-2xl">explore</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-[#e0e3e5]">Misi</h3>
          <ul className="space-y-4 sm:space-y-6">
            <li className="flex items-start gap-3 sm:gap-4 text-[#c2c6d6]">
              <span className="material-symbols-outlined text-[#adc6ff] text-xl mt-0.5 shrink-0">check_circle</span>
              <span className="break-words">Fasilitas ibadah khusyuk dengan dukungan teknologi cerdas terintegrasi.</span>
            </li>
            <li className="flex items-start gap-3 sm:gap-4 text-[#c2c6d6]">
              <span className="material-symbols-outlined text-[#adc6ff] text-xl mt-0.5 shrink-0">check_circle</span>
              <span className="break-words">Pendidikan agama adaptif yang dapat diakses dari mana saja kapan saja.</span>
            </li>
            <li className="flex items-start gap-3 sm:gap-4 text-[#c2c6d6]">
              <span className="material-symbols-outlined text-[#adc6ff] text-xl mt-0.5 shrink-0">check_circle</span>
              <span className="break-words">Pemberdayaan sosial dan ekonomi berbasis transparansi blockchain.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default LandingProfile;
