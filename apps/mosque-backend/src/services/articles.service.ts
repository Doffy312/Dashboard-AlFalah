import crypto from "crypto";
import { eq, desc } from "drizzle-orm";
import { db } from "../config/db.js";
import { article } from "../db/schema/index.js";

export interface CreateArticleInput {
  title: string;
  category: string;
  type?: string;
  date: string;
  author: string;
  readTime?: string;
  image?: string;
  summary?: string;
  content: string;
}

function calculateReadTime(content: string): string {
  if (!content) return "1 min baca";
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min baca`;
}

function deriveTypeFromCategory(category: string): string {
  const catLower = (category || "").toLowerCase();
  if (catLower.includes("edukasi") || catLower.includes("artikel")) return "edukasi";
  if (catLower.includes("mendatang") || catLower.includes("agenda")) return "mendatang";
  return "terlaksana";
}

export class ArticlesService {
  async findAll() {
    return await db
      .select()
      .from(article)
      .orderBy(desc(article.date));
  }

  async findById(id: string) {
    const result = await db
      .select()
      .from(article)
      .where(eq(article.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: CreateArticleInput) {
    const id = crypto.randomUUID();

    const cleanSummary = (data.summary && data.summary.trim().length > 0)
      ? data.summary.trim()
      : (data.content ? (data.content.trim().slice(0, 150) + (data.content.length > 150 ? "..." : "")) : "");

    const cleanReadTime = (data.readTime && data.readTime.trim().length > 0)
      ? data.readTime.trim()
      : calculateReadTime(data.content || "");

    const cleanType = data.type || deriveTypeFromCategory(data.category);

    await db.insert(article).values({
      id,
      title: data.title.trim(),
      category: data.category.trim(),
      type: cleanType,
      date: data.date,
      author: data.author.trim(),
      readTime: cleanReadTime,
      image: data.image ?? "",
      summary: cleanSummary,
      content: data.content.trim(),
    });

    return this.findById(id);
  }

  async update(id: string, data: Partial<CreateArticleInput>) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updatePayload: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.category !== undefined) {
      updatePayload.category = data.category.trim();
      if (!data.type) updatePayload.type = deriveTypeFromCategory(data.category);
    }
    if (data.type !== undefined) updatePayload.type = data.type;
    if (data.date !== undefined) updatePayload.date = data.date;
    if (data.author !== undefined) updatePayload.author = data.author.trim();
    if (data.image !== undefined) updatePayload.image = data.image;
    if (data.content !== undefined) {
      updatePayload.content = data.content.trim();
      if (!data.readTime) updatePayload.readTime = calculateReadTime(data.content);
      if (data.summary === undefined && (!existing.summary || existing.summary.trim() === "")) {
        updatePayload.summary = data.content.trim().slice(0, 150) + (data.content.length > 150 ? "..." : "");
      }
    }
    if (data.summary !== undefined) updatePayload.summary = data.summary.trim();
    if (data.readTime !== undefined) updatePayload.readTime = data.readTime.trim();

    await db
      .update(article)
      .set(updatePayload)
      .where(eq(article.id, id));

    return this.findById(id);
  }

  async delete(id: string) {
    const existing = await this.findById(id);
    if (!existing) return null;

    await db.delete(article).where(eq(article.id, id));
    return existing;
  }
}

export const articlesService = new ArticlesService();

