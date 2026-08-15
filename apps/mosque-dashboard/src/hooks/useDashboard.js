import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../lib/api";

export function useDashboardSummary(options = {}) {
  return useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: () => dashboardApi.getSummary(),
    ...options,
  });
}

export function useCashflow(year, options = {}) {
  return useQuery({
    queryKey: ["dashboardCashflow", year],
    queryFn: async () => {
      const data = await dashboardApi.getCashflow(year);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      const income = new Array(12).fill(0);
      const expense = new Array(12).fill(0);

      if (Array.isArray(data)) {
        data.forEach(item => {
          const mIndex = parseInt(item.month, 10) - 1;
          if (mIndex >= 0 && mIndex < 12) {
            if (item.type === 'Pemasukan') income[mIndex] = Number(item.total);
            if (item.type === 'Pengeluaran') expense[mIndex] = Number(item.total);
          }
        });
      }
      return { months, income, expense };
    },
    ...options,
  });
}

export function useAllocation(typeOrOptions = "Pengeluaran", options = {}) {
  const type = typeof typeOrOptions === 'string' ? typeOrOptions : "Pengeluaran";
  const queryOptions = typeof typeOrOptions === 'object' ? typeOrOptions : options;

  return useQuery({
    queryKey: ["dashboardAllocation", type],
    queryFn: async () => {
      const data = await dashboardApi.getAllocation(type);
      if (!Array.isArray(data) || data.length === 0) return [];
      
      const totalSum = data.reduce((sum, item) => sum + Number(item.total), 0);
      if (totalSum === 0) return [];

      return data.map(item => ({
        label: item.category,
        percentage: Math.round((Number(item.total) / totalSum) * 100)
      }));
    },
    ...queryOptions,
  });
}

export function useRecentActivity(options = {}) {
  return useQuery({
    queryKey: ["dashboardRecentActivity"],
    queryFn: () => dashboardApi.getRecentActivity(),
    ...options,
  });
}

export function useUpcomingPrograms(options = {}) {
  return useQuery({
    queryKey: ["dashboardUpcomingPrograms"],
    queryFn: () => dashboardApi.getUpcomingPrograms(),
    ...options,
  });
}

export function useCompletedPrograms(options = {}) {
  return useQuery({
    queryKey: ["dashboardCompletedPrograms"],
    queryFn: () => dashboardApi.getCompletedPrograms(),
    ...options,
  });
}

