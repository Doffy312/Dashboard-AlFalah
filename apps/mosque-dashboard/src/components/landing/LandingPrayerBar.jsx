import { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock } from 'lucide-react';

/**
 * LandingPrayerBar
 * Jadwal Shalat dengan Zona Waktu Tinggede Selatan, Sigi, Sulawesi Tengah (WITA).
 * Desain ornamental khas Islam dengan skema warna landing page (Emerald & Amber / Gold).
 */

const PRAYER_KEYS = [
  { name: 'Subuh', key: 'Fajr' },
  { name: 'Dzuhur', key: 'Dhuhr' },
  { name: 'Ashar', key: 'Asr' },
  { name: 'Maghrib', key: 'Maghrib' },
  { name: 'Isya', key: 'Isha' }
];

// Fallback waktu shalat standar Kemenag RI untuk Tinggede Selatan, Sigi, Sulawesi Tengah (WITA)
const DEFAULT_PRAYER_TIMES = {
  Fajr: '04:44',
  Dhuhr: '12:06',
  Asr: '15:26',
  Maghrib: '18:08',
  Isha: '19:20'
};

/**
 * Komponen SVG Ornament Gerbang Arch Islam (Sisi Kiri / Kanan)
 * Didesain presisi secara simetris di posisi tengah vertikal dan horizontal.
 */
const IslamicArchOrnament = ({ side = 'left' }) => (
  <div
    className={`hidden sm:flex items-center justify-center shrink-0 w-12 sm:w-16 md:w-20 self-stretch select-none pointer-events-none ${
      side === 'right' ? 'scale-x-[-1]' : ''
    }`}
  >
    <svg
      viewBox="0 0 80 100"
      className="w-full h-auto max-h-28 text-amber-500/50 fill-current drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`goldGrad-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#d97706" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id={`starGlow-${side}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
          <stop offset="70%" stopColor="#059669" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Symmetrical Arch Ribbon */}
      <path
        d="M 80,2 C 45,2 18,22 18,50 C 18,78 45,98 80,98 L 80,86 C 52,86 30,70 30,50 C 30,30 52,14 80,14 Z"
        fill={`url(#goldGrad-${side})`}
      />

      {/* Decorative Inner Arc */}
      <path
        d="M 80,20 C 60,20 42,32 42,50 C 42,68 60,80 80,80"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        opacity="0.6"
      />

      {/* Perfectly Centered Rub el Hizb (Islamic 8-Pointed Star) */}
      <g transform="translate(0, 0)">
        {/* Outer Square */}
        <rect
          x="27"
          y="37"
          width="26"
          height="26"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.5"
          rx="1"
          opacity="0.9"
        />
        {/* Rotated Square (45deg) */}
        <rect
          x="27"
          y="37"
          width="26"
          height="26"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.5"
          rx="1"
          transform="rotate(45 40 50)"
          opacity="0.9"
        />

        {/* Radiating Accent Lines */}
        <line x1="40" y1="30" x2="40" y2="70" stroke="#f59e0b" strokeWidth="0.8" opacity="0.5" />
        <line x1="20" y1="50" x2="60" y2="50" stroke="#f59e0b" strokeWidth="0.8" opacity="0.5" />
        <line x1="26" y1="36" x2="54" y2="64" stroke="#f59e0b" strokeWidth="0.6" opacity="0.4" />
        <line x1="26" y1="64" x2="54" y2="36" stroke="#f59e0b" strokeWidth="0.6" opacity="0.4" />

        {/* Emerald Center Jewel */}
        <circle cx="40" cy="50" r="5" fill={`url(#starGlow-${side})`} stroke="#f59e0b" strokeWidth="1" />
        <circle cx="40" cy="50" r="2" fill="#ffffff" />
      </g>
    </svg>
  </div>
);

const CACHE_KEY = 'prayer_times_cache';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

// Load cached prayer times from localStorage, or use defaults
function loadCachedPrayerTimes() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached.timings && cached.hijri && (Date.now() - cached.ts < CACHE_TTL)) {
        return cached;
      }
    }
  } catch { /* ignore */ }
  return null;
}

