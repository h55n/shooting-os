# Shooting AI Content & Coaching OS — Product Requirements Document

**Version:** 2.0
**Status:** Build Blueprint
**Date:** 2026-09-08
**Product:** Shooting AI Content & Coaching OS
**Primary User:** M N Rehman (Father / Shooting Expert / Coach)
**Secondary Users:** Internal content/operations team (Operator); future athletes, parents, coaching leads
**Primary Language:** Hindi / Hinglish
**Platforms:** Mobile-first PWA (installable on Android/iOS); desktop-compatible admin view

---

## Table of Contents

1. Executive Summary
2. Product Vision
3. Problem Statement
4. Product Principles
5. Target Users
6. V1 Product Scope
7. Core User Experience
8. Content Planning System
9. Idea System
10. Research System
11. Trend Research System *(V1)*
12. Knowledge Base
13. Father's Voice System
14. Script Generation System
15. Script Review
16. Masterclass Builder *(V1)*
17. Content Repurposing
18. Analytics System
19. Learning Loop
20. AI Assistant
21. AI Agent Architecture
22. Agent Orchestration
23. Model Strategy
24. Notifications
25. UI/UX Requirements
26. Voice Input
27. Content Dependencies
28. Scheduling Engine
29. Content Pillars
30. Funnel Mapping
31. Initial Shooting Knowledge Model
32. Father's Story Model
33. Accuracy and Safety Layer
34. Recommended Technical Architecture
35. Core Database Model
36. Knowledge Retrieval / RAG Flow
37. API / Service Boundaries
38. Security
39. Observability
40. Cost Management
41. Testing Strategy
42. Acceptance Tests
43. Phase-Wise Build Plan
44. MVP Definition
45. MVP Success Metrics
46. Definition of Done
47. Development Workflow
48. Vertical Slice Strategy
49. Initial Seed Data
50. Example End-to-End Workflow
51. Example Assistant Interaction
52. Failure Handling
53. What the AI Must Never Do
54. What the AI Should Do
55. Long-Term Architecture
56. Open Decisions
57. Recommended Technology Stack
58. Final Product Definition

---

## 1. Executive Summary

The Shooting AI Content & Coaching OS is a simple, mobile-first application designed to turn the father's shooting expertise, experience, stories, ideas and knowledge into a repeatable content and coaching system.

The product is not intended to be a generic chatbot.

It is an **AI-assisted operating system for shooting education, personal-brand content, research, planning, scripting, trend monitoring, masterclass building, and learning**.

The core loop is:

```
Father's Expertise
      ↓
Ideas / Questions / Research / Trends
      ↓
Knowledge + Verified Facts + Father's Voice
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

The system must make the father's job extremely simple:

> Open app → see today's work → review/use script → mark status → give feedback → move on.

AI performs all complex work behind the scenes.

---

## 2. Product Vision

Build a scalable system around the father's real expertise:

**Shooting → Education → Authority → Trust → Masterclass → Performance Assessment → Personalized Coaching**

The product should eventually become the operating layer connecting:

- Knowledge
- Research and Trends
- Content
- Personal brand
- Masterclasses
- Leads
- Coaching
- Analytics
- Continuous improvement

The most valuable asset in this system is not the AI model.

It is:

**Father's real expertise + verified story + unique voice + structured shooting knowledge + audience understanding + content system + analytics/feedback.**

AI amplifies that asset.

---

## 3. Problem Statement

Currently, content creation and coaching operations are fragmented:

- Ideas exist in conversations or memory.
- Content series require manual planning.
- Scripts need repeated writing and rewriting.
- Research is disconnected from content production.
- Trend monitoring is manual or non-existent.
- The father's authentic speaking style can be lost in generic AI output.
- Completed and pending content is difficult to track.
- A missed recording can break the content schedule.
- There is no unified feedback loop from published content to future planning.
- Masterclass material has no structured builder or content-reuse system.
- A generic AI can hallucinate personal achievements or technical claims.
- The father should not need to learn prompting or complicated software.

The product solves all of this by creating one simple interface over a structured AI and content backend.

---

## 4. Product Principles

### 4.1 Simple for the Father

The father must be able to operate the entire system without understanding or touching:

- Prompts
- AI models
- APIs
- Databases
- Agents
- Research workflows
- Automation pipelines

His interface must feel like using WhatsApp — familiar, big buttons, clear labels, minimal decisions.

### 4.2 AI Behind the Scenes

All complexity belongs in the backend. The UI exposes only simple human actions:

- `Aaj kya hai?`
- `Mera idea`
- `Research karo`
- `Script banao`
- `Meri language mein karo`
- `Change this`
- `Approve`
- `Done`

### 4.3 Father's Expertise Is the Source of Authority

AI must never invent:

- Achievements or medals
- Competition results
- Credentials
- Personal history
- Technical claims attributed to the father

Every personal fact must come from verified source material provided by the operator or the father himself.

### 4.4 Human Approval Before Publishing

AI prepares. The father decides.

Default workflow:
```
AI Draft → Father Review → Revision → Approval → Record / Publish
```

Nothing advances past APPROVED status without the father's explicit confirmation.

### 4.5 Mobile First

The primary experience must work comfortably on a phone with one hand. Large text, large touch targets, minimal scrolling for key tasks.

### 4.6 Hindi / Hinglish First

The system must support natural spoken and written Hindi/Hinglish. Technical shooting terms may remain in English where that matches the father's natural vocabulary. Do not add grammatical mistakes artificially — preserve his natural thinking pattern and vocabulary.

### 4.7 Structured Knowledge Over Model Memory

The AI retrieves relevant information from the Shooting Knowledge Base instead of relying on model training memory. This prevents hallucination and ensures consistency.

### 4.8 Middle-Aged User Accessibility

The UI is designed explicitly for a middle-aged, non-technical primary user:

- Font sizes must be large and readable without zooming
- No small icons without labels
- No hidden gestures (no swipe-to-delete without a visible button alternative)
- Actions are always clearly labelled in Hindi/Hinglish
- One primary action per screen — no decision overload
- Confirmation dialogs for destructive or irreversible actions
- Status always visible — the father should never wonder what is happening
- Loading states must show a simple message: *"Abhi ho raha hai..."*

---

## 5. Target Users

### 5.1 Primary User — Father (M N Rehman)

An experienced shooter and coach who:

- Provides expertise, stories, and lived experience
- Captures ideas verbally or as short notes
- Reviews and approves scripts
- Records videos
- Gives corrections and feedback
- Marks content progress

He sees the simplest possible UI. He must never encounter technical jargon, agent names, model names, or prompt instructions.

### 5.2 Operator / Content Manager

Internal user (Hassan or team) who:

- Creates and manages content series and campaigns
- Conducts and manages research tasks
- Manages the knowledge base and uploads source documents
- Manages the trend research feed
- Builds and organises masterclass content
- Enters analytics data
- Handles publishing workflow
- Maintains the content pipeline

The operator view has full access to the backend tools.

### 5.3 Future — Athlete / Parent / Lead

Not in V1 scope.

Future functionality will connect educational content to:

- Masterclass registration
- Performance assessments
- Personalized coaching
- Parent and athlete programs

---

## 6. V1 Product Scope

The following features are in scope for V1. Everything else is explicitly deferred.

### V1 Core Features

1. Authentication (role-based: Father / Operator / Admin)
2. Home / Today screen
3. Content Planner
4. Series management
5. Idea capture (text + voice)
6. AI idea expansion
7. Research workflow (manual trigger + AI execution)
8. **Trend Research System** *(V1 — automated)*
9. Script generation with father's voice layer
10. Script review and editing
11. Script version history
12. Content status tracking
13. Knowledge Base with RAG retrieval
14. Source and citation storage
15. **Masterclass Builder** *(V1)*
16. Content repurposing (one idea → multiple formats)
17. Basic analytics (manual entry in V1)
18. Learning loop (analytics → recommendations)
19. AI assistant (single conversational interface)
20. Notifications
21. Activity / history log
22. Error and audit logging

### V2 (Deferred)

- Automated publishing integrations (YouTube, Instagram APIs)
- Platform-connected analytics (auto-pull from social platforms)
- Lead tracking and CRM
- Performance assessment workflow
- n8n automation layer
- Advanced agent orchestration

### Future

- Athlete portal
- Personalized training plans
- Coaching CRM with full pipeline
- Parent portal
- Performance data integration
- Advanced video analysis
- Multilingual expansion beyond Hindi

---

## 7. Core User Experience

### 7.1 Home Screen

The home screen answers one question every time the father opens the app:

> **Aaj mujhe kya karna hai?**

Example home screen layout:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Good Morning, Rehman Sahab 🎯
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Aaj ka Kaam  (3 items)

  ┌─────────────────────────┐
  │ 🎬 Reel #12             │
  │ Trigger Control         │
  │ Script: Taiyaar ✅      │
  │ Recording: Baaki hai    │
  │              [Kholo →]  │
  └─────────────────────────┘

  ┌─────────────────────────┐
  │ 📚 Beginner Series Day 4│
  │ Research: Hua ✅        │
  │ Script: Review karo ⚠️  │
  │              [Kholo →]  │
  └─────────────────────────┘

  ┌─────────────────────────┐
  │ 📺 YouTube              │
  │ Competition Pressure    │
  │ Status: Research ho     │
  │ rahi hai... ⏳          │
  │              [Kholo →]  │
  └─────────────────────────┘

  ┌─────────────────────────┐
  │ + Mera Naya Idea        │
  └─────────────────────────┘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

The father must never need to navigate through menus to discover today's work. Everything urgent is on this one screen.

### 7.2 Navigation Structure

**Father view — bottom navigation bar (5 tabs):**

```
🏠 Ghar   |   📋 Plan   |   💡 Ideas   |   📝 Content   |   🤖 Help
```

Labels must be in Hindi or Hinglish. Icons must be large and recognizable.

**Operator / Admin view — adds access to:**

- Knowledge Base
- Research
- Trend Research
- Masterclass Builder
- Analytics
- Settings / Admin

---

## 8. Content Planning System

The planner is the operational heart of the application.

### 8.1 Content Hierarchy

```
Campaign
   ↓
