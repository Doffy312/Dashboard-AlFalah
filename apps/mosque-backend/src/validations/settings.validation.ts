import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

export const settingKeyEnum = z.enum(["profile", "finance", "customData", "security"], {
  errorMap: () => ({ message: "Kategori pengaturan harus salah satu dari: profile, finance, customData, security" }),
});

export const profileSettingsSchema = z.object({
  orgName: z.string().trim().min(1, "Nama organisasi/masjid wajib diisi").max(255),
  address: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  email: z.string().trim().email("Format email tidak valid").optional().or(z.literal("")),
  ig: z.string().trim().optional().default(""),
  fb: z.string().trim().optional().default(""),
  yt: z.string().trim().optional().default(""),
  description: z.string().trim().optional().default(""),
  vision: z.string().trim().optional().default(""),
  mission: z.array(z.string()).optional().default([]),
  logo: z.string().optional().default(""),
  lat: z.coerce.number().optional().default(-6.91746),
  lng: z.coerce.number().optional().default(107.61912),
}).passthrough();

export const financeSettingsSchema = z.object({
  categories: z.array(z.object({
    id: z.union([z.string(), z.number()]),
    name: z.string().trim().min(1, "Nama kategori tidak boleh kosong"),
    type: z.enum(["income", "expense"]),
  })).optional(),
  bankInfo: z.object({
    bankName: z.string().optional().default(""),
    accountNumber: z.string().optional().default(""),
    accountHolder: z.string().optional().default(""),
  }).optional(),
  signatures: z.object({
    bendaharaName: z.string().optional().default(""),
    bendaharaTitle: z.string().optional().default(""),
    bendaharaSignature: z.string().optional().default(""),
    ketuaName: z.string().optional().default(""),
    ketuaTitle: z.string().optional().default(""),
    ketuaSignature: z.string().optional().default(""),
  }).optional(),
}).passthrough();

export const customDataSettingsSchema = z.object({
  jemaahStatus: z.array(z.string()).optional().default([]),
  prokerStatus: z.array(z.string()).optional().default([]),
}).passthrough();

export const securitySettingsSchema = z.object({
  theme: z.enum(["light", "dark"]).optional().default("dark"),
}).passthrough();

export function validateSettingBody(req: Request, res: Response, next: NextFunction): void {
  const keyResult = settingKeyEnum.safeParse(req.params.key);
  if (!keyResult.success) {
    res.status(400).json({
      error: "Bad Request",
      message: keyResult.error.errors[0]?.message || "Invalid settings key",
    });
    return;
  }

  const key = keyResult.data;
  let schema: z.ZodSchema;

  switch (key) {
    case "profile":
      schema = profileSettingsSchema;
      break;
    case "finance":
      schema = financeSettingsSchema;
      break;
    case "customData":
      schema = customDataSettingsSchema;
      break;
    case "security":
      schema = securitySettingsSchema;
      break;
  }

  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validasi data pengaturan gagal",
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }
    next(error);
  }
}
