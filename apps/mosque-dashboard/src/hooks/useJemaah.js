import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jemaahApi } from "../lib/api";
import toast from "react-hot-toast";

export function useJemaahList(filters, options = {}) {
  return useQuery({
    queryKey: ["jemaah", filters],
    queryFn: () => jemaahApi.getAll(filters),
    ...options,
  });
}

export function useJemaahById(id, options = {}) {
  return useQuery({
    queryKey: ["jemaah", id],
    queryFn: () => jemaahApi.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useJemaahSummary(options = {}) {
  return useQuery({
    queryKey: ["jemaahSummary"],
    queryFn: () => jemaahApi.getSummary(),
    ...options,
  });
}

export function useCreateJemaah() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => jemaahApi.create(data),
    onSuccess: () => {
      toast.success("Data jemaah berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["jemaah"] });
      queryClient.invalidateQueries({ queryKey: ["jemaahSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menambahkan data jemaah");
    },
  });
}

export function usePublicRegisterJemaah() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => jemaahApi.publicRegister(data),
    onSuccess: () => {
      toast.success("Pendaftaran jemaah berhasil!");
      queryClient.invalidateQueries({ queryKey: ["jemaah"] });
      queryClient.invalidateQueries({ queryKey: ["jemaahSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal mendaftar jemaah");
    },
  });
}

export function useUpdateJemaah() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => jemaahApi.update(id, data),
    onSuccess: (_, variables) => {
      toast.success("Data jemaah berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["jemaah"] });
      queryClient.invalidateQueries({ queryKey: ["jemaah", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["jemaahSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui data jemaah");
    },
  });
}

export function useDeleteJemaah() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => jemaahApi.delete(id),
    onSuccess: () => {
      toast.success("Data jemaah berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["jemaah"] });
      queryClient.invalidateQueries({ queryKey: ["jemaahSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menghapus data jemaah");
    },
  });
}
