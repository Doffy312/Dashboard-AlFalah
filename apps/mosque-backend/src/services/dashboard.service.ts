import { transactionService } from "./transactions.service.js";
import { programService } from "./programs.service.js";
import { jemaahService } from "./jemaah.service.js";
import { inventarisService } from "./inventaris.service.js";

// ─── Dashboard Service ───────────────────────────────────────────────
// Composes data from all domain services to power the Dashboard KPI
// cards, charts, and widgets.

export class DashboardService {
  /**
   * Main KPI summary for the 4 cards at the top of Dashboard.jsx
   * Returns: saldo, pemasukan, pengeluaran, jemaah count
   */
  async getSummary() {
    const [financeSummary, jemaahSummary, programSummary, inventarisSummary] =
      await Promise.all([
        transactionService.getSummary(),
        jemaahService.getSummary(),
        programService.getSummary(),
        inventarisService.getSummary(),
      ]);

    return {
      finance: financeSummary,
      jemaah: jemaahSummary,
      programs: programSummary,
      inventaris: inventarisSummary,
    };
  }

  /**
   * Monthly cashflow data for bar chart.
   */
  async getCashflow(year: number) {
    return transactionService.getMonthlyCashflow(year);
  }

  /**
   * Expense category distribution for donut chart.
   */
  async getAllocation() {
    return transactionService.getCategoryDistribution();
  }

  /**
   * Recent transactions for the activity timeline.
   */
  async getRecentActivity(limit = 5) {
    const recentTransactions = await transactionService.findAll({ page: 1, limit });
    return recentTransactions.data;
  }

  /**
   * Upcoming programs for the sidebar widget.
   */
  async getUpcomingPrograms(limit = 3) {
    return programService.getUpcoming(limit);
  }

  /**
   * Completed programs for the landing page widget.
   */
  async getCompletedPrograms(limit = 10) {
    return programService.getCompleted(limit);
  }
}

export const dashboardService = new DashboardService();
