import { useMemo } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { terbilang, generateReceiptNumber } from '../../lib/terbilang';

const InvoicePreview = ({
  transaction,
  allTransactions = [],
  paperSize = 'a4',
  customPartyName = '',
  customCity = '',
  withMaterai = undefined,
  isPrintMode = false,
  isExportMode = false,
}) => {
  const { profile, finance } = useSettings();

  const receiptNo = useMemo(() => {
    return generateReceiptNumber(transaction, allTransactions);
  }, [transaction, allTransactions]);

  const isPemasukan = transaction?.type === 'Pemasukan';

  // Robust date formatting without UTC timezone day-shift
  const formattedDate = useMemo(() => {
    if (!transaction?.date) return '';
    try {
      const cleanDate = String(transaction.date).split('T')[0];
      const parts = cleanDate.split('-');
      if (parts.length === 3) {
        const d = parseInt(parts[2], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[0], 10);
        return new Date(y, m, d).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
      return new Date(transaction.date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return String(transaction.date);
    }
  }, [transaction?.date]);

  // Intelligent detection for donor or recipient name (excluding 'untuk' which indicates purpose)
  const detectedParty = useMemo(() => {
    if (customPartyName && customPartyName.trim()) {
      return customPartyName.trim();
    }
    const desc = transaction?.description || '';

    // 1. Scan QR pattern: e.g. "Donasi Infaq Scan QR - Bpk. Hendra Pratama (Kajian)"
    const qrMatch = desc.match(/(?:Scan QR|QRIS)\s*-\s*([A-Za-z0-9\s.]+?)(?:\(|-|,|$)/i);
    if (qrMatch && qrMatch[1]?.trim()) {
      return qrMatch[1].trim();
    }

    // 2. Preposition pattern: "dari X", "kepada X", "oleh X", "a/n X", "atas nama X"
    const prepMatch = desc.match(/(?:dari|kepada|oleh|a\/n|atas nama)\s+([A-Za-z0-9\s.]+?)(?:\(|-|,|$)/i);
    if (prepMatch && prepMatch[1]?.trim()) {
      return prepMatch[1].trim();
    }

    // 3. Fallback
    return isPemasukan ? 'Jemaah / Donatur' : 'Penerima Kas / Rekanan';
  }, [transaction?.description, isPemasukan, customPartyName]);

  // Intelligent city detection for Titimangsa tempat
  const detectedCity = useMemo(() => {
    if (customCity && customCity.trim()) {
      return customCity.trim();
    }
    if (!profile?.address) return 'Bandung';
    const parts = profile.address.split(',');
    if (parts.length > 1) {
      const last = parts[parts.length - 1].trim();
      const cleaned = last.replace(/\s*\d{5}$/, '').trim();
      if (cleaned) return cleaned;
    }
    return 'Bandung';
  }, [profile?.address, customCity]);

  // Bea Meterai regulation (UU No. 10/2020: nominal > Rp 5.000.000)
  const hasMaterai = useMemo(() => {
    if (typeof withMaterai === 'boolean') {
      return withMaterai;
    }
    return Number(transaction?.amount || 0) > 5000000;
  }, [withMaterai, transaction?.amount]);

  // Full accounting currency format with cents (,00)
  const formattedAmountWithCents = useMemo(() => {
    const amt = Number(transaction?.amount || 0);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amt);
  }, [transaction?.amount]);

  if (!transaction) return null;

  const terbilangText = terbilang(transaction.amount);
  const signatures = finance?.signatures || {};
  const isA5 = paperSize === 'a5';

  return (
    <div
      id="invoice-print-area"
      data-paper-size={paperSize}
      className={`invoice-sheet bg-white text-slate-900 mx-auto transition-all ${
        isPrintMode || isExportMode
          ? 'shadow-none border-none rounded-none w-full'
          : 'shadow-lg rounded-xl border border-slate-200'
      } ${
        isA5
          ? 'w-full max-w-[620px] p-5 text-xs'
          : 'w-full max-w-[780px] p-8 text-sm'
      }`}
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      {/* KOP SURAT RESMI */}
      <div className={`flex items-center justify-between border-b-2 border-slate-800 ${
        isA5 ? 'pb-2.5 mb-3' : 'pb-4 mb-5'
      }`}>
        <div className="flex items-center gap-3 sm:gap-4">
          {profile?.logo ? (
            <img
              src={profile.logo}
              alt="Logo Masjid"
              className={isA5 ? 'w-12 h-12 object-contain rounded-lg shrink-0' : 'w-16 h-16 object-contain rounded-lg shrink-0'}
            />
          ) : (
            <div className={`rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-sm shrink-0 ${
              isA5 ? 'w-11 h-11 text-lg' : 'w-16 h-16 text-2xl'
            }`}>
              🕌
            </div>
          )}
          <div>
            <h1 className={`font-bold text-slate-900 uppercase tracking-wide leading-tight ${
              isA5 ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'
            }`}>
              {profile?.orgName || 'Masjid Al-Falah'}
            </h1>
            <p className={`text-slate-600 leading-relaxed max-w-[480px] ${
              isA5 ? 'text-[10px] mt-0.5' : 'text-[11px] mt-0.5'
            }`}>
              {profile?.address || 'Jl. Raya Pendidikan No. 123, Kota Bandung'}
            </p>
            <p className={`text-slate-500 ${
              isA5 ? 'text-[9px] mt-0.5' : 'text-[10px] mt-0.5'
            }`}>
              {profile?.phone ? `Telp/WA: ${profile.phone}` : ''} {profile?.email ? `• Email: ${profile.email}` : ''}
            </p>
          </div>
        </div>

        {/* Badge Tipe Kuitansi */}
        <div className="text-right shrink-0">
          <div className={`inline-block font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider border ${
            isPemasukan
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-amber-50 text-amber-800 border-amber-300'
          } ${isA5 ? 'text-[9px]' : 'text-xs'}`}>
            {isPemasukan ? 'Bukti Penerimaan Kas' : 'Bukti Pengeluaran Kas'}
          </div>
          <div className={`text-slate-500 font-mono font-bold ${
            isA5 ? 'text-[10px] mt-0.5' : 'text-[11px] mt-1'
          }`}>
            {receiptNo}
          </div>
        </div>
      </div>

      {/* JUDUL DOKUMEN & METADATA */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-50 rounded-lg border border-slate-200 ${
        isA5 ? 'p-2 mb-3' : 'p-3 mb-4'
      }`}>
        <div>
          <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-semibold">Nomor Bukti</span>
          <span className="font-bold font-mono text-slate-900 text-xs sm:text-sm">{receiptNo}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-semibold">Tanggal Transaksi</span>
          <span className="font-medium text-slate-900 text-xs">{formattedDate}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-semibold">Kategori Kas</span>
          <span className="inline-block px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-slate-200 text-slate-800">
            {transaction.category}
          </span>
        </div>
      </div>

      {/* DETAIL TRANSAKSI */}
      <div className={isA5 ? 'space-y-1.5 mb-3' : 'space-y-2.5 mb-5'}>
        {/* Pihak Terkait */}
        <div className="grid grid-cols-12 gap-2 py-1 border-b border-slate-100">
          <div className="col-span-4 sm:col-span-3 font-semibold text-slate-600">
            {isPemasukan ? 'Telah Diterima Dari' : 'Diserahkan Kepada'}
          </div>
          <div className="col-span-8 sm:col-span-9 text-slate-900 font-bold break-words">
            : {detectedParty}
          </div>
        </div>

        {/* Uraian / Keterangan */}
        <div className="grid grid-cols-12 gap-2 py-1 border-b border-slate-100">
          <div className="col-span-4 sm:col-span-3 font-semibold text-slate-600">
            Uraian / Keterangan
          </div>
          <div className="col-span-8 sm:col-span-9 text-slate-800 leading-relaxed break-words">
            : {transaction.description || 'Tidak ada catatan transaksi'}
          </div>
        </div>

        {/* Terbilang */}
        <div className="grid grid-cols-12 gap-2 py-1 border-b border-slate-100 items-start">
          <div className="col-span-4 sm:col-span-3 font-semibold text-slate-600">
            Terbilang
          </div>
          <div className="col-span-8 sm:col-span-9">
            <span className="text-slate-900 font-medium italic bg-emerald-50/80 border border-emerald-200/80 px-2.5 py-0.5 rounded block leading-normal text-[10px] sm:text-xs">
              &ldquo; {terbilangText} &rdquo;
            </span>
          </div>
        </div>

        {/* Nominal Besar */}
        <div className={`bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl flex items-center justify-between ${
          isA5 ? 'py-2 px-3 my-2' : 'p-3.5 my-3'
        }`}>
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-300 font-semibold">
              Jumlah Uang / Nominal
            </span>
            {hasMaterai && (
              <span className="text-[9px] text-amber-300 font-medium flex items-center gap-1 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Dikenakan Bea Meterai Rp 10.000
              </span>
            )}
          </div>
          <div className={`font-extrabold tracking-tight font-mono ${
            isA5 ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'
          }`}>
            {formattedAmountWithCents}
          </div>
        </div>
      </div>

      {/* INFORMASI REKENING (IF BANK INFO AVAILABLE) */}
      {finance?.bankInfo?.bankName && isPemasukan && (
        <div className={`rounded-lg border border-dashed border-slate-300 bg-slate-50/60 flex items-center justify-between ${
          isA5 ? 'p-1.5 mb-3 text-[9px]' : 'p-2.5 mb-4 text-[11px]'
        }`}>
          <span className="text-slate-600">
            Penyaluran resmi via <strong>{finance.bankInfo.bankName}</strong> No. Rek: <strong>{finance.bankInfo.accountNumber}</strong> a/n {finance.bankInfo.accountHolder}
          </span>
          <span className="text-emerald-700 font-bold flex items-center gap-1 shrink-0 ml-2">
            ✓ Transaksi Sah
          </span>
        </div>
      )}

      {/* TANDA TANGAN SECTION */}
      <div className={isA5 ? 'mt-3 pt-1' : 'mt-5 pt-2'}>
        {/* Titimangsa Tempat & Tanggal Transaksi */}
        <div className={`flex justify-end text-slate-700 font-semibold ${
          isA5 ? 'text-[9px] mb-1.5' : 'text-xs mb-2.5'
        }`}>
          <span>{detectedCity}, {formattedDate}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          {/* Kolom 1: Penyetor / Penerima */}
          <div className={`flex flex-col justify-between ${
            isA5 ? 'min-h-[100px]' : 'min-h-[125px]'
          }`}>
            <div className={`text-slate-600 font-medium ${isA5 ? 'text-[10px]' : 'text-[11px]'}`}>
              {isPemasukan ? 'Penyetor / Donatur,' : 'Penerima Uang,'}
            </div>
            <div className="flex-1"></div>
            <div className={`text-center font-bold text-slate-800 border-t border-slate-400 mx-1 pt-1 break-words leading-tight ${
              isA5 ? 'text-[10px]' : 'text-xs'
            }`}>
              ( {detectedParty} )
            </div>
          </div>

          {/* Kolom 2: Bendahara (Penandatangan Utama & Slot Materai) */}
          <div className={`flex flex-col justify-between ${
            isA5 ? 'min-h-[100px]' : 'min-h-[125px]'
          }`}>
            <div className={`text-slate-600 font-medium ${isA5 ? 'text-[10px]' : 'text-[11px]'}`}>
              {signatures.bendaharaTitle || 'Bendahara DKM,'}
            </div>

            {/* Area Tanda Tangan & Kotak Materai */}
            <div className={`flex-1 relative flex items-center justify-center p-0.5 min-h-[50px] ${hasMaterai ? 'my-0.5' : ''}`}>
              {/* Kotak Fisik Materai Rp 10.000 (Sesuai UU Bea Meterai No. 10/2020) */}
              {hasMaterai && (
                <div
                  className={`border-2 border-dashed border-red-500/80 bg-red-50/60 rounded flex flex-col items-center justify-center text-center p-0.5 select-none pointer-events-none shadow-sm ${
                    isA5 ? 'w-20 h-11' : 'w-24 h-13'
                  }`}
                  title="Area Penempelan Bea Meterai Rp 10.000"
                >
                  <span className={`font-black tracking-widest text-red-700 uppercase leading-none ${isA5 ? 'text-[7px]' : 'text-[8px]'}`}>
                    MATERAI
                  </span>
                  <span className={`font-extrabold text-red-800 leading-tight ${isA5 ? 'text-[9px]' : 'text-[10px]'}`}>
                    Rp 10.000
                  </span>
                  <span className={`text-[6px] text-red-600/90 font-medium leading-none tracking-tighter ${isA5 ? 'hidden' : 'block'}`}>
                    TEMPEL DI SINI
                  </span>
                </div>
              )}

              {/* Digital Signature Image / Cap Basah - Ditata agar menimpa materai */}
              {signatures.bendaharaSignature ? (
                <img
                  src={signatures.bendaharaSignature}
                  alt="Tanda Tangan Bendahara"
                  className={`object-contain mix-blend-multiply filter contrast-125 pointer-events-none ${
                    hasMaterai ? 'absolute inset-0 m-auto z-10' : ''
                  } ${
                    isA5 ? 'max-h-12 max-w-[100px]' : 'max-h-16 max-w-[130px]'
                  }`}
                />
              ) : (
                <div className={`text-slate-400 italic ${
                  hasMaterai
                    ? 'absolute bottom-0 text-[7px] bg-white/90 px-1 rounded border border-slate-200 pointer-events-none'
                    : 'text-[9px]'
                }`}>
                  {hasMaterai ? '(Ttd menimpa materai)' : '(Cap / Tanda Tangan)'}
                </div>
              )}
            </div>

            <div className={`text-center font-bold text-slate-900 border-t border-slate-400 mx-1 pt-1 break-words leading-tight ${
              isA5 ? 'text-[10px]' : 'text-xs'
            }`}>
              {signatures.bendaharaName || 'Bendahara'}
            </div>
          </div>

          {/* Kolom 3: Ketua DKM (Mengetahui) */}
          <div className={`flex flex-col justify-between ${
            isA5 ? 'min-h-[100px]' : 'min-h-[125px]'
          }`}>
            <div className={`text-slate-600 font-medium leading-tight ${isA5 ? 'text-[10px]' : 'text-[11px]'}`}>
              Mengetahui,<br />
              <span className="text-[9px] text-slate-500">{signatures.ketuaTitle || 'Ketua DKM'}</span>
            </div>

            {/* Digital Signature Image if available */}
            <div className="flex-1 flex items-center justify-center p-0.5 min-h-[50px]">
              {signatures.ketuaSignature ? (
                <img
                  src={signatures.ketuaSignature}
                  alt="Tanda Tangan Ketua DKM"
                  className={`object-contain mix-blend-multiply filter contrast-125 ${
                    isA5 ? 'max-h-12 max-w-[100px]' : 'max-h-16 max-w-[130px]'
                  }`}
                />
              ) : (
                <div className="text-[9px] text-slate-400 italic">
                  (Cap / Tanda Tangan)
                </div>
              )}
            </div>

            <div className={`text-center font-bold text-slate-900 border-t border-slate-400 mx-1 pt-1 break-words leading-tight ${
              isA5 ? 'text-[10px]' : 'text-xs'
            }`}>
              {signatures.ketuaName || 'Ketua DKM'}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER & VERIFIKASI KEASLIAN */}
      <div className={`border-t border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between text-slate-400 gap-1.5 ${
        isA5 ? 'mt-3 pt-1.5 text-[8px]' : 'mt-6 pt-2.5 text-[9px]'
      }`}>
        <div>
          Dokumen ini diterbitkan sah oleh Sistem Informasi Keuangan {profile?.orgName || 'Masjid Al-Falah'}.
          {hasMaterai && (
            <span className="text-red-600 font-semibold ml-1">
              • Dokumen sah dibubuhi Bea Meterai Rp 10.000
            </span>
          )}
        </div>
        <div className="font-mono text-slate-400">
          ID: {transaction.id}
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
