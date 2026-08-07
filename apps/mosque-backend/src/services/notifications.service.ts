import crypto from "crypto";
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
    const id = crypto.randomUUID();
    await db
      .insert(notification)
      .values({
        id,
        type: data.type,
        title: data.title,
        description: data.description,
      });

    // Emit event to connected clients to fetch new notification
    try {
      const io = getSocketIO();
      io.emit("notificationUpdated");
    } catch {
      // Socket.IO might not be initialized in tests
    }

    return this.findById(id);
  }

  async findById(id: string) {
    const result = await db
      .select()
      .from(notification)
      .where(eq(notification.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async markAsRead(id: string) {
    await db
      .update(notification)
      .set({ isRead: true })
      .where(eq(notification.id, id));
    return this.findById(id);
  }
  
  async markAllAsRead() {
    await db
      .update(notification)
      .set({ isRead: true })
      .where(eq(notification.isRead, false));
    return { success: true };
  }
}

export const notificationService = new NotificationService();
