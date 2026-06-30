import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionApi } from "../lib/api";

export function useTransactions(filters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => transactionApi.getAll(filters),
  });
}

export function useTransaction(id) {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: () => transactionApi.getById(id),
    enabled: !!id,
  });
}

export function useTransactionSummary() {
  return useQuery({
    queryKey: ["transactionSummary"],
    queryFn: () => transactionApi.getSummary(),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => transactionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardCashflow"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardAllocation"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => transactionApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardCashflow"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardAllocation"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => transactionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardCashflow"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardAllocation"] });
    },
  });
}