Content Series
   ↓
Content Piece
   ↓
Tasks
   ↓
Assets
   ↓
Performance
```

Example:

```
Campaign:   Beginner Shooting Education
Series:     30 Days Beginner Shooting
Episode:    Day 4 — Breathing Technique

Tasks:
  → Research
  → Script
  → Father Review
  → Recording
  → Editing
  → Publishing
  → Analytics Entry
```

### 8.2 Content Status Model

Every content item moves through a defined status pipeline:

```
IDEA
  ↓
PLANNED
  ↓
RESEARCHING
  ↓
SCRIPT_DRAFT
  ↓
REVIEW          ← Father's action required here
  ↓
APPROVED        ← Father's explicit approval
  ↓
RECORDING
  ↓
EDITING
  ↓
SCHEDULED
  ↓
PUBLISHED
  ↓
ANALYZING
  ↓
LEARNED
```

Additional statuses: `BLOCKED`, `REJECTED`, `ARCHIVED`

A status badge must always be visible on the content card so the father can see at a glance what stage everything is at.

### 8.3 Dynamic Planning

The planner must respond intelligently to real progress — and missed progress.

Example:
```
Monday: Day 3 recording was not completed.

System checks:
  → Is Day 4 dependent on Day 3?
  → Is this a sequential series?
  → Can Day 4 proceed independently?
  → Is there another ready item that can fill the slot?

System proposes updated plan.

Father approves or adjusts.
```

The AI must always **propose** schedule changes and wait for human approval. It must never silently reschedule important commitments.

---

## 9. Idea System

This is one of the most critical features. The father must be able to capture an idea in whatever form it comes to him.

### 9.1 Input Types

- Free text (typed)
- Voice note (spoken, then transcribed)
- Short sentence or fragment
- Rough thought or observation
- Question
- Shooting mistake or correction
- Coaching lesson from a session
- A student's problem or question

Example:

> *"Beginners trigger ko jaldi press karte hain aur shot kharab hota hai."*

This becomes a full structured content item without the father needing to do anything else.

### 9.2 Idea Processing Pipeline

```
RAW IDEA (text or voice)
   ↓
Understand intent
   ↓
Classify shooting topic
   ↓
Search Knowledge Base for related material
   ↓
Check existing content to avoid duplication
   ↓
Identify research gaps
   ↓
Check trend feed for relevance
   ↓
Generate 2–3 possible content angles
   ↓
Suggest format (Reel / YouTube / Carousel / etc.)
   ↓
Create content candidate
```

### 9.3 AI Output Per Idea

For each processed idea, the system returns:

- Suggested title
- Core lesson or insight
- Target audience
- Recommended content pillar
- Suggested format
- Hook suggestion
- Key points (2–4)
- Research needed (if any)
- Relevant father story (if verified and applicable)
- Suggested CTA
- Related existing content
- Evidence confidence level

### 9.4 Idea Actions (Father)

The father can say or tap:

- `Isko reel banao`
- `Isko YouTube topic banao`
- `Research karo`
- `Simple karo`
- `Mere experience ka example add karo`
- `Ye line hatao`
- `Isko 60 second ka karo`
- `Isko series mein add karo`

---

## 10. Research System

Research must be separated from creative generation. AI must never invent facts during script generation — if evidence is needed, it comes from the research system.

### 10.1 Research Flow

```
Topic or Claim
   ↓
Research Agent
   ↓
Search authoritative and relevant sources
   ↓
Extract claims and evidence
   ↓
Attach source attribution
   ↓
Produce evidence summary
   ↓
Compare against existing Knowledge Base
   ↓
Flag what can and cannot be claimed
   ↓
Identify content angles from findings
```

### 10.2 Research Output Format

Each completed research task contains:

- Research question or topic
- Key findings (summarised)
- Individual claims with source attribution
- Source URLs and references
- Publication date where available
- Confidence level (High / Medium / Low)
- Conflicting evidence (if found)
- What can be claimed
- What must NOT be claimed without additional evidence
- Suggested content angle from findings

### 10.3 Source Hierarchy

Sources are prioritised in this order:

1. Official governing bodies (ISSF, NRAI, etc.)
2. Official competition and event sources
3. Peer-reviewed or high-quality research
4. Recognised institutions
5. Expert commentary and interviews
6. Reputable secondary sources
7. Social content — only for trend or audience discovery, never as factual authority

### 10.4 Research Freshness

Research tasks have configurable freshness requirements:

| Content Type | Freshness Requirement |
|---|---|
| Stable technical fact | Older sources acceptable |
| Current rules / regulations | Must use current official sources |
| Trends and audience behavior | Must use recent sources |
| Competitor or peer content | Recent content only |

---

## 11. Trend Research System *(V1)*

Trend research gives the content system awareness of what is currently happening in the shooting sport space. This is automated in V1 — the system runs regular scans without requiring manual input.

### 11.1 Purpose

- Identify what topics, questions, and concerns are trending among shooters, parents, and coaches right now
- Surface topics where the father's expertise is directly relevant to current audience interest
- Alert the operator and AI when a trending topic matches an existing knowledge area
- Prevent the content plan from becoming disconnected from what audiences are actually searching for and talking about

### 11.2 Trend Sources

The system monitors:

- YouTube search trends (shooting, sports performance, Olympic pathway topics)
- Instagram and Reels hashtag activity in the shooting and sports coaching space
- Reddit and forum discussions (r/shooting, parenting sports forums)
- Google Trends for relevant keywords
- Competitor / peer creator content activity
- Audience questions in the comments of published content

### 11.3 Trend Research Flow

```
Scheduled scan (daily / configurable frequency)
   ↓
Pull signals from monitored sources
   ↓
