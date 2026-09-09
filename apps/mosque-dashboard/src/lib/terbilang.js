/**
 * Helper function to convert numeric amount to Indonesian spoken words (Terbilang).
 * Example: 500000 -> "Lima Ratus Ribu Rupiah"
 */

const SATUAN = [
  '',
  'Satu',
  'Dua',
  'Tiga',
  'Empat',
  'Lima',
  'Enam',
  'Tujuh',
  'Delapan',
  'Sembilan',
  'Sepuluh',
  'Sebelas'
];

function angkaKeKata(n) {
  n = Math.floor(Math.abs(n));

  if (n < 12) {
    return SATUAN[n];
  }
  if (n < 20) {
    return `${angkaKeKata(n - 10)} Belas`;
  }
  if (n < 100) {
    const sisa = n % 10;
    return `${angkaKeKata(Math.floor(n / 10))} Puluh${sisa > 0 ? ' ' + SATUAN[sisa] : ''}`;
  }
  if (n < 200) {
    const sisa = n - 100;
    return `Seratus${sisa > 0 ? ' ' + angkaKeKata(sisa) : ''}`;
  }
  if (n < 1000) {
    const sisa = n % 100;
    return `${SATUAN[Math.floor(n / 100)]} Ratus${sisa > 0 ? ' ' + angkaKeKata(sisa) : ''}`;
  }
  if (n < 2000) {
    const sisa = n - 1000;
    return `Seribu${sisa > 0 ? ' ' + angkaKeKata(sisa) : ''}`;
  }
  if (n < 1000000) {
    const sisa = n % 1000;
    return `${angkaKeKata(Math.floor(n / 1000))} Ribu${sisa > 0 ? ' ' + angkaKeKata(sisa) : ''}`;
  }
  if (n < 1000000000) {
    const sisa = n % 1000000;
    return `${angkaKeKata(Math.floor(n / 1000000))} Juta${sisa > 0 ? ' ' + angkaKeKata(sisa) : ''}`;
  }
  if (n < 1000000000000) {
    const sisa = n % 1000000000;
    return `${angkaKeKata(Math.floor(n / 1000000000))} Miliar${sisa > 0 ? ' ' + angkaKeKata(sisa) : ''}`;
  }
  if (n < 1000000000000000) {
    const sisa = n % 1000000000000;
    return `${angkaKeKata(Math.floor(n / 1000000000000))} Triliun${sisa > 0 ? ' ' + angkaKeKata(sisa) : ''}`;
  }

  return String(n);
}

export function terbilang(nominal) {
  const num = Number(nominal);
  if (isNaN(num) || num === 0) {
    return 'Nol Rupiah';
  }
  const kata = angkaKeKata(num).trim().replace(/\s+/g, ' ');
  return `${kata} Rupiah`;
}

/**
 * Generate formatted receipt number based on transaction date and monthly sequence.
 * Format: KWT/YYYY/MM/XXX (e.g. KWT/2026/09/001)
 */
export function generateReceiptNumber(currentTx, allTransactions = []) {
  if (!currentTx || !currentTx.date) return 'KWT/0000/00/000';

  const txDate = new Date(currentTx.date);
  const year = txDate.getFullYear();
  const month = String(txDate.getMonth() + 1).padStart(2, '0');

  // Filter transactions in the same month and year
  const sameMonthTx = allTransactions
    .filter(t => {
      if (!t.date) return false;
      const d = new Date(t.date);
      return d.getFullYear() === year && String(d.getMonth() + 1).padStart(2, '0') === month;
    })
    .sort((a, b) => {
      // Sort chronologically ascending
      const timeDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (timeDiff !== 0) return timeDiff;
      // Secondary fallback to created_at or id
      return (a.createdAt || a.id || '').localeCompare(b.createdAt || b.id || '');
    });

  const index = sameMonthTx.findIndex(t => t.id === currentTx.id);
  const sequence = index >= 0 ? index + 1 : 1;
  const seqPadded = String(sequence).padStart(3, '0');

  return `KWT/${year}/${month}/${seqPadded}`;
}

export default terbilang;
