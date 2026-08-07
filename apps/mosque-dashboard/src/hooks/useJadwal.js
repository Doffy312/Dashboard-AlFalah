import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jadwalApi } from '../lib/api';

export const useJadwalList = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['jadwal', filters],
    queryFn: () => jadwalApi.getAll(filters),
    ...options,
  });
};

export const useCreateJadwal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: jadwalApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal'] });
    },
  });
};

export const useUpdateJadwal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => jadwalApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal'] });
    },
  });
};

export const useDeleteJadwal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: jadwalApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal'] });
    },
  });
};
