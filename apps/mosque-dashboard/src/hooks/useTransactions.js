import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionApi } from "../lib/api";
import toast from "react-hot-toast";

export function useTransactions(filters, options = {}) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => transactionApi.getAll(filters),
    select: (result) => result?.data ?? result,
    ...options,
  });
}

export function useTransaction(id, options = {}) {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: () => transactionApi.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useTransactionSummary(options = {}) {
  return useQuery({
    queryKey: ["transactionSummary"],
    queryFn: () => transactionApi.getSummary(),
    ...options,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => transactionApi.create(data),
    onSuccess: () => {
      toast.success("Transaksi berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardCashflow"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardAllocation"] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menambahkan transaksi");
    },
  });
}

export function usePublicDonate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => transactionApi.publicDonate(data),
    onSuccess: () => {
      toast.success("Donasi Infaq Scan QR Berhasil!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardCashflow"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardAllocation"] });
      queryClient.invalidateQueries({ queryKey: ["ziswaf"] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memproses donasi");
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => transactionApi.update(id, data),
    onSuccess: (_, variables) => {
      toast.success("Transaksi berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardCashflow"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardAllocation"] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui transaksi");
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => transactionApi.delete(id),
    onSuccess: () => {
      toast.success("Transaksi berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardCashflow"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardAllocation"] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menghapus transaksi");
    },
  });
}
