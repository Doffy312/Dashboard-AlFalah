import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../lib/api";
import toast from "react-hot-toast";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.getAll(),
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => {
      toast.error(err.message || "Gagal memperbarui notifikasi");
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Semua notifikasi ditandai sudah dibaca");
    },
    onError: (err) => {
      toast.error(err.message || "Gagal menandai semua notifikasi");
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notifikasi berhasil dihapus");
    },
    onError: (err) => {
      toast.error(err.message || "Gagal menghapus notifikasi");
    },
  });
}

export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Semua notifikasi berhasil dibersihkan");
    },
    onError: (err) => {
      toast.error(err.message || "Gagal membersihkan notifikasi");
    },
  });
}
