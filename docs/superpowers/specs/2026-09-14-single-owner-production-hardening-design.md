# Single-owner production hardening design

## Goal

Turn Shooting OS into a small, private, mobile-first content system for one owner. It must allow that owner to establish the account once, use authenticated creation and shooting workflows, and deny every other account. The work must not introduce teams, roles, billing, public content, or a multi-user dashboard.

## Scope and boundaries

- The only interactive account journey is first-owner setup followed by owner sign-in. Public registration is disabled after setup and rejected in production when an owner is configured.
- The owner identifier is a server-only `OWNER_USER_ID` environment value. It is never derived from mutable user metadata, exposed to the client, or committed.
- Supabase remains the source of identity and persistent data. Browser clients use the public key only; service-role access remains confined to server-only utilities.
- The app uses existing workflow screens and visual language. UI changes make account state, protected actions, loading, recovery, and offline shooting clear without adding a new dashboard or design system.
- AI remains optional and low-volume: an explicitly configured provider is used only from server routes, with deterministic/mock behavior reserved for development. No background agents or automatic costly collection is added.
- Production database changes are supplied as reviewed migrations and tests. They are not applied to a remote project in this work.

## Security architecture

`OWNER_USER_ID` is the authoritative boundary. Server route helpers validate the Supabase-authenticated user with `auth.getUser()` and reject any non-owner request before reads or mutations. Middleware/proxy protects navigation, but route handlers independently use the same helper so a bypass cannot become an authorization flaw.

A single owner RLS migration drops legacy broad and role-based policies, revokes anonymous access to app tables, and replaces policies with explicit `TO authenticated` predicates that require `(select auth.uid()) = configured owner UUID`. Per-operation policies make select, insert, update, and delete intent visible. The migration uses no user metadata, no security-definer bypass, and adds indexes only where policy predicates need them.

The controlled setup route may create the initial account only while `OWNER_USER_ID` is unset and only through a server-side bootstrap flow. Once configured, signup is unavailable. Production startup/preflight requires the Supabase URL, public key, owner UUID, and a non-demo configuration; optional AI credentials are required only when their provider is selected.

## Product and UI behavior

The app shell presents one owner’s current action and retains the existing Ideas, Script Review, Schedule, Shooting View, First Ten, Series, Research, Trends, Assist, and Masterclass flows. Account UI is reduced to owner setup/sign-in/status; it has no roles or user management.

Every mutation uses a compact pending state, a recoverable error message, and a retry action where retrying is safe. The Shooting View keeps previously opened script data in local storage and clearly identifies offline mode. The PWA shell remains installable and avoids caching authenticated API responses.

## Verification

Unit tests cover owner configuration parsing, setup lockout, route denial, low-volume provider selection, and user-facing error normalization. SQL/pgTAP tests cover owner allow/second-account deny policies. Browser E2E covers owner setup/sign-in and `Idea → Script → Approve → Schedule → Shooting View → Shot Ho Gaya` at mobile viewport; a live run requires a safe test Supabase project and test device.

The repository uses a current lint command, pinned tool versions, a production build, typecheck, test suite, dependency audit, and a secret-free environment preflight. Live migrations, RLS tests, deployment, external provider calls, and real-device validation remain manual gates requiring project access and explicit approval.

## External inputs required

To perform live validation, the owner must provide access to a non-production Supabase project, set `OWNER_USER_ID` to the owner Auth UUID, provide a separate non-owner Auth UUID, and supply a deployed test URL. Existing provider keys are inspected only for presence; the owner selects a single AI provider/model before it is enabled in production.
