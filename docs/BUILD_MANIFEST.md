# Build manifest

## Phase-wise delivery
- Phase 0: source-of-truth PRD copied to `docs/PRD.md`; schema, taxonomy and handoff docs included.
- Phase 1: Next.js app shell, mobile-first UI, PWA manifest, Father/Operator navigation.
- Phase 2: planner data model, lifecycle statuses, daily plan and dependency engine.
- Phase 3: idea capture API/UI, deterministic demo AI adapter, voice/STT seam.
- Phase 4: Supabase knowledge tables, pgvector and verified-only match function.
- Phase 5: research workspace and source/evidence schema; provider seam documented.
- Phase 6: trend workspace and trend schema; provider seam documented.
- Phase 7: script generation/review, version-ready model, personal-claim validator.
- Phase 8: masterclass modules/sections, review workflow and source-linking schema.
- Phase 9: unified assistant UI/API with intent routing foundation.
- Phase 10: analytics schema/UI and learning-loop contract.

## Verification performed
`npm test` PASS: 7 tests.
Repository structural verification PASS.

## Verification blocked by environment
Dependency installation (`npm install`) timed out twice. Consequently Next.js build/typecheck/browser/device verification was not executable here. Live Supabase and external AI/STT/trend integrations also require credentials and network access.
