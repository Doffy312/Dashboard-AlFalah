import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jemaahApi } from "../lib/api";

export function useJemaahList(filters) {
  return useQuery({
    queryKey: ["jemaah", filters],
    queryFn: () => jemaahApi.getAll(filters),
  });
}

export function useJemaahById(id) {
  return useQuery({
    queryKey: ["jemaah", id],
    queryFn: () => jemaahApi.getById(id),
    enabled: !!id,
  });
}

export function useJemaahSummary() {
  return useQuery({
    queryKey: ["jemaahSummary"],
    queryFn: () => jemaahApi.getSummary(),
  });
}

export function useCreateJemaah() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => jemaahApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jemaah"] });
      queryClient.invalidateQueries({ queryKey: ["jemaahSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}

export function useUpdateJemaah() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => jemaahApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["jemaah"] });
      queryClient.invalidateQueries({ queryKey: ["jemaah", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["jemaahSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}

export function useDeleteJemaah() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => jemaahApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jemaah"] });
      queryClient.invalidateQueries({ queryKey: ["jemaahSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}
