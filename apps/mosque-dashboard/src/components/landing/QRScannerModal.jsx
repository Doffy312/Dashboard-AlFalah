import { useState, useEffect, useRef } from 'react';
import { X, QrCode, Camera, CheckCircle2, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

const QRScannerModal = ({ isOpen, onClose, onOpenRegistration }) => {
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'show'
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Safely stop camera tracks
  const stopCamera = () => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.warn('Error stopping camera tracks:', err);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setIsCameraLoading(false);
  };

  // Lock body scroll & cleanup camera on close/unmount
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      stopCamera();
      setIsScanning(false);
      setScanSuccess(false);
      setCameraError(null);
      setActiveTab('scan');
    }
    return () => {
      document.body.style.overflow = '';
      stopCamera();
    };
  }, [isOpen]);

  // Handle camera stream lifecycle when isScanning changes
  useEffect(() => {
    let isMounted = true;

    async function initCamera() {
      if (!isScanning) return;

      setIsCameraLoading(true);
      setCameraError(null);

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
          });

          if (!isMounted) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((playErr) => {
              console.warn('Video play error:', playErr);
            });
          }
          setIsCameraLoading(false);
        } else {
          if (isMounted) {
            setCameraError('Kamera tidak didukung pada browser ini. Anda dapat membuka form pendaftaran langsung.');
            setIsCameraLoading(false);
            setIsScanning(false);
          }
        }
      } catch (err) {
        console.warn('Camera access error:', err);
        if (isMounted) {
          setCameraError('Izin akses kamera ditolak atau tidak tersedia. Silakan buka form pendaftaran langsung.');
          setIsCameraLoading(false);
          setIsScanning(false);
        }
      }
    }

    if (isScanning) {
      initCamera();
    } else {
      stopCamera();
    }

    return () => {
      isMounted = false;
    };
  }, [isScanning]);

  const handleStartScan = () => {
    setCameraError(null);
    setScanSuccess(false);
    setIsScanning(true);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    stopCamera();
    setCameraError(null);
  };

  const handleSimulateScan = () => {
    setScanSuccess(true);
    stopCamera();
    setTimeout(() => {
      onClose();
      onOpenRegistration();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-[#060b10]/90 p-4 sm:p-6 pt-16 sm:pt-8 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0b131a] border border-amber-500/30 p-6 sm:p-8 rounded-3xl max-w-lg w-full relative space-y-6 shadow-2xl my-auto text-white max-h-[88vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-start pt-1 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <QrCode size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Fitur Scan QR Pendaftaran Jemaah</h2>
              <p className="text-xs text-slate-400">Scan QR Code untuk membuka form pendaftaran jemaah masjid</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Tutup Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleTabChange('scan')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'scan'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera size={16} /> Scan Kamera QR
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('show')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'show'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode size={16} /> QR Code Resmi
          </button>
        </div>

        {/* Tab Content: Scan Camera */}
        {activeTab === 'scan' && (
          <div className="space-y-4 text-center">
            <div className="relative w-full aspect-square max-w-[280px] mx-auto bg-slate-900 rounded-2xl border-2 border-dashed border-amber-500/40 overflow-hidden flex flex-col items-center justify-center p-4">
              
              {!isScanning && !scanSuccess && (
                <div className="space-y-3 p-4">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                    <Camera size={32} />
                  </div>
                  <p className="text-xs text-slate-300">Arahkan kamera smartphone ke QR Code Pendaftaran</p>
                  <button
                    type="button"
                    onClick={handleStartScan}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-95"
                  >
                    Aktifkan Kamera Scan
                  </button>
                </div>
              )}

              {isScanning && !scanSuccess && (
                <>
                  {isCameraLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 text-amber-400 gap-2">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-xs font-medium">Memulai Kamera...</span>
                    </div>
                  )}

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-xl"
                  />

                  <div className="absolute inset-4 border-2 border-emerald-400 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                    <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#10b981] animate-bounce"></div>
                    <div className="text-[10px] text-emerald-300 font-mono bg-slate-950/80 py-1 px-2 rounded-md self-center">
                      Memindai QR Code...
                    </div>
                  </div>
                </>
              )}

              {scanSuccess && (
                <div className="space-y-3 animate-in zoom-in-95 duration-150">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-300">QR Code Terdeteksi!</h4>
                  <p className="text-xs text-slate-400">Membuka formulir pendaftaran jemaah...</p>
                </div>
              )}
            </div>

            {cameraError && (
              <p className="text-xs text-amber-300 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                {cameraError}
              </p>
            )}

            {isScanning && (
              <button
                type="button"
                onClick={handleSimulateScan}
                className="w-full py-2.5 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 size={16} /> Simulasikan Pemindaian QR (Buka Form)
              </button>
            )}
          </div>
        )}

        {/* Tab Content: Show Official QR */}
        {activeTab === 'show' && (
          <div className="space-y-4 text-center">
            <div className="bg-white p-6 rounded-2xl border-4 border-amber-500/40 w-fit mx-auto shadow-xl space-y-3">
              <svg viewBox="0 0 100 100" className="w-44 h-44 mx-auto">
                <path fill="#0f172a" d="M0,0 h100 v100 h-100 z" />
                <path fill="#ffffff" d="M5,5 h30 v30 h-30 z M10,10 v20 h20 v-20 z M15,15 h10 v10 h-10 z" />
                <path fill="#ffffff" d="M65,5 h30 v30 h-30 z M70,10 v20 h20 v-20 z M15,15 h10 v10 h-10 z" />
                <path fill="#ffffff" d="M5,65 h30 v30 h-30 z M10,70 v20 h20 v-20 z M15,75 h10 v10 h-10 z" />
                <rect x="42" y="10" width="8" height="8" fill="#10b981" />
                <rect x="52" y="18" width="8" height="8" fill="#ffffff" />
                <rect x="42" y="26" width="8" height="8" fill="#ffffff" />
                <rect x="10" y="42" width="8" height="8" fill="#ffffff" />
                <rect x="22" y="50" width="8" height="8" fill="#10b981" />
                <rect x="42" y="42" width="16" height="16" fill="#f59e0b" rx="2" />
                <rect x="65" y="42" width="8" height="8" fill="#ffffff" />
                <rect x="78" y="50" width="8" height="8" fill="#ffffff" />
                <rect x="42" y="65" width="8" height="8" fill="#ffffff" />
                <rect x="52" y="75" width="8" height="8" fill="#10b981" />
                <rect x="65" y="65" width="12" height="12" fill="#ffffff" />
                <rect x="80" y="80" width="10" height="10" fill="#10b981" />
              </svg>
              <div className="text-slate-900 font-bold text-[11px] uppercase tracking-wider">QR Code Pendaftaran Jemaah</div>
            </div>
            <p className="text-xs text-slate-400">
              Tunjukkan QR Code ini kepada jemaah untuk di-scan secara langsung melalui smartphone.
            </p>
          </div>
        )}

        {/* Footer Direct Trigger Button */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
              onOpenRegistration();
            }}
            className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Buka Form Pendaftaran Langsung</span>
            <ArrowRight size={18} />
          </button>
          
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Proses pendaftaran cepat, terstruktur, &amp; privasi lokasi terjamin.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
