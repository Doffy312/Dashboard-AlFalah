---
name: engineering-sop
description: Web application engineering & security audit workflow based on SOP_Web_Application_Engineering_Professional.md. Use this skill when auditing existing features, refactoring critical code, analyzing database query performance (indexing/N+1), auditing API security (RBAC/IDOR/Zod), or planning safe database migrations.
---

# Web Application Engineering SOP & Audit Skill

This skill guides deep audits and implementations according to [SOP_Web_Application_Engineering_Professional.md](../../../SOP_Web_Application_Engineering_Professional.md).

## When to Activate This Skill
- **Security Audit:** Reviewing endpoints for IDOR, Broken Access Control, SQL Injection, XSS, or Secret Leaks.
- **Database Engineering:** Tuning slow queries, resolving N+1 queries, planning index additions, or wrapping multi-step mutations in transactions.
- **Data Integrity & Validations:** Ensuring Zod runtime validations match schema types and sanitize all untrusted user inputs.
- **Safe Migrations:** Verifying non-destructive database migrations and rollback safety.
- **Pre-Release Audit:** Running the final engineering checklist before reporting a feature or bugfix as complete.

---

## SOP Chapter Mapping Reference

Consult the corresponding sections in [SOP_Web_Application_Engineering_Professional.md](../../../SOP_Web_Application_Engineering_Professional.md):

| Domain | Key SOP Sections | Focus Checklist |
| :--- | :--- | :--- |
| **Input Validation** | Bab 4 | Zod schema validation on `req.body`, `req.params`, `req.query`. Never trust client payload. |
| **Auth & RBAC** | Bab 5, 6, 7 | Verify token validity and explicit role/permission checks on backend routes. |
| **IDOR & Data Access** | Bab 8 | Always verify ownership (`where: { id, mosqueId, userId }`). Never allow user A to mutate user B's resource. |
| **XSS & Injection** | Bab 9, 12 | Sanitize HTML inputs (DOMPurify). Use parameterized ORM queries only; no raw string concatenation. |
| **Database Indexing** | Bab 13, 14 | Add indexes for frequent `WHERE`, `JOIN`, and `ORDER BY` columns. Avoid redundant indexes. |
| **Query Performance** | Bab 15, 16, 17 | Eliminate N+1 via batching/include. Select only needed fields (`select: { id: true, ... }`). Enforce limit/pagination. |
| **Transactions** | Bab 18, 19 | Wrap multi-table updates (e.g. finance/transaksi, qurban quota) in atomic DB transactions. |
| **Error Handling** | Bab 31, 32 | Catch errors via global middleware; do not expose database error codes, SQL strings, or stack traces in API response. |
| **Frontend Health** | Bab 34, 36 | Eliminate unnecessary re-renders, avoid large monolithic packages for trivial tasks, lazy-load heavy components. |

---

## Verification Protocol
Before marking work complete, verify:
1. `npm run test` or relevant test suite passes.
2. No TypeScript compiler warnings (`npm run type-check` or `tsc --noEmit`).
3. Zod schema catches missing/invalid payload types.
4. Happy path, error path, and unauthorized access scenarios have been verified.
