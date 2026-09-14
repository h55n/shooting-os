# Shooting OS production remediation design

## Context

Shooting OS is a private, single-owner application for M N Rehman. The authenticated
owner is the only permitted user. The existing Supabase project uses owner-only RLS,
but application routes and AI integrations need defense in depth. The app must not
store credentials in source control or expose them in responses or logs.

The product issues observed on the deployed app are:

- Assist displays Markdown tokens such as `**bold**` literally instead of formatted
  text and numbered lists.
- AI-backed actions surface generic failures, including Assist and Suggested Ideas.
- The current AI provider selection ignores `AI_PROVIDER` and uses stale hard-coded
  model identifiers in a fallback chain.
- Verified knowledge is retrieved lexically but there is no simple, owner-facing
  explanation of what memory is available or a reliable fallback when no match exists.

## Goals

1. Enforce the single-owner boundary in every non-public API route, including routes
   that use the Supabase service role.
2. Make AI actions reliable, diagnosable, bounded, and safe without exposing provider
   response bodies or credentials.
3. Render assistant content as deliberately restricted Markdown with accessible mobile
   typography.
4. Establish a practical, grounded owner-context workflow: verified knowledge documents
   are the only source for personal claims; retrieval is scoped to the user question;
   user can understand and improve the available context.
5. Address confirmed production hygiene issues while preserving the current credentials
   and deployed database contents.

## Non-goals

- No multi-user roles, signup expansion, public sharing, or team dashboard.
- No credential rotation, source-control changes, or copying secret values into outputs
  or logs.
- No automatic data deletion, production database migration, Git push, or deployment
  without a separate explicit confirmation.
- No claim that the app has a complete biography of M N Rehman until verified knowledge
  is actually seeded and reviewed by the owner.

## Design

### 1. Owner authorization

Create one route-level authorization entry point around `requireOwner()` and invoke it
before input parsing, AI requests, service-role access, or data writes in every private
route. Public exceptions are limited to health, login/reset, and the authentication
callback. Preserve neutral 401/403 user messages and do not leak internal identities.

Routes that only use a cookie-aware Supabase client still receive the application-layer
owner check; RLS remains the database backstop. Service-role AI routes lose their
unauthenticated execution path entirely.

### 2. AI configuration and failure behaviour

Replace implicit provider ordering with an explicit non-secret configuration mapping:
`AI_PROVIDER` selects the primary provider and an optional ordered fallback list may be
configured by provider name. Each supported provider has an overridable model variable
and maintained default. Invalid configuration fails closed with a safe operator-visible
error class, never an API response body.

Provider calls use bounded timeouts and classify failures (missing configuration,
unauthorized provider credentials, exhausted rate limit, upstream unavailable, malformed
model output). Application responses remain actionable and safe; server logs record only
provider name, status class, and request correlation id—not tokens, request bodies, or
provider response bodies. A small authenticated owner-only diagnostic endpoint reports
configuration readiness and provider availability without making model output public.

AI calls occur only after authentication and required contextual data are resolved.
JSON-producing flows validate the response with Zod and retry a malformed response once
with a constrained repair prompt only where this does not create duplicate data.

### 3. Assist content presentation

Use a small Markdown renderer configured for a strict allow-list: paragraphs, headings,
ordered/unordered lists, emphasis, strong text, inline code, and safe external links.
Disable raw HTML and sanitize URLs to `https:`, `http:`, and internal paths. Define
mobile-first spacing, list indentation, line-height, and overflow handling so an AI reply
like a numbered checklist reads as a real checklist rather than literal `**` markers.

Maintain plain-text rendering for the user's own messages. Display a concise retry action
on a failed assistant request, while preserving typed input and avoiding duplicate
conversation persistence.

### 4. Owner knowledge/context

Keep memory deliberately narrow and auditable:

`knowledge_documents` -> verified status -> retrieval by question -> compact prompt context
-> AI response.

Add a visible Assist explanation of matched verified sources (titles/count only) and an
empty-context state that says no personal facts are available for that question. Add a
simple Knowledge readiness panel that counts verified documents and links to the existing
knowledge capture/review workflow. Personal memories, accomplishments, and biographical
claims remain forbidden unless present in verified documents.

Improve retrieval deterministically before introducing embeddings: normalize Hindi/English
tokens, include title/content metadata, apply a minimum score, and cap prompt size. Do not
send the entire knowledge store to a provider.

### 5. Platform hardening and quality

Validate `next` destinations as local paths to close the login open redirect. Remove any
server-side anonymous Supabase singleton that can accidentally be used instead of the
cookie-aware client. Ensure error serialization only returns safe public fields. Add
security response headers appropriate for a Next.js app while preserving Supabase and AI
requests. Pin direct runtime dependencies to the lockfile's verified versions.

Improve basic interaction accessibility on affected surfaces: semantic live status for AI
errors/loading, accessible labels for icon controls, visible focus states, and touch-safe
targets.

### 6. Database follow-up

Prepare, but do not apply, a separate explicit owner-policy migration replacing the
dynamic policy loop with reviewed policies. It will be applied only after the owner
confirms the exact migration and production target. Existing owner-only RLS is preserved
in the meantime.

## Verification

- Unit tests cover safe return paths, route owner guard placement, provider configuration
  parsing, provider-error redaction, Markdown sanitization, and retrieval ranking.
- Route-level tests demonstrate private AI/service-role endpoints reject anonymous and
  non-owner requests before invoking the provider.
- Run the repository test suite, type check, lint if configured, and production build.
- Verify a preview locally or in a non-production deployment with an owner session:
  formatted Assist response, a failed-provider retry state, Suggested Ideas, and no
  private-route response for an unauthenticated request.
- After explicit deployment authorization, verify the production route headers and
  owner-only behaviour. Do not test destructive data mutations in production.

## Rollout

Code changes and tests are committed locally. A deployment is requested separately. The
explicit RLS migration is a separate, reviewed action. After deployment, the owner seeds
3–5 verified voice/context documents and uses Assist grounding indicators to confirm that
answers draw on the intended context.
