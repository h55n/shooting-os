# Shooter Content OS — Product Requirements Document

**Version:** 3.0  
**Status:** New Source of Truth  
**Date:** 2026-09-13  
**Repository:** `h55n/shooting-os`  
**Primary User:** M N Rehman  
**Primary Device:** Mobile phone  
**UI language:** English labels/navigation  
**Content language:** Natural Hindi/Hinglish

## Product definition

Shooter Content OS is one private mobile-first application for M N Rehman. Its primary job is to help him independently create genuinely good short-form shooting education, experience, coaching, competition, and personal-story content for Instagram Reels, YouTube Shorts, and Facebook Reels. Its secondary job is to turn the same grounded expertise into structured masterclasses.

> Complex system underneath. Extremely simple app on top.

This is not a multi-user SaaS, generic chatbot, technical AI console, project-management dashboard, social scheduler first, video editor, CRM, or analytics dashboard. There is **no Operator Mode**, no Father/Operator/Admin product experience, and no user-role hierarchy in normal product logic.

## Primary outcomes

The main creation loop is:

`Idea → Shape → Script → Review → Plan → Shoot → Complete`

The teaching loop is:

`Teaching Topic → Structure → Review → Lesson Scripts → Teach / Publish`

The first major success milestone is that M N Rehman independently creates and shoots his **First 10 Videos** using the app.

## Core principles

- One owner, one experience; authentication is for privacy/security, not product roles.
- Content creation comes first; analytics/publishing/business features are later.
- Deterministic systems own predictable behavior: status, required sections, duration rules, hook/category libraries, formatting, schedules, versions, progress, notifications and offline rules.
- AI is used only for language, judgment, creativity, adaptation, summarization, research interpretation and conversational understanding.
- M N Rehman has final control: accept, edit, reject, targeted-regenerate, restore.
- Generated voice is spoken, raw, real, natural Hinglish: expert but accessible, short sentences, useful, story-driven where relevant, never generic AI copy.
- Knowledge and voice are separate concepts. The system must never invent memories or achievements.
- Mobile is the primary UX: one-hand friendly, large touch targets, strong hierarchy, minimal typing, voice where useful, safe-area aware, fast and PWA-friendly.
- UI quality is functional: no wall-of-text scripts; use clear script sections, spacing, typography, actions, loading/error/empty/success states.
- Technical concepts (models, prompts, embeddings, vectors, tokens, RAG, jobs, audit tables) stay hidden.
- Never modify, expose, replace, regenerate or rotate existing environment variables or secrets unless explicitly requested.

## Content strategy

Primary audiences: beginners, active shooters seeking practical guidance, competitive shooters, parents/aspiring shooters, and broader sports viewers where stories translate.

Primary platforms: Instagram Reels, YouTube Shorts, Facebook Reels. Default target is usually 30–60s; 15–30s when enough, up to ~90s only when justified. Vertical 9:16, one clear idea, strong opening, quick context, retention support, payoff, useful story/example where relevant, optional CTA and production guidance.

Educational content should be infotainment: curiosity, contrast, real examples, mistakes, demonstrations, myths, stories, surprising insights and practical stakes without clickbait.

## Main navigation

Bottom navigation is exactly:

1. Home
2. Ideas
3. Plan
4. Content
5. Masterclass

Voice, Assist, notifications, profile/settings and Guide are contextual/global actions. Assistant is **not** a bottom-navigation destination.

## Onboarding and Guide

Onboarding is short, skippable, replayable and teaches Home, Ideas, Content, Plan, Masterclass, Assist/Guide. It ends by offering the First 10 journey. Track completed/skipped state without blocking app use if preference persistence fails.

`guide_mode` is an optional persistent preference that adds small contextual explanations rather than duplicating the UI. Subtle sounds/micro-interactions may reinforce meaningful success and are configurable.

## Home

Home answers only: **What should I do now?** Surface roughly 1–3 meaningful next actions (review script, shoot today, confirm fact, choose next topic, continue First 10), then secondary upcoming/suggestion/trend/progress. Quick actions: New Idea, Voice Idea, Suggest Something, New Masterclass, Assist. Stats stay secondary.

