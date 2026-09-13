# Shooter Content OS — Build & Integration Plan

**Version:** 1.0  
**Date:** 2026-09-13  
**Repository:** `h55n/shooting-os`  
**Status:** Authoritative implementation plan

This document supersedes the old Father/Operator/Admin direction. Preserve useful Next.js, Supabase, pgvector, AI-provider, claim-validation, PWA, knowledge, and domain foundations, but rebuild the product as one private authenticated-owner experience for M N Rehman.

## Non-negotiable rules

1. Never modify, replace, expose, regenerate, or rotate existing environment variables or secrets unless explicitly requested.
2. Use safe additive migrations; never rewrite migrations that may already be applied.
3. Keep the app runnable after meaningful phases and add/update tests with behavior changes.
4. Mobile is the primary acceptance target.
5. Every meaningful persistent action must actually save; never show completion after persistence failure.
6. Prefer deterministic taxonomies, rules, templates, validators, workflows, and state machines before AI.
7. AI is for language, judgment, adaptation, creativity, summarization, research interpretation, and conversational control.
8. Do not build Operator Mode, admin dashboards, multi-user product roles, CRM, publishing integrations, or heavy analytics before the creation loop is proven.

## Dependency order

### Phase 0 — Baseline and safety
Run install, tests, typecheck, verify, build; document routes, DB/migration state, runtime issues, and constraints in `docs/BASELINE_2026-09.md`. Do not alter secrets.

### Phase 1 — Product source of truth
Update PRD, architecture/status/manifest/continuation docs and README. Historical Operator references must be explicitly obsolete.

### Phase 2 — Single-owner architecture
Remove `Role` and `requireRole` from product TypeScript decisions; protect the private app with session auth only; disable public signup; remove role routing and headers; add additive RLS migration replacing role-dependent policies with authenticated-owner policies. Keep legacy enum/column until production state is verified.

### Phase 3 — Mobile shell/design system
Bottom nav: `Home | Ideas | Plan | Content | Masterclass`. Assist is a global/contextual action. Build reusable mobile cards, status, progress, script/guidance blocks, loading/error/empty/success states, sheets, toggles and accessible motion/sound foundations. Script readability is a first-class requirement.

### Phase 4 — Onboarding and Guide
Short skippable onboarding; persisted completion/skipped state; contextual `guide_mode` preference; no duplicate UI.

### Phase 5 — Real data access
Stop using `lib/data.ts` as a production data source. Add repository/service functions for home actions, ideas, content, plan, series and masterclasses. Standardize API responses as `{ok:true,data,meta?}` / `{ok:false,error,userMessage?,details?}`.

### Phase 6 — Content engine
Deterministic content-category definitions, hook families/templates, duration estimation, structured Zod script schema, and quality gate. Initial categories: Beginner Education, Common Mistake, Myth/Misconception, Personal Story, Competition Story/Lesson, Demonstration/Technique, Quick Tip, Comparison, Opinion/Expert Take, Problem→Solution, FAQ, Pathway/Career, Mental Performance, Equipment/Setup.

### Phase 7 — Idea flow
Input → classify → retrieve related verified knowledge/content → identify research need → shape angle → validate → persist. UI: My Ideas / Suggested, text + voice entry, idea detail, Build Script, Edit, Assist.

### Phase 8 — Voice
Record → stop → transcribe → show transcript → edit/confirm → continue. Use for ideas, Assist changes, masterclass topics and knowledge corrections.

### Phase 9 — Knowledge grounding
One ingestion/retrieval layer over verified knowledge documents/chunks and pgvector. Claims must receive real verified facts rather than `[]`. Corrections require preview/confirm, versioning/re-indexing, and audit history; chat must never silently mutate core facts.

### Phase 10–11 — Script generation, review and versioning
Idea brief → category → knowledge/research/voice → hook → structured generation → schema validation → deterministic quality gate → claim validation → targeted repair → persisted script/version → Review. Never regenerate the whole script for a small targeted edit. Father-facing script blocks: Hook, main sections, Visual, On-screen text, B-roll, CTA; actions: Approve, Change, Guidance, Shooting View, Assist, restore version.

### Phase 12 — First 10 Videos
Generate once from verified profile/knowledge/content strategy, persist ordered journey and progress, surface next action on Home, and make the 1/10→10/10 path obvious.

### Phase 13 — Series
Persist goal/audience/ordered topics/progress. For 30-day series: generate/review/reorder/replace 30 topic briefs, approve plan, generate first 7 scripts by default, continue in batches, never silently alter approved topics.

### Phase 14 — Plan/production
Persistent Today/Week/Upcoming shoot dates, simple rescheduling, and transactional `Shot Ho Gaya` that updates status/timestamp/tasks/audit/next action. Do not show success if the save fails.

### Phase 15 — Shooting Guidance
Default OFF. Deterministic category guidance first; AI only for topic-specific additions. Persist guidance with the script/content version.

### Phase 16–17 — Shooting View and offline scripts
Full-screen large readable text, section navigation, font size, wake lock where supported, no nav chrome. Explicitly cache approved/current/First-10 shooting scripts for offline use without indiscriminately caching authenticated APIs; clearly show offline availability.

### Phase 18–20 — Research, trends and Assist actions
Research: search/provider → evidence normalization → confidence → content-safe summary with sources. Trends: manual quality-proven refresh first, scoring/dedupe, 1–3 relevant suggestions. Assist becomes typed domain actions (edit script, create idea, schedule/reschedule, correct knowledge, series/masterclass operations) with preview/result; no arbitrary DB access.

### Phase 21 — Masterclass
Real `/masterclass`: existing courses + New. Topic/Suggest/Talk entry. Generate grounded structured outline first with audience/outcome/duration; father reviews/approves; then generate/version lesson scripts. Do not generate entire course before outline approval.

### Phase 22–23 — Notifications and export
In-app actionable notifications first. Export order: copy structured script, native share, printable view, PDF, document export.

### Phase 24–26 — Later
Only after the creation/production loop is proven: minimal manual performance data and evidence-based learning; publishing integrations; future business/leads. No CRM now.

## Practical milestones

- **A Clean Foundation:** baseline, docs, single-owner auth/RLS, navigation, design cleanup.
- **B First Useful Creation Loop:** real ideas, content engine, structured scripts, quality gate, review/versioning.
- **C First 10:** onboarding, Guide, First 10, guidance, approval.
- **D Production Loop:** persistent plan, shoot dates, Shot Ho Gaya, rescheduling, Shooting View, offline.
- **E Intelligence:** knowledge/RAG, verified facts/corrections, research, trends, Assist actions.
- **F Series:** 30-topic planning and batch generation.
- **G Masterclass:** outline/duration/lesson generation/versioning.
- **H Production Readiness:** micro-interactions, notifications, export, mobile E2E, error/performance/smoke audit.

## Test gates

Unit tests cover status mapping, categories, hooks, duration, quality gate, next action, series order, First 10 progress, schedule transitions, Shot Ho Gaya and claim/fact validation. Integration tests cover Idea→save→script→version→approve→schedule→shot, knowledge correction, series batch, and masterclass outline→approval→lesson. Mobile E2E covers First 10, idea, series and masterclass critical paths.

## Completion gate

Core is not complete until M N Rehman can independently onboard/skip, create or receive an idea, generate natural grounded Hinglish short-form, review/edit/Assist, approve, schedule, use optional shooting guidance, open the script offline in Shooting View, mark it shot, progress through First 10, and create/review/generate a masterclass—without any operator role.

> Reliability before agent complexity. Structure before prompting. Useful guidance before automation. Creation before analytics. Owner control before AI autonomy.
