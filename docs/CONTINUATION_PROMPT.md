# Shooting AI Content & Coaching OS — Complete Build Continuation Prompt

> **Use this document as the master handoff prompt for Codex, Claude Code, or another coding agent.**
>
> The objective is **not** to create another V1 scaffold. The objective is to take the current repository from its audited foundation to a **complete, production-quality V1 product** matching the PRD, with real persistence, real integrations, security, testing, mobile UX, observability, deployment, and honest verification.

---

## 0. Your role

You are the senior full-stack engineer, AI systems engineer, QA engineer, security reviewer, and deployment engineer taking ownership of this repository.

Repository name:

`shooting-ai-content-coaching-os`

Product:

**Shooting AI Content & Coaching OS**

Primary user:

**M N Rehman — shooting expert / coach**

Secondary user:

**Internal operator/content operations user**

Primary language:

**Hindi / Hinglish**

Primary platform:

**Mobile-first installable PWA**

Admin platform:

**Desktop-compatible operator/admin interface**

Source of truth:

`docs/PRD.md`

Audit of current state:

`docs/AUDIT_CHECKLIST.md`

Do not assume the current repository is production-ready. Read the audit and verify everything yourself.

---

# 1. Product understanding — do not lose this context

This is not a generic chatbot.

It is an **AI-assisted operating system around the father's real shooting expertise** for:

- content planning,
- idea capture,
- research,
- trend monitoring,
- knowledge management,
- script generation,
- father's authentic voice,
- content review/approval,
- masterclass building,
- analytics,
- learning,
- and eventually the broader coaching/business system.

The core loop is:

```text
Father Expertise
      ↓
Ideas / Questions / Research / Trends
      ↓
Verified Knowledge + Verified Personal Facts + Father's Voice
      ↓
Content Plan
      ↓
Script
      ↓
Father Review
      ↓
Record / Publish
      ↓
Performance Data
      ↓
Learning
      ↓
Better Future Planning
```

The father's interface should feel extremely simple:

```text
Open app
→ see today's work
→ review/use script
→ approve/edit
→ mark progress
→ give feedback
→ move on
```

AI complexity belongs behind the scenes.

---

# 2. Non-negotiable product rules

## 2.1 Never fabricate

The system must never invent:

- father's achievements,
- medals,
- competition results,
- credentials,
- personal history,
- personal stories,
- technical claims attributed to the father,
- sources,
- citations,
- research findings.

If evidence is missing, the system must say so and request verification.

## 2.2 Human approval is mandatory

Default lifecycle:

```text
AI Draft
→ Father Review
→ Revision
→ Approval
→ Record / Publish
```

No AI agent may silently advance content into `APPROVED` or `PUBLISHED`.

Approval must be enforced server-side, not only by hiding/showing UI buttons.

## 2.3 Verified knowledge is the authority layer

AI must retrieve from the structured knowledge base before generation whenever the task depends on factual/domain/personal information.

Knowledge states:

- verified,
- unverified,
- disputed.

Only verified facts can be treated as established facts.

Disputed facts must not enter production generation context without explicit operator resolution.

## 2.4 Voice authenticity

The output must sound like the father, not like generic AI.

Voice characteristics to preserve:

- natural spoken Roman Hindi / Hinglish,
- direct and practical,
- beginner-friendly,
- natural technical English terms,
- coach perspective,
- Concept → Why it matters → Consequence → Practice/Solution,
- practical examples,
- useful repetition,
- no generic motivational filler,
- no artificial grammar mistakes.

Use real father samples only. Do not manufacture fake voice examples.

## 2.5 Father UX

Target user is a middle-aged, non-technical user.

Requirements:

- mobile-first,
- large text,
- minimum 56×56px touch targets,
- full-word buttons,
- no icon-only critical actions,
- simple Hindi/Hinglish,
- obvious current status,
- plain-language errors,
- clear loading states,
- no technical jargon in father mode,
- destructive actions require confirmation.

---

