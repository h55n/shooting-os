# Production handoff / initialization prompt

Use this prompt in the next coding/deployment session after cloning the repository:

> You are taking over `shooting-ai-content-coaching-os`. Read `README.md`, `docs/PHASE_STATUS.md`, `docs/VERIFICATION.md`, `docs/ARCHITECTURE.md`, `.env.example`, and the full `papa-crm-PRD-v2.md`. Do not replace working architecture unless required. Complete the remaining deployment-readiness work phase by phase. First run `npm install`, `npm run test`, `npm run typecheck`, and `npm run build`; fix every failure. Then provision a Supabase project, apply `supabase/migrations/0001_initial.sql`, configure Auth roles, Storage buckets and RLS, and seed verified brand/voice/knowledge/story data. Configure one real AI provider, one STT provider, and real trend/research providers. Implement provider adapters without putting secrets in the client. Add browser E2E for Home, Idea→Script→Review→Approve, planner dependencies, research, trends, masterclass review and analytics learning. Use a mobile viewport and fail on console errors. Run the PRD AI evaluation dataset for factual accuracy, source grounding, voice, hallucination and unsupported personal claims. Verify real-device PWA behavior. Deploy to Vercel, set environment variables, configure cron/notifications as appropriate, run smoke tests against production, and document exact production URLs and rollback steps. Never mark an acceptance test passed unless it was actually executed. Any missing external credential or API must be recorded as a blocker with the exact configuration needed.

## Required human inputs
- Supabase project URL + anon key + server-side service key
- Father identity/profile and 3–5 authentic voice samples
- Verified credentials and personal story sources
- AI provider API key/model choice
- STT provider key
- Research/trend provider keys
- Vercel project access
- Notification channel choice

## Security rules
Never commit `.env.local`, API keys, service-role keys, recordings, or private source documents.
