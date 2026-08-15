import { describe, it, expect } from "vitest";

// Logika utilitas perhitungan saldo bersih & total
function calculateFinancialSummary(items: { type: "Pemasukan" | "Pengeluaran"; amount: number }[]) {
  const totalPemasukan = items
    .filter((i) => i.type === "Pemasukan")
    .reduce((sum, i) => sum + i.amount, 0);

  const totalPengeluaran = items
    .filter((i) => i.type === "Pengeluaran")
    .reduce((sum, i) => sum + i.amount, 0);

  const saldoKas = totalPemasukan - totalPengeluaran;

  return {
    totalPemasukan,
    totalPengeluaran,
    saldoKas,
  };
}

describe("Calculations & Financial Summary Unit Tests", () => {
  it("harus mengkalkulasi total pemasukan, pengeluaran, dan saldo kas bersih secara akurat", () => {
    const mockTransactions = [
      { type: "Pemasukan" as const, amount: 5000000 },
      { type: "Pemasukan" as const, amount: 2500000 },
      { type: "Pengeluaran" as const, amount: 1500000 },
      { type: "Pengeluaran" as const, amount: 500000 },
    ];

    const summary = calculateFinancialSummary(mockTransactions);

    expect(summary.totalPemasukan).toBe(7500000);
    expect(summary.totalPengeluaran).toBe(2000000);
    expect(summary.saldoKas).toBe(5500000);
  });

  it("harus menangani kasus transaksi kosong (saldo nol)", () => {
    const summary = calculateFinancialSummary([]);
    expect(summary.totalPemasukan).toBe(0);
    expect(summary.totalPengeluaran).toBe(0);
    expect(summary.saldoKas).toBe(0);
  });
});