# 3. First action: audit before changing code

Before implementing anything:

1. Read `docs/PRD.md` completely.
2. Read `docs/AUDIT_CHECKLIST.md` completely.
3. Read `README.md`.
4. Read `docs/ARCHITECTURE.md`.
5. Read `docs/VERIFICATION.md`.
6. Read `.env.example`.
7. Inspect every application, library, SQL and test file.
8. Install dependencies.
9. Run tests.
10. Run typecheck.
11. Run lint.
12. Run production build.
13. Fix every local failure before moving forward.

Do not blindly trust existing status labels.

Create/update verification records as work progresses.

---

# 4. Technical direction

Keep the architecture modular and provider-agnostic.

Recommended base stack from the PRD:

- Next.js App Router
- React
- TypeScript
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- pgvector
- server-side Next.js route handlers/server actions
- provider abstraction for AI
- provider abstraction for STT
- provider abstraction for research/trends
- Vercel deployment
- browser E2E framework
- unit/integration tests

Use current stable packages and current framework conventions. If an existing package/script is obsolete, replace it with the current supported approach rather than forcing an old convention.

Do not put provider secrets in client code.

---

# 5. Industry-standard repository architecture

Refactor toward a maintainable feature/domain structure. Do not create a giant route-handler codebase.

A target structure can be:

```text
app/
  (father)/
    page.tsx
    plan/page.tsx
    ideas/page.tsx
    content/page.tsx
    assistant/page.tsx
  operator/
    knowledge/page.tsx
    research/page.tsx
    trends/page.tsx
    masterclass/page.tsx
    analytics/page.tsx
    settings/page.tsx
  api/
    auth/
    projects/
    series/
    content/
    tasks/
    ideas/
    research/
    trends/
    knowledge/
    scripts/
    masterclass/
    assistant/
    analytics/
    agents/
    files/
    settings/
    health/
  login/
  layout.tsx
  globals.css

components/
  ui/
  father/
  operator/
  content/
  planner/
  assistant/
  knowledge/

features/
  auth/
  planner/
  ideas/
  knowledge/
  research/
  trends/
  scripts/
  masterclass/
  assistant/
  analytics/
  notifications/

lib/
  domain/
  db/
  auth/
  ai/
    agents/
    providers/
    prompts/
    schemas/
    orchestration/
  rag/
  research/
  trends/
  voice/
  notifications/
  observability/
  security/
  validation/
  jobs/

supabase/
  migrations/
  seed.sql
  functions/        # if needed

public/
  icons/
  manifest.webmanifest
  sw.js

tests/
  unit/
  integration/
  e2e/
  fixtures/
  ai-evals/

scripts/
  verify-repo.mjs
  seed-demo.mjs
  evaluate-ai.mjs
  smoke-production.mjs

docs/
  PRD.md
  ARCHITECTURE.md
  AUDIT_CHECKLIST.md
  CONTINUATION_PROMPT.md
  VERIFICATION.md
  DEPLOYMENT.md
  SECURITY.md
  AI_EVALUATION.md
  RUNBOOK.md
```

This is a target, not a requirement to move files blindly. Preserve clarity and avoid unnecessary churn.

---

# 6. Build the product as vertical slices

Do not build disconnected infrastructure first.

Build and prove these slices one by one:

```text
Slice 1
Idea → Knowledge/RAG → Research if needed → Script → Critic → Claim validation → Father review → Version → Approval → Planner task

Slice 2
Series → Content items → Dependencies → Daily plan → Reschedule → Recovery proposal

Slice 3
Research → Evidence → Sources → Script context → Citation traceability

Slice 4
Trend signal → Deduplication → Relevance scoring → Operator approval → Idea → Content item

Slice 5
Masterclass → Module → Section → Verified source reuse → Father review → Approval → Version history

Slice 6
Published → Manual analytics → Comparison → Learning insight → Recommendation → Future planning

Slice 7
Father assistant → Intent → Tool selection → Real tool execution → Safe confirmation → Result → Session history
```

