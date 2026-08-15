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
  image: string;
  summary: string;
  content: string;
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
    await db.insert(article).values({
      id,
      title: data.title,
      category: data.category,
      type: data.type ?? "terlaksana",
      date: data.date,
      author: data.author,
      readTime: data.readTime ?? "3 min baca",
      image: data.image,
      summary: data.summary,
      content: data.content,
    });
    return this.findById(id);
  }

  async update(id: string, data: Partial<CreateArticleInput>) {
    const existing = await this.findById(id);
    if (!existing) return null;

    await db
      .update(article)
      .set({
        ...data,
        updatedAt: new Date(),
      })
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
