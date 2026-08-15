import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jadwalApi } from '../lib/api';
import toast from 'react-hot-toast';

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
      toast.success('Data jadwal berhasil ditambahkan');
      queryClient.invalidateQueries({ queryKey: ['jadwal'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menambahkan data jadwal');
    },
  });
};

export const useUpdateJadwal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => jadwalApi.update(id, data),
    onSuccess: () => {
      toast.success('Data jadwal berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['jadwal'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal memperbarui data jadwal');
    },
  });
};

export const useDeleteJadwal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: jadwalApi.delete,
    onSuccess: () => {
      toast.success('Data jadwal berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['jadwal'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menghapus data jadwal');
    },
  });
};
