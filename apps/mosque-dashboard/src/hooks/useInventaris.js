import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventarisApi } from "../lib/api";
import toast from "react-hot-toast";

export function useInventarisList(filters, options = {}) {
  return useQuery({
    queryKey: ["inventaris", filters],
    queryFn: () => inventarisApi.getAll(filters),
    ...options,
  });
}

export function useInventarisById(id, options = {}) {
  return useQuery({
    queryKey: ["inventaris", id],
    queryFn: () => inventarisApi.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useInventarisSummary(options = {}) {
  return useQuery({
    queryKey: ["inventarisSummary"],
    queryFn: () => inventarisApi.getSummary(),
    ...options,
  });
}

export function useCreateInventaris() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => inventarisApi.create(data),
    onSuccess: () => {
      toast.success("Data inventaris berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["inventaris"] });
      queryClient.invalidateQueries({ queryKey: ["inventarisSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menambahkan data inventaris");
    },
  });
}

export function useUpdateInventaris() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => inventarisApi.update(id, data),
    onSuccess: (_, variables) => {
      toast.success("Data inventaris berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["inventaris"] });
      queryClient.invalidateQueries({ queryKey: ["inventaris", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["inventarisSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui data inventaris");
    },
  });
}

export function useDeleteInventaris() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => inventarisApi.delete(id),
    onSuccess: () => {
      toast.success("Data inventaris berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["inventaris"] });
      queryClient.invalidateQueries({ queryKey: ["inventarisSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menghapus data inventaris");
    },
  });
}
