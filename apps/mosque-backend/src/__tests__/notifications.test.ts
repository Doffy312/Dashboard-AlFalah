import { describe, it, expect } from "vitest";

interface MockNotification {
  id: string;
  type: string;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: Date;
}

class InMemoryNotificationStore {
  private notifications: MockNotification[] = [];

  getAll() {
    return [...this.notifications];
  }

  create(data: { type: string; title: string; description: string }) {
    const newNotif: MockNotification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      type: data.type,
      title: data.title,
      description: data.description,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  findById(id: string) {
    return this.notifications.find((n) => n.id === id) ?? null;
  }

  markAsRead(id: string) {
    const item = this.notifications.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
    }
    return item ?? null;
  }

  markAllAsRead() {
    this.notifications.forEach((n) => {
      n.isRead = true;
    });
    return { success: true };
  }

  delete(id: string) {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index === -1) {
      return null;
    }
    const [deleted] = this.notifications.splice(index, 1);
    return deleted;
  }

  deleteAll() {
    const count = this.notifications.length;
    this.notifications = [];
    return { success: true, count };
  }
}

describe("Notification Service & Deletion Unit Tests", () => {
  it("harus berhasil membuat notifikasi dan menandainya sebagai sudah dibaca", () => {
    const store = new InMemoryNotificationStore();
    const item = store.create({
      type: "Donasi",
      title: "Donasi Infaq Masuk",
      description: "Penerimaan infaq sebesar Rp 500.000",
    });

    expect(item.id).toBeDefined();
    expect(item.isRead).toBe(false);

    const updated = store.markAsRead(item.id);
    expect(updated?.isRead).toBe(true);
  });

  it("harus berhasil menghapus 1 notifikasi berdasarkan ID", () => {
    const store = new InMemoryNotificationStore();
    const item1 = store.create({
      type: "Keuangan",
      title: "Laporan Kas",
      description: "Kas bulan ini telah diperbarui",
    });
    const item2 = store.create({
      type: "Kegiatan",
      title: "Kajian Akbar",
      description: "Jadwal kajian hari Ahad",
    });

    expect(store.getAll().length).toBe(2);

    const deleted = store.delete(item1.id);
    expect(deleted).not.toBeNull();
    expect(deleted?.id).toBe(item1.id);

    const remaining = store.getAll();
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe(item2.id);
  });

  it("harus mengembalikan null jika ID notifikasi yang ingin dihapus tidak ditemukan", () => {
    const store = new InMemoryNotificationStore();
    store.create({
      type: "Pesan",
      title: "Pesan Baru",
      description: "Pesan dari jemaah",
    });

    const deleted = store.delete("non-existent-id");
    expect(deleted).toBeNull();
    expect(store.getAll().length).toBe(1);
  });

  it("harus berhasil menghapus seluruh notifikasi (deleteAll / clear-all)", () => {
    const store = new InMemoryNotificationStore();
    store.create({ type: "Keuangan", title: "A", description: "Desc A" });
    store.create({ type: "Kegiatan", title: "B", description: "Desc B" });
    store.create({ type: "Inventaris", title: "C", description: "Desc C" });

    expect(store.getAll().length).toBe(3);

    const result = store.deleteAll();
    expect(result.success).toBe(true);
    expect(result.count).toBe(3);
    expect(store.getAll().length).toBe(0);
  });

  it("harus menangani markAllAsRead dengan benar pada seluruh notifikasi yang belum dibaca", () => {
    const store = new InMemoryNotificationStore();
    store.create({ type: "Keuangan", title: "A", description: "Desc A" });
    store.create({ type: "Kegiatan", title: "B", description: "Desc B" });

    store.markAllAsRead();
    const all = store.getAll();
    expect(all.every((n) => n.isRead)).toBe(true);
  });
});
