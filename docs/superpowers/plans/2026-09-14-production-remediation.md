# Shooting OS production remediation implementation plan

> **For implementation:** follow `superpowers:executing-plans`, `superpowers:test-driven-development`, and `superpowers:systematic-debugging` task by task.

**Goal:** harden Shooting OS as a single-owner application, repair AI-backed flows and formatted Assist output, and add safely growing work context.

**Architecture:** retain Supabase RLS as the database backstop and add a single route-level owner guard. Replace implicit AI fallback with explicit provider configuration, safe classified failures, and validated response handling. Treat verified knowledge and work context as distinct retrieval sources. Render AI responses with an allow-listed Markdown component.

**Tech stack:** Next.js App Router, TypeScript, React, Supabase Auth/Postgres, Tailwind, Zod, Node test runner.

---

### Task 1: Establish the route security inventory and reusable owner guard

**Files:**
- Modify: `lib/auth/owner.ts`
- Modify: all private route handlers in `app/api/**/route.ts`
- Modify: `app/api/ai/analyze-trend/route.ts`
- Modify: `app/api/ai/generate-course/route.ts`
- Test: `tests/api-owner-authorization.test.js`

1. Write failing tests that identify public exceptions and assert private handlers call the shared guard before AI or service-role work.
2. Add a small guard/helper that returns a verified owner identity or a safe response.
3. Apply it to every private route, with explicit public-route allow-list comments.
4. Ensure service-role endpoints authorize before request body parsing or database work.
5. Run `node --test tests/api-owner-authorization.test.js`.

### Task 2: Fix authentication redirect and Supabase server-client safety

**Files:**
- Modify: `app/login/page.tsx`
- Create: `lib/navigation/safe-next.ts`
- Modify: `lib/db/supabase.ts`
- Modify: imports that use the anonymous singleton
- Test: `tests/safe-next.test.js`

1. Write tests for allowed internal destinations and rejected absolute, protocol-relative, malformed, and auth-loop paths.
2. Implement the pure safe-next parser and use it in login navigation.
3. Remove the server anonymous singleton and retain only intentional configuration and service-client factory exports.
4. Verify no server route uses an anonymous client for owner data.
5. Run the focused tests.

### Task 3: Make AI provider configuration reliable and safe

**Files:**
- Modify: `lib/ai/provider.ts`
- Create: `lib/ai/errors.ts`
- Modify: `app/api/assistant/route.ts`
- Modify: `app/api/ideas/route.ts`
- Modify: other `getAIProvider()` callers
- Create: `app/api/ai/status/route.ts`
- Test: `tests/ai-provider.test.js`

1. Write failing tests for primary provider selection, optional fallback parsing, safe error classifications, and no returned provider body/token.
2. Implement explicit provider/model configuration with maintained defaults and bounded timeouts.
3. Classify upstream errors from HTTP status without retaining provider response text; redact all unknown thrown values.
4. Validate text and JSON outputs; add one non-persisting repair attempt only for malformed JSON.
5. Return actionable safe messages and correlation IDs; add authenticated owner-only readiness status that exposes no secret values.
6. Run focused tests and a configured non-mutating provider readiness check.

### Task 4: Render formatted Assist output safely

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `components/assistant/markdown-reply.tsx`
- Modify: `app/assistant/page.tsx`
- Test: `tests/assistant-markdown.test.js`

1. Add a minimal maintained Markdown renderer and sanitizer dependency after checking its current official documentation and compatibility with installed Next/React versions.
2. Write failing tests for bold text, ordered lists, unsafe raw HTML, unsafe URLs, and plain user message behaviour.
3. Implement a strict renderer with no raw HTML, controlled link protocols, accessible headings/lists, and mobile-first spacing.
4. Replace line-splitting Assist rendering with the component and add a retry button/live status that preserves input.
5. Run the focused tests, type check, and visual browser verification at phone width.

### Task 5: Add safe, growing owner work context

**Files:**
- Create: `supabase/migrations/<timestamp>_work_context.sql`
- Create: `lib/knowledge/work-context.ts`
- Modify: `lib/knowledge/retrieval.ts`
- Modify: `app/api/assistant/route.ts`
- Modify: content/script approval, scheduling, and completion route handlers
- Modify: existing Knowledge/Assist UI surfaces
- Test: `tests/work-context.test.js`

1. Write tests that define eligible artifacts and prove drafts/unchecked personal claims cannot enter verified knowledge.
2. Implement a compact work-context record with source type, source ID, owner ID, artifact status, title, excerpt, and timestamps.
3. Upsert context only when an artifact is approved, scheduled, or marked completed; keep raw personal-fact promotion an explicit owner review action.
4. Retrieve verified facts and work context separately, cap both contexts, and label grounding metadata by source type.
5. Add owner-facing counts/source labels and an empty-memory explanation.
6. Generate but do not apply the migration; present it for separate live-database approval.

### Task 6: Production headers, accessible states, dependency reproducibility

**Files:**
- Modify: `next.config.*` or relevant app configuration
- Modify: affected page/components with icon buttons and status feedback
- Modify: `package.json`, `package-lock.json`
- Test: `tests/production-safety.test.js`

1. Write tests for expected headers/config, status semantics, and exact direct dependency versions.
2. Add appropriate security headers without blocking Supabase/Auth/app assets.
3. Provide aria labels, focus-visible styles, and live regions on the updated surfaces.
4. Pin direct package versions to the verified lockfile versions.
5. Run focused tests.

### Task 7: Prepare explicit RLS follow-up and full verification

**Files:**
- Create: `supabase/migrations/<timestamp>_explicit_owner_policies.sql`
- Modify: `docs/production-readiness.md` or current deployment documentation
- Test: existing test suite

1. Replace the dynamic-policy proposal with an explicit migration reviewed per table; do not apply it.
2. Document exact preflight and rollback expectations, including owner and non-owner RLS tests.
3. Run `npm test`, `npm run typecheck`, configured lint, production build, and dependency audit.
4. Browser-test unauthenticated rejection, formatted Assist response, failure/retry UI, Suggested Idea, and responsive views in a non-production target.
5. Request approval before database migration, deployment, push, or production data mutations.