Filter by relevance to shooting, coaching, and father's content pillars
   ↓
Cluster by topic
   ↓
Match against Knowledge Base and father's existing expertise
   ↓
Score each trend by: relevance × search volume × timeliness
   ↓
Generate topic suggestions with rationale
   ↓
Surface to operator dashboard and AI idea engine
   ↓
Father sees simple suggestion: "Is topic pe video banao?"
```

### 11.4 Trend Research Output

Each trend item includes:

- Trend topic
- Why it is trending (audience interest signal)
- Estimated search / engagement volume
- How it connects to father's expertise or content pillars
- Suggested content angle
- Suggested format (Reel / YouTube / Carousel)
- Urgency level (Timely / Evergreen / Seasonal)
- Related Knowledge Base content (if any)

### 11.5 Trend-to-Idea Integration

When a trend is approved or flagged as relevant:

- It is passed automatically into the Idea System
- The idea processing pipeline (Section 9.2) runs on it
- The resulting content candidate enters the Content Planner
- The original trend signal is attached to the content item for context

### 11.6 Operator Control

- Operator can configure which sources to monitor
- Operator can set scan frequency (daily recommended)
- Operator can filter out irrelevant categories
- Operator can approve or dismiss trend suggestions before they reach the father
- Father sees only approved, relevant suggestions in simple language

---

## 12. Knowledge Base

The knowledge base is the long-term memory of the product. It is what prevents the AI from hallucinating and ensures consistency across every content item.

### 12.1 Recommended Structure

```
SHOOTING-BRAND/
├── BRAND/
│   ├── father-profile
│   ├── credentials (verified)
│   ├── philosophy
│   ├── voice-examples
│   └── vocabulary
│
├── AUDIENCE/
│   ├── parents
│   ├── beginners
│   ├── competitive-shooters
│   └── common-objections
│
├── KNOWLEDGE/
│   ├── shooting-fundamentals
│   ├── competition
│   ├── mental-performance
│   ├── pathway
│   └── olympic-pathway
│
├── STORY/
│   ├── childhood
│   ├── ncc
│   ├── crpf
│   ├── national-competitions
│   ├── international-competitions
│   └── injury-and-return
│
├── CONTENT/
│   ├── ideas-inbox
│   ├── scripts-approved
│   ├── published
│   └── analytics
│
├── TRENDS/
│   ├── active-trends
│   ├── past-trends
│   └── audience-signals
│
└── BUSINESS/
    ├── masterclass-content
    ├── offers
    ├── funnel
    └── testimonials
```

### 12.2 Document Verification Status

Every knowledge document has a verification status:

- **Verified** — confirmed from source document, father statement, or official record
- **Unverified** — added but not yet confirmed
- **Disputed** — conflicting information exists

AI must only present Verified content as established fact. Unverified content must be flagged. Disputed content must not be used in scripts without explicit operator review.

---

## 13. Father's Voice System

The voice engine is what separates this from any generic AI content tool. Every script must sound like the father, not like a generic AI.

### 13.1 Voice Characteristics

The father's authentic style includes:

- Natural spoken Roman Hindi / Hinglish
- Direct and practical — no filler language
- Beginner-friendly explanations
- Technical English terms where they are his natural vocabulary
- Structured thinking pattern: Concept → Why it matters → Consequence → Practice / Solution
- Practical, real-world examples
- Coach's perspective — he is teaching, not performing
- References to real personal experience where verified
- Useful repetition of key points
- No artificial motivational language or generic inspirational phrases

The system must preserve his thinking pattern and vocabulary. It must not add grammatical mistakes artificially. It must not make him sound younger, more formal, or more like a generic social media creator.

### 13.2 Voice Sources

Initial voice setup requires 3–5 strong examples of actual father speech or writing as baseline references.

Over time, the voice dataset grows with:

- Approved scripts (positive examples)
- Recorded and transcribed content
- Father's corrections and edits (what he changed and why)
- Phrases he rejected (negative examples)
- Vocabulary he prefers
- Phrases to avoid

### 13.3 Voice Learning Loop

```
AI generates script
   ↓
Father edits or corrects
   ↓
Approved version stored as positive example
   ↓
Rejected phrases stored as negative examples
   ↓
Voice model improves with each approval cycle
   ↓
Future scripts require fewer edits
```

---

## 14. Script Generation System

### 14.1 Input Sources

Script generation can begin from:

- A processed idea
- Research findings
- Knowledge Base retrieval
- A series brief (e.g. Day 4 of Beginner Series)
- The father's own story (verified)
- A trend signal
- A target format and audience

### 14.2 Output Structure

A standard script is structured as:

```
HOOK
  (The opening line that stops the scroll)

BODY
  (The main teaching or insight)

KEY EXPLANATION
  (The core concept explained simply)

PRACTICAL EXAMPLE
  (A real or coached scenario)

FATHER'S EXPERIENCE
  (Only if this story is verified in the Knowledge Base)

ACTION / EXERCISE
  (What the viewer should try)

CTA
  (What to do next — follow, save, comment, register)
```

The exact structure varies by format. A Reel is not structured identically to a YouTube video or an educational carousel.

### 14.3 Supported Formats

- Instagram Reel (60–90 seconds)
- Instagram Short video
- YouTube video (long-form)
- YouTube Short
- Educational post (text + image)
- Instagram Carousel (slide-by-slide)
- Instagram Story sequence
- Masterclass module section
- Email or lead magnet content

### 14.4 Personal Claim Validation

Before the script is shown to the father, an automated validator runs:

- Scans for first-person achievement claims ("I won...", "I represented...", "I competed...")
- Checks each claim against verified Knowledge Base records
- Flags any claim that is not backed by a verified source
- Presents a warning next to flagged sections

The father is shown the flag and can either confirm, correct, or remove the claim.

---

## 15. Script Review

The father must be able to review and edit scripts directly within the app, without technical steps.

### 15.1 Review UI Requirements

- Script displayed in large, readable text
- Clear section labels (Hook, Body, Example, CTA)
- Each section individually editable
- Action buttons must be large, clearly labelled, and in Hindi/Hinglish

### 15.2 Available Actions

The father can tap or speak:

- `Approve` — moves to approved status
- `Edit` — opens section for direct text editing
- `Rewrite` — AI rewrites the selected section
- `Simple karo` — AI simplifies the language
- `Meri language mein karo` — AI rewrites in more natural voice
- `Research this` — flags a claim for research before approval
- `Ye hatao` — removes the selected section
- `Example add karo` — AI adds a practical example
- `Short karo` — AI shortens the script
- `Lambi karo` — AI expands the script

### 15.3 Version History

Every change creates a new version. No version is ever deleted automatically.

```
v1 — AI Draft
v2 — AI Revision (based on father feedback)
v3 — Father Edit
v4 — Approved Final
```

The father can always see and compare previous versions. Version history is visible as a simple timeline: *"v1 banaya: 8 Sep / v2 badla: 9 Sep / v3 approve: 10 Sep"*

---

## 16. Masterclass Builder *(V1)*

The masterclass builder allows the operator to construct and maintain structured masterclass content using the father's verified knowledge, approved scripts, and personal stories.

### 16.1 Purpose

The masterclass is the primary business conversion tool. It must be:

- Structured and organised logically
- Built from verified content, not invented by AI
- Linked to the content funnel (free content → masterclass → assessment → coaching)
- Easy for the operator to assemble and update
- Easy for the father to review section by section

### 16.2 Masterclass Structure (V1)

The current planned masterclass follows this broad outline:

1. Understanding the sport (overview, disciplines, scope)
2. Beginner fundamentals (technique, safety, equipment)
3. Why shooters don't improve (common mistakes and mental blocks)
4. Competition psychology and pressure handling
5. The shooting pathway (club → state → national → Olympic)
6. Father's personal story (verified, source-backed)
7. Personalized assessment and next step (CTA to coaching)

Each section is a module. Each module contains:

- Module title
- Learning objective
- Core content (sourced from Knowledge Base or approved scripts)
- Key points
- Father's voice notes (spoken or written)
- Supporting examples
- CTA within the section

### 16.3 Content Reuse from Content Pipeline

Approved scripts and research findings from the regular content pipeline feed directly into the masterclass builder:

```
Approved Reel Script on "Trigger Control"
   ↓
