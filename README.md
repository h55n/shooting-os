# Shooting OS

Private, mobile-first content operating system for **M N Rehman**. The product is intentionally single-user: there is no Operator, Father/Operator, Admin, or team-facing product mode.

`docs/PRD.md` and `docs/BUILD_PLAN.md` are the authoritative product and implementation sources.

## Product flow

The main navigation is **Home · Ideas · Plan · Content · Masterclass**. Assist is a contextual action layer rather than a separate operating console.

Core workflows now include:
- idea capture by text or supported browser voice recognition;
- deterministic content categories, hook patterns, duration checks, status rules, and quality gates;
- structured Hinglish-ready scripts with section-level editing and version history;
- explicit approval, shoot scheduling, `Shot Ho Gaya`, optional persisted Shooting Guidance, and teleprompter-lite Shooting View;
- offline access to previously opened Shooting View scripts;
- First 10 Videos and 30-topic Series planning with owner-controlled replacement/reordering and selective batch scripting;
- verified knowledge retrieval, claim validation, and confirmed versioned knowledge corrections;
- evidence-backed research from explicit source URLs with safe claim, warning, confidence, and source visibility;
- manual-first trend candidate scoring without pretending to provide live discovery when no search provider is connected;
- Masterclass outline-first creation, explicit outline approval, lesson generation, lesson review/approval, and version history;
- in-app completion alerts and structured script copy export.

## Technical foundations

- Next.js App Router / React / TypeScript
- Supabase Auth + PostgreSQL + Row Level Security
- pgvector-backed verified knowledge retrieval
- pluggable AI provider fallback layer
- deterministic content-engine and validation modules before AI calls
- PWA manifest + service worker + offline Shooting View fallback
- GitHub Actions verification for tests, typecheck, repository verification, and production build

## Local setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Do not expose or move server provider secrets into client code. Existing environment values are intentionally outside the repository.

## Database

Apply migrations in order. Do **not** rewrite migrations that have already been applied.

Current additive sequence:
- `0001_initial.sql`
- `0002_conversations_versions_jobs.sql`
- `0003_single_owner_model.sql`
- `0004_creation_and_production_flow.sql`
- `0005_knowledge_and_progress.sql`
- `0006_owner_knowledge_updates.sql`
- `0007_intelligence_versioning_notifications.sql`
- `0008_in_app_notification_triggers.sql`

The legacy role enum/column remains only for migration compatibility; product authorization is single authenticated owner.

## Verification

```bash
npm test
npm run typecheck
npm run verify
npm run build
```

GitHub Actions runs the same verification path on pushed commits. See `docs/IMPLEMENTATION_STATUS.md` for current scope, known constraints, and deliberately deferred external integrations.
