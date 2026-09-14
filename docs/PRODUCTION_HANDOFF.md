# Production handoff

## Current state

Shooting OS is a private, single-owner Next.js application deployed on Vercel. The
production runtime uses Supabase Auth/Postgres and a server-side AI provider chain.
The live site is `https://shooting-os.vercel.app`.

## First commands after cloning

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

Read `README.md`, `docs/DEPLOYMENT.md`, `docs/IMPLEMENTATION_STATUS.md`,
`docs/ARCHITECTURE.md`, and `.env.example` before changing configuration.

## Runtime configuration

Set the names from `.env.example` in Vercel; values must never be committed or
printed. `OWNER_USER_ID` is the Supabase Auth UUID for the one approved owner.
`SUPABASE_SERVICE_ROLE_KEY` and all provider keys are server-only. Configure an
explicit primary `AI_PROVIDER` plus `AI_FALLBACK_PROVIDERS` for resilient generation.

## Database changes

Migrations in `supabase/migrations/` are append-only. Use the Supabase CLI to create,
dry-run, apply, and verify each new migration. Do not modify an already applied
migration, apply a migration to an unknown project, or use a migration as a rollback.

## Remaining production gates

- Resolve Supabase security-advisor findings for exposed `SECURITY DEFINER` functions,
  mutable function search paths, and leaked-password protection.
- Run real authenticated browser journeys and owner/non-owner RLS denial tests.
- Test install, reload, offline Shooting View, speech capture, wake lock, and touch
  behavior on real Android and iPhone devices.
- Verify every configured AI provider from the deployed environment and retain a safe
  fallback order.

## Security rules

Never commit `.env.local`, API keys, service-role keys, recordings, or private source
documents. Do not deploy, push, alter production data, or apply migrations without
the owner’s explicit approval.