Operator marks it as reusable in Masterclass
   ↓
It appears in the Masterclass Builder under "Fundamentals → Trigger"
   ↓
Operator adapts it for long-form masterclass format
   ↓
Father reviews the masterclass module
   ↓
Module approved
```

### 16.4 AI Role in Masterclass Building

The AI helps the operator:

- Draft initial module content from relevant Knowledge Base material
- Suggest which existing approved scripts are relevant to each section
- Reformat short-form content (Reels, posts) into long-form teaching narrative
- Flag any section that contains unverified claims
- Suggest logical flow and transitions between modules

The AI does not publish or finalise masterclass content without operator review and father approval.

### 16.5 Father's View in Masterclass Builder

For the father, the masterclass builder presents one module at a time:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Masterclass — Module 2
  Beginner Fundamentals
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Section: Trigger Control

  [Content displayed in large text]

  ✅ Approve this section
  ✏️  Change karo
  🔁 Dobara likhao
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 17. Content Repurposing

One approved core idea or script can be adapted into multiple formats without repeating the research or scripting process from scratch.

### 17.1 Repurposing Flow

```
Core Approved Topic
   ├── Instagram Reel (60–90 sec script)
   ├── YouTube Short (vertical script)
   ├── YouTube Video (extended long-form)
   ├── Instagram Carousel (slide-by-slide text)
   ├── Instagram Story sequence
   ├── Educational post (single image + caption)
   └── Masterclass module section
```

### 17.2 Rules for Repurposing

- The original verified claim and meaning must be preserved across all formats
- AI must not introduce additional facts or claims during repurposing
- Each repurposed format must still pass the personal claim validator
- The father reviews and approves each format independently

---

## 18. Analytics System

### 18.1 V1 — Manual Entry

In V1, analytics are entered manually by the operator. Platform integrations are deferred to V2.

### 18.2 Tracked Metrics

**Platform metrics:**
- Views
- Watch time / retention
- Likes, comments, shares, saves
- Follower growth
- Profile visits

**Business metrics:**
- Leads generated
- Masterclass registrations
- Performance assessments booked
- Coaching enquiries or conversions

**Internal qualitative feedback:**
- Father approved this script on first review
- Father rejected the hook — reason noted
- Topic felt very useful according to father
- Audience question that came in from content
- Recurring objection from audience

### 18.3 Analytics Entry UI

The analytics entry screen is simple and designed for the operator:

```
Content: Reel #12 — Trigger Control
Published: 8 Sep 2026

Views:      [_____]
Likes:      [_____]
Comments:   [_____]
Shares:     [_____]
Saves:      [_____]

Notes:      [_________________]

[ Save ]
```

---

## 19. Learning Loop

Analytics data must feed back into future content planning. This is what makes the system smarter over time.

```
Published Content
      ↓
Performance Data Entered
      ↓
Pattern Detection (AI)
      ↓
Learning Insight Generated
      ↓
Content Recommendations
      ↓
New Ideas Surfaced
      ↓
Planning Informed
```

Example AI output:

> *"Practical mistake-based beginner videos are performing significantly better than general motivational content. Consider more 'common mistakes' format content."*

This is presented as a recommendation with supporting data — not as a definitive command. The operator and father can accept or dismiss it.

---

## 20. AI Assistant

The AI assistant is the single conversational interface that the father uses to interact with the entire system.

### 20.1 Purpose

The father should not need to navigate through menus to complete a task. He talks to the assistant and it handles everything behind the scenes.

### 20.2 Example Interactions

**Planning:**
> *"Aaj kya karna hai?"*
> → Shows today's work

**Content:**
> *"Mere paas ye idea hai — breathing pe ek reel banana hai."*
> → Runs idea pipeline, returns content proposal

**Research:**
> *"Is baat ko verify karo — diaphragmatic breathing se score improve hota hai."*
> → Triggers research job, returns findings with sources

**Script:**
> *"Isko 60 second ka reel bana do."*
> → Generates reel script using knowledge and research

**Knowledge:**
> *"Maine pehle is topic pe kya bola hai?"*
> → Searches Knowledge Base and approved scripts

**Planning recovery:**
> *"Kal recording nahi hui, ab plan kya hona chahiye?"*
> → Analyses dependencies, proposes revised schedule

**Critique:**
> *"Is script mein kya weak hai?"*
> → Runs content critic, returns honest feedback

**Masterclass:**
> *"Module 3 ke liye content suggest karo."*
> → Searches relevant approved content and knowledge, suggests module sections

**Trend:**
> *"Aajkal kya trend chal raha hai shooting mein?"*
> → Returns current trend digest with suggested topics

### 20.3 Assistant Design Rules

- The assistant uses Hindi/Hinglish in all responses to the father
- It never mentions agent names, model names, or technical processes
- It never says "I am an AI" or refers to itself as a model
- It always confirms before making significant changes: *"Kya main ye plan update kar doon?"*
- It explains delays simply: *"Research ho rahi hai, 1–2 minute mein milega."*

---

## 21. AI Agent Architecture

The system presents one unified assistant to the father while internally using specialised agents. The father never sees or interacts with individual agents.

### 21.1 Agent Roster

**1. Research Agent**
Researches topics, facts, technical claims, and competitor content.

**2. Trend Research Agent**
Monitors and processes trend signals from YouTube, Instagram, Google Trends, and forums.

**3. Audience Research Agent**
Understands the behavior, concerns, and objections of parents, beginners, and competitive shooters.

**4. Content Idea Agent**
Turns knowledge, research, and trend signals into structured content candidates.

**5. Father Voice Agent**
Adapts all content output to match the father's verified voice and vocabulary.

**6. Reel Script Agent**
Creates short-form video scripts optimised for mobile consumption.

**7. YouTube Script Agent**
Creates long-form structured scripts for YouTube.

**8. Masterclass Agent**
Builds, organises, and refines masterclass module content.

**9. Repurposing Agent**
Converts one approved core piece into multiple platform formats.

**10. Content Critic Agent**
Reviews any script or content item for:
- Factual accuracy
- Voice consistency
- Hook strength
- Clarity and simplicity
- Retention structure
- Differentiation from existing content
- CTA effectiveness
- Brand fit

**11. Planning Agent**
Manages schedule, dependencies, daily plan, and rescheduling logic.

---

## 22. Agent Orchestration

No single user request calls all agents. An orchestrator routes each request to the appropriate agent or combination of agents.

```
USER REQUEST
     ↓
Intent Detection
     ↓
Task Router
     ↓
Required Agent(s) selected
     ↓
Knowledge Retrieval (RAG)
     ↓
Model Selection (by task type)
     ↓
Agent Execution
     ↓
Output Validation
     ↓
Response to User
```

Example routing:

```
"Trigger control pe reel banao"
   ↓ Router detects: Script request, short format
   ↓ Knowledge Retrieval: shooting fundamentals → trigger section
   ↓ Father Voice retrieval: voice examples
   ↓ Existing content check: has trigger been covered before?
   ↓ Reel Script Agent: generates draft
   ↓ Content Critic Agent: reviews draft
   ↓ Response: Draft returned to father for review
