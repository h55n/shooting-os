# Baseline — 2026-09

**Source commit:** `8870495f8716557cdc64eb51cfe1922aed9ada5c`  
**Baseline verification branch:** `build/single-owner-content-os`

## Verification environment

The task execution container could not resolve `github.com`, so a local clone/runtime walk was not possible without violating the environment/secrets rule. To establish a real baseline against the unchanged application code, the first branch change added GitHub Actions verification only. No product code or environment variables were changed before these checks.

GitHub Actions runner: Ubuntu 24.04, Node 22.23.2, npm 10.9.8.

## Baseline commands

- `npm ci`: **PASS** — 182 packages installed, 183 audited, 0 vulnerabilities.
- `npm test`: **FAIL (6/7 pass)** — one stale source-contract assertion in `tests/domain.test.js` expects `UnsupportedPersonalClaims`, while the current claim module exposes `validateClaims` / `ClaimValidationResult`.
- `npm run typecheck`: **PASS**.
- `npm run verify`: **FAIL** only because it runs the failing test before typecheck.
- `npm run build`: **PASS** — Next.js 16.3.4 / Turbopack, TypeScript pass, all pages generated.

The production build also reports that the `middleware.ts` file convention is deprecated in Next.js 16 and should migrate to `proxy.ts`.

## Baseline app routes

- `/`
- `/account`
- `/assistant`
- `/content`
- `/content/[id]`
- `/ideas`
- `/ideas/[id]`
- `/login`
- `/plan`
- `/signup`

No `/masterclass` product page exists at baseline.

API routes:

- `/api/ai/analyze-trend`
- `/api/ai/generate-course`
- `/api/assistant`
- `/api/content/[id]/approve`
- `/api/health`
- `/api/ideas`
- `/api/scripts`

## Baseline architecture findings

- `Role = father | operator | admin` is still exposed in product domain types.
- Server auth includes `getRole()` and `requireRole()`.
- Middleware loads profile role, guards `/operator`, exposes `x-user-role`, and allows public signup.
- Several RLS policies depend on `current_role()` and operator/admin values.
- Bottom navigation is `Ghar | Plan | Ideas | Content | Help`; Assistant is a main tab.
- `lib/data.ts` is still the production source for empty/static collections on Home/Content/Plan and part of Ideas.
- Content detail contains local/mock state transitions and timeout-based edits rather than persistent end-to-end actions.
- Ideas API has useful validation/provider/claim/persistence foundations, but knowledge, related content, voice examples and verified facts are placeholders; DB persistence failures can currently be swallowed while returning a successful generated response.
- Supabase/pgvector, claim validation, PWA, knowledge markdown, script version table, masterclass schema, conversations/messages and AI provider abstraction are useful foundations to preserve.

## Database baseline

Repository migrations present:

1. `0001_initial.sql`
2. `0002_conversations_versioning_claims.sql`

The actual remote Supabase migration ledger could not be inspected from the available GitHub-only execution path and no secrets were accessed or changed. Therefore all new DB work must be additive and assume both existing migrations may already be applied.

## Runtime/browser limitation

A route-by-route browser console walk could not be performed in this execution environment because the repository could not be cloned/run locally and no authenticated browser runtime is connected. Production compilation/typechecking is covered by GitHub Actions; runtime/E2E verification remains a separate gate once a browser/deployment environment is available.
