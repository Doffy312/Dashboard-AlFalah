import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../lib/api";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: () => dashboardApi.getSummary(),
    refetchInterval: 5000,
  });
}

export function useCashflow(year) {
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
    refetchInterval: 5000,
  });
}

export function useAllocation() {
  return useQuery({
    queryKey: ["dashboardAllocation"],
    queryFn: async () => {
      const data = await dashboardApi.getAllocation();
      if (!Array.isArray(data) || data.length === 0) return [];
      
      const totalSum = data.reduce((sum, item) => sum + Number(item.total), 0);
      if (totalSum === 0) return [];

      return data.map(item => ({
        label: item.category,
        percentage: Math.round((Number(item.total) / totalSum) * 100)
      }));
    },
    refetchInterval: 5000,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["dashboardRecentActivity"],
    queryFn: () => dashboardApi.getRecentActivity(),
    refetchInterval: 5000,
  });
}

export function useUpcomingPrograms() {
  return useQuery({
    queryKey: ["dashboardUpcomingPrograms"],
    queryFn: () => dashboardApi.getUpcomingPrograms(),
    refetchInterval: 5000,
  });
}

export function useCompletedPrograms() {
  return useQuery({
    queryKey: ["dashboardCompletedPrograms"],
    queryFn: () => dashboardApi.getCompletedPrograms(),
    refetchInterval: 5000,
  });
}