## Ideas

Entry modes:
- **I Have an Idea** — text or voice.
- **Suggest Something** — grounded suggestions using expertise, knowledge gaps, existing/planned content, series needs, trends and later performance learning, each with a short reason.
- **Talk It Through** — conversational capture that ends in an actionable content item.

Ideas views are **My Ideas** and **Suggested**. AI may challenge weak/generic angles but must never silently override intent.

## Content engine

Initial deterministic categories:
1. Beginner Education
2. Common Mistake
3. Myth / Misconception
4. Personal Story
5. Competition Story / Lesson
6. Demonstration / Technique
7. Quick Tip
8. Comparison
9. Opinion / Expert Take
10. Problem → Solution
11. Question / FAQ
12. Pathway / Career Guidance
13. Mental Performance
14. Equipment / Setup where appropriate

Each category defines structure, hook families, pacing, visual defaults, proof/example expectations, CTA patterns and quality rules.

Hook families include mistake, curiosity, contrarian, specific outcome, question, warning, myth, story opening, demonstration, comparison, expert observation and audience callout. Patterns are stored as structural templates, adapted to topic and scored/checked; AI generates new hooks only where adaptation requires it. The user can Change Hook, Show Alternatives, Rewrite, Make Stronger or Make More Natural.

## Structured scripts

Never store/show only one text blob. Conceptual structure:

```json
{
  "hook": {},
  "setup": {},
  "mainPoint": {},
  "storyOrExample": {},
  "takeaway": {},
  "cta": {},
  "production": {
    "visuals": [],
    "broll": [],
    "onScreenText": [],
    "delivery": []
  },
  "targetDurationSeconds": 52
}
```

The review UI clearly separates HOOK, SETUP/CONTEXT, MAIN POINT, EXAMPLE/STORY, TAKEAWAY and CTA, with optional VISUAL/CAMERA/B-ROLL/ON-SCREEN TEXT/DELIVERY. Timing may show 0–3s etc. Script body readability has dedicated mobile typography.

Before presentation, deterministic quality gates check hook presence/clarity, one dominant idea, unnecessary intro, repetition, spoken language, sentence length, payoff, duration estimate, relevant example/story, non-forced CTA, grounded claims, required fields, duplicates and generic AI filler. AI critic/repair runs only for real higher-level failures, ideally targeted to failed sections.

Every meaningful edit produces a recoverable version with parent/source/reason/timestamp/snapshot. Small edits must not regenerate the entire script.

## Knowledge, claims and corrections

The knowledge base stores identity, career, achievements, competition history, coaching philosophy, shooting knowledge, stories, teaching style, vocabulary, voice examples, research, approved/published content, corrections, verified facts and masterclass material.

Knowledge status is Verified / Unverified / Disputed. Verified facts may be used normally; uncertain personal claims require confirmation; disputed facts cannot be stated as fact. Generation flow retrieves only task-relevant verified knowledge and related context rather than injecting everything.

When father says **This is wrong**: capture correction → preview → confirm → versioned knowledge update → mark prior conflict → re-index → audit. Ordinary chat must never silently mutate core facts.

## Research and trends

Research runs when technical claims need evidence, rules may have changed, the user asks, or uncertainty is detected. Father sees a compact key finding / safe claim / warning / confidence card, with sources behind View Sources. Prefer official governing/event sources, then peer-reviewed/institutional, credible expert and reputable secondary sources; social sources are for trends/audience signals, not factual authority.

Trends appear only as a small **Worth making this week** set (roughly 1–3) with why-now, fit and suggested angle plus Make This/Later/Not Interested. They must not become a dashboard.

## First 10 Videos

After onboarding, offer a persisted generated journey based on verified knowledge and strategy; do not recreate it on every load. Typical progression may include intro/journey/lesson/beginner mistake/stance/aim/mental strength/pressure/story/advice, but it is not a forever-hardcoded list. Each item contains purpose, audience, category, hook, script, duration, platform, visual guidance, optional shooting guidance, shoot date and status. Progress 1/10→10/10 and next action are obvious.

## Series

