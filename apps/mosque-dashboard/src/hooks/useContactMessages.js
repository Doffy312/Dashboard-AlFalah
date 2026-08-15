import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactMessagesApi } from "../lib/api";
import toast from "react-hot-toast";

export function useContactMessages(options = {}) {
  return useQuery({
    queryKey: ["contact-messages"],
    queryFn: () => contactMessagesApi.getAll(),
    ...options,
  });
}

export function useCreateContactMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => contactMessagesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => {
      console.error("Gagal mengirim pesan:", err);
    },
  });
}

export function useUpdateMessageStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => contactMessagesApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Status pesan berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
    onError: (err) => {
      toast.error(err.message || "Gagal memperbarui status pesan");
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => contactMessagesApi.delete(id),
    onSuccess: () => {
      toast.success("Pesan berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
    onError: (err) => {
      toast.error(err.message || "Gagal menghapus pesan");
    },
  });
}
