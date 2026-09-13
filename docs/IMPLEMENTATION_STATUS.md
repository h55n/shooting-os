# Implementation Status — 2026-09-13

`docs/PRD.md` and `docs/BUILD_PLAN.md` remain the authoritative source of truth. This file records the implemented state, not a replacement roadmap.

## Implemented

### Single-owner product foundation
- Product auth is one authenticated owner; no Operator/Admin/Father product surfaces.
- Next.js 16 `proxy.ts` protects the private app.
- Public signup is removed.
- Bottom navigation is Home, Ideas, Plan, Content, Masterclass; Assist is contextual.
- Legacy role schema is retained only for migration compatibility.

### Content creation and production
- 14 deterministic content categories and hook compatibility rules.
- Structured script schema, duration estimation, deterministic quality checks, claim validation.
- Persistent Idea → Script → section edit/version → approval → schedule → Shooting View → `Shot Ho Gaya` flow.
- Optional persisted Shooting Guidance.
- Structured script copy/export.
- Offline fallback for scripts previously opened in Shooting View.
- First 10 Videos with persisted progress tied to actual shoot completion.
- Series: one 30-topic planning pass, replacement, ordering, progress, selective batch scripting rather than generating all 30 scripts blindly.

### Knowledge, Assist, research, trends
- pgvector/verified knowledge retrieval remains the grounding layer.
- Personal claims are checked against verified facts.
- Knowledge corrections require explicit confirmation and retain history.
- Assist retrieves scoped verified context instead of embedding the complete markdown memory and persists conversations against the authenticated owner.
- Assist returns typed navigation actions rather than acting as a hidden admin console.
- Research accepts explicit external source URLs, safely extracts readable text, produces source-grounded summary/safe claim/warning/confidence, and persists evidence/source records.
- Research source fetching blocks local/private targets and validates redirects.
- Trend flow is deliberately manual-first: the owner supplies a signal, then the system scores shooting relevance and suggests an angle. It does not claim live trend discovery without a search/signal provider.

### Masterclass
- Topic + target duration → outline first.
- Explicit outline review/approval is required before lesson generation.
- Initial outline and generated lesson drafts are versioned.
- Generated lessons are visible for review and individually approvable.

### Mobile/PWA/UX
- Mobile-first cards/touch targets and action-centered Home.
- Browser speech recognition is used for idea voice capture when supported, with text as the guaranteed fallback.
- Teleprompter-lite Shooting View supports font sizing, section navigation and wake lock.
- Service worker routes offline Shooting View navigation to a local saved-script surface.
- In-app completion notifications are persisted for completed research and masterclass lesson generation.

## Database migrations added in this rebuild

- `0003_single_owner_model.sql`
- `0004_creation_and_production_flow.sql`
- `0005_knowledge_and_progress.sql`
- `0006_owner_knowledge_updates.sql`
- `0007_intelligence_versioning_notifications.sql`
- `0008_in_app_notification_triggers.sql`

All are additive. Existing migration files were not rewritten.

## Deliberate external blockers / deferred integrations

These are not represented as completed because the repository does not currently contain the required authorized external service/provider:

1. **Automatic live trend discovery** — current implementation evaluates owner-supplied signals. A trustworthy external search/social/trend provider is still required for autonomous discovery.
2. **Open-web research discovery** — research executes against explicit source URLs. Automatic source search needs an external search provider. The product does not fabricate source discovery.
3. **Server speech-to-text fallback** — browser speech recognition is available where supported. A server STT provider is not introduced without an existing configured provider/credential.
4. **True authenticated browser E2E against production Supabase** — GitHub CI verifies source contracts, TypeScript, repository checks and production builds. The execution environment used for this rebuild could not clone/access GitHub from its local container, so real browser E2E against the user's configured Supabase environment requires an environment with those authorized runtime credentials.

## Verification policy

No completion claim should be made from this file alone. Use the latest GitHub Actions `Verify` run for the branch; it executes tests, typecheck, repository verification and production build.