Every slice must be fully functional before it is marked complete.

---

# 7. Authentication and authorization

Implement real Supabase Auth.

Requirements:

- email/password or the selected supported login mechanism,
- session persistence,
- refresh handling,
- sign out,
- protected routes,
- role-aware navigation,
- server-side role checks,
- API authorization,
- RLS policies,
- no demo bypass in production mode.

Roles:

- father,
- operator,
- admin.

Create and test a permission matrix for every table and API mutation.

Never trust a client-provided role.

Never use the service-role key from browser code.

Add authorization tests including attempted privilege escalation.

---

# 8. Database and persistence

Review the current schema and evolve it to support complete workflows.

At minimum ensure robust models for:

- profiles,
- projects,
- series,
- content items,
- tasks,
- dependencies,
- ideas,
- scripts and immutable versions,
- knowledge documents,
- knowledge chunks,
- knowledge verification state,
- research jobs/results,
- sources,
- claim/evidence relationships,
- trends,
- masterclasses/modules/sections and versions,
- analytics,
- feedback,
- conversations/messages,
- agent runs,
- audit logs,
- voice examples and feedback,
- notifications/preferences/delivery logs,
- background jobs/idempotency.

Add appropriate:

- created_at,
- updated_at,
- created_by,
- updated_by,
- status constraints,
- indexes,
- foreign keys,
- uniqueness constraints,
- soft-delete/archive semantics where required.

Use migrations rather than editing an already-applied migration in place.

---

# 9. Content lifecycle and versioning

Define and enforce a complete state machine.

Example states can include:

```text
IDEA
→ RESEARCHING
→ DRAFT
→ REVIEW
→ REVISION
→ APPROVED
→ RECORDING
→ RECORDED
→ PUBLISHED
→ ANALYZING
→ LEARNED
```

Use the PRD's actual terminology where it specifies a state.

Requirements:

- invalid transitions rejected server-side,
- original AI draft immutable,
- every edit creates a new version,
- approval records who approved and when,
- publishing records publication metadata,
- audit log for important transitions,
- no silent publishing.

---

# 10. Planner implementation

Build real CRUD for:

- projects,
- series,
- content items,
- tasks,
- dependencies.

Implement:

- 30-day series creation,
- daily plan,
- priority ordering,
- due dates,
- manual rescheduling,
- dependency blocking,
- conflict detection,
- missed-task detection,
- downstream impact calculation,
- proposed recovery plan,
- father/operator approval of recovery changes.

Important:

The system may **propose** schedule changes. It must not silently change important commitments.

---

# 11. Idea engine

Implement the full pipeline:

```text
Text or voice input
→ transcription if voice
→ intent classification
→ topic classification
→ duplicate check
→ knowledge retrieval
→ trend check
→ research-needed decision
→ 2–3 content angles
→ format suggestion
→ structured proposal
→ father confirmation
→ content item creation
```

Voice input must use actual browser microphone capture and a real STT adapter.

Handle:

- permission denied,
- no microphone,
- unclear transcription,
- timeout,
- provider error,
- empty transcript.

Father-facing message for unclear transcription should be simple Hindi/Hinglish.

---

# 12. Knowledge Base and RAG

Implement end-to-end RAG.

Pipeline:

```text
Operator uploads document
→ secure storage
→ extract text
→ normalize
→ chunk
→ metadata tagging
→ verification status
→ embedding generation
→ pgvector storage
→ retrieval
→ metadata filtering
→ reranking
→ context assembly
→ citations/evidence
→ generation
→ output validation
```

Knowledge metadata must distinguish:

- verified fact,
- verified father statement,
- research finding,
- opinion/commentary,
- draft content,
- approved content,
- external source.

Only appropriate verified material should be eligible for factual generation.

Implement operator workflows for:

- upload,
- preview,
- verify,
- mark unverified,
- dispute,
- resolve dispute,
- archive.

Secure private documents using Supabase Storage policies and signed URLs where appropriate.

