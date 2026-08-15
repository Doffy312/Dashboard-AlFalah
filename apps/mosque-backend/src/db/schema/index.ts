// ─── Schema Barrel Export ─────────────────────────────────────────────
// Re-exports all tables and relations for Drizzle and drizzle-kit.

export {
  user,
  session,
  account,
  verification,
} from "./auth.js";

export {
  transaction,
  transactionRelations,
} from "./transactions.js";

export {
  program,
  programRelations,
} from "./programs.js";

export {
  jemaah,
  jemaahRelations,
} from "./jemaah.js";

export {
  inventaris,
  inventarisRelations,
} from "./inventaris.js";

export {
  notification,
} from "./notifications.js";

export {
  ziswafTransaction,
} from "./ziswaf.js";

export {
  qurbanTahun,
  qurbanKelompok,
  pequrban,
  qurbanTahunRelations,
  qurbanKelompokRelations,
  pequrbanRelations,
} from "./qurban.js";

export {
  jadwalPetugas,
} from "./jadwal.js";

export {
  setting,
} from "./settings.js";

export {
  article,
} from "./articles.js";

export {
  contactMessages,
} from "./contactMessages.js";
