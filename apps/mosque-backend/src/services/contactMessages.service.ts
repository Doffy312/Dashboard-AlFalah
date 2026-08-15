import crypto from "crypto";
import { eq, desc } from "drizzle-orm";
import { db, pool } from "../config/db.js";
import { contactMessages } from "../db/schema/index.js";
import { notificationService } from "./notifications.service.js";

export interface CreateContactMessageInput {
  fullName: string;
  email: string;
  whatsapp: string;
  subject: string;
  message: string;
}

export class ContactMessagesService {
  private isTableEnsured = false;

  private async ensureTable() {
    if (this.isTableEnsured) return;
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id VARCHAR(36) PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          whatsapp VARCHAR(50) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'Baru',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      this.isTableEnsured = true;
    } catch (err) {
      console.error("Gagal memastikan tabel contact_messages:", err);
    }
  }

  async findAll() {
    await this.ensureTable();
    const data = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
    return data;
  }

  async findById(id: string) {
    await this.ensureTable();
    const result = await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: CreateContactMessageInput) {
    await this.ensureTable();
    const id = crypto.randomUUID();
    
    await db.insert(contactMessages).values({
      id,
      fullName: data.fullName,
      email: data.email,
      whatsapp: data.whatsapp,
      subject: data.subject,
      message: data.message,
      status: "Baru",
    });

    // Auto generate notification & emit socket.io update to dashboard admins
    try {
      await notificationService.create({
        type: "Pesan",
        title: `Pesan Baru: ${data.fullName}`,
        description: `Subjek: ${data.subject} (${data.email})`,
      });
    } catch (err) {
      console.error("Gagal membuat notifikasi pesan:", err);
    }

    return this.findById(id);
  }

  async updateStatus(id: string, status: string) {
    await this.ensureTable();
    await db
      .update(contactMessages)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(contactMessages.id, id));

    return this.findById(id);
  }

  async delete(id: string) {
    await this.ensureTable();
    await db
      .delete(contactMessages)
      .where(eq(contactMessages.id, id));
    return { success: true };
  }
}

export const contactMessagesService = new ContactMessagesService();