```

---

## 23. Model Strategy

The system architecture must remain model-provider agnostic. No single AI provider should be hard-coded into business logic.

### 23.1 Supported Providers

Initial implementation considers:

- Gemini (Google)
- Groq (fast inference)
- OpenRouter (provider abstraction)
- Sarvam AI (Hindi/Hinglish optimised)
- Ollama / local models (for private or offline tasks)
- Hugging Face (for embedding and specialised model workloads)

### 23.2 Model Routing by Task

```
Task Type                         → Model Tier
────────────────────────────────────────────────
Simple classification / routing   → Fast, cheap model
Bulk content generation           → Fast, inexpensive model
High-quality script generation    → Stronger capable model
Research synthesis                → Reasoning-capable model
Hindi/Hinglish tasks              → Sarvam or Hindi-optimised model
Private / sensitive tasks         → Ollama / local model
Embedding / vector tasks          → Dedicated embedding model
```

Model selection is a configuration concern. Swapping providers must not require code changes.

---

## 24. Notifications

The system sends timely, useful notifications — without creating noise.

### 24.1 Notification Types

| Trigger | Notification |
|---|---|
| Day begins with pending work | *"Aaj 3 kaam hain. Dekhein?"* |
| Script is ready for review | *"Reel #12 ka script taiyaar hai. Review karein."* |
| Research completed | *"Breathing technique research ho gayi. Script banane ke liye ready."* |
| Recording overdue | *"Beginner Day 3 recording 2 din se baaki hai."* |
| Series falling behind schedule | *"30 Days Series 3 din peeche chal rahi hai."* |
| Trend alert | *"Abhi Olympic pathway topic trend kar raha hai."* |
| Masterclass module ready for review | *"Module 2 review ke liye ready hai."* |
| Weekly summary | *"Is hafte 4 videos publish hue. Dekhein results."* |

### 24.2 Notification Rules

- Operator can configure notification frequency and channels
- Father should receive maximum 2–3 notifications per day
- No system or technical error messages are shown to the father
- All father-facing notifications are in Hindi/Hinglish

---

## 25. UI / UX Requirements

### 25.1 Primary Navigation (Father View)

Bottom navigation bar — always visible:

```
🏠 Ghar  |  📋 Plan  |  💡 Ideas  |  📝 Content  |  🤖 Help
```

### 25.2 Secondary Navigation (Operator View)

Accessible via side menu or tab extension:

- Knowledge Base
- Research
- Trend Research
- Masterclass Builder
- Analytics
- Settings / Admin

### 25.3 UI Standards for Middle-Aged Non-Technical User

These are non-negotiable design requirements:

| Requirement | Specification |
|---|---|
| Font size | Minimum 18px body text; 22px+ for primary actions |
| Touch targets | Minimum 56×56px for all tappable elements |
| Button labels | Full words in Hindi/Hinglish — no icon-only buttons |
| Confirmations | All destructive actions require explicit confirmation dialog |
| Loading states | Always show: *"Abhi ho raha hai..."* — never blank screen |
| Error messages | Plain language, no technical codes shown to father |
| Status visibility | Current status always visible on every content card |
| Gestures | No swipe-to-delete or hidden gesture dependencies — all actions have visible buttons |
| Color | High contrast — text must be clearly readable in outdoor / bright light |
| Scroll | Minimize scrolling on key screens — critical actions visible without scroll |

### 25.4 Script Reading Mode

When the father reads a script for review, the display switches to an optimised reading mode:

- Single column
- Large text (24px minimum)
- High contrast background
- Sections clearly labelled
- Action buttons fixed at the bottom
- No distracting sidebar or navigation

---

## 26. Voice Input

Voice input is a first-class feature because the father's ideas come most naturally through speech.

### 26.1 Voice Input Flow

```
Father taps microphone button
   ↓
Recording begins (visual indicator shown)
   ↓
Father speaks naturally in Hindi/Hinglish
   ↓
Recording ends (tap again or silence detection)
   ↓
Speech-to-text transcription
   ↓
Original transcript preserved (never deleted)
   ↓
AI cleans and extracts structured idea
   ↓
Result shown to father for confirmation
```

### 26.2 Design Requirements

- Microphone button must be large and always accessible (floating or bottom bar)
- Visual waveform or animation while recording to confirm it is working
- Simple confirmation: *"Ye aapka idea hai — sahi hai?"*
- Father can correct the transcription if needed
- Original audio preserved for quality checking

### 26.3 Supported STT Providers

- Sarvam AI (Hindi/Hinglish optimised — preferred)
- OpenAI Whisper (fallback)
- Deepgram (alternative)

Provider must be configurable.

---

## 27. Content Dependencies

Content items within a series may depend on each other.

### 27.1 Example

```
Beginner Shooting Series
   Day 1 — Safety Fundamentals
      ↓ (must be published first)
   Day 2 — Stance and Posture
      ↓
   Day 3 — Grip Technique
      ↓
   Day 4 — Breathing Control
```

### 27.2 Rules

- The planner tracks dependency chains within series
- If a dependent item is delayed, the planner flags the downstream impact
- Not all content is sequential — standalone or parallel content is also supported
- The father is shown dependencies in simple terms: *"Day 4 tabhi jayega jab Day 3 publish ho."*

---

## 28. Scheduling Engine

The scheduling engine turns the content plan into a realistic, adaptive daily work plan.

### 28.1 Inputs

- Series order and episode sequence
- Due dates and target publishing dates
- Priority levels
- Father's recording availability (if configured)
- Content dependencies
- Desired publishing cadence
- Estimated time for each task type
- Completed task history
- Blocked or delayed items

### 28.2 Outputs

- Recommended daily task list (powers the Home screen)
- Revised schedule after delays or changes
- Overdue task alerts
- Next best action when current task is blocked
- Impact analysis when a task is missed

### 28.3 Override

The father or operator can always override the AI schedule. The system accepts manual changes and adjusts the rest of the plan accordingly.

---

## 29. Content Pillars

Every content item is tagged to one of five primary pillars:

1. **Shooting Education** — technical fundamentals, technique, equipment
2. **Performance and Competition** — mental game, competition prep, pressure handling
3. **Pathway** — how to progress from beginner to national level, career opportunities
4. **Father's Personal Story** — verified biographical content
5. **Myths and Hard Truths** — correcting common misconceptions in the sport

Every content item optionally carries:

- Pillar (required)
- Target audience (beginners / parents / competitive shooters)
- Funnel stage (awareness / trust / conversion)
- Format
- Strategic goal (reach / education / authority / masterclass registration / coaching)

---

## 30. Funnel Mapping

The content system is not built only for views. It is built to move audiences through a business funnel.

```
FREE CONTENT (Reels, YouTube, Posts)
      ↓
Attention and Reach
      ↓
Trust and Authority
      ↓
MASTERCLASS REGISTRATION
      ↓
Performance Assessment
      ↓
Personalized Coaching Program
      ↓
Results
      ↓
Testimonials
      ↓
