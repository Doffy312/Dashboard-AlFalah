import type { Request, Response, NextFunction } from "express";

/**
 * Strip HTML tags dari string untuk mencegah Stored XSS.
 * Menggunakan regex sederhana karena kita tidak perlu parsing HTML penuh —
 * cukup menghilangkan tag yang tidak diinginkan dari input teks biasa.
 */
function stripHtmlTags(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")   // Hapus semua HTML tags
    .replace(/&lt;/gi, "<")     // Decode common HTML entities yang mungkin lolos
    .replace(/&gt;/gi, ">")
    .replace(/<[^>]*>/g, "")   // Pass kedua untuk menangkap entity yang di-decode
    .trim();
}

/**
 * Recursively sanitize semua string values dalam sebuah object.
 */
function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = stripHtmlTags(value);
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string"
          ? stripHtmlTags(item)
          : item !== null && typeof item === "object"
            ? sanitizeObject(item)
            : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Middleware yang men-sanitize semua string values di req.body
 * untuk mencegah Stored XSS attacks.
 * 
 * Harus dipasang SEBELUM validate middleware agar data 
 * yang masuk ke Zod sudah bersih.
 * 
 * @example
 * router.post("/", requireAuth, sanitizeBody, validate(schema), controller.create);
 */
export function sanitizeBody(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
}

/**
 * Middleware yang men-sanitize query parameters.
 * Berguna untuk endpoint GET yang menerima search input.
 * 
 * @example
 * router.get("/", requireAuth, sanitizeQuery, controller.findAll);
 */
export function sanitizeQuery(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.query && typeof req.query === "object") {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === "string") {
        (req.query as Record<string, any>)[key] = stripHtmlTags(value);
      }
    }
  }
  next();
}