Series stores name, goal, audience, description, ordered topics, episode state/progress and planned dates. For 30-part series: generate/review all 30 topic briefs → reject/reorder/replace → approve topic plan → generate first batch (default 7) → continue in batches/adapt later topics. Never silently change approved topics.

## Shooting guidance and Shooting View

**Shooting Guidance** defaults OFF and may add simple Hinglish advice for framing, phone position, eye line, stance, delivery, pauses, expressions, movement, demonstrations, B-roll, on-screen text, lighting and useful take segmentation. Deterministic category defaults come first; persist guidance with script/version.

Shooting View/teleprompter-lite: full-screen mobile, large readable text, section-by-section navigation, minimal controls, adjustable size, wake lock where supported, guidance hidden by default, swipe/tap navigation and offline access for explicitly saved/current scripts. Start reliable/simple before auto-scroll.

## Planning and production state

Plan is a production calendar, not project management. Focus V1 on shoot date, with Today/Upcoming/week, easy reschedule, mark complete and open script.

Father-facing pipeline:
1. Draft / Review
2. Approved
3. To Shoot
4. Shot
5. Editing / Ready
6. Published

Internal lifecycle may remain detailed: IDEA → PLANNED → RESEARCHING → SCRIPT_DRAFT → REVIEW → APPROVED → RECORDING → EDITING → SCHEDULED → PUBLISHED → ANALYZING → LEARNED plus BLOCKED/REJECTED/ARCHIVED.

**Shot Ho Gaya** is a real persistent transaction: timestamp/status + shoot task completion + next action + audit where applicable + immediate Home update. Never show completed state when persistence failed.

## Offline

Minimum: recently opened approved scripts and current First 10/shoot scripts are available offline; Shooting View works once explicitly cached; show **Available Offline**. Do not indiscriminately cache authenticated API responses. Full offline editing/sync may be deferred.

## Assist

Assist is contextual control, not the main product UI. Examples: strengthen hook, add story, schedule Friday, correct knowledge, simplify, explain recommendation, change episode 6, make masterclass 3 hours. Supported Assist operations execute typed domain actions with preview/result rather than merely chat. No arbitrary DB access.

## Masterclass

Masterclass is a primary nav area. Start with **I Have a Topic / Suggest Something / Talk It Through** via text/voice. Generate an outline first: topic, audience, learning outcome, modules, lessons, estimated lesson/total duration, demonstrations, stories/examples and prerequisites. Father edits/Assist/reviews and approves outline before full lessons are generated.

Duration requests (e.g. 3 hours) change module count/depth/demos/exercises with visible estimates. After outline approval, generate versioned lesson scripts containing objective, opening, explanation, grounded father knowledge, story/example, demonstration, practice/action, takeaway and closing. Personal claims remain grounded.

## Notifications/export/later scope

Notifications are low-volume and actionable (script ready, fact confirmation, shoot today, research done, series decision, masterclass outline, high-value trend). Start in-app before push.

Export order: Shooting View, copy structured script, native share, printable/PDF, document/text where useful.

Later only: publishing APIs, automated social analytics, evidence-based learning loop, broad repurposing, lead generation/CRM, advanced teleprompter, multi-user expansion.

## Security/reliability

- One owner account, no public signup after setup, no role selector.
- Never expose provider/service secrets client-side.
- Secure server APIs and RLS, validate inputs, avoid client-supplied ownership identifiers.
- Destructive actions need confirmation; meaningful knowledge/content changes are auditable.
- AI workflows handle timeout, malformed/partial output, missing/fallback provider, schema/validation failure, retry, duplicate request, DB/network failure.
- Never claim persistence succeeded when it failed.

Preferred architecture:

`UI → domain action → deterministic preprocessing → retrieval/research if needed → AI only if needed → structured parser → deterministic validators → optional targeted repair → persistence → UI`

## Definition of done

M N Rehman can independently:

`idea → shape → grounded natural Hinglish script → understand optional shooting guidance → review/change → approve → schedule → open at shoot/offline → mark shot → track to published`

and:

`teaching topic → grounded course outline → duration adjustment → approve modules → generate/version/revise complete lesson scripts`

without an operator and without seeing technical AI/database complexity.
