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
  qurbanParticipant,
} from "./qurban.js";

export {
  jadwalPetugas,
} from "./jadwal.js";
