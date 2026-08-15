import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { programApi } from "../lib/api";
import toast from "react-hot-toast";

export function usePrograms(filters, options = {}) {
  return useQuery({
    queryKey: ["programs", filters],
    queryFn: () => programApi.getAll(filters),
    ...options,
  });
}

export function useProgram(id, options = {}) {
  return useQuery({
    queryKey: ["program", id],
    queryFn: () => programApi.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useProgramSummary(options = {}) {
  return useQuery({
    queryKey: ["programSummary"],
    queryFn: () => programApi.getSummary(),
    ...options,
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => programApi.create(data),
    onSuccess: () => {
      toast.success("Program kerja berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["programSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardUpcomingPrograms"] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menambahkan program kerja");
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => programApi.update(id, data),
    onSuccess: (_, variables) => {
      toast.success("Program kerja berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["program", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["programSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardUpcomingPrograms"] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui program kerja");
    },
  });
}

export function useUpdateProgramStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => programApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success("Status program berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["program", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["programSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardUpcomingPrograms"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardCompletedPrograms"] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui status program");
    },
  });
}

export function useCompleteProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => programApi.completeProgram(id, formData),
    onSuccess: (_, variables) => {
      toast.success("Program berhasil diselesaikan");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["program", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["programSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardUpcomingPrograms"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardCompletedPrograms"] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menyelesaikan program");
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => programApi.delete(id),
    onSuccess: () => {
      toast.success("Program kerja berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["programSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardUpcomingPrograms"] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menghapus program kerja");
    },
  });
}
