import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ziswafApi } from '../lib/api';
import toast from 'react-hot-toast';

export const useZiswafList = (filters, options = {}) => {
  return useQuery({
    queryKey: ['ziswaf', filters],
    queryFn: () => ziswafApi.getAll(filters),
    ...options,
  });
};

export const useCreateZiswaf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ziswafApi.create,
    onSuccess: () => {
      toast.success('Data ZISWAF berhasil ditambahkan');
      queryClient.invalidateQueries({ queryKey: ['ziswaf'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menambahkan data ZISWAF');
    },
  });
};

export const useUpdateZiswaf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => ziswafApi.update(id, data),
    onSuccess: () => {
      toast.success('Data ZISWAF berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['ziswaf'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal memperbarui data ZISWAF');
    },
  });
};

export const useDeleteZiswaf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ziswafApi.delete,
    onSuccess: () => {
      toast.success('Data ZISWAF berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['ziswaf'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menghapus data ZISWAF');
    },
  });
};

export const useVerifyZiswaf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => ziswafApi.verify(id),
    onSuccess: () => {
      toast.success('Donasi berhasil diverifikasi dan dibukukan ke Kas');
      queryClient.invalidateQueries({ queryKey: ['ziswaf'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal memverifikasi donasi');
    },
  });
};

export const useRejectZiswaf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => ziswafApi.reject(id, reason),
    onSuccess: () => {
      toast.success('Donasi berhasil ditandai ditolak/fiktif');
      queryClient.invalidateQueries({ queryKey: ['ziswaf'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menolak transaksi donasi');
    },
  });
};

