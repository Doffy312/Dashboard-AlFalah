import { Request, Response, NextFunction } from "express";
import { notificationService } from "../services/notifications.service.js";

export class NotificationController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await notificationService.findAll();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id);
      res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead();
      res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
