# Shooting AI Content & Coaching OS

An AI-assisted operating system designed to turn a shooting expert's expertise, experience, and knowledge into a repeatable content and coaching system. This is a production-oriented V1 implementation.

## Overview

The Shooting AI Content & Coaching OS is a mobile-first application designed for the primary user (a shooting expert and coach). It serves as the operating layer connecting:
- **Knowledge & Research**: Structured knowledge base and trend research.
- **Content Creation**: Idea capture, content planning, AI script generation, and review.
- **Coaching**: Masterclass building and performance assessment tracking.
- **Analytics**: Content performance tracking to fuel continuous improvement.

The system ensures that the AI amplifies the human's real expertise, providing a simple, WhatsApp-like UI for the expert, while handling complex AI tasks and agent orchestration in the backend.

## Features

- **Mobile-First Father UI**: Simple, accessible views (Ghar, Plan, Ideas, Content Review, Help/Assistant) tailored for easy use.
- **Operator Console**: Comprehensive tools for internal teams to manage Knowledge, Research, Trends, Masterclass content, and Analytics.
- **Content Lifecycle Management**: Dynamic planning from raw idea capture (text/voice) to script generation, review, and publishing.
- **AI-Powered Workflows**: Idea and script APIs with claim-validation hooks to prevent hallucinations and maintain the expert's authentic voice.
- **Provider Abstraction Seams**: Flexible integration for AI models and speech-to-text providers.
- **Robust Backend**: Powered by Supabase/Postgres with pgvector, Row Level Security (RLS), and audit/agent-run tables.
- **PWA Ready**: Includes a web manifest for seamless mobile installation.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: Supabase / PostgreSQL (with pgvector)
- **Styling**: Tailwind CSS
- **AI Integrations**: Pluggable AI and speech-to-text abstractions

## Getting Started

### Prerequisites
- Node.js 20+
- A Supabase project

### Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment configuration:
   Copy the example environment file and configure your local settings:
   ```bash
   cp .env.example .env.local
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to [http://localhost:3000](http://localhost:3000) to view the app. Demo mode works without provider credentials to review UI and core flows safely.

## Production Setup

1. **Database Initialization**: Apply the `supabase/migrations/0001_initial.sql` file in your Supabase SQL editor.
2. **Configuration**: Set up Auth and Storage in Supabase.
3. **Environment Variables**: Configure all required Vercel environment variables. **Never expose provider secrets in client code.**

## Audit and Continuation

- `docs/AUDIT_CHECKLIST.md`: Full current-state audit (Done / Partial / Missing / Blocked).
- `docs/CONTINUATION_PROMPT.md`: Master handoff prompt for driving the product to production quality.

## Verification

To ensure code quality and verify the setup:

```bash
npm test
npm run typecheck
npm run build
npm run verify
```

*(Note: See `docs/VERIFICATION.md` and `docs/PRODUCTION_HANDOFF.md` for detailed continuation and build steps.)*
