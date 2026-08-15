import { eq, desc, asc, count, sql, and, like } from "drizzle-orm";
import { db } from "../config/db.js";
import { qurbanTahun, qurbanKelompok, pequrban } from "../db/schema/qurban.js";
import { jemaah } from "../db/schema/jemaah.js";

export const qurbanService = {
  // ─── 1. Summary Statistics & Yearly Trend Chart ───────────────────────────
  async getSummaryStats(yearFilter?: string | number) {
    // Get active year or selected year
    let targetYear: number;
    if (yearFilter) {
      targetYear = typeof yearFilter === 'string' ? parseInt(yearFilter, 10) : yearFilter;
    } else {
      const activeYear = await db.select().from(qurbanTahun).orderBy(desc(qurbanTahun.tahun)).limit(1);
      targetYear = activeYear[0]?.tahun || new Date().getFullYear();
    }

    const yearRecord = await db.select().from(qurbanTahun).where(eq(qurbanTahun.tahun, targetYear)).limit(1);
    const targetYearId = yearRecord[0]?.id;

    let totalPequrban = 0;
    let totalSapi = 0;
    let totalKambing = 0;

    if (targetYearId) {
      const counts = await db
        .select({
          jenisHewan: pequrban.jenisHewan,
          total: count(pequrban.id),
        })
        .from(pequrban)
        .where(eq(pequrban.qurbanTahunId, targetYearId))
        .groupBy(pequrban.jenisHewan);

      counts.forEach((item) => {
        const cnt = Number(item.total);
        totalPequrban += cnt;
        if (item.jenisHewan === 'Sapi') {
          totalSapi += cnt;
        } else if (item.jenisHewan === 'Kambing') {
          totalKambing += cnt;
        }
      });
    }

    // Yearly trend chart dataset
    const allYears = await db.select().from(qurbanTahun).orderBy(asc(qurbanTahun.tahun));
    const yearlyTrend = await Promise.all(
      allYears.map(async (y) => {
        const pequrbanInYear = await db
          .select({
            jenisHewan: pequrban.jenisHewan,
            cnt: count(pequrban.id),
          })
          .from(pequrban)
          .where(eq(pequrban.qurbanTahunId, y.id))
          .groupBy(pequrban.jenisHewan);

        let total = 0;
        let sapi = 0;
        let kambing = 0;

        pequrbanInYear.forEach((row) => {
          const c = Number(row.cnt);
          total += c;
          if (row.jenisHewan === 'Sapi') sapi += c;
          if (row.jenisHewan === 'Kambing') kambing += c;
        });

        return {
          tahun: y.tahun,
          total,
          sapi,
          kambing,
        };
      })
    );

    return {
      selectedYear: targetYear,
      totalPequrban,
      totalSapi,
      totalKambing,
      totalKelompokSapi: Math.ceil(totalSapi / 7),
      yearlyTrend,
    };
  },

  // ─── 2. Tahun Qurban CRUD ──────────────────────────────────────────────────
  async getAllTahun() {
    const years = await db.select().from(qurbanTahun).orderBy(desc(qurbanTahun.tahun));
    if (years.length === 0) {
      const currentYear = new Date().getFullYear();
      await this.createTahun(currentYear, true);
      return db.select().from(qurbanTahun).orderBy(desc(qurbanTahun.tahun));
    }
    return years;
  },

  async createTahun(tahun: number, statusAktif = true) {
    const existing = await db.select().from(qurbanTahun).where(eq(qurbanTahun.tahun, tahun)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }
    const newId = crypto.randomUUID();
    await db.insert(qurbanTahun).values({
      id: newId,
      tahun,
      statusAktif,
    });
    const inserted = await db.select().from(qurbanTahun).where(eq(qurbanTahun.id, newId));
    return inserted[0];
  },

  // ─── 3. Kelompok Qurban CRUD ──────────────────────────────────────────────
  async getKelompokByTahun(qurbanTahunId: string) {
    const kelompokList = await db
      .select()
      .from(qurbanKelompok)
      .where(eq(qurbanKelompok.qurbanTahunId, qurbanTahunId))
      .orderBy(asc(qurbanKelompok.nomorUrut), asc(qurbanKelompok.namaKelompok));

    // For each kelompok, get member count and member list
    const result = await Promise.all(
      kelompokList.map(async (kel) => {
        const members = await db
          .select({
            id: pequrban.id,
            jemaahId: pequrban.jemaahId,
            jemaahName: jemaah.name,
            jemaahPhone: jemaah.phone,
            status: pequrban.status,
            catatan: pequrban.catatan,
            createdAt: pequrban.createdAt,
          })
          .from(pequrban)
          .innerJoin(jemaah, eq(pequrban.jemaahId, jemaah.id))
          .where(eq(pequrban.qurbanKelompokId, kel.id));

        return {
          ...kel,
          memberCount: members.length,
          isFull: kel.jenisHewan === 'Sapi' && members.length >= 7,
          members,
        };
      })
    );

    return result;
  },

  async createKelompok(data: { qurbanTahunId: string; namaKelompok: string; jenisHewan?: string; nomorUrut?: number }) {
    const id = crypto.randomUUID();
    await db.insert(qurbanKelompok).values({
      id,
      qurbanTahunId: data.qurbanTahunId,
      namaKelompok: data.namaKelompok,
      jenisHewan: data.jenisHewan || 'Sapi',
      nomorUrut: data.nomorUrut || 1,
    });

    const res = await db.select().from(qurbanKelompok).where(eq(qurbanKelompok.id, id));
    return res[0];
  },

  async deleteKelompok(id: string) {
    await db.delete(qurbanKelompok).where(eq(qurbanKelompok.id, id));
    return true;
  },

  // ─── 4. PeQurban CRUD & Validation ─────────────────────────────────────────
  async getAllPequrban(filters: { qurbanTahunId?: string; tahun?: number; search?: string; jenisHewan?: string }) {
    let yearId = filters.qurbanTahunId;

    if (!yearId && filters.tahun) {
      const yearRec = await db.select().from(qurbanTahun).where(eq(qurbanTahun.tahun, filters.tahun)).limit(1);
      yearId = yearRec[0]?.id;
    }

    // Default to active year if no year specified
    if (!yearId) {
      const latestYear = await db.select().from(qurbanTahun).orderBy(desc(qurbanTahun.tahun)).limit(1);
      yearId = latestYear[0]?.id;
    }

    if (!yearId) return [];

    let query = db
      .select({
        id: pequrban.id,
        jemaahId: pequrban.jemaahId,
        jemaahName: jemaah.name,
        jemaahAddress: jemaah.address,
        jemaahPhone: jemaah.phone,
        qurbanTahunId: pequrban.qurbanTahunId,
        tahun: qurbanTahun.tahun,
        qurbanKelompokId: pequrban.qurbanKelompokId,
        namaKelompok: qurbanKelompok.namaKelompok,
        jenisHewan: pequrban.jenisHewan,
        status: pequrban.status,
        catatan: pequrban.catatan,
        createdAt: pequrban.createdAt,
      })
      .from(pequrban)
      .innerJoin(jemaah, eq(pequrban.jemaahId, jemaah.id))
      .innerJoin(qurbanTahun, eq(pequrban.qurbanTahunId, qurbanTahun.id))
      .leftJoin(qurbanKelompok, eq(pequrban.qurbanKelompokId, qurbanKelompok.id));

    const conditions = [eq(pequrban.qurbanTahunId, yearId)];

    if (filters.search) {
      conditions.push(like(jemaah.name, `%${filters.search}%`));
    }
    if (filters.jenisHewan) {
      conditions.push(eq(pequrban.jenisHewan, filters.jenisHewan));
    }

    return query.where(and(...conditions)).orderBy(asc(qurbanKelompok.namaKelompok), asc(pequrban.createdAt));
  },

  async getPequrbanById(id: string) {
    const records = await db
      .select({
        id: pequrban.id,
        jemaahId: pequrban.jemaahId,
        jemaahName: jemaah.name,
        jemaahAddress: jemaah.address,
        jemaahPhone: jemaah.phone,
        qurbanTahunId: pequrban.qurbanTahunId,
        tahun: qurbanTahun.tahun,
        qurbanKelompokId: pequrban.qurbanKelompokId,
        namaKelompok: qurbanKelompok.namaKelompok,
        jenisHewan: pequrban.jenisHewan,
        status: pequrban.status,
        catatan: pequrban.catatan,
        createdAt: pequrban.createdAt,
      })
      .from(pequrban)
      .innerJoin(jemaah, eq(pequrban.jemaahId, jemaah.id))
      .innerJoin(qurbanTahun, eq(pequrban.qurbanTahunId, qurbanTahun.id))
      .leftJoin(qurbanKelompok, eq(pequrban.qurbanKelompokId, qurbanKelompok.id))
      .where(eq(pequrban.id, id));

    return records[0];
  },

  async createPequrban(data: {
    jemaahId: string;
    qurbanTahunId: string;
    jenisHewan: 'Sapi' | 'Kambing';
    qurbanKelompokId?: string | null;
    namaKelompokBaru?: string | null;
    status?: string;
    catatan?: string | null;
  }) {
    let kelompokIdToAssign = data.qurbanKelompokId || null;

    if (data.jenisHewan === 'Sapi') {
      // If user provided a new group name or no existing group selected, auto-create a new group
      if (data.namaKelompokBaru && data.namaKelompokBaru.trim()) {
        const newGroup = await this.createKelompok({
          qurbanTahunId: data.qurbanTahunId,
          namaKelompok: data.namaKelompokBaru.trim(),
          jenisHewan: 'Sapi',
        });
        kelompokIdToAssign = newGroup.id;
      } else if (!kelompokIdToAssign) {
        // Find existing non-full cow groups or auto create "Kelompok Sapi N"
        const existingGroups = await this.getKelompokByTahun(data.qurbanTahunId);
        const availableCowGroup = existingGroups.find((g) => g.jenisHewan === 'Sapi' && g.memberCount < 7);

        if (availableCowGroup) {
          kelompokIdToAssign = availableCowGroup.id;
        } else {
          const cowGroupCount = existingGroups.filter((g) => g.jenisHewan === 'Sapi').length;
          const newGroup = await this.createKelompok({
            qurbanTahunId: data.qurbanTahunId,
            namaKelompok: `Kelompok Sapi ${cowGroupCount + 1}`,
            jenisHewan: 'Sapi',
            nomorUrut: cowGroupCount + 1,
          });
          kelompokIdToAssign = newGroup.id;
        }
      }

      // 🛑 BACKEND VALIDATION: Max 7 members for cow groups
      if (kelompokIdToAssign) {
        const currentMembers = await db
          .select({ count: count(pequrban.id) })
          .from(pequrban)
          .where(eq(pequrban.qurbanKelompokId, kelompokIdToAssign));

        if (Number(currentMembers[0]?.count || 0) >= 7) {
          throw new Error("Kelompok Sapi ini sudah mencapai batas maksimal 7 anggota.");
        }
      }
    } else if (data.jenisHewan === 'Kambing') {
      // If no group is assigned for Kambing, optionally create a 1-member Kambing group or keep null
      if (data.namaKelompokBaru && data.namaKelompokBaru.trim()) {
        const newGroup = await this.createKelompok({
          qurbanTahunId: data.qurbanTahunId,
          namaKelompok: data.namaKelompokBaru.trim(),
          jenisHewan: 'Kambing',
        });
        kelompokIdToAssign = newGroup.id;
      }
    }

    const newPequrbanId = crypto.randomUUID();
    await db.insert(pequrban).values({
      id: newPequrbanId,
      jemaahId: data.jemaahId,
      qurbanTahunId: data.qurbanTahunId,
      qurbanKelompokId: kelompokIdToAssign,
      jenisHewan: data.jenisHewan,
      status: data.status || 'Proses',
      catatan: data.catatan || null,
    });

    return this.getPequrbanById(newPequrbanId);
  },

  async updatePequrban(
    id: string,
    data: Partial<{
      jemaahId: string;
      qurbanTahunId: string;
      jenisHewan: 'Sapi' | 'Kambing';
      qurbanKelompokId: string | null;
      namaKelompokBaru: string | null;
      status: string;
      catatan: string | null;
    }>
  ) {
    const existing = await this.getPequrbanById(id);
    if (!existing) {
      throw new Error("Data pequrban tidak ditemukan");
    }

    let targetKelompokId = data.qurbanKelompokId !== undefined ? data.qurbanKelompokId : existing.qurbanKelompokId;
    const targetJenisHewan = data.jenisHewan || existing.jenisHewan;
    const targetTahunId = data.qurbanTahunId || existing.qurbanTahunId;

    if (targetJenisHewan === 'Sapi') {
      if (data.namaKelompokBaru && data.namaKelompokBaru.trim()) {
        const newGroup = await this.createKelompok({
          qurbanTahunId: targetTahunId,
          namaKelompok: data.namaKelompokBaru.trim(),
          jenisHewan: 'Sapi',
        });
        targetKelompokId = newGroup.id;
      }

      // 🛑 BACKEND VALIDATION: Max 7 members rule
      if (targetKelompokId && targetKelompokId !== existing.qurbanKelompokId) {
        const currentMembers = await db
          .select({ count: count(pequrban.id) })
          .from(pequrban)
          .where(eq(pequrban.qurbanKelompokId, targetKelompokId));

        if (Number(currentMembers[0]?.count || 0) >= 7) {
          throw new Error("Kelompok Sapi ini sudah mencapai batas maksimal 7 anggota.");
        }
      }
    }

    const updateData: any = {};
    if (data.jemaahId) updateData.jemaahId = data.jemaahId;
    if (data.qurbanTahunId) updateData.qurbanTahunId = data.qurbanTahunId;
    if (data.jenisHewan) updateData.jenisHewan = data.jenisHewan;
    updateData.qurbanKelompokId = targetKelompokId;
    if (data.status) updateData.status = data.status;
    if (data.catatan !== undefined) updateData.catatan = data.catatan;

    await db.update(pequrban).set(updateData).where(eq(pequrban.id, id));
    return this.getPequrbanById(id);
  },

  async removePequrban(id: string) {
    await db.delete(pequrban).where(eq(pequrban.id, id));
    return true;
  },
};
