import { eq, desc } from "drizzle-orm";
import { db } from "../config/db.js";
import { notification } from "../db/schema/index.js";
import { getSocketIO } from "../lib/socket.js";

export interface CreateNotificationInput {
  type: string;
  title: string;
  description: string;
}

export class NotificationService {
  async findAll() {
    const data = await db
      .select()
      .from(notification)
      .orderBy(desc(notification.createdAt))
      .limit(50); // Fetch latest 50 notifications
    return data;
  }

  async create(data: CreateNotificationInput) {
    const result = await db
      .insert(notification)
      .values({
        type: data.type,
        title: data.title,
        description: data.description,
      });

    // Emit event to connected clients to fetch new notification
    const io = getSocketIO();
    if (io) {
      io.emit("notificationUpdated");
    }

    return result[0];
  }

  async markAsRead(id: string) {
    const result = await db
      .update(notification)
      .set({ isRead: true })
      .where(eq(notification.id, id));
    return result[0] ?? null;
  }
  
  async markAllAsRead() {
    const result = await db
      .update(notification)
      .set({ isRead: true })
      .where(eq(notification.isRead, false));
    return result[0] ?? null;
  }
}

export const notificationService = new NotificationService();
