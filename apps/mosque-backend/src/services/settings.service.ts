import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { setting } from "../db/schema/settings.js";

const DEFAULT_SETTINGS: Record<string, any> = {
  profile: {
    orgName: 'Masjid Al-Falah',
    address: 'Jl. Raya Pendidikan No. 123, Kota Bandung',
    phone: '081234567890',
    email: 'info@masjidalfalah.id',
    ig: '@masjidalfalah',
    fb: 'Masjid Al-Falah Bandung',
    yt: 'Al-Falah TV',
    description: 'Masjid Al-Falah adalah pusat ibadah dan kegiatan sosial kemasyarakatan di Bandung.',
    vision: "Menjadi pusat peradaban dan ibadah yang memakmurkan jemaah, berlandaskan al-Qur'an dan as-Sunnah serta didukung tata kelola yang profesional dan transparan.",
    mission: [
      "Menyelenggarakan ibadah dan kajian keagamaan yang berkualitas.",
      "Mengelola dana infaq, sedekah, dan zakat secara transparan.",
      "Mengembangkan pemberdayaan jemaah, anak yatim, dan dhuafa."
    ],
    logo: '',
  },
  finance: {
    categories: [
      { id: 1, name: 'Kas Umum', type: 'income' },
      { id: 2, name: 'Dana Infak', type: 'income' },
      { id: 3, name: 'Dana Zakat', type: 'income' },
      { id: 4, name: 'Operasional', type: 'expense' },
      { id: 5, name: 'Pembangunan', type: 'expense' },
    ],
    bankInfo: {
      bankName: 'BSI (Bank Syariah Indonesia)',
      accountNumber: '7123456789',
      accountHolder: 'Masjid Al-Falah',
    },
  },
  customData: {
    jemaahStatus: ['Tetap', 'Mustahik', 'Muzakki', 'Pindahan'],
    prokerStatus: ['Direncanakan', 'Berjalan', 'Selesai', 'Dibatalkan'],
  },
  security: {
    theme: 'dark',
  },
};

export const settingsService = {
  async getAll() {
    const rows = await db.select().from(setting);
    const result = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  },

  async getByKey(key: string) {
    const rows = await db.select().from(setting).where(eq(setting.key, key));
    if (rows.length > 0) {
      return rows[0].value;
    }
    return DEFAULT_SETTINGS[key] ?? {};
  },

  async update(key: string, value: any) {
    const rows = await db.select().from(setting).where(eq(setting.key, key));
    if (rows.length > 0) {
      await db.update(setting)
        .set({ value, updatedAt: new Date() })
        .where(eq(setting.key, key));
    } else {
      await db.insert(setting).values({ key, value });
    }
    return this.getByKey(key);
  }
};
