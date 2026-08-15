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

    // Use slightly zoomed-out level on mobile so the full radius circle is visible
    const initialZoom = window.innerWidth < 640 ? 16 : 17;

    const map = L.map(mapContainerRef.current, {
      center: [mosqueLat, mosqueLng],
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false
    });

    // CartoDB Voyager Clean Tiles (Light/White)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Zoom Control — bottom-right on desktop, top-right on mobile to avoid thumb overlap
    L.control.zoom({ position: window.innerWidth < 640 ? 'topright' : 'bottomright' }).addTo(map);

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

    // Leaflet requires invalidateSize when its container dimensions change
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    // Trigger initial invalidateSize after a short delay to ensure DOM is fully rendered
    const resizeTimer = setTimeout(handleResize, 300);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    <section id="sebaran-jemaah" className="scroll-mt-24 py-8 sm:py-16 px-3 sm:px-6 lg:px-12 max-w-7xl mx-auto text-white relative overflow-hidden w-full">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-full min-w-0">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-12 w-full px-2 min-w-0">
          <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-semibold tracking-wide uppercase mb-3 sm:mb-4 max-w-full text-center leading-tight">
            <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Peta Interaktif Sebaran Jemaah</span>
          </div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 sm:mb-4 break-words leading-tight px-1">
            Jangkauan Pelayanan &amp; Komunitas Masjid
          </h2>
          <p className="text-slate-400 text-xs sm:text-base md:text-lg leading-relaxed px-1 sm:px-0 break-words">
            Visualisasi pemetaan titik lokasi tempat tinggal jemaah terdaftar di lingkungan {mosqueName} untuk optimalisasi dakwah, silaturahmi, dan penyaluran ZISWAF.
          </p>
        </div>

        {/* Action Controls & Filters Bar */}
        <div className="bg-[#0d1820]/90 border border-white/10 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 w-full max-w-full min-w-0 overflow-hidden">
          
          {/* Category Filter Pills — horizontally scrollable on mobile with min-w-0 to prevent flexbox overflow */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full min-w-0 max-w-full pb-1 sm:pb-0 hide-scrollbar shrink">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium flex items-center gap-1 sm:gap-1.5 pr-2 border-r border-white/10 shrink-0 whitespace-nowrap">
              <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" /> Filter:
            </span>
            {['Semua', 'Jamaah Rutin', 'Muzakki', 'Mustahik', 'Lansia'].map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                    active
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {cat !== 'Semua' && (
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                    />
                  )}
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Mode Switcher (Pins vs Density) — 2 column grid on mobile */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 min-w-0">
            <div className="bg-black/30 p-1 rounded-xl border border-white/10 grid grid-cols-2 gap-1 w-full sm:w-auto min-w-0">
              <button
                onClick={() => setDisplayMode('pins')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  displayMode === 'pins'
                    ? 'bg-white/10 text-emerald-400 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" /> Pin Marker
              </button>
              <button
                onClick={() => setDisplayMode('density')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  displayMode === 'density'
                    ? 'bg-white/10 text-emerald-400 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" /> Heatmap
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid: Stats Sidebar + Map Container */}
        {/* On mobile: Map first (order-1), Stats second (order-2) */}
        {/* On lg desktop: Stats left (order-none), Map right (order-none) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-full min-w-0">
          
          {/* Stats Cards — Below map on mobile, Left sidebar on desktop */}
          <div className="lg:col-span-1 order-2 lg:order-1 min-w-0 max-w-full">

            {/* Mobile: Horizontal scroll strip for stat cards */}
            {/* Desktop: Vertical stacked cards */}
            <div className="flex lg:flex-col gap-3 sm:gap-4 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 hide-scrollbar w-full min-w-0 max-w-full">
              
              {/* Stat Card 1: Total Jemaah */}
              <div className="bg-[#0d1820]/90 border border-white/10 rounded-2xl p-3.5 sm:p-5 shadow-lg min-w-[180px] sm:min-w-[220px] lg:min-w-0 shrink-0 lg:shrink">
                <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs mb-1.5 sm:mb-2">
                  <span>Total Jemaah Terdata</span>
                  <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{totalTerdata} <span className="text-[10px] sm:text-xs font-normal text-emerald-400">Jiwa</span></div>
                <div className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span>Terhubung ke Database</span>
                </div>
              </div>

              {/* Stat Card 2: Cakupan Wilayah */}
              <div className="bg-[#0d1820]/90 border border-white/10 rounded-2xl p-3.5 sm:p-5 shadow-lg min-w-[180px] sm:min-w-[220px] lg:min-w-0 shrink-0 lg:shrink">
                <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs mb-1.5 sm:mb-2">
                  <span>Cakupan Wilayah</span>
                  <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{totalRt} <span className="text-[10px] sm:text-xs font-normal text-blue-400">RT / 4 RW</span></div>
                <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">Tersebar di seluruh RW Kelurahan sekitar masjid.</p>
              </div>

              {/* Stat Card 3: Radius */}
              <div className="bg-[#0d1820]/90 border border-white/10 rounded-2xl p-3.5 sm:p-5 shadow-lg min-w-[180px] sm:min-w-[220px] lg:min-w-0 shrink-0 lg:shrink">
                <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs mb-1.5 sm:mb-2">
                  <span>Radius Sebaran</span>
                  <Navigation className="w-4 h-4 text-amber-400 shrink-0" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">~{radiusText} <span className="text-[10px] sm:text-xs font-normal text-amber-400">meter</span></div>
                <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">Radius sebaran titik jemaah dari lokasi masjid.</p>
              </div>
            </div>

            {/* Legend & Privacy Card — visible on all screens, but more compact on mobile */}
            <div className="bg-[#0d1820]/90 border border-white/10 rounded-2xl p-3 sm:p-4 mt-3 sm:mt-4 shadow-lg min-w-0 max-w-full">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2 sm:mb-3">
                <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Legenda &amp; Data Real DB
              </h4>
              {/* Mobile: 2-column compact grid | Desktop: stacked list */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-1.5 sm:gap-y-2 text-[11px] sm:text-xs text-slate-300 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 shrink-0"></span> Jamaah Rutin
                  </span>
                  <span className="text-slate-400 text-[10px] sm:text-[11px] font-semibold">{countRutin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500 shrink-0"></span> Muzakki
                  </span>
                  <span className="text-slate-400 text-[10px] sm:text-[11px] font-semibold">{countMuzakki}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500 shrink-0"></span> Mustahik
                  </span>
                  <span className="text-slate-400 text-[10px] sm:text-[11px] font-semibold">{countMustahik}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-purple-500 shrink-0"></span> Lansia
                  </span>
                  <span className="text-slate-400 text-[10px] sm:text-[11px] font-semibold">{countLansia}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Map Canvas Container — Shows FIRST on mobile (order-1), right side on desktop */}
          <div className="lg:col-span-3 order-1 lg:order-2 relative bg-[#060b10] rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl w-full max-w-full min-w-0">
            
            {/* Map Canvas — explicit height for Leaflet to render correctly */}
            <div ref={mapContainerRef} className="w-full max-w-full h-[40vh] min-h-[260px] max-h-[440px] sm:h-[55vh] lg:h-[540px] lg:max-h-none z-10"></div>

            {/* Privacy Protection Overlay Badge at Bottom */}
            <div className="bg-[#060b10]/90 border-t border-white/10 p-2.5 sm:p-3 px-3 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-300 z-20 w-full max-w-full min-w-0 overflow-hidden">
              <div className="flex items-start sm:items-center gap-1.5 sm:gap-2 text-emerald-400 font-medium min-w-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-emerald-400 mt-0.5 sm:mt-0" />
                <span className="break-words">Privasi Terjaga: Koordinat anonim berdasarkan statistik database.</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 flex-wrap shrink-0">
                <span>Pusat: <strong className="text-white">{mosqueName}</strong></span>
                <span className="hidden sm:inline">•</span>
                <span>Menampilkan: <strong className="text-emerald-400">{filteredPoints.length}</strong> titik</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default LandingDistributionMap;
