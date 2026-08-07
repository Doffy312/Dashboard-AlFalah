import { useState, useEffect, useRef } from 'react';

/**
 * LandingPrayerBar
 * Fetches prayer times from the Aladhan API, determines the next upcoming prayer,
 * and displays a live countdown timer along with today's scheduled Petugas (if any).
 */

const SHOLAT_ORDER = [
  { name: 'Subuh', key: 'Fajr' },
  { name: 'Dzuhur', key: 'Dhuhr' },
  { name: 'Ashar', key: 'Asr' },
  { name: 'Maghrib', key: 'Maghrib' },
  { name: 'Isya', key: 'Isha' },
];

const DEFAULT_PRAYER_TIMES = {
  Fajr: '04:35',
  Dhuhr: '12:00',
  Asr: '15:18',
  Maghrib: '18:02',
  Isha: '19:15',
};

const parseTime = (timeStr) => {
  if (!timeStr) return null;
  const cleaned = timeStr.replace(/\s*\(.*\)/, '').trim();
  const [h, m] = cleaned.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return { hours: h, minutes: m };
};

const LandingPrayerBar = ({ jadwalList = [] }) => {
  const [prayerTimes, setPrayerTimes] = useState(DEFAULT_PRAYER_TIMES);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState('--:--:--');
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // Fetch prayer times on mount with fallback
  useEffect(() => {
    let cancelled = false;

    const fetchTimes = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          'https://api.aladhan.com/v1/timingsByCity?city=Bandung&country=Indonesia&method=20'
        );
        if (!res.ok) throw new Error('API network error');
        const json = await res.json();
        if (!cancelled && json.code === 200 && json.data?.timings) {
          setPrayerTimes(json.data.timings);
        }
      } catch {
        // Gracefully keep default prayer times
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTimes();
    return () => { cancelled = true; };
  }, []);

  // Determine next prayer + start countdown
  useEffect(() => {
    if (!prayerTimes) return;

    const tick = () => {
      const now = new Date();
      const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

      let found = null;
      let targetSeconds = 0;

      for (const sholat of SHOLAT_ORDER) {
        const parsed = parseTime(prayerTimes[sholat.key]);
        if (!parsed) continue;
        const sholatSeconds = parsed.hours * 3600 + parsed.minutes * 60;
        if (sholatSeconds > nowSeconds) {
          found = sholat;
          targetSeconds = sholatSeconds;
          break;
        }
      }

      if (!found) {
        found = SHOLAT_ORDER[0];
        const parsed = parseTime(prayerTimes[found.key]);
        if (parsed) {
          targetSeconds = parsed.hours * 3600 + parsed.minutes * 60 + 24 * 3600;
        }
      }

      setNextPrayer(found);

      const diff = Math.max(0, targetSeconds - nowSeconds);
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setCountdown(`${h}:${m}:${s}`);
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [prayerTimes]);

  // Find recent/today scheduled officer (Khotib / Imam / Muadzin)
  const todayOfficer = Array.isArray(jadwalList) && jadwalList.length > 0 ? jadwalList[0] : null;

  return (
    <section className="mb-[140px] lp-reveal lp-delay-1">
      <div className="lp-glass lp-border p-6 sm:p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 lp-glow">
        {/* Left: Label */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#adc6ff]/10 flex items-center justify-center lp-border">
            <span className="material-symbols-outlined text-[#adc6ff] text-2xl sm:text-3xl">schedule</span>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#c2c6d6] mb-1">
              Jadwal Berikutnya
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-[#e0e3e5]">
              {loading ? 'Memuat...' : nextPrayer ? `Shalat ${nextPrayer.name}` : 'Shalat'}
            </div>
            {todayOfficer && (
              <div className="text-xs text-[#adc6ff] font-medium mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">person</span>
                {todayOfficer.role}: {todayOfficer.personName}
              </div>
            )}
          </div>
        </div>

        {/* Center: Countdown */}
        <div className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-[#adc6ff]">
          {countdown}
        </div>

        {/* Right: Quote */}
        <div className="text-right hidden md:block">
          <p className="text-[#c2c6d6] text-sm italic max-w-[280px]">
            "Sesungguhnya shalat itu adalah fardhu yang ditentukan waktunya."
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingPrayerBar;
