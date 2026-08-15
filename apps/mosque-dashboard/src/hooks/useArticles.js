import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articleApi } from "../lib/api";
import toast from "react-hot-toast";

export function useArticles(options = {}) {
  return useQuery({
    queryKey: ["articles"],
    queryFn: () => articleApi.getAll(),
    ...options,
  });
}

export function useArticle(id, options = {}) {
  return useQuery({
    queryKey: ["article", id],
    queryFn: () => articleApi.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => articleApi.create(data),
    onSuccess: () => {
      toast.success("Berita berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (err) => {
      toast.error(err.message || "Gagal menambahkan berita");
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => articleApi.update(id, data),
    onSuccess: () => {
      toast.success("Berita berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (err) => {
      toast.error(err.message || "Gagal memperbarui berita");
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => articleApi.delete(id),
    onSuccess: () => {
      toast.success("Berita berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (err) => {
      toast.error(err.message || "Gagal menghapus berita");
    },
  });
}