Do not expose private knowledge publicly.

---

# 13. Father's voice system

Implement a real voice context layer.

Initial data requirement:

**3–5 authentic father speech/writing samples.**

Do not invent them.

Store:

- sample,
- source,
- date,
- format,
- verified status,
- notes.

Build retrieval based on relevant examples rather than stuffing all samples into every prompt.

Store useful feedback:

- father-approved wording,
- father corrections,
- rejected phrases,
- preferred vocabulary,
- phrases to avoid.

Use this data in future generation context.

Build an evaluation set comparing generated output against authentic examples.

---

# 14. Research engine

Implement provider abstraction.

The first real provider can be whichever is practical and configured, but the business layer must not depend on a single vendor.

Pipeline:

```text
Research request
→ query planning
→ source search
→ retrieval
→ source normalization
→ credibility/source hierarchy
→ finding extraction
→ claim extraction
→ citation mapping
→ research synthesis
→ review/status
→ attach to content
```

Requirements:

- citations must point to actual retrieved sources,
- no invented URLs,
- no fabricated publishers,
- source timestamps/access times,
- deduplication,
- retries,
- rate-limit handling,
- failure states,
- operator review for questionable evidence.

---

# 15. Trend research system

Implement scheduled daily scanning.

Sources specified by the PRD include:

- YouTube,
- Instagram,
- Google Trends,
- forums.

Provider adapters must be replaceable.

Pipeline:

```text
Scheduled scan
→ collect signals
→ normalize
→ deduplicate
→ cluster topics
→ relevance score
→ urgency/freshness
→ match against pillars/knowledge
→ store trend item
→ operator review
→ approve/dismiss
→ approved trend → idea engine
→ optional father alert
```

Do not treat a single viral signal as universal audience evidence.

Explain relevance enough for the operator to understand why a trend was surfaced.

---

# 16. Script engine

Support PRD formats:

- Instagram Reel,
- short video,
- YouTube long-form,
- YouTube Short,
- educational post,
- Instagram Carousel,
- Instagram Story sequence,
- masterclass section,
- email/lead-magnet content.

Generation context should include only relevant evidence:

```text
Approved idea
+ relevant verified KB
+ verified father facts
+ relevant research
+ approved trend context
+ relevant father voice examples
+ content history/duplicate context
+ target audience
+ format requirements
```

Then:

```text
Generate structured draft
→ schema validation
→ factual/claim validation
→ critic review
→ revision suggestions
→ father review
```

Implement AI actions:

- simplify,
- rewrite,
- shorten,
- expand,
- voice adjust.

Never overwrite v1.

---

# 17. Claim validator and safety gate

The current regex-style validator is only a starting point.

Build a production claim-validation system.

For important factual/personal claims, represent:

```text
claim
claim_type
source/evidence IDs
verification state
confidence
blocking reason
```

Block or flag unsupported personal claims before father review according to the safety policy.

Examples of forbidden fabrication:

- “I won X medal” without evidence,
- “I represented India at…” without evidence,
- invented career timeline,
- invented credentials,
- invented coaching results.

The system should ask for evidence rather than filling the gap.

---

# 18. Content Critic Agent

Implement a critic that evaluates:

- factual accuracy,
- source grounding,
- voice consistency,
- hook strength,
- clarity,
- simplicity,
- retention structure,
- differentiation,
- CTA quality,
- brand fit.

Return structured findings.

Do not let the critic silently change content.

Critic output should be visible to operator and used by the revision workflow.

---

# 19. Masterclass builder

Implement:

```text
Masterclass
→ Modules
→ Sections
→ Source content
→ Draft
→ Claim validation
→ Father review
→ Revision
→ Approval
→ Version history
```

Features:

- create/reorder modules,
- create/reorder sections,
- generate from verified KB,
- reuse approved scripts,
- AI draft assistance,
- one-module-at-a-time father review,
- section approval,
- version history,
- source traceability.

---

# 20. AI assistant / orchestrator

