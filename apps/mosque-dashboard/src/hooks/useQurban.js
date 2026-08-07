import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qurbanApi } from '../lib/api';

export const useQurbanList = (filters) => {
  return useQuery({
    queryKey: ['qurban', filters],
    queryFn: () => qurbanApi.getAll(filters),
  });
};

export const useCreateQurban = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: qurbanApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qurban'] });
    },
  });
};

export const useUpdateQurban = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => qurbanApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qurban'] });
    },
  });
};

export const useDeleteQurban = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: qurbanApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qurban'] });
    },
  });
};