More Content + More Trust
```

Each content item should have a defined strategic objective. Not every piece needs to convert — but no piece should be created without a purpose.

---

## 31. Initial Shooting Knowledge Model

The knowledge base must cover these areas before meaningful AI output is possible:

**Disciplines:**
Rifle, pistol, shotgun, single trap, double trap, skeet

**Technical fundamentals:**
Safety, stance, grip, breathing, sight alignment, trigger operation, follow-through, dry practice

**Performance:**
Competition experience, pressure handling, consistency, pre-competition routine

**Pathway:**
Club level progression, state and national pathway, international competition, Olympic qualification pathway, career opportunities in shooting

**The detailed content of each area must be built from verified source documents and from interviews with the father — not generated by AI from training data.**

---

## 32. Father's Story Model

The father's personal journey is a critical content asset. Every piece of it must be treated as factual source material, not AI-generated narrative.

Areas to document and verify:

- NCC involvement and early shooting exposure
- CRPF service and shooting career context
- Shooting team progression and selection experiences
- Equipment shortages and how they were overcome
- Key mentors and coaches
- National competition experiences (specific events, results where verifiable)
- Sports rifle experience
- International competition (events, context, results where verifiable)
- Medals and achievements (verified and source-cited)
- Injury, recovery, and return to competition
- Transition from competitor to coach
- Coaching philosophy developed from experience

**The AI must never fill gaps in this story. If a detail is not in the verified record, it is not used.**

---

## 33. Accuracy and Safety Layer

Before any output is presented to the father as ready for review, a validation layer runs automatically.

### 33.1 Personal Claim Validator

Scans for first-person achievement statements and checks each one against the verified Knowledge Base:

- *"I won..."*
- *"I represented..."*
- *"I trained..."*
- *"I competed..."*
- *"I achieved..."*
- *"I was selected..."*

If the claim is not verified: the sentence is flagged with a warning. The father sees: *"Ye claim verify nahi hai — source chahiye."*

### 33.2 Technical Claim Validator

Flags technically questionable or unsupported claims in script content.

### 33.3 Research Validator

Ensures that any externally-sourced claim has an attached source. Unattributed external claims are flagged.

### 33.4 Voice Validator

Checks whether the script wording is consistent with approved father voice examples. Flags sections that seem generic or out of character.

### 33.5 Hallucination Rule

If evidence is unavailable: **do not invent. Ask for source material or mark the claim as unverified.** This rule has no exceptions.

---

## 34. Recommended Technical Architecture

### Frontend

**Next.js + React + TypeScript**

Mobile-first responsive design. Deployable as:
- Progressive Web App (PWA)
- Installable on Android home screen
- Installable on iOS home screen via Safari

### Backend

Next.js API routes / server actions, or a dedicated API layer if scale requires it.

### Database

**Supabase / PostgreSQL**

Stores:
- Users and roles
- Projects, series, content items, content tasks
- Ideas, scripts, script versions
- Knowledge documents and chunks
- Research items and sources
- Trend research data
- Masterclass modules and sections
- Analytics records
- Agent run logs
- Audit logs

### Authentication

Supabase Auth. Role-based: Father / Operator / Admin.

### Storage

Supabase Storage for:
- Voice recordings (idea capture)
- Uploaded source documents (knowledge base)
- Images and exported assets
- Video references

### Vector Search

PostgreSQL + pgvector (Supabase Vector) for semantic retrieval across:
- Father's verified stories
- Shooting knowledge chunks
- Approved scripts
- Research notes
- Transcripts

### AI Layer

Provider abstraction layer:

```
AI Gateway / Model Adapter
   ├── Gemini
   ├── Groq
   ├── OpenRouter
   ├── Sarvam AI (Hindi/Hinglish)
   └── Ollama (local/private)
```

### Deployment

Vercel for Next.js application.

---

## 35. Core Database Model

### users
`id` · `name` · `role` · `email` · `created_at`

### projects
`id` · `name` · `description` · `status`

### series
`id` · `project_id` · `name` · `description` · `target_audience` · `content_goal` · `status`

### content_items
`id` · `series_id` · `title` · `content_type` · `pillar` · `funnel_stage` · `status` · `priority` · `scheduled_date` · `published_at`

### content_tasks
`id` · `content_item_id` · `task_type` · `status` · `assigned_to` · `due_date` · `completed_at`

### ideas
`id` · `raw_input` · `input_type` · `normalized_idea` · `status` · `created_by` · `created_at`

### scripts
`id` · `content_item_id` · `version` · `content` · `status` · `model` · `approved_by` · `created_at`

### knowledge_documents
`id` · `category` · `title` · `content` · `source_type` · `verification_status`

### knowledge_chunks
`id` · `document_id` · `content` · `embedding`

### research_items
`id` · `content_item_id` · `topic` · `findings` · `status` · `created_at`

### sources
`id` · `research_item_id` · `url` · `title` · `publisher` · `published_at` · `accessed_at` · `credibility`

### trend_items
`id` · `topic` · `source` · `signal_type` · `relevance_score` · `urgency` · `status` · `detected_at`

### masterclass_modules
`id` · `masterclass_id` · `title` · `order` · `learning_objective` · `status`

### masterclass_sections
`id` · `module_id` · `title` · `content` · `content_source_id` · `status` · `approved_by`

### content_analytics
`id` · `content_item_id` · `platform` · `metric_name` · `metric_value` · `recorded_at`

### feedback
`id` · `content_item_id` · `user_id` · `feedback_type` · `feedback_text`

### agent_runs
`id` · `agent_name` · `input` · `output` · `model` · `tokens` · `cost` · `status` · `created_at`

### audit_logs
`id` · `user_id` · `entity_type` · `entity_id` · `action` · `metadata` · `created_at`

---

## 36. Knowledge Retrieval / RAG Flow

```
User request or generation task
     ↓
Intent analysis
     ↓
Query generation (multiple query variants)
     ↓
Vector search (pgvector)
   + Metadata filters (verified / category / date)
     ↓
Relevant knowledge chunks retrieved
     ↓
Reranking by relevance
     ↓
Context assembly
     ↓
LLM call with assembled context
     ↓
Structured output
     ↓
Validation layer
     ↓