Replace the current keyword router with a real orchestration layer.

Architecture:

```text
User message
→ intent detection
→ task planning
→ tool selection
→ authorization check
→ RAG/context retrieval
→ agent/tool execution
→ validation
→ confirmation if side effect
→ response
→ conversation persistence
```

Tools should cover:

- planner,
- ideas,
- research,
- trends,
- knowledge,
- scripts,
- masterclass,
- analytics.

Example:

```text
Father: “Aaj kya karna hai?”

Assistant:
→ planner.getToday()
→ dependency check
→ overdue check
→ produce 2–3 highest priority actions
```

Example:

```text
Father: “Trigger control pe reel banao.”

Assistant:
→ classify request
→ retrieve trigger-control KB
→ check duplicate content
→ check trend context
→ create script draft
→ critic
→ claim validator
→ save draft
→ return review link
```

Any action that changes important data must have explicit confirmation when required.

Persist session history.

---

# 21. Analytics and learning loop

Implement manual operator analytics entry for V1.

Store normalized metrics with:

- content item,
- platform,
- metric,
- value,
- recorded_at.

Support comparison views.

Build learning pipeline:

```text
Published content
→ analytics entry
→ normalize metrics
→ compare cohorts/formats/topics
→ generate evidence-backed insight
→ recommendation
→ future idea/planner input
```

Do not claim causality from tiny samples.

Recommendations should show the evidence window and confidence.

Generate weekly summary.

---

# 22. Notifications

Implement a provider abstraction for notification delivery.

PRD requirement:

- maximum 2–3 father notifications/day,
- no technical error messages to father,
- Hindi/Hinglish messaging.

Support relevant events:

- daily plan,
- script ready,
- research complete,
- overdue recording,
- series behind schedule,
- approved trend,
- masterclass module ready,
- weekly analytics summary.

Implement:

- preference management,
- scheduling,
- deduplication,
- daily cap,
- retry,
- delivery log,
- failure monitoring.

---

# 23. Observability and cost controls

Every important AI workflow must create an `agent_runs` record.

Track:

- agent name,
- input reference/metadata,
- output metadata,
- provider/model,
- latency,
- token usage,
- estimated cost,
- status,
- error category,
- timestamps.

Do not log secrets or private document contents unnecessarily.

Implement:

- structured logs,
- correlation IDs,
- error boundaries,
- request timing,
- provider failures,
- job failures,
- database failures,
- storage failures.

Cost controls:

- retrieval caching,
- query dedupe,
- appropriate model tier routing,
- provider fallback,
- token limits,
- budget thresholds,
- safe retries.

---

# 24. Security hardening

Perform a dedicated security review.

Requirements:

- RLS on all private tables,
- API authorization,
- server-only provider secrets,
- secure Storage policies,
- signed URLs,
- input validation,
- output validation,
- rate limiting for expensive endpoints,
- abuse protection,
- safe file handling,
- security headers,
- CSP where appropriate,
- dependency vulnerability scan,
- no secrets in git,
- no private father data in demo seed data,
- backup/restore plan.

Test unauthorized access explicitly.

---

# 25. PWA and mobile quality

The father experience must be excellent on an actual phone.

Verify:

- installability,
- manifest,
- icons,
- splash/start URL as appropriate,
- responsive layouts,
- safe-area insets,
- touch targets,
- keyboard behaviour,
- microphone permission flow,
- loading states,
- offline/failure messaging,
- service-worker update behaviour,
- no horizontal overflow,
- readable typography,
- fixed bottom navigation usability.

Do not claim PWA completion without a real-device test.

---

# 26. Testing strategy

## Unit

Cover:

- status transitions,
- scheduling,
- dependencies,
- planning recovery,
- claim validation,
- prompt/context builders,
- schema validation,
- source hierarchy,
- trend scoring,
- notification cap,
- cost routing.

## Integration

Test against a dedicated test Supabase environment:

- auth,
- RLS,
- CRUD,
- storage,
- pgvector,
- jobs,
- full vertical slices.

