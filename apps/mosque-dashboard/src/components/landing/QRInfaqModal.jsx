import { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  HeartHandshake, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2, 
  Copy, 
  Check, 
  Smartphone,
  Info,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { usePublicDonate } from '../../hooks/useTransactions';

/**
 * CONFIGURASI QRIS PENERIMA DONASI
 * =========================================================================
 * Saat ini menggunakan Penerima "Al-Falah Oruna" dengan QRIS Fiktif (Uji Coba).
 * 
 * CARA MENGGANTI KE QRIS REAL NANTI:
 * 1. Ubah `isFiktif: false`
 * 2. Ganti `merchantName`, `nmid`, dan/atau pasang `realQrisImageUrl`
 * =========================================================================
 */
const QRIS_CONFIG = {
  merchantName: 'AL-FALAH ORUNA',
  subTitle: 'Donasi & Infaq Digital Resmi',
  nmid: 'ID1024589230112',
  city: 'BANDUNG',
  isFiktif: true, // Ubah ke false jika sudah pakai QRIS Real
  realQrisImageUrl: null, // Pasang URL gambar jika ada (misal: '/images/qris-real.png')
};

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000, 250000, 500000];

const QRInfaqModal = ({ isOpen, onClose, defaultType = 'Infaq', onSuccessCallback }) => {
  const [amount, setAmount] = useState(50000);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [notes, setNotes] = useState('');
  const [donasiType, setDonasiType] = useState(defaultType);
  const [showSimulasiForm, setShowSimulasiForm] = useState(false);
  
  const [isCopied, setIsCopied] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(null);

  const donateMutation = usePublicDonate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Legitimate modal state reset
      setDonasiType(defaultType || 'Infaq');
      setTransactionSuccess(null);
      setShowSimulasiForm(false);
    } else {
      document.body.style.overflow = '';
      setTransactionSuccess(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, defaultType]);

  if (!isOpen) return null;

  const finalAmount = customAmount ? Number(customAmount) : Number(amount);

  // Dynamic QRIS Payload standard string
  const dynamicPayload = `00020101021226680014ID.LINKAJA.WWW0118936009110022008915021500000000000000053033605405${finalAmount}5802ID5914${QRIS_CONFIG.merchantName}6007${QRIS_CONFIG.city}61054011562070703A0163047B4A`;

  const handleSelectPreset = (val) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(dynamicPayload);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleOpenQRISApp = () => {
    const qrisDeepLink = `qris://pay?amount=${finalAmount}&name=${encodeURIComponent(QRIS_CONFIG.merchantName)}`;
    window.location.href = qrisDeepLink;
    setTimeout(() => {
      handleCopyPayload();
    }, 800);
  };

  const handleProcessDonateSimulasi = async (e) => {
    e?.preventDefault();
    if (!finalAmount || finalAmount <= 0) return;

    donateMutation.mutate(
      {
        amount: finalAmount,
        donorName: donorName.trim() || 'Hamba Allah',
        type: donasiType,
        description: notes.trim() || `Donasi Scan QRIS (${QRIS_CONFIG.merchantName})`,
      },
      {
        onSuccess: (res) => {
          const txData = res?.data || res;
          setTransactionSuccess({
            refId: `QRIS-${Date.now().toString().slice(-8)}`,
            donorName: donorName.trim() || 'Hamba Allah',
            recipient: QRIS_CONFIG.merchantName,
            amount: finalAmount,
            type: donasiType,
            date: new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            dbId: txData?.id || 'MYSQL-DB-SYNC'
          });
          if (onSuccessCallback) {
            onSuccessCallback(`Donasi ${donasiType} ke ${QRIS_CONFIG.merchantName} sebesar ${formatCurrency(finalAmount)} tersimpan di MySQL Database!`);
          }
        }
      }
    );
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0b131a] border border-emerald-500/30 rounded-3xl max-w-lg w-full shadow-2xl text-white max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Fixed Header */}
        <div className="flex-none p-5 sm:p-6 bg-[#0b131a] border-b border-white/10 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <QrCode size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Scan QRIS Donasi</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                  {QRIS_CONFIG.isFiktif ? 'Mode Uji Coba' : 'QRIS Real'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Penerima: <strong className="text-emerald-400 font-semibold">{QRIS_CONFIG.merchantName}</strong></p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
            aria-label="Tutup Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Transaction Success View */}
          {transactionSuccess ? (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-emerald-300">Alhamdulillah! Transaksi Diverifikasi</h3>
                <p className="text-xs text-slate-300">
                  Terima kasih, donasi <strong className="text-white">{transactionSuccess.type}</strong> kepada <strong className="text-emerald-400">{transactionSuccess.recipient}</strong> telah berhasil dicatat &amp; tersimpan ke Database MySQL.
                </p>
              </div>

              {/* Receipt Box */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-left space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-white/10 text-slate-400">
                  <span>Penerima:</span>
                  <span className="text-emerald-400 font-bold">{transactionSuccess.recipient}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Ref No:</span>
                  <span className="text-amber-400 font-bold">{transactionSuccess.refId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Nama Donatur:</span>
                  <span className="text-white font-bold">{transactionSuccess.donorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Jenis Donasi:</span>
                  <span className="text-emerald-400 font-bold">{transactionSuccess.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Waktu Transaksi:</span>
                  <span className="text-slate-200">{transactionSuccess.date}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-300 font-sans uppercase">Total Nominal:</span>
                  <span className="text-emerald-400 text-lg font-sans">{formatCurrency(transactionSuccess.amount)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 italic">
                "Semoga Allah SWT menerima amal ibadah Anda dan melipatgandakan keberkahan rezeki keluarga. Aamiin."
              </p>

              <button
                onClick={onClose}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2"
              >
                <Check size={18} /> Selesai &amp; Kembali
              </button>
            </div>
          ) : (
            /* Main Form & Barcode Section */
            <div className="space-y-6">
              
              {/* Donasi Type Selector */}
              <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-semibold">
                {['Infaq', 'Sedekah', 'Wakaf'].map((typeOption) => (
                  <button
                    key={typeOption}
                    type="button"
                    onClick={() => setDonasiType(typeOption)}
                    className={`py-2 rounded-lg transition-all text-center ${
                      donasiType === typeOption
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {typeOption}
                  </button>
                ))}
              </div>

              {/* Nominal Selection Section */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Pilih Nominal Donasi {donasiType}</span>
                  <span className="text-slate-400 font-normal text-[11px]">Bebas atur nominal</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelectPreset(val)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        amount === val && !customAmount
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {formatCurrency(val)}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Input */}
                <div className="relative mt-2">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-emerald-400 font-bold">
                    Rp
                  </span>
                  <input 
                    id="customDonationAmount"
                    type="text"
                    aria-label="Nominal Kustom Donasi"
                    placeholder="Atur nominal kustom (contoh: 75.000)"
                    value={customAmount ? Number(customAmount).toLocaleString('id-ID') : ''}
                    onChange={handleCustomAmountChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
                  />
                </div>
              </div>

              {/* Visual QR Barcode Box (QRIS Direct) */}
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/40 text-center shadow-2xl space-y-3 text-slate-900 relative overflow-hidden">
                
                {/* QRIS Header Badge */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 px-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-red-600 tracking-wider uppercase">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                    QRIS Standar Pembayaran Nasional
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono font-bold">NMID: {QRIS_CONFIG.nmid}</div>
                </div>

                {/* Beneficiary Merchant Name */}
                <div className="text-center pt-1">
                  <div className="font-black text-slate-900 text-lg tracking-tight uppercase flex items-center justify-center gap-1.5">
                    <span>{QRIS_CONFIG.merchantName}</span>
                    <CheckCircle2 size={16} className="text-emerald-600 inline-block" />
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">{QRIS_CONFIG.subTitle}</div>
                </div>

                {/* High Definition SVG QR Code Barcode Graphic or Real Image */}
                <div className="bg-slate-950 p-4 rounded-2xl inline-block shadow-inner border border-slate-800 my-1 relative group">
                  {QRIS_CONFIG.realQrisImageUrl ? (
                    <img 
                      src={QRIS_CONFIG.realQrisImageUrl} 
                      alt={`QRIS ${QRIS_CONFIG.merchantName}`}
                      className="w-48 h-48 mx-auto object-contain rounded-xl"
                    />
                  ) : (
                    <svg viewBox="0 0 100 100" className="w-44 h-44 mx-auto">
                      <path fill="#ffffff" d="M0,0 h100 v100 h-100 z" />
                      
                      {/* Position detection patterns (Outer & Inner Squares) */}
                      <path fill="#0f172a" d="M5,5 h26 v26 h-26 z M9,9 v18 h18 v-18 z M13,13 h10 v10 h-10 z" />
                      <path fill="#0f172a" d="M69,5 h26 v26 h-26 z M73,9 v18 h18 v-18 z M77,13 h10 v10 h-10 z" />
                      <path fill="#0f172a" d="M5,69 h26 v26 h-26 z M9,73 v18 h18 v-18 z M13,77 h10 v10 h-10 z" />
                      
                      {/* Data modules pattern (Dynamic QR matrix) */}
                      <rect x="36" y="8" width="6" height="6" fill="#0f172a" />
                      <rect x="48" y="14" width="6" height="6" fill="#10b981" />
                      <rect x="58" y="8" width="6" height="6" fill="#0f172a" />
                      
                      <rect x="36" y="22" width="6" height="6" fill="#0f172a" />
                      <rect x="48" y="28" width="6" height="6" fill="#0f172a" />
                      <rect x="58" y="22" width="6" height="6" fill="#10b981" />

                      <rect x="8" y="36" width="6" height="6" fill="#0f172a" />
                      <rect x="20" y="44" width="6" height="6" fill="#10b981" />
                      <rect x="36" y="36" width="12" height="12" fill="#10b981" rx="2" />
                      <rect x="54" y="36" width="6" height="6" fill="#0f172a" />
                      <rect x="66" y="44" width="6" height="6" fill="#0f172a" />
                      <rect x="80" y="36" width="6" height="6" fill="#10b981" />

                      <rect x="8" y="54" width="6" height="6" fill="#10b981" />
                      <rect x="20" y="54" width="6" height="6" fill="#0f172a" />
                      <rect x="54" y="54" width="6" height="6" fill="#10b981" />
                      <rect x="66" y="54" width="6" height="6" fill="#0f172a" />
                      <rect x="80" y="54" width="6" height="6" fill="#0f172a" />

                      <rect x="36" y="69" width="6" height="6" fill="#0f172a" />
                      <rect x="48" y="77" width="6" height="6" fill="#10b981" />
                      <rect x="58" y="69" width="6" height="6" fill="#0f172a" />
                      
                      <rect x="36" y="85" width="6" height="6" fill="#10b981" />
                      <rect x="48" y="85" width="6" height="6" fill="#0f172a" />
                      <rect x="69" y="69" width="10" height="10" fill="#0f172a" />
                      <rect x="83" y="83" width="10" height="10" fill="#10b981" />
                    </svg>
                  )}

                  {/* Center Badge Icon */}
                  {!QRIS_CONFIG.realQrisImageUrl && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white p-1.5 rounded-lg shadow-lg border border-slate-200 flex items-center gap-1">
                        <HeartHandshake size={18} className="text-emerald-600" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Nominal Summary & Supporting Banks */}
                <div className="pt-1 px-2 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">Total Nominal Transaksi:</span>
                    <span className="text-emerald-700 font-black text-lg">{formatCurrency(finalAmount)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-center gap-2 pt-1 border-t border-slate-100 font-medium">
                    <span>GoPay</span> • <span>OVO</span> • <span>Dana</span> • <span>ShopeePay</span> • <span>BCA</span> • <span>Mandiri</span> • <span>BRI</span>
                  </div>
                </div>

              </div>

              {/* Direct Action Buttons for Mobile/Scan */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleOpenQRISApp}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:via-emerald-300 hover:to-teal-300 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2 border border-emerald-300/30"
                >
                  <Smartphone size={20} className="text-slate-950" />
                  <span>Buka Aplikasi QRIS / E-Wallet di HP ({formatCurrency(finalAmount)})</span>
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Info size={13} />
                    Scan barcode langsung dengan Kamera / M-Banking HP
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPayload}
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{isCopied ? 'Payload Disalin!' : 'Salin Payload QRIS'}</span>
                  </button>
                </div>
              </div>

              {/* Dev / Testing Database Simulation Section */}
              <div className="pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSimulasiForm(!showSimulasiForm)}
                  className="w-full text-center py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-white/5"
                >
                  <Sparkles size={14} className="text-emerald-400" />
                  <span>{showSimulasiForm ? 'Sembunyikan Form Catat MySQL' : 'Mode Uji Coba: Catat Donasi Langsung ke MySQL'}</span>
                </button>

                {showSimulasiForm && (
                  <form onSubmit={handleProcessDonateSimulasi} className="space-y-3 pt-3 animate-in fade-in duration-200">
                    <div>
                      <label htmlFor="donorNameInput" className="text-xs font-semibold text-slate-300 block mb-1">Nama Donatur (Opsional)</label>
                      <input 
                        id="donorNameInput"
                        type="text"
                        placeholder="Nama Anda (atau biarkan 'Hamba Allah')"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="donorNotesInput" className="text-xs font-semibold text-slate-300 block mb-1">Catatan / Doa (Opsional)</label>
                      <input 
                        id="donorNotesInput"
                        type="text"
                        placeholder="Contoh: Semoga berkah dan lancar rezeki"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={donateMutation.isPending || finalAmount <= 0}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {donateMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-emerald-400" />
                          <span>Menyimpan ke Database MySQL...</span>
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          <span>Simpan Rekam Donasi ke Database MySQL ({formatCurrency(finalAmount)})</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              <div className="flex items-center justify-center text-[10px] text-slate-500 gap-1 pt-1">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Sistem Donasi Digital Terstruktur &amp; Otomatis Valid</span>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRInfaqModal;
