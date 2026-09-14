# Deployment guide

## Production target

The linked Vercel project serves the production app at `https://shooting-os.vercel.app`.
The default GitHub branch is `master`; the active delivery branch is
`build/single-owner-content-os` until it is fast-forwarded into `master`.

## Pre-deploy checks

Run these from the repository root:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

The GitHub Actions Verify workflow runs the same checks on `master` and `build/**`.

## Database changes

Migrations are append-only. Create a migration with the Supabase CLI, dry-run it,
apply it to the linked project, and verify it before deploying code that depends on it.
Never copy credentials into migration files, source code, logs, or commits.

## Environment safety

Vercel holds runtime values. The required production variable names are documented in
`.env.example`; values stay out of Git. The client may receive only `NEXT_PUBLIC_*`
values. Provider and Supabase service-role keys are server-only.

## Smoke check and rollback

After a production deployment, inspect its status and request `/api/health`. If a
release needs to be reversed, use Vercel's rollback command or dashboard to point the
production alias at the known-good deployment. Do not change database migrations as a
rollback mechanism.
