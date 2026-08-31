import { useState, useEffect } from 'react';

const JadwalSholatWidget = () => {
  const [jadwal, setJadwal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        setLoading(true);
        const [resJakarta, resPalu, resMadinah] = await Promise.all([
          fetch('https://api.aladhan.com/v1/timingsByCity?city=Jakarta&country=Indonesia&method=20'),
          fetch('https://api.aladhan.com/v1/timingsByCity?city=Palu&country=Indonesia&method=20'),
          fetch('https://api.aladhan.com/v1/timingsByCity?city=Madinah&country=Saudi%20Arabia&method=4')
        ]);
        
        const dataJakarta = await resJakarta.json();
        const dataPalu = await resPalu.json();
        const dataMadinah = await resMadinah.json();
        
        if (dataJakarta.code === 200 && dataPalu.code === 200 && dataMadinah.code === 200) {
          setJadwal({
            jakarta: dataJakarta.data.timings,
            palu: dataPalu.data.timings,
            madinah: dataMadinah.data.timings
          });
        } else {
          setError('Gagal mengambil jadwal sholat');
        }
      } catch {
        setError('Koneksi terputus');
      } finally {
        setLoading(false);
      }
    };

    fetchJadwal();
  }, []);

  const sholatList = [
    { name: 'Subuh', key: 'Fajr', icon: 'routine' },
    { name: 'Dzuhur', key: 'Dhuhr', icon: 'light_mode' },
    { name: 'Ashar', key: 'Asr', icon: 'wb_twilight' },
    { name: 'Maghrib', key: 'Maghrib', icon: 'dark_mode' },
    { name: 'Isya', key: 'Isha', icon: 'nights_stay' },
  ];

  const locations = [
    { id: 'jakarta', name: 'Jakarta', region: 'WIB' },
    { id: 'palu', name: 'Palu, Sulteng', region: 'WITA' },
    { id: 'madinah', name: 'Madinah', region: 'Arab Saudi' },
  ];

  return (
    <div className="bg-surface rounded-2xl p-6 border border-outline-variant flex flex-col w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-on-surface">Jadwal Sholat</h3>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-xl h-[150px]">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-error text-body-sm text-center py-md h-[150px] flex items-center justify-center">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {locations.map(loc => (
            <div key={loc.id} className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant hover:bg-surface-variant/50 transition-colors">
              <div className="flex justify-between items-center mb-5">
                <h4 className="text-[15px] font-semibold text-on-surface">{loc.name}</h4>
                <span className="text-[11px] font-medium text-on-surface-variant bg-surface px-2.5 py-1 rounded-md border border-outline-variant">{loc.region}</span>
              </div>
              <div className="flex flex-col gap-1">
                {sholatList.map(sholat => (
                  <div key={sholat.name} className="flex justify-between items-center p-2 rounded-lg hover:bg-surface-variant transition-colors group">
                    <div className="flex items-center gap-2.5 text-on-surface-variant group-hover:text-on-surface transition-colors">
                      <span className="material-symbols-outlined text-[18px]">{sholat.icon}</span>
                      <span className="text-[13px] font-medium">{sholat.name}</span>
                    </div>
                    <span className="text-[14px] font-bold text-on-surface group-hover:text-on-surface transition-colors">{jadwal?.[loc.id]?.[sholat.key]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JadwalSholatWidget;
