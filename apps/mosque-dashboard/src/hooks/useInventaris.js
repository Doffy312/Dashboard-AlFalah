import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventarisApi } from "../lib/api";

export function useInventarisList(filters) {
  return useQuery({
    queryKey: ["inventaris", filters],
    queryFn: () => inventarisApi.getAll(filters),
  });
}

export function useInventarisById(id) {
  return useQuery({
    queryKey: ["inventaris", id],
    queryFn: () => inventarisApi.getById(id),
    enabled: !!id,
  });
}

export function useInventarisSummary() {
  return useQuery({
    queryKey: ["inventarisSummary"],
    queryFn: () => inventarisApi.getSummary(),
  });
}

export function useCreateInventaris() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => inventarisApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventaris"] });
      queryClient.invalidateQueries({ queryKey: ["inventarisSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}

export function useUpdateInventaris() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => inventarisApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventaris"] });
      queryClient.invalidateQueries({ queryKey: ["inventaris", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["inventarisSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}

export function useDeleteInventaris() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => inventarisApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventaris"] });
      queryClient.invalidateQueries({ queryKey: ["inventarisSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}
