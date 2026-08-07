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
}

export const notificationController = new NotificationController();
