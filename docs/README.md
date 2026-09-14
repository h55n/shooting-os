# Documentation map

## Product

- [Product requirements](./PRD.md)
- [Architecture](./ARCHITECTURE.md)
- [Build plan](./BUILD_PLAN.md)
- [Seed data and verified knowledge](./SEED_DATA.md)

## Operations

- [Production handoff and required access](./PRODUCTION_HANDOFF.md)
- [Deployment guide](./DEPLOYMENT.md)
- [Current implementation status](./IMPLEMENTATION_STATUS.md)
- [Verification guide](./VERIFICATION.md)
- [Audit checklist](./AUDIT_CHECKLIST.md)

## Historical records

Baseline, build-manifest, phase-status, PR, and dated verification documents record
prior work. They are intentionally retained for traceability and are not operational
runbooks. Start operational work from the current handoff and verification guide.

## Active engineering work

- [Production remediation design](./superpowers/specs/2026-09-14-audit-remediation-design.md)
- [Production remediation plan](./superpowers/plans/2026-09-14-production-remediation.md)

## Repository conventions

- `app/` contains pages and route handlers.
- `components/` contains reusable user-interface components.
- `lib/` contains domain, authorization, AI, and data-access logic.
- `supabase/migrations/` contains append-only database migrations; never rewrite an
  applied migration.
- `knowledge/` contains non-secret source material for owner review.
- `tests/` contains automated regression tests.

Environment files remain local or in Vercel. They are never part of this documentation
or source control.
