import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../lib/api";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: () => dashboardApi.getSummary(),
  });
}

export function useCashflow(year) {
  return useQuery({
    queryKey: ["dashboardCashflow", year],
    queryFn: () => dashboardApi.getCashflow(year),
  });
}

export function useAllocation() {
  return useQuery({
    queryKey: ["dashboardAllocation"],
    queryFn: () => dashboardApi.getAllocation(),
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["dashboardRecentActivity"],
    queryFn: () => dashboardApi.getRecentActivity(),
  });
}

export function useUpcomingPrograms() {
  return useQuery({
    queryKey: ["dashboardUpcomingPrograms"],
    queryFn: () => dashboardApi.getUpcomingPrograms(),
  });
}

export function useCompletedPrograms() {
  return useQuery({
    queryKey: ["dashboardCompletedPrograms"],
    queryFn: () => dashboardApi.getCompletedPrograms(),
  });
}