## Browser E2E

Use a real browser automation framework.

Required journeys:

1. Login → Home.
2. Idea capture → proposal.
3. Idea → script → review → edit → version → approve.
4. Series → dependency → daily plan.
5. Missed task → recovery proposal.
6. Research → sources → evidence → script.
7. Trend → approve → idea.
8. Masterclass → section → father review → approve.
9. Publish → analytics → learning recommendation.
10. Assistant → planner/tool execution.

Run with a mobile viewport.

Fail tests on console errors.

## Accessibility

Test:

- keyboard navigation,
- focus visibility,
- semantics,
- labels,
- contrast,
- screen-reader basics,
- touch targets.

## AI evaluation

Create a fixed regression dataset containing:

- real father voice examples,
- verified shooting facts,
- verified personal facts,
- intentionally false personal claims,
- typical father ideas,
- Hindi/Hinglish cases,
- trend signals.

Measure:

- factual accuracy,
- source grounding,
- voice similarity/acceptance,
- hallucination rate,
- personal claim detection accuracy,
- instruction following.

Store evaluation results so future model/provider changes can be compared.

---

# 27. Provider abstraction

Keep interfaces stable.

Potential providers mentioned in the product planning include:

- Gemini,
- Groq,
- OpenRouter,
- Sarvam,
- Ollama/local models,
- Hugging Face/dedicated embeddings.

Do not hard-code business logic to one provider.

The implementation must select providers through configuration.

A mock provider may remain for local development, but production must fail clearly if a required real provider is not configured. Never silently substitute mock output in production.

---

# 28. Environment configuration

Create a clean environment contract.

Separate:

- public browser-safe variables,
- server-only secrets,
- test variables,
- production variables.

Never expose:

- service-role keys,
- AI provider keys,
- STT keys,
- research/trend secrets.

Document exactly which variables are required for each feature.

---

# 29. Deployment

Deploy to Vercel after the application passes local verification.

Requirements:

1. production Supabase project,
2. migrations applied,
3. auth configured,
4. storage configured,
5. RLS verified,
6. real AI provider configured,
7. real STT configured,
8. research/trend provider configured,
9. cron/jobs configured,
10. notification provider configured if used,
11. Vercel environment variables configured,
12. production build passes,
13. production smoke tests pass,
14. rollback procedure documented.

Record:

- production URL,
- deployment identifier,
- database migration version,
- environment configuration status,
- rollback command/procedure.

Never report “deployed successfully” without actually verifying the deployed application.

---

# 30. Seed data requirements

Do not fabricate father's real information.

Production seed data must be created from supplied/verified material.

Required:

### Brand
- father profile,
- positioning,
- philosophy,
- vocabulary,
- verified credentials.

### Voice
- 3–5 authentic speech/writing samples.

### Knowledge
- shooting fundamentals,
- competition,
- mental performance,
- pathway,
- Olympic pathway.

### Story
- source-backed personal timeline.

### Content
- real existing ideas,
- approved scripts,
- published examples where available.

### Trends
- source configuration,
- relevant keywords/categories.

If this data is not available, mark the corresponding production acceptance as blocked. Do not manufacture it.

---

# 31. Error handling

Father-facing errors must be simple Hindi/Hinglish.

Examples:

```text
Knowledge missing:
“Is point ke liye mere paas verified information nahi hai. Operator se confirm karwana hoga.”

Unclear transcription:
“Mujhe ye phrase clearly nahi mila. Kya aap dobara bol sakte hain?”

Schedule conflict:
“Current plan mein tasks overlap ho rahe hain. Main ek revised plan suggest kar sakta hoon.”

Unsupported personal claim:
“Ye claim verified Knowledge Base mein nahi hai. Source milne tak main ise final script mein include nahi karunga.”
```

Operator/admin errors can contain technical details, but still should be actionable and safe.

---

# 32. Definition of Done — strict gate

A feature is Done only if all applicable items are true:

