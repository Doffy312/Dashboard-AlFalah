import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qurbanApi } from '../lib/api';
import toast from 'react-hot-toast';

export const useQurbanSummary = (year, options = {}) => {
  return useQuery({
    queryKey: ['qurban', 'summary', year],
    queryFn: () => qurbanApi.getSummary(year),
    ...options,
  });
};

export const useQurbanYears = (options = {}) => {
  return useQuery({
    queryKey: ['qurban', 'years'],
    queryFn: qurbanApi.getYears,
    ...options,
  });
};

export const useCreateQurbanYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: qurbanApi.createYear,
    onSuccess: () => {
      toast.success('Tahun Qurban berhasil ditambahkan');
      queryClient.invalidateQueries({ queryKey: ['qurban'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menambahkan tahun Qurban');
    },
  });
};

export const useQurbanGroups = (qurbanTahunId, options = {}) => {
  return useQuery({
    queryKey: ['qurban', 'groups', qurbanTahunId],
    queryFn: () => qurbanApi.getGroups(qurbanTahunId),
    enabled: !!qurbanTahunId,
    ...options,
  });
};

export const useCreateQurbanGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: qurbanApi.createGroup,
    onSuccess: () => {
      toast.success('Kelompok Qurban berhasil dibuat');
      queryClient.invalidateQueries({ queryKey: ['qurban'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal membuat kelompok Qurban');
    },
  });
};

export const useQurbanList = (filters, options = {}) => {
  return useQuery({
    queryKey: ['qurban', 'list', filters],
    queryFn: () => qurbanApi.getAll(filters),
    ...options,
  });
};

export const useCreateQurban = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: qurbanApi.create,
    onSuccess: () => {
      toast.success('Data pequrban berhasil ditambahkan');
      queryClient.invalidateQueries({ queryKey: ['qurban'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menambahkan pequrban');
    },
  });
};

export const useUpdateQurban = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => qurbanApi.update(id, data),
    onSuccess: () => {
      toast.success('Data pequrban berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['qurban'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal memperbarui data pequrban');
    },
  });
};

export const useDeleteQurban = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: qurbanApi.delete,
    onSuccess: () => {
      toast.success('Data pequrban berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['qurban'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menghapus data pequrban');
    },
  });
};