Response to user or agent pipeline
```

Metadata distinguishes:
- Verified fact
- Father statement (verified)
- Research finding (sourced)
- Opinion or commentary
- Draft content
- Approved content
- External source

The model must know which category of knowledge it is drawing from in every generation call.

---

## 37. API / Service Boundaries

```
/auth
/projects
/series
/content
/tasks
/ideas
/research
/trends
/knowledge
/scripts
/masterclass
/assistant
/analytics
/agents
/files
/settings
```

Keep modules separated. The application should be able to grow without becoming one large undifferentiated codebase.

---

## 38. Security

- Secure authentication (Supabase Auth with JWT)
- Row-level security on all database tables
- Knowledge base and personal story data are private — not exposed publicly
- Secure file storage (signed URLs, server-side access only)
- Encrypted transport (HTTPS enforced)
- All AI provider API keys stored server-side only — never in frontend code or client environment
- Audit trail for all important content changes and approvals
- Role-based access enforced at API level
- Safe deletion policies — archive before delete for content items

---

## 39. Observability

Track the following for system health and AI quality monitoring:

**Infrastructure:**
API errors · Database errors · Latency percentiles · File storage failures

**AI:**
Model errors · Agent failures · Token usage per agent · Estimated AI cost per run · Hallucination flags triggered · Research job failures · Transcription failures

**Content:**
Approval rates · Revision counts per script · Research completion times · Trend items approved vs dismissed

Every important AI workflow must have an execution record in `agent_runs`.

---

## 40. Cost Management

AI usage must be optimised from the start:

- Cache repeated retrievals (same knowledge, same query)
- Always retrieve before generating (RAG reduces generation cost)
- Use small, fast models for classification and routing tasks
- Reserve stronger models for high-quality script generation and research synthesis
- Batch research jobs where possible
- Deduplicate trend signals
- Use prompt templates — no ad hoc prompts in production
- Configure provider routing by cost and quality requirement
- Log tokens and estimated cost per agent run for monitoring

---

## 41. Testing Strategy

### 41.1 Unit Testing

Test business logic in isolation:
- Scheduling logic and dependency resolution
- Status transition rules (valid vs invalid transitions)
- Content dependency chain logic
- Prompt builders (correct context assembly)
- Claim validators
- Database helper functions

### 41.2 Integration Testing

Test complete user journeys across layers:

```
Idea → Research → Script
Idea → Series → Plan
Script → Approval → Version history
Trend → Idea → Content item
Published → Analytics entry → Learning recommendation
Masterclass module → Father review → Approval
```

### 41.3 AI Evaluation

Maintain a fixed evaluation dataset:

- Father's real writing and speech examples (voice baseline)
- Known verified shooting facts
- Verified personal story facts
- Intentionally false claims (must be caught by validator)
- Typical father ideas (across all pillar categories)
- Expected Hindi/Hinglish behavior
- Trend signals with known correct classifications

Evaluate regularly against:
- Factual accuracy rate
- Source grounding rate
- Voice similarity score
- Hallucination rate
- Personal claim flag accuracy
- Instruction following rate

### 41.4 Browser / UX Testing

Automated browser verification for:
- All pages load without error on mobile viewport
- Navigation works correctly between all screens
- Forms and buttons behave correctly
- Script review mode is readable and functional
- Console errors are zero on critical journeys
- Father-mode UI is free of technical jargon

---

## 42. Acceptance Tests

### Home Screen
**Given** pending tasks exist → **Then** the home screen shows today's highest-priority 2–3 tasks without any navigation required.

### Idea Capture
**Given** the father speaks a rough idea → **Then** the system produces a structured content proposal with title, audience, format, hook, and key points within 30 seconds.

### Research
**Given** a factual research request → **Then** the system returns a research report with findings and cited sources.

### Trend Research
**Given** a scheduled trend scan runs → **Then** the system surfaces relevant trending topics with relevance scores and suggested content angles.

### Script Generation
**Given** an approved topic with knowledge and research context → **Then** the system produces a draft script in the father's voice, with flagged unverified claims marked clearly.

### Personal Story Validation
**Given** a script contains an unsupported personal claim → **Then** the system flags it before showing to the father; it does not fabricate supporting evidence.

### Script Versioning
**Given** the father edits a script → **Then** the original AI draft is preserved as v1 and the edited version is saved as a new version.

### Masterclass Module
**Given** an operator assembles a masterclass section from approved content → **Then** the father can review the section and approve or revise it in a simple one-module view.

### Planning Recovery
**Given** a task is missed or delayed → **Then** the system identifies the downstream impact and proposes a revised schedule for father or operator approval.

### Analytics Learning
**Given** performance data is entered for published content → **Then** the system stores the data and incorporates it into future content recommendations.

---

## 43. Phase-Wise Build Plan

### Phase 0 — Product Foundation

**Goal:** Define the source of truth before building any AI.

**Deliverables:**
- Finalised requirements (this PRD)
- Database schema
- Product architecture diagram
- User roles and permission map
- Design system / component library selection
- Knowledge taxonomy
- Voice examples collected (3–5 samples minimum)
- Verified father profile document
- Verified story repository (initial)
- Trend research source list configured

**Exit criteria:** The team can explain exactly what data the system stores, why, and from where it comes.

---

### Phase 1 — App Shell

**Build:**
- Next.js app initialisation
- Supabase project and auth setup
- Role-based routing (Father view / Operator view)
- Mobile-first responsive layout
- Bottom navigation bar (Father view)
- Home / Plan / Ideas / Content / Assistant placeholder screens
- Deployment pipeline to Vercel

**Exit criteria:** Father can log in and navigate the full app on a phone. No broken screens.

---

### Phase 2 — Content Planner

**Build:**
- Projects, series, content items
- Content task tracking per item
- Status model implementation
- Date and scheduling fields
- Content dependencies (series order)
- Daily plan generation (powers Home screen)
- Manual rescheduling

**Exit criteria:** A complete 30-day series can be created, tracked, and managed entirely within the planner.

---

### Phase 3 — Idea Engine

**Build:**
- Text idea capture
- Voice idea capture (microphone → STT → transcript)
- Idea classification pipeline
- Knowledge Base lookup from idea
- Idea-to-content item conversion
- Related content duplicate check
- Format suggestion
- Father confirmation flow

**Exit criteria:** Father speaks one rough idea and receives a usable, structured content proposal.

---

### Phase 4 — Knowledge Base + RAG

**Build:**
- Document upload interface (operator)
- Document chunking
- Embedding generation
- pgvector storage and retrieval
- Metadata tagging (category, verification status, source type)
- Verified / unverified / disputed status management
- Source reference storage

**Exit criteria:** AI can retrieve relevant shooting knowledge and verified father facts for any generation task.

---

### Phase 5 — Research Engine

**Build:**
- Research job creation (manual trigger by operator or AI)
- Source search and retrieval
- Claim extraction and source citation
- Research output format
- Research status tracking
- Research attached to content items
- Source hierarchy enforcement

**Exit criteria:** Any topic can be researched and the resulting evidence is ready to feed into script generation.

---

### Phase 6 — Trend Research System

**Build:**
- Trend source configuration (YouTube, Instagram, Google Trends, forums)
- Scheduled scan job (daily)
- Signal collection and filtering
- Topic clustering
- Relevance scoring against content pillars and knowledge base
- Trend item storage
- Operator dashboard for trend review and approval
- Trend-to-idea pipeline integration
- Father-facing trend alert (simple, Hindi/Hinglish)

**Exit criteria:** System automatically surfaces relevant trending topics. Operator reviews and approves. Approved trends flow into the idea engine.

---

### Phase 7 — Script Engine

**Build:**
- Script generation (Reel, YouTube Short, YouTube, Carousel, Educational post)
- Father voice layer (voice examples in context)
- Knowledge and research context injection
- Personal claim validator
- Script editor (father review mode)
- Version history (v1 draft never overwritten)
- AI revision actions (Simplify, Rewrite, Shorten, Expand, Voice adjust)
- Content Critic Agent integration

**Exit criteria:** Father can receive a script, review it, make corrections, and approve it with minimal effort. Validator catches unsupported claims before review.

---

### Phase 8 — Masterclass Builder

**Build:**
- Masterclass structure (modules → sections)
- Section creation from Knowledge Base content
- Approved script reuse in masterclass sections
- AI-assisted module drafting
- Father review interface (one module at a time, simple)
- Section approval workflow
- Section version history
- Claim validation in masterclass content

**Exit criteria:** Operator can build a complete masterclass from approved content and knowledge. Father can review and approve module by module.

---

### Phase 9 — AI Assistant

**Build:**
- Single chat interface for father
- Intent detection and task routing
- Connection to: planner, idea engine, research, trend research, knowledge, script engine, masterclass builder
- Planning recovery conversations
- Hindi/Hinglish response generation
- Conversation history within session

**Exit criteria:** Father can run all major workflows — planning, ideas, script requests, masterclass review — purely through conversation with the assistant.

---

### Phase 10 — Analytics + Learning Loop

**Build:**
- Manual analytics entry interface (operator)
- Platform abstraction layer (ready for V2 automation)
- Performance record storage
- Content comparison views
- Learning insight generation (AI)
- Content recommendations from analytics
- Weekly summary report

**Exit criteria:** System can identify what content is working and recommend future topics based on performance patterns.

---

## 44. MVP Definition

The MVP must prove that one complete content loop works reliably:

```
Father speaks idea
   ↓
AI understands and classifies
   ↓
Knowledge retrieval runs
   ↓
Research runs if needed
   ↓
Script generated in father's voice
   ↓
Father reviews and approves
   ↓
Task scheduled in planner
   ↓
Father records
   ↓
Content marked published
   ↓
Performance entered
```

If this loop works reliably end-to-end, the foundation is strong enough to build everything else on top of it.

---

## 45. MVP Success Metrics

**Product:**
- Time from idea capture to first usable script
- Father approval rate on first script review
- Average number of revisions per script before approval
- Percentage of scheduled content items completed on time
- Missed content recovery rate

**AI Quality:**
- Factual error rate in generated scripts
- Unsupported personal claim rate (how often the validator fires correctly)
- Father voice acceptance rate (scripts approved without voice correction)
- Source grounding rate (claims with attached sources)
- Hallucination rate (measured against evaluation dataset)

**Business:**
- Weekly content output volume
- Masterclass sections completed
- Trend items surfaced and acted upon

---

## 46. Definition of Done

A feature is considered done only when all of the following are true:

1. UI works correctly on a mobile phone (tested on actual device)
2. Backend behaviour is fully implemented
3. All error cases are handled gracefully with user-facing messages
4. Data is persisted correctly
5. Authorization is enforced at API level
6. Relevant AI outputs pass validation before display
7. Unit tests cover business logic
8. Integration test covers the end-to-end journey
9. Browser verification completed — no console errors on critical paths
10. All user-facing language is in Hindi/Hinglish where appropriate and readable by a non-technical middle-aged user

---

## 47. Development Workflow

Recommended implementation loop for every feature:

```
Requirement confirmed
   ↓
