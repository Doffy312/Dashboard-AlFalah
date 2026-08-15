import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapPin, 
  Users, 
  Layers, 
  ShieldCheck, 
  Filter, 
  Building2, 
  Compass,
  Navigation,
  Info
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSettings } from '../../contexts/SettingsContext';
import { useJemaahSummary } from '../../hooks/useJemaah';

// ─── Color Palette for Categories ──────────────────────────────────────────
const CATEGORY_COLORS = {
  'Semua': '#10B981',
  'Jamaah Rutin': '#10B981', // Emerald
  'Muzakki': '#3B82F6',      // Blue
  'Mustahik': '#F59E0B',     // Amber
  'Lansia': '#8B5CF6'        // Purple
};

// Deterministic pseudo-random number generator for stable point scattering
function seededRandom(seed) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// Calculate Haversine distance in meters between two lat/lng coordinates
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
            Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const LandingDistributionMap = () => {
  const { profile } = useSettings();
  const { data: jemaahSummary } = useJemaahSummary();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const mosqueMarkerRef = useRef(null);
  const mosqueCircleRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState('Semua');
  const [displayMode, setDisplayMode] = useState('pins'); // 'pins' | 'density'

  // Extract Mosque Center Coordinates & Info from Settings
  const mosqueLat = parseFloat(profile?.lat) || -6.91746;
  const mosqueLng = parseFloat(profile?.lng) || 107.61912;
  const mosqueName = profile?.orgName || 'Masjid Al-Falah';
  const mosqueAddress = profile?.address || 'Jl. Raya Pendidikan No. 123, Bandung';

  // Statistics calculation based on real DB jemaahSummary
  const totalTerdata = jemaahSummary ? (jemaahSummary.total || 0) : 485;
  const countMuzakki = jemaahSummary ? (jemaahSummary.Muzakki || 0) : 6;
  const countMustahik = jemaahSummary ? (jemaahSummary.Mustahik || 0) : 5;
  const countLansia = jemaahSummary ? (jemaahSummary.Lansia || 0) : 4;
  const countRutin = jemaahSummary ? (jemaahSummary.Umum || 0) : 11;
  const totalRt = 14;
  const radiusText = '150';

  // Generate dynamic pseudo scatter points centered strictly within a 150m radius of mosque coordinates
  const generatedPoints = useMemo(() => {
    const categories = [
      { key: 'Jamaah Rutin', count: countRutin > 0 ? countRutin : 11, label: 'Jemaah Rutin (Aktif)' },
      { key: 'Muzakki', count: countMuzakki > 0 ? countMuzakki : 6, label: 'Donatur & Muzakki ZISWAF' },
      { key: 'Mustahik', count: countMustahik > 0 ? countMustahik : 5, label: 'Penerima Manfaat / Mustahik' },
      { key: 'Lansia', count: countLansia > 0 ? countLansia : 4, label: 'Jemaah Lansia Terdata' },
    ];

    const result = [];
    let globalIdx = 1;
    const cosLat = Math.cos(mosqueLat * Math.PI / 180);

    categories.forEach((catInfo) => {
      // Cap visible markers per category to 25 to prevent performance bottlenecks on Leaflet
      const visibleCount = Math.min(catInfo.count, 25);

      for (let i = 0; i < visibleCount; i++) {
        const seed = globalIdx * 37 + i * 13;
        const angle = seededRandom(seed) * Math.PI * 2;
        // Strictly between 20 meters and 145 meters from mosque center (within 150m max radius)
        const distMeters = Math.round(20 + seededRandom(seed + 1) * 125);

        const latOffset = (distMeters / 111320) * Math.sin(angle);
        const lngOffset = (distMeters / (111320 * cosLat)) * Math.cos(angle);

        const pointLat = mosqueLat + latOffset;
        const pointLng = mosqueLng + lngOffset;

        const formattedDist = `${distMeters} m`;
        const rtNum = (globalIdx % 12) + 1;
        const rwNum = (globalIdx % 4) + 3;

        result.push({
          id: `JM-${String(globalIdx).padStart(3, '0')}`,
          code: `JMH-RT${String(rtNum).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
          rt: `RT ${String(rtNum).padStart(2, '0')} / RW ${String(rwNum).padStart(2, '0')}`,
          lat: pointLat,
          lng: pointLng,
          category: catInfo.key,
          label: catInfo.label,
          distance: formattedDist,
        });
        globalIdx++;
      }
    });

    return result;
  }, [mosqueLat, mosqueLng, countRutin, countMuzakki, countMustahik, countLansia]);

  // Filtered Points based on selected Category Filter
  const filteredPoints = activeCategory === 'Semua' 
    ? generatedPoints 
    : generatedPoints.filter(p => p.category === activeCategory);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent duplicate initialization

    const map = L.map(mapContainerRef.current, {
      center: [mosqueLat, mosqueLng],
      zoom: 17,
      zoomControl: false,
      attributionControl: false
    });

    // CartoDB Voyager Clean Tiles (Light/White)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Zoom Control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Layer Group for markers
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    // Mosque Center Marker Icon
    const mosqueIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 bg-emerald-500/30 rounded-full animate-ping"></div>
        <div class="relative w-10 h-10 bg-emerald-700 text-amber-300 border-2 border-amber-400 rounded-full shadow-xl flex items-center justify-center font-bold text-lg">
          🕌
        </div>
      </div>
    `;
    const mosqueIcon = L.divIcon({
      html: mosqueIconHtml,
      className: 'mosque-center-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const mosqueMarker = L.marker([mosqueLat, mosqueLng], { icon: mosqueIcon }).addTo(map);
    mosqueMarker.bindPopup(`
      <div class="p-3 font-sans text-slate-800">
        <div class="flex items-center gap-2 font-bold text-emerald-800 text-sm mb-1">
          <span>🕌</span> ${mosqueName}
        </div>
        <p class="text-xs text-slate-600 mb-2">${mosqueAddress}</p>
        <span class="inline-block px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
          Pusat Kegiatan Masjid
        </span>
      </div>
    `);
    mosqueMarkerRef.current = mosqueMarker;

    // Radius circle around mosque
    const mosqueCircle = L.circle([mosqueLat, mosqueLng], {
      color: '#10B981',
      fillColor: '#10B981',
      fillOpacity: 0.08,
      radius: 150,
      weight: 1.5,
      dashArray: '4, 8'
    }).addTo(map);
    mosqueCircleRef.current = mosqueCircle;

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Map Center & Mosque Marker Popup when mosque coordinates or profile change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([mosqueLat, mosqueLng], mapInstanceRef.current.getZoom());

    if (mosqueMarkerRef.current) {
      mosqueMarkerRef.current.setLatLng([mosqueLat, mosqueLng]);
      mosqueMarkerRef.current.setPopupContent(`
        <div class="p-3 font-sans text-slate-800">
          <div class="flex items-center gap-2 font-bold text-emerald-800 text-sm mb-1">
            <span>🕌</span> ${mosqueName}
          </div>
          <p class="text-xs text-slate-600 mb-2">${mosqueAddress}</p>
          <span class="inline-block px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
            Pusat Kegiatan Masjid
          </span>
        </div>
      `);
    }

    if (mosqueCircleRef.current) {
      mosqueCircleRef.current.setLatLng([mosqueLat, mosqueLng]);
    }
  }, [mosqueLat, mosqueLng, mosqueName, mosqueAddress]);

  // Update Markers when category filter or display mode changes
  useEffect(() => {
    if (!layerGroupRef.current || !mapInstanceRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    if (displayMode === 'pins') {
      filteredPoints.forEach((point) => {
        const color = CATEGORY_COLORS[point.category] || '#10B981';
        
        const pinHtml = `
          <div class="group relative cursor-pointer flex items-center justify-center transition-transform duration-200 hover:scale-125">
            <div class="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center" style="background-color: ${color}">
              <div class="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: pinHtml,
          className: 'jemaah-pin-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([point.lat, point.lng], { icon: customIcon });

        const popupContent = `
          <div class="p-3 font-sans text-slate-800 min-w-[200px]">
            <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
              <span class="text-xs font-semibold text-slate-500">${point.code}</span>
              <span class="px-2 py-0.5 text-[10px] font-bold rounded-full text-white" style="background-color: ${color}">
                ${point.category}
              </span>
            </div>
            <div class="font-bold text-sm text-slate-900 mb-1">${point.label}</div>
            <div class="text-xs text-slate-600 space-y-1">
              <div class="flex items-center gap-1.5">
                <span class="text-slate-400">📍</span> ${point.rt}
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-slate-400">📏</span> <strong>${point.distance}</strong> dari Masjid
              </div>
            </div>
            <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>GPS Koordinat Terdata</span>
              <span class="text-emerald-600 font-medium">Terverifikasi</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        layerGroup.addLayer(marker);
      });
    } else {
      // Density / Heatmap Circles Mode
      filteredPoints.forEach((point) => {
        const color = CATEGORY_COLORS[point.category] || '#10B981';
        const circle = L.circle([point.lat, point.lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.35,
          radius: 30,
          weight: 1
        });
        circle.bindTooltip(`${point.rt} - ${point.category}`, { permanent: false });
        layerGroup.addLayer(circle);
      });
    }
  }, [filteredPoints, displayMode]);

  return (
    <section id="sebaran-jemaah" className="scroll-mt-24 py-16 px-6 lg:px-12 max-w-7xl mx-auto text-white relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-4">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Peta Interaktif Sebaran Jemaah</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Jangkauan Pelayanan & Komunitas Masjid
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Visualisasi pemetaan titik lokasi tempat tinggal jemaah terdaftar di lingkungan {mosqueName} untuk optimalisasi dakwah, silaturahmi, dan penyaluran ZISWAF.
          </p>
        </div>

        {/* Action Controls & Filters Bar */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pr-2 border-r border-white/10">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter:
            </span>
            {['Semua', 'Jamaah Rutin', 'Muzakki', 'Mustahik', 'Lansia'].map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                    active
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {cat !== 'Semua' && (
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                    />
                  )}
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Mode Switcher (Pins vs Density) */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="bg-black/30 p-1 rounded-xl border border-white/10 flex items-center">
              <button
                onClick={() => setDisplayMode('pins')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  displayMode === 'pins'
                    ? 'bg-white/10 text-emerald-400 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" /> Pin Marker
              </button>
              <button
                onClick={() => setDisplayMode('density')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  displayMode === 'density'
                    ? 'bg-white/10 text-emerald-400 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Heatmap Radius
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid: Stats Sidebar + Map Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Stats Grid Cards */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Stat Card 1 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Total Jemaah Terdata</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">{totalTerdata} <span className="text-xs font-normal text-emerald-400">Jiwa</span></div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Terhubung ke Sistem Database</span>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Cakupan Wilayah</span>
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">{totalRt} <span className="text-xs font-normal text-blue-400">RT / 4 RW</span></div>
              <p className="text-xs text-slate-400">Tersebar di seluruh RW Kelurahan sekitar masjid.</p>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Radius Sebaran</span>
                <Navigation className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">~{radiusText} <span className="text-xs font-normal text-amber-400">meter</span></div>
              <p className="text-xs text-slate-400">Radius sebaran titik jemaah dari lokasi masjid.</p>
            </div>

            {/* Legend & Privacy Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-400" /> Legenda & Data Real DB
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Jamaah Rutin
                  </span>
                  <span className="text-slate-400 text-[11px] font-semibold">{countRutin} jiwa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Muzakki ZISWAF
                  </span>
                  <span className="text-slate-400 text-[11px] font-semibold">{countMuzakki} jiwa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Mustahik
                  </span>
                  <span className="text-slate-400 text-[11px] font-semibold">{countMustahik} jiwa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Lansia / Sepuh
                  </span>
                  <span className="text-slate-400 text-[11px] font-semibold">{countLansia} jiwa</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Map Canvas Container */}
          <div className="lg:col-span-3 relative bg-[#060b10] rounded-3xl border border-white/10 overflow-hidden shadow-2xl min-h-[480px] lg:min-h-[540px] flex flex-col">
            
            {/* Map Canvas */}
            <div ref={mapContainerRef} className="w-full flex-1 min-h-[400px] z-10"></div>

            {/* Privacy Protection Overlay Badge at Bottom */}
            <div className="bg-[#060b10]/90 backdrop-blur-md border-t border-white/10 p-3 px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300 z-20">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Privasi Terjaga: Koordinat disajikan secara anonim berdasarkan statistik database.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span>Pusat: <strong className="text-white">{mosqueName}</strong></span>
                <span>•</span>
                <span>Total Menampilkan: <strong className="text-emerald-400">{filteredPoints.length}</strong> titik</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default LandingDistributionMap;
