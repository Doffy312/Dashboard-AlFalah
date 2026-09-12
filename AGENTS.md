# Workspace Engineering Rules & Control Policy

> **Authority:** Mandatory engineering policy for Antigravity AI agent.  
> **Master SOP:** [SOP_Web_Application_Engineering_Professional.md](file:///e:/Dashboard/SOP_Web_Application_Engineering_Professional.md)  
> **Detailed Policy:** [.agents/rules/ai-engineering-policy.md](file:///e:/Dashboard/.agents/rules/ai-engineering-policy.md)  
> **Standards:** [.agents/rules/engineering-standards.md](file:///e:/Dashboard/.agents/rules/engineering-standards.md)  
> **Stack:** Frontend: React 19 + Vite SPA (`apps/mosque-dashboard`) | Backend: Express + TypeScript + Drizzle ORM (`apps/mosque-backend`)

---

## 1. Core Principles & Priority Hierarchy
When requirements conflict, follow this strict priority order:
1. **Preserve Existing Functionality** (No unnecessary rewrites/refactors; maintain backward compatibility).
2. **Security & Least Privilege** (RBAC, IDOR prevention, never expose secrets).
3. **Data Integrity & Correctness** (Atomic transactions, strict runtime validation with Zod).
4. **Reliability & Performance** (Measure before optimizing, select only needed columns, avoid N+1 queries).
5. **Maintainability & Observability** (Clean code, consistent API responses, structured error logging).

---

## 2. Non-Negotiable Engineering Commandments
- **Input Validation:** *Never trust client input.* Runtime validation with Zod on every mutation endpoint.
- **Backend Authorization:** *Never rely on UI for authorization.* Enforce permissions (RBAC) and resource ownership (IDOR prevention) strictly at API endpoints.
- **SQL Safety:** *Never concatenate untrusted input into SQL.* Use parameterized queries and ORM abstractions only.
- **XSS Prevention:** *Never render untrusted HTML without sanitization* (DOMPurify).
- **Data Minimization:** *Never return more data than needed.* Avoid unbounded queries or `SELECT *`; enforce pagination.
- **Secret Protection:** *Never expose server secrets, tokens, or internal database errors* in API responses or git commits.

---

## 3. Special Domain Rule — Financial & Numerical Data
*Crucial for Mosque modules: Kas, Infaq, Zakat, Laporan Keuangan, Invoice.*
- Avoid floating-point arithmetic for exact monetary values; store integers/minor units or exact decimals.
- Validate numeric boundaries (no negative amounts unless explicitly required).
- Calculations must be authoritative on the server; never rely solely on client-side math.
- Wrap related financial writes (e.g. transfers, ledger entries) in atomic database transactions.
- Preserve full auditability for financial entries.

---

## 4. Prohibited AI Agent Anti-Patterns
- **"Just make it work":** Never prioritize speed or demo convenience over correctness and production safety.
- **"The frontend hides it":** Hiding buttons in the UI is NOT a security control.
- **"TypeScript says it's valid":** TypeScript types disappear at runtime; always validate external data with Zod.
- **"We can optimize later":** Never knowingly introduce obvious N+1 queries, unbounded queries, or un-chunked heavy libraries.
- **"Disable the check temporarily":** Never weaken linters, type checks, or security tests just to make a build pass.

---

## 5. Stop Conditions (Mandatory Clarification Gate)
Halt and ask for explicit user confirmation before proceeding if:
1. An operation is destructive (dropping database tables, deleting data, removing migrations).
2. Business requirements conflict or the intended authorization model is ambiguous.
3. Secrets or credentials required for safe execution are unavailable.

---

## 6. Verification & Final Response Standard
A task is COMPLETE only after evidence of verification (Lint, Build, Typecheck, or Tests).
Format completion reports with:
- **Implementation Summary:** What changed, why, and affected modules.
- **Security & Database Impact:** Auth, validation, migrations, and query safety.
- **Performance & Verification:** Bundle/query impact, Lint/Build/Test results. *Never claim tests passed if they were not run.*
