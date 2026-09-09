import { Request, Response, NextFunction } from "express";
import { notificationService } from "../services/notifications.service.js";

export class NotificationController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    const data = await notificationService.findAll();
    res.json(data);
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;
    await notificationService.markAsRead(id);
    res.json({ success: true, message: "Notification marked as read" });
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    await notificationService.markAllAsRead();
    res.json({ success: true, message: "All notifications marked as read" });
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;
    const deleted = await notificationService.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Notifikasi tidak ditemukan" });
    }
    res.json({ success: true, message: "Notifikasi berhasil dihapus" });
  }

  async deleteAll(req: Request, res: Response, next: NextFunction) {
    await notificationService.deleteAll();
    res.json({ success: true, message: "Semua notifikasi berhasil dihapus" });
  }
}

export const notificationController = new NotificationController();
