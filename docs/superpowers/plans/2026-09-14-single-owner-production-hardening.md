# Single-owner production hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing Shooting OS safely deployable as a single-owner app.

**Architecture:** A shared server-only owner guard protects every route; an additive Supabase migration applies the same boundary at RLS. Existing mobile workflows stay in place, while the account, runtime configuration, and release checks are tightened.

**Tech Stack:** Next.js 16, TypeScript, Supabase SSR/Postgres RLS, Node test runner, ESLint, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-14-single-owner-production-hardening-design.md`

## Global Constraints

- Do not add teams, roles, public content, or a multi-user dashboard.
- `OWNER_USER_ID` stays server-only and is never logged, exposed to clients, or committed.
- Do not apply remote migrations, seed a remote database, deploy, push, or call a paid provider.

---

### Task 1: Server-only owner guard

**Files:** Create `lib/auth/owner.ts`; modify `lib/auth/server.ts`, `proxy.ts`, `.env.example`; test `tests/owner-auth.test.js`.

**Interfaces:** `requireOwner(): Promise<User>` throws `AUTH_REQUIRED`, `OWNER_NOT_CONFIGURED`, or `OWNER_FORBIDDEN`; `ownerErrorResponse(error: unknown): NextResponse` maps them to 401, 503, and 403.

- [ ] Write a test that checks `OWNER_USER_ID`, `auth.getUser()`, and `OWNER_FORBIDDEN` are present, and `user_metadata` is absent.
- [ ] Run `node --test tests/owner-auth.test.js`; expect failure because the helper is absent.
- [ ] Implement `requireOwner` by calling the existing cookie-aware `getUser`, rejecting an absent user, rejecting a missing owner in production, and comparing `user.id` to `OWNER_USER_ID`.
- [ ] Make `proxy.ts` protect navigation with that helper while every API route will independently use it.
- [ ] Run `node --test tests/owner-auth.test.js && npm run typecheck`; expect exit 0.
- [ ] Commit `lib/auth/owner.ts lib/auth/server.ts proxy.ts .env.example tests/owner-auth.test.js` with `feat: enforce a single owner boundary`.

### Task 2: Owner-only routes and controlled setup UI

**Files:** Modify `app/api/**/route.ts`, `app/login/page.tsx`, `app/signup/page.tsx`, `app/account/page.tsx`, `components/AppShell.tsx`; create `app/setup/page.tsx`, `app/api/setup/route.ts`; test `tests/route-authorization.test.js`.

**Interfaces:** Route handlers consume Task 1 helpers. `/api/setup` returns 409 after `OWNER_USER_ID` is configured. `/api/health` remains secret-free and public.

- [ ] Write a route inventory test which asserts every non-health route handler calls `requireOwner()` and signup redirects after owner configuration.
- [ ] Run `node --test tests/route-authorization.test.js`; expect failure.
- [ ] Add `await requireOwner()` before every protected read or mutation; catch errors via `ownerErrorResponse`.
- [ ] Render setup only before owner configuration; redirect `/signup` to `/login` once the owner UUID exists. Retain the existing private, mobile-first visual style.
- [ ] Run `node --test tests/route-authorization.test.js && npm run build`; expect exit 0.
- [ ] Commit relevant `app`, `components`, and test changes with `feat: restrict app routes to the owner`.

### Task 3: Additive owner-only RLS migration

**Files:** Create a CLI-generated `supabase/migrations/*_owner_only_rls.sql` and `supabase/tests/owner_rls.test.sql`; modify `tests/single-owner.test.js`, `docs/PRODUCTION_HANDOFF.md`.

**Interfaces:** SQL uses `(select auth.uid())` and `TO authenticated`; it never trusts metadata or uses a security-definer authorization bypass.

- [ ] Run `supabase migration new owner_only_rls` and use the generated filename.
- [ ] Write a source test that requires `TO authenticated` and `(select auth.uid())`, rejects `auth.role()` and `security definer`.
- [ ] Drop legacy broad policies, revoke `anon` access, grant only necessary authenticated operations, and create separate select/insert/update/delete owner policies with `USING` and `WITH CHECK`.
- [ ] Add pgTAP tests using `tests.create_supabase_user()` and `tests.authenticate_as()` for owner allow and second-user denial.
- [ ] Run `supabase migration list --local && supabase test db`; if no local runtime exists, document the precise blocker without remote application.
- [ ] Commit migration, pgTAP test, source test, and handoff update with `feat: add owner-only Supabase RLS`.

### Task 4: Low-volume AI runtime and recovery

**Files:** Create `lib/config/runtime.ts`, `lib/api/rate-limit.ts`; modify `lib/ai/provider.ts`, AI/content routes, `components/ShootingViewClient.tsx`, `public/sw.js`; test `tests/runtime-config.test.js`, `tests/api-resilience.test.js`.

**Interfaces:** `getRuntimeConfiguration()` returns booleans and provider name only; `enforceRateLimit(request, key): Response | null` emits 429 for local bursts and fails closed in production without a shared limiter.

- [ ] Write failing tests that require one selected provider, no key logging, local script snapshots, and no `/api/*` caching.
- [ ] Implement a server-only configuration resolver that enables only the selected provider when its matching key is present; mock mode is development-only.
- [ ] Add normalized safe errors, retryable UI state, and rate-limit handling to mutation/AI routes without adding background jobs.
- [ ] Run focused tests, `npm run typecheck`, and `npm run build`; expect exit 0.
- [ ] Commit with `feat: harden runtime configuration and recovery`.

### Task 5: Release gates, headers, and mobile E2E

**Files:** Modify `package.json`, `package-lock.json`, `next.config.mjs`, `vercel.json`, `scripts/verify-repo.mjs`; create `eslint.config.mjs`, `playwright.config.ts`, `tests/e2e/owner-flow.spec.ts`, `scripts/preflight-production.mjs`, `tests/release-tooling.test.js`.

**Interfaces:** `npm run lint` invokes ESLint; `npm run e2e` drives the mobile owner flow in demo mode; `npm run preflight` reports only variable names and readiness states.

- [ ] Write tests requiring `eslint .`, the E2E config, and a preflight script that never prints environment values.
- [ ] Install pinned `eslint`, `@eslint/js`, `eslint-config-next`, and `playwright`; replace deprecated `next lint`; make structural verification use existing dynamic routes rather than `content/c1`.
- [ ] Add CSP, Permissions-Policy, and safe cache headers to `vercel.json`; preserve service worker registration and authenticated API no-cache behavior.
- [ ] Write the mobile E2E flow: sign in/demo entry, Idea, Script, Approve, Schedule, Shooting View, and Shot Ho Gaya.
- [ ] Implement preflight checks for Supabase URL/public key/service key, owner UUID, cron secret, and only the selected provider key. Report `SET`, `MISSING`, or `INVALID` without values.
- [ ] Run `npm test && npm run lint && npm run typecheck && npm run build && npm audit --omit=dev --audit-level=high`; run E2E after browser installation.
- [ ] Commit release tooling changes with `chore: add production release gates`.

## Plan review

- Tasks 1–3 cover the owner boundary and Supabase RLS; Task 4 covers low-cost AI, failure handling, and offline recovery; Task 5 covers UI validation, deployment controls, and release gates.
- Live project, migration, provider, deployment, and device work remain explicit owner-controlled gates.
