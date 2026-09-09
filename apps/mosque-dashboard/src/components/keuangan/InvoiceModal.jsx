import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Modal from '../common/Modal';
import InvoicePreview from './InvoicePreview';
import toast from 'react-hot-toast';
import { generateReceiptNumber } from '../../lib/terbilang';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const InvoiceModal = ({ isOpen, onClose, transaction, allTransactions = [] }) => {
  const [paperSize, setPaperSize] = useState('a4');
  const [partyName, setPartyName] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [withMaterai, setWithMaterai] = useState(() => {
    return Number(transaction?.amount || 0) > 5000000;
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printAreaRef = useRef(null);

  const receiptNo = useMemo(() => {
    return generateReceiptNumber(transaction, allTransactions);
  }, [transaction, allTransactions]);

  // Auto-detect default party name and materai requirement from transaction
  useEffect(() => {
    if (!transaction) {
      setPartyName('');
      setWithMaterai(false);
      return;
    }
    const desc = transaction.description || '';
    const isPemasukan = transaction.type === 'Pemasukan';

    const qrMatch = desc.match(/(?:Scan QR|QRIS)\s*-\s*([A-Za-z0-9\s.]+?)(?:\(|\-|,|$)/i);
    if (qrMatch && qrMatch[1]?.trim()) {
      setPartyName(qrMatch[1].trim());
    } else {
      const prepMatch = desc.match(/(?:dari|kepada|oleh|a\/n|atas nama)\s+([A-Za-z0-9\s.]+?)(?:\(|\-|,|$)/i);
      if (prepMatch && prepMatch[1]?.trim()) {
        setPartyName(prepMatch[1].trim());
      } else {
        setPartyName(isPemasukan ? 'Jemaah / Donatur' : 'Penerima Kas / Rekanan');
      }
    }

    // Auto-enable materai for transactions > 5.000.000 (UU Bea Meterai No. 10/2020)
    setWithMaterai(Number(transaction.amount || 0) > 5000000);
  }, [transaction]);

  if (!transaction) return null;

  const handlePrint = () => {
    const originalTitle = document.title;
    const cleanNo = (receiptNo || 'KWT').replace(/[\/\\]/g, '-');
    document.title = `Kwitansi-${cleanNo}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;

    setIsGeneratingPDF(true);
    const toastId = toast.loading('Sedang merender dan menyusun file PDF...');

    let wrapper = null;

    try {
      // Small pause to allow React state update & isExportMode to propagate
      await new Promise((resolve) => setTimeout(resolve, 200));

      const originalEl = printAreaRef.current?.querySelector('#invoice-print-area');
      if (!originalEl) {
        throw new Error('Elemen kuitansi tidak ditemukan di dalam printAreaRef.');
      }

      // Ensure all web fonts (Inter, Material Symbols) are fully loaded before capture
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const isA5 = paperSize === 'a5';
      const targetPixelWidth = isA5 ? 560 : 794; // Approximate A5 / A4 width in px at 96 DPI

      // Strategy: Create a tiny 1x1 overflow:hidden wrapper in the viewport.
      // Inside it, place the full-size clone with opacity:1.
      // This keeps the clone technically in-viewport (enabling browser font smoothing)
      // while being visually invisible to the user.
      // html2canvas captures the CLONE (not the wrapper), so it sees full content at opacity:1.

      wrapper = document.createElement('div');
      wrapper.id = 'invoice-pdf-wrapper';
      wrapper.style.cssText = `
        position: fixed; top: 0; left: 0;
        width: 1px; height: 1px;
        overflow: hidden;
        z-index: -9999;
        pointer-events: none;
      `;

      const clone = originalEl.cloneNode(true);
      clone.id = 'invoice-pdf-clone';
      clone.style.cssText = `
        width: ${targetPixelWidth}px;
        min-width: ${targetPixelWidth}px;
        max-width: ${targetPixelWidth}px;
        position: absolute;
        top: 0;
        left: 0;
        box-shadow: none;
        border: none;
        border-radius: 0;
        margin: 0;
        padding: ${isA5 ? '20px' : '32px'};
        background: #ffffff;
        color: #0f172a;
        overflow: visible;
        transform: none;
        opacity: 1;
        -webkit-font-smoothing: antialiased;
        text-rendering: geometricPrecision;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // Wait for browser layout reflow so scrollHeight is accurate
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const cloneHeight = clone.scrollHeight;
      if (cloneHeight < 50) {
        throw new Error(`Clone height terlalu kecil (${cloneHeight}px), kemungkinan layout gagal.`);
      }

      // Render crisp canvas at 3x scale (≈300 DPI print quality)
      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: targetPixelWidth + 80,
        width: targetPixelWidth,
        height: cloneHeight,
      });

      // Validate canvas output
      if (!canvas || canvas.width < 100 || canvas.height < 100) {
        throw new Error(`Canvas render gagal: ${canvas?.width}x${canvas?.height}`);
      }

      const imgData = canvas.toDataURL('image/png', 1.0);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: isA5 ? 'a5' : 'a4',
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8; // 8mm margin
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      let imgWidth = availableWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      let posX = margin;
      let posY = margin;

      // Scale down proportionally if content is taller than the page
      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
        posX = margin + (availableWidth - imgWidth) / 2;
      } else {
        // Slight top offset for visual balance
        posY = margin + Math.max(0, (availableHeight - imgHeight) / 6);
      }

      pdf.addImage(imgData, 'PNG', posX, posY, imgWidth, imgHeight, undefined, 'FAST');

      const cleanNo = (receiptNo || 'KWT').replace(/[\/\\]/g, '-');
      const filename = `Kwitansi-${cleanNo}.pdf`;

      pdf.save(filename);

      toast.success(`Berhasil mengunduh ${filename}`, { id: toastId });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error(`Gagal membuat PDF: ${error.message}. Mengalihkan ke dialog cetak...`, {
        id: toastId,
        duration: 5000,
      });
      setTimeout(() => {
        handlePrint();
      }, 800);
    } finally {
      if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
      setIsGeneratingPDF(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Kuitansi Resmi Keuangan"
        maxWidth="max-w-4xl"
      >
        <div className="flex flex-col gap-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface-variant/50 border border-outline-variant">
            {/* Paper Size Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1 shrink-0">
                <span className="material-symbols-outlined text-[16px]">description</span>
                Ukuran Kertas:
              </span>
              <div className="inline-flex rounded-lg bg-surface border border-outline-variant p-0.5">
                <button
                  type="button"
                  onClick={() => setPaperSize('a4')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    paperSize === 'a4'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  A4 (Standar)
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize('a5')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    paperSize === 'a5'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  A5 (Ringkas)
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                disabled={isGeneratingPDF}
                onClick={handleDownloadPDF}
                className="px-3.5 py-1.5 rounded-lg border border-outline-variant bg-surface hover:bg-surface-variant text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                title="Unduh langsung sebagai file PDF resmi"
              >
                {isGeneratingPDF ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                    <span>Menyiapkan PDF...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px] text-red-500">picture_as_pdf</span>
                    <span>Unduh PDF</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                title="Cetak Kuitansi langsung ke Printer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Cetak Kuitansi
              </button>
            </div>
          </div>

          {/* Quick Customizer (Party Name, City Titimangsa & Materai) */}
          <div className="flex flex-col gap-2 p-3 bg-surface rounded-xl border border-outline-variant">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              {/* Nama Penyetor / Penerima */}
              <div className="sm:col-span-7 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0">badge</span>
                <label className="text-xs font-semibold text-on-surface shrink-0">
                  {transaction.type === 'Pemasukan' ? 'Penyetor:' : 'Penerima:'}
                </label>
                <input
                  type="text"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="glass-input flex-1 px-2.5 py-1 rounded-md text-xs font-medium text-on-surface"
                  placeholder="Ketik atau sesuaikan nama pihak..."
                />
                {partyName && (
                  <button
                    type="button"
                    onClick={() => setPartyName(transaction.type === 'Pemasukan' ? 'Jemaah / Donatur' : 'Penerima Kas / Rekanan')}
                    className="text-[11px] text-on-surface-variant hover:text-primary shrink-0 transition-colors"
                    title="Reset nama ke default"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Kota Titimangsa */}
              <div className="sm:col-span-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0">location_on</span>
                <label className="text-xs font-semibold text-on-surface shrink-0">
                  Kota:
                </label>
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="glass-input flex-1 px-2.5 py-1 rounded-md text-xs font-medium text-on-surface"
                  placeholder="Otomatis (Profil)"
                  title="Nama kota tempat transaksi untuk titimangsa tanggal"
                />
                {customCity && (
                  <button
                    type="button"
                    onClick={() => setCustomCity('')}
                    className="text-[11px] text-on-surface-variant hover:text-primary shrink-0 transition-colors"
                    title="Kembalikan ke kota default"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Toggle Materai Rp 10.000 */}
            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/60">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={withMaterai}
                  onChange={(e) => setWithMaterai(e.target.checked)}
                  className="rounded border-outline-variant text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer"
                />
                <span className="font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-red-500">approval</span>
                  Bubuhkan Kotak Bea Meterai Rp 10.000
                </span>
                {Number(transaction.amount || 0) > 5000000 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-bold border border-red-200 dark:border-red-800">
                    Wajib Bea Meterai (&gt; Rp 5 Juta)
                  </span>
                ) : (
                  <span className="text-[10px] text-on-surface-variant">
                    (Opsional untuk transaksi &le; Rp 5 Juta)
                  </span>
                )}
              </label>

              {withMaterai && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hidden sm:inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Kotak materai aktif
                </span>
              )}
            </div>
          </div>

          {/* Invoice Live Preview Sheet Inside Modal */}
          <div className="p-2 sm:p-5 bg-slate-900/5 dark:bg-black/20 rounded-2xl border border-outline-variant overflow-x-auto flex justify-center">
            <div ref={printAreaRef} className="w-full flex justify-center">
              <InvoicePreview
                transaction={transaction}
                allTransactions={allTransactions}
                paperSize={paperSize}
                customPartyName={partyName}
                customCity={customCity}
                withMaterai={withMaterai}
                isPrintMode={false}
                isExportMode={isGeneratingPDF}
              />
            </div>
          </div>

          {/* Footer Hint */}
          <div className="flex items-center justify-between text-xs text-on-surface-variant px-1">
            <span className="flex items-center gap-1 text-[11px]">
              <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
              Kop surat & tanda tangan resmi otomatis disinkronkan dari menu Pengaturan Keuangan.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface transition-colors underline cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* DEDICATED PRINT PORTAL ATTACHED DIRECTLY TO BODY (OUTSIDE #ROOT & OUTSIDE MODAL TRANSFORMS) */}
      {isOpen &&
        createPortal(
          <div id="invoice-print-portal" data-paper-size={paperSize}>
            <InvoicePreview
              transaction={transaction}
              allTransactions={allTransactions}
              paperSize={paperSize}
              customPartyName={partyName}
              customCity={customCity}
              withMaterai={withMaterai}
              isPrintMode={true}
            />
          </div>,
          document.body
        )}
    </>
  );
};

export default InvoiceModal;
