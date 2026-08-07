export const mockTransactions = [
  {
    id: 'TRX-001',
    date: '2026-06-12',
    type: 'Pemasukan',
    category: 'Infaq',
    amount: 4500000,
    description: 'Infaq Kotak Amal Jumat (12 Juni)',
    programId: null
  },
  {
    id: 'TRX-002',
    date: '2026-06-10',
    type: 'Pengeluaran',
    category: 'Pembangunan',
    amount: 8000000,
    description: 'Pembelian Sound System Baru',
    programId: null
  },
  {
    id: 'TRX-003',
    date: '2026-06-08',
    type: 'Pengeluaran',
    category: 'Operasional',
    amount: 1200000,
    description: 'Pembayaran Tagihan Listrik Mei',
    programId: null
  },
  {
    id: 'TRX-004',
    date: '2026-06-05',
    type: 'Pemasukan',
    category: 'Wakaf',
    amount: 10000000,
    description: 'Wakaf Tunai dari Hamba Allah',
    programId: null
  },
  {
    id: 'TRX-005',
    date: '2026-06-02',
    type: 'Pengeluaran',
    category: 'Operasional',
    amount: 800000,
    description: 'Insentif Petugas Kebersihan',
    programId: null
  },
  {
    id: 'TRX-006',
    date: '2026-05-28',
    type: 'Pemasukan',
    category: 'Infaq',
    amount: 3800000,
    description: 'Infaq Kotak Amal Jumat (28 Mei)',
    programId: null
  },
  {
    id: 'TRX-007',
    date: '2026-05-20',
    type: 'Pengeluaran',
    category: 'Sosial',
    amount: 5000000,
    description: 'Santunan Anak Yatim Rutin',
    programId: 'PRG-002'
  },
  {
    id: 'TRX-008',
    date: '2026-05-15',
    type: 'Pemasukan',
    category: 'Zakat',
    amount: 15000000,
    description: 'Zakat Maal Bapak H. Ahmad',
    programId: null
  }
];

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};
