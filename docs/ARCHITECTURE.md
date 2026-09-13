# Architecture

Next.js App Router → route handlers → domain services → provider adapters → Supabase PostgreSQL/pgvector/Storage.

AI flow: request → intent → RAG retrieval → model adapter → structured output → claim/content validator → human review → audit.

Provider choices are configuration, not business logic. Default demo adapters are deterministic and do not pretend to be live research or AI.

Core vertical slices map to the PRD: Idea→Script→Approve; Series→Plan; Research→Evidence→Script; Trend→Idea; Masterclass→Review; Publish→Analytics→Learn.