Database / API design
   ↓
UI built (mobile-first)
   ↓
Core logic implemented
   ↓
AI integration connected
   ↓
Unit tests written
   ↓
Integration test written
   ↓
Browser flow verified
   ↓
Father (real user) tests it
   ↓
Feedback collected
   ↓
Iteration
```

Do not build all agents first and then connect UI. Build complete user journeys vertically — one working slice at a time.

---

## 48. Vertical Slice Strategy

Build complete, usable slices rather than separate layers:

```
Slice 1: Idea → Script → Approve
Slice 2: Series → Plan → Daily Task
Slice 3: Research → Evidence → Script
Slice 4: Trend → Idea → Content Item
Slice 5: Masterclass Module → Father Review → Approve
Slice 6: Publish → Analytics → Learning
```

Each slice is fully usable before moving to the next. The father can use Slice 1 in production while Slice 2 is still being built.

---

## 49. Initial Seed Data

Before meaningful AI testing is possible, this data must be created:

### Brand
- Father profile (name, role, background, positioning)
- Core coaching philosophy
- Vocabulary list (preferred terms, terms to avoid)
- Verified credentials (with sources)

### Voice
At least 3–5 authentic examples of the father's speech or writing — real transcripts or messages, not AI-generated samples.

### Knowledge
Initial documents covering:
- Shooting fundamentals (technique, safety, equipment)
- Competition and mental performance
- Shooting pathway (club → Olympic)
- Olympic pathway overview

### Story
Verified, source-backed timeline of the father's personal shooting journey.

### Content
Any existing ideas, previously approved scripts, or previously published content.

### Trends
Initial list of monitored sources and relevant keywords for the Trend Research Agent to start with.

**This seed data is essential. The AI cannot produce quality output without it.**

---

## 50. Example End-to-End Workflow

**Father says:**
> *"Beginners trigger ko jaldi press karte hain."*

**System:**

```
1. Voice captured and transcribed
2. Intent: new content idea
3. Topic classified: trigger control → fundamentals
4. Knowledge Base searched: trigger operation section retrieved
5. Existing content checked: no prior trigger control reel found
6. Trend feed checked: no active trend — evergreen topic
7. 2–3 possible angles generated:
     a. Common beginner mistake (problem → solution)
     b. The physical feel of correct trigger pressure
     c. Dry practice drill for trigger control
8. Father selects angle a
9. Reel script generated with knowledge context and father's voice
10. Personal claim validator runs — no unsupported claims found
11. Content Critic runs — hook rated strong, CTA present
12. Script shown to father for review
13. Father edits one section
14. Version 2 saved (v1 preserved)
15. Father approves
16. Content item moves to APPROVED status
17. Planner schedules recording task
18. Father records
19. Content marked PUBLISHED
20. Operator enters analytics
21. Learning insight generated after 7 days
22. System suggests follow-up: "Trigger control drill — part 2"
```

---

## 51. Example Assistant Interaction

**Father:**
> *"Aaj kya karna hai?"*

**Assistant:**
> *"Aaj 2 important kaam hain:*
>
> *1. Beginner Series Day 4 — script review ke liye ready hai.*
> *2. Trigger Control Reel — recording baaki hai.*
>
> *Kal ka breathing video bhi pending hai. Agar aap chahte hain toh main plan adjust kar deta hoon — batayein?"*

---

## 52. Failure Handling

The system must fail safely and communicate clearly in Hindi/Hinglish.

**If research fails:**
> *"Research abhi complete nahi ho payi. Main bina verified information ke script generate nahi kar sakta. Kya manually source dena chahenge?"*

**If knowledge is missing:**
> *"Is point ke liye mere paas verified information nahi hai. Operator se confirm karwana hoga."*

**If transcription is unclear:**
> *"Mujhe ye phrase clearly nahi mila. Kya aap dobara bol sakte hain?"*

**If schedule conflict arises:**
> *"Current plan mein 3 tasks overlap ho rahe hain. Main ek revised plan suggest kar sakta hoon — dekhna chahenge?"*

**If a personal claim cannot be verified:**
> *"Ye claim Knowledge Base mein nahi hai. Main ise script mein include nahi kar sakta jab tak source nahi milta."*

---

## 53. What the AI Must Never Do

- Fabricate the father's achievements, medals, or competition results
- Fabricate personal stories or biographical details
- Fabricate sources or citations
- Present assumptions or guesses as established facts
- Silently rewrite factual claims without flagging the change
- Advance content to published status without configured approval
- Silently reschedule important commitments without user awareness
- Treat one viral post as universal audience evidence
- Replace the father's expertise with generic AI knowledge
- Produce content in a voice that does not match the father's authenticated style

---

## 54. What the AI Should Do

- Reduce the operational workload for both father and operator
- Organise and structure raw ideas into actionable content candidates
- Research topics and surface evidence with proper attribution
- Retrieve relevant knowledge to ground every generation task
- Draft scripts that preserve the father's authentic voice
- Identify weaknesses in content before the father reviews it
- Propose schedule changes rather than making them silently
- Repurpose approved content into multiple formats
- Monitor trends and alert when relevant to the father's content pillars
- Build and organise masterclass content from verified material
- Learn from analytics and make future recommendations
- Surface useful opportunities the operator or father may have missed
- Ask for missing evidence rather than inventing it
- Make the father's expertise scalable without diluting its authenticity

---

## 55. Long-Term Architecture

```
                    SHOOTING OS
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
   KNOWLEDGE          CONTENT          BUSINESS
       │                 │                 │
   Research          Planning         Masterclass
   RAG               Scripts          Assessment
   Stories           Trends           Coaching
   Voice             Publishing       Leads
                     Analytics        Testimonials
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                   AI ORCHESTRATOR
                         │
                 CONTINUOUS LEARNING
```

The system eventually becomes the central operating platform for the father's entire education and coaching business.

---

## 56. Open Decisions

Finalise during implementation — these must not block the initial build:

- Exact AI provider and model for each agent role
- Speech-to-text provider (Sarvam / Whisper / Deepgram)
- Trend monitoring API providers
- Publishing integrations (V2)
- Platform analytics APIs (V2)
- Notification channel (push / WhatsApp / email)
- Whether n8n automation layer enters in V2 or later
- Final visual design and component library
- Future athlete portal architecture

Architecture must keep all of these replaceable without core code changes.

---

## 57. Recommended Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + React + TypeScript |
| UI Components | Mobile-first component system (TBD in design phase) |
| Backend | Next.js API routes / server actions |
| Database | Supabase (PostgreSQL) |
| Vector Search | pgvector (via Supabase Vector) |
| Storage | Supabase Storage |
| Auth | Supabase Auth (role-based) |
| AI | Provider abstraction: Gemini / Groq / OpenRouter / Sarvam / Ollama |
| Automation | n8n (V2) |
| Deployment | Vercel |
| Testing | Unit (Jest/Vitest) + Integration + Browser E2E + AI evaluations |
| Version Control | GitHub |

This stack is intentionally modular. Individual providers can be replaced without rebuilding the core system.

---

## 58. Final Product Definition

The finished product must feel like:

> **"Mere content ka ek intelligent assistant jo meri planning, research, trends, script, masterclass aur daily kaam sambhalta hai."**

Not:

> *"Ek complicated AI platform jisme samajh nahi aata kya karna hai."*

The user-facing experience remains simple even as the underlying system becomes sophisticated.

**The core product loop:**

**IDEA → RESEARCH → TRENDS → KNOWLEDGE → PLAN → SCRIPT → REVIEW → RECORD → PUBLISH → ANALYZE → LEARN**

**The business loop:**

**CONTENT → TRUST → MASTERCLASS → PERFORMANCE ASSESSMENT → COACHING → RESULTS → TESTIMONIALS → TRUST**

The system succeeds when the father's expertise becomes a **repeatable, measurable and scalable content and education engine** — without losing the authenticity that makes the brand valuable.

---

*End of PRD v2.0*