const LandingPrayerBar = () => {
  const cached = loadCachedPrayerTimes();
  // Render immediately with cached times or fallback — NO loading state
  const [prayerTimes, setPrayerTimes] = useState(cached?.timings || DEFAULT_PRAYER_TIMES);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState('--:--:--');
  const [hijriDate, setHijriDate] = useState(cached?.hijri || '');
  const [gregorianDate, setGregorianDate] = useState('');

  // Synchronize Gregorian & Hijri Date + Fetch API (background refresh)
  useEffect(() => {
    let cancelled = false;

    // Tanggal Masehi Bahasa Indonesia
    const now = new Date();
    const formattedGregorian = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Date formatting needs to be in effect for timezone accuracy
    setGregorianDate(formattedGregorian);

    // Fetch dari Aladhan API menggunakan koordinat presisi Tinggede Selatan, Sigi (Lat: -0.9254, Long: 119.8732)
    const fetchPrayerTimes = async () => {
      try {
        const res = await fetch(
          'https://api.aladhan.com/v1/timings?latitude=-0.9254&longitude=119.8732&method=20'
        );
        if (!res.ok) throw new Error('Network error');
        const json = await res.json();

        if (!cancelled && json.code === 200 && json.data) {
          if (json.data.timings) {
            setPrayerTimes(json.data.timings);
          }
          const hijriStr = json.data.date?.hijri
            ? `${json.data.date.hijri.day} ${json.data.date.hijri.month?.en || ''} ${json.data.date.hijri.year} H`
            : '';
          if (hijriStr) setHijriDate(hijriStr);

          // Cache to localStorage for instant render next visit
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              timings: json.data.timings,
              hijri: hijriStr,
              ts: Date.now(),
            }));
          } catch { /* quota exceeded — ignore */ }
        }
      } catch (err) {
        console.warn('Gagal memuat jadwal online, menggunakan fallback Tinggede Selatan:', err);
      }
    };

    fetchPrayerTimes();
    return () => { cancelled = true; };
  }, []);

  // Live Timer Countdown to Next Prayer
  useEffect(() => {
    if (!prayerTimes) return;

    const tick = () => {
      const now = new Date();
      const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

      let upcoming = null;
      let targetSeconds = 0;

      for (const item of PRAYER_KEYS) {
        const rawTime = prayerTimes[item.key];
        if (!rawTime) continue;
        const cleaned = rawTime.replace(/\s*\(.*\)/, '').trim();
        const [h, m] = cleaned.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) continue;

        const prayerSeconds = h * 3600 + m * 60;
        if (prayerSeconds > nowSeconds) {
          upcoming = { ...item, time: cleaned };
          targetSeconds = prayerSeconds;
          break;
        }
      }

      // Jika seluruh jadwal hari ini telah berlalu (setelah Isya), target berikutnya adalah Subuh besok
      if (!upcoming) {
        const subuhTime = (prayerTimes.Fajr || '04:44').replace(/\s*\(.*\)/, '').trim();
        const [h, m] = subuhTime.split(':').map(Number);
        targetSeconds = (h || 4) * 3600 + (m || 44) * 60 + 24 * 3600;
        upcoming = { ...PRAYER_KEYS[0], time: subuhTime };
      }

      setNextPrayer(upcoming);

      const diff = Math.max(0, targetSeconds - nowSeconds);
      const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const seconds = String(diff % 60).padStart(2, '0');

      setCountdown(`${hours}:${minutes}:${seconds}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  return (
    <section id="jadwal-shalat" className="py-10 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto scroll-mt-24">
      {/* Title & Location Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2 flex items-center justify-center gap-2">
          <span>Jadwal Shalat</span>
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-300 font-medium">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold">
            <MapPin size={14} /> Tinggede Selatan, Sigi, Sulawesi Tengah (WITA)
          </span>

          {(gregorianDate || hijriDate) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
              <Calendar size={14} /> {gregorianDate} {hijriDate ? `| ${hijriDate}` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Main Ornamental Schedule Box */}
      <div className="relative max-w-4xl mx-auto">
        {/* Outer Frame with Glowing Backdrop */}
        <div className="relative rounded-[2rem] bg-[#091118]/90 border border-amber-500/30 backdrop-blur-xl shadow-2xl shadow-emerald-950/50 p-4 sm:p-6 text-white flex items-stretch justify-between overflow-visible">

          {/* Left Decorative Arch Ornament */}
          <IslamicArchOrnament side="left" />

          {/* 5 Shalat Schedule Grid */}
          <div className="grid grid-cols-5 flex-1 divide-x divide-white/10 sm:divide-amber-500/20 text-center px-1 sm:px-4 py-2 sm:py-3 items-center">
            {PRAYER_KEYS.map((sholat) => {
              const isNext = nextPrayer?.key === sholat.key;
              const rawTime = prayerTimes[sholat.key] || DEFAULT_PRAYER_TIMES[sholat.key];
              const timeDisplay = rawTime.replace(/\s*\(.*\)/, '').trim();

              return (
                <div
                  key={sholat.key}
                  className={`flex flex-col items-center justify-center py-2.5 sm:py-3 px-1 transition-all duration-300 relative ${
                    isNext
                      ? 'bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/50 rounded-2xl shadow-lg shadow-amber-500/10 scale-[1.03]'
                      : 'hover:bg-white/5 rounded-xl'
                  }`}
                >
                  {/* Glowing active indicator dot */}
                  {isNext && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  )}

                  {/* Prayer Name */}
                  <span
                    className={`text-xs sm:text-sm lg:text-base tracking-wide mb-1 sm:mb-1.5 ${
                      isNext ? 'font-extrabold text-amber-300' : 'font-semibold text-slate-300'
                    }`}
                  >
                    {sholat.name}
                  </span>

                  {/* Prayer Time */}
                  <span
                    className={`text-sm sm:text-lg lg:text-xl font-bold tracking-tight ${
                      isNext ? 'text-white font-black' : 'text-slate-200'
                    }`}
                  >
                    {timeDisplay}
                  </span>

                  {/* Subtitle / Next badge text if active */}
                  <span
                    className={`text-[10px] mt-1 hidden sm:inline-block ${
                      isNext ? 'text-amber-400 font-bold uppercase tracking-wider' : 'text-slate-500'
                    }`}
                  >
                    {isNext ? 'Berikutnya' : sholat.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right Decorative Arch Ornament */}
          <IslamicArchOrnament side="right" />
        </div>

        {/* Floating Bottom Pill Badge (Prayer Countdown) */}
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20">
          <div className="px-5 sm:px-7 py-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide shadow-xl shadow-amber-500/30 flex items-center gap-2 border border-amber-300/40 shrink-0 whitespace-nowrap">
            <Clock size={16} className="text-slate-950 animate-pulse" />
            <span>
              Prayer Countdown:{' '}
              <strong className="font-mono text-sm sm:text-base text-slate-950 font-black tracking-widest ml-1">
                {countdown}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPrayerBar;
