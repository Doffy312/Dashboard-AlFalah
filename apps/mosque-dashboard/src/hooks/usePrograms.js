import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { programApi } from "../lib/api";

export function usePrograms(filters) {
  return useQuery({
    queryKey: ["programs", filters],
    queryFn: () => programApi.getAll(filters),
  });
}

export function useProgram(id) {
  return useQuery({
    queryKey: ["program", id],
    queryFn: () => programApi.getById(id),
    enabled: !!id,
  });
}

export function useProgramSummary() {
  return useQuery({
    queryKey: ["programSummary"],
    queryFn: () => programApi.getSummary(),
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => programApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["programSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardUpcomingPrograms"] });
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => programApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["program", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["programSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardUpcomingPrograms"] });
    },
  });
}

  export function useUpdateProgramStatus() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, status }) => programApi.updateStatus(id, status),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["programs"] });
        queryClient.invalidateQueries({ queryKey: ["program", variables.id] });
        queryClient.invalidateQueries({ queryKey: ["programSummary"] });
      },
    });
  }
  
  export function useCompleteProgram() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, formData }) => programApi.completeProgram(id, formData),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["programs"] });
        queryClient.invalidateQueries({ queryKey: ["program", variables.id] });
        queryClient.invalidateQueries({ queryKey: ["programSummary"] });
        queryClient.invalidateQueries({ queryKey: ["dashboardCompletedPrograms"] });
      },
    });
  }

export function useDeleteProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => programApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["programSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardUpcomingPrograms"] });
    },
  });
}
