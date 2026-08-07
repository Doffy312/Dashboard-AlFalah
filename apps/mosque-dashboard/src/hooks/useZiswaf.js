import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ziswafApi } from '../lib/api';

export const useZiswafList = (filters) => {
  return useQuery({
    queryKey: ['ziswaf', filters],
    queryFn: () => ziswafApi.getAll(filters),
  });
};

export const useCreateZiswaf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ziswafApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ziswaf'] });
    },
  });
};

export const useUpdateZiswaf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => ziswafApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ziswaf'] });
    },
  });
};

export const useDeleteZiswaf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ziswafApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ziswaf'] });
    },
  });
};