- [ ] UI works on mobile.
- [ ] Backend behaviour is real, not mocked.
- [ ] Data persists correctly.
- [ ] Authorization is enforced server-side.
- [ ] Error cases are handled.
- [ ] AI output is validated.
- [ ] Relevant unit tests exist.
- [ ] Integration tests exist.
- [ ] Browser E2E passes.
- [ ] No console errors on critical journey.
- [ ] Father-facing UI is simple Hindi/Hinglish.
- [ ] Real device verification completed for mobile-critical features.
- [ ] Observability exists for important operations.
- [ ] Security review completed.
- [ ] Documentation is updated.

If one of these is not true, the feature is not Done.

---

# 33. Required acceptance tests

The following must actually execute successfully before final completion:

### Home
Given pending tasks exist → Home shows today's highest-priority 2–3 tasks without navigation.

### Idea
Given father speaks a rough idea → structured proposal is produced within the target response time under configured provider performance.

### Research
Given factual research request → findings contain actual cited sources.

### Trends
Given scheduled scan → relevant trend items are collected, scored, stored and presented for operator approval.

### Script
Given approved topic + verified knowledge/research → script is generated with voice context and validation.

### Personal claim
Given unsupported personal claim → validator blocks/flags it before final approval context.

### Versioning
Given father edits v1 → v1 remains immutable and edited version is stored separately.

### Masterclass
Given operator assembles a section → father can review and approve/revise it.

### Planning recovery
Given missed task → downstream impact is calculated and revised schedule is proposed for approval.

### Analytics learning
Given performance data → data is stored and used in a future recommendation.

---

# 34. Final verification protocol

At the end, execute in order:

```text
1. clean install
2. unit tests
3. typecheck
4. lint
5. production build
6. integration tests
7. browser E2E
8. mobile viewport E2E
9. accessibility checks
10. AI evaluation suite
11. Supabase/RLS/Storage verification
12. PWA real-device verification
13. production deployment
14. production smoke tests
15. rollback verification/documentation
```

Keep evidence for each step.

If something cannot run, record:

- exact blocker,
- exact missing input/credential,
- exact command/test that was blocked,
- what remains unverified.

Do not convert “not run” into “passed”.

---

# 35. Final reporting rule

Your final report must contain four sections:

1. **Actually completed** — only backed by execution evidence.
2. **Partially completed** — implementation exists but acceptance is incomplete.
3. **Blocked** — exact external/environment dependency.
4. **Remaining work** — actionable items with priority.

Do not say:

- “production ready” unless production verification passed,
- “all features complete” if any required V1 capability is missing,
- “tested” when you only inspected source code,
- “AI integrated” when a mock provider is still being used,
- “auth implemented” when the login is only a demo,
- “RAG implemented” when only pgvector schema exists.

Evidence beats optimism.

---

# 36. Definition of project completion

The project can be called **Complete V1 / Production Ready** only when the PRD's V1 scope is implemented end-to-end and the following are true:

```text
Real user authentication
        ↓
Real persisted data
        ↓
Idea / Voice capture
        ↓
RAG + verified knowledge
        ↓
Research + citations
        ↓
Trend monitoring + approval
        ↓
AI generation + father's voice
        ↓
Critic + claim validation
        ↓
Father review + versioning + approval
        ↓
Planner + dependencies + recovery
        ↓
Recording / publication state
        ↓
Analytics
        ↓
Learning + recommendations
        ↓
Masterclass reuse
        ↓
Assistant orchestration
        ↓
Notifications
        ↓
Audit + observability + cost controls
        ↓
Security verification
        ↓
Browser E2E
        ↓
Real-device PWA verification
        ↓
Production deployment + smoke test
```

The final product should feel like:

> **“Mere content ka ek intelligent assistant jo meri planning, research, trends, script, masterclass aur daily kaam sambhalta hai.”**

It should not feel like a complicated AI dashboard.

Build for the father's simplicity while keeping the backend at professional production quality.
