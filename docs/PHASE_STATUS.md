# Phase completion matrix

This file is a high-level snapshot. The authoritative current-state assessment is `docs/AUDIT_CHECKLIST.md`.

| Phase | Current status | Evidence |
|---|---|---|
| 0 Foundation | Partial | PRD/schema/docs exist; real verified brand/voice/story/trend seed data is still required. |
| 1 App shell | Partial | UI/PWA shell exists; real auth, protected routing and browser/device verification are missing. |
| 2 Planner | Partial | Domain logic/schema/tests exist; CRUD, persistence, rescheduling and recovery UX are missing. |
| 3 Idea engine | Partial | Text API/UI and mock provider exist; real STT/RAG/duplicate/persistence/confirmation are missing. |
| 4 Knowledge/RAG | Partial | pgvector schema and verified-only function exist; ingestion/embedding/retrieval service is missing. |
| 5 Research | Partial | Schema/UI/seam exist; live provider, evidence extraction and citation workflow are missing. |
| 6 Trends | Partial | Schema/UI/seam exist; scheduled collection, scoring, approval and trend→idea are missing. |
| 7 Script engine | Partial | Draft/review/claim hook exist; real AI/RAG/voice/research/critic/version persistence is missing. |
| 8 Masterclass | Partial | Schema/UI foundation exists; complete builder/review/version workflow is missing. |
| 9 Assistant | Partial | UI + keyword router exist; orchestration, tools and persistence are missing. |
| 10 Analytics/Learning | Partial | Schema/UI foundation exists; real entry, analysis, recommendations and weekly loop are missing. |

## Verified locally

- `npm test` — **7/7 pass**.
- `node scripts/verify-repo.mjs` — **PASS**.

## Not verified in this environment

- Dependency-backed typecheck/build.
- Browser E2E and console-error audit.
- Real Supabase/Auth/RLS/Storage/pgvector integration.
- Real AI/STT/research/trend integrations.
- Real-device PWA verification.
- Production deployment/smoke test.

See `docs/AUDIT_CHECKLIST.md` for the full breakdown and `docs/CONTINUATION_PROMPT.md` for the required completion plan.
