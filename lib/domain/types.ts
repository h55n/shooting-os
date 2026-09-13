// ─── Core Enums / Literal Types ──────────────────────────────────────────────

export type Role = 'father' | 'operator' | 'admin';

export type ContentStatus =
  | 'IDEA'
  | 'PLANNED'
  | 'RESEARCHING'
  | 'SCRIPT_DRAFT'
  | 'REVIEW'
  | 'APPROVED'
  | 'RECORDING'
  | 'EDITING'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'ANALYZING'
  | 'LEARNED'
  | 'BLOCKED'
  | 'REJECTED'
  | 'ARCHIVED';

export type Pillar =
  | 'Shooting Education'
  | 'Performance and Competition'
  | 'Pathway'
  | "Father's Personal Story"
  | 'Myths and Hard Truths';

export type ContentType =
  | 'reel'
  | 'youtube_short'
  | 'youtube'
  | 'post'
  | 'carousel'
  | 'story'
  | 'masterclass'
  | 'email';

export type VerificationStatus = 'verified' | 'unverified' | 'disputed';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

// ─── Domain Objects ───────────────────────────────────────────────────────────

export interface ContentItem {
  id: string;
  title: string;
  content_type: ContentType;
  pillar: Pillar;
  status: ContentStatus;
  priority: number;
  scheduled_date?: string;
  series?: string;
  task?: string;
  series_id?: string;
  funnel_stage?: string;
  sequence_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IdeaProposal {
  title: string;
  coreLesson: string;
  audience: string;
  pillar: Pillar;
  format: ContentType;
  hook: string;
  keyPoints: string[];
  researchNeeded: boolean;
  confidence: 'high' | 'medium' | 'low';
  relatedContent: string[];
  isDuplicate?: boolean;
  duplicateNote?: string;
  personalClaims?: string[];
}

export interface ScriptSections {
  hook: string;
  body: string;
  keyExplanation: string;
  practicalExample: string;
  fatherExperience: string;
  action: string;
  cta: string;
  estimatedDuration?: string;
  visualNotes?: string;
}

export interface Script {
  id?: string;
  contentItemId: string;
  version: number;
  sections: ScriptSections;
  personalClaims: string[];
  status: 'draft' | 'approved' | 'rejected';
  model?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface CriticEvaluation {
  overallScore: number;
  scores: {
    factualAccuracy: number;
    voiceConsistency: number;
    hookStrength: number;
    clarity: number;
    simplicity: number;
    retentionStructure: number;
    practicalValue: number;
    brandFit: number;
  };
  strengths: string[];
  issues: string[];
  suggestions: string[];
  revisionPriority: 'low' | 'medium' | 'high';
  blockingIssues: string[];
}

export interface KnowledgeDocument {
  id: string;
  category: string;
  title: string;
  content: string;
  source_type: string;
  verification_status: VerificationStatus;
  source_url?: string;
  created_by?: string;
  created_at: string;
}

export interface ResearchItem {
  id: string;
  content_item_id?: string;
  topic: string;
  findings?: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  sources?: Source[];
  created_at: string;
}

export interface Source {
  id: string;
  url: string;
  title?: string;
  publisher?: string;
  published_at?: string;
  credibility?: number;
}

export interface TrendItem {
  id: string;
  topic: string;
  source: string;
  signal_type?: string;
  relevance_score?: number;
  urgency?: string;
  status: 'new' | 'approved' | 'dismissed' | 'converted';
  detected_at: string;
}

export interface Profile {
  id: string;
  name: string;
  role: Role;
  created_at: string;
}

// ─── API Response types ───────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  ok?: false;
  error: string;
  hindiError?: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── UI / State types ─────────────────────────────────────────────────────────

export interface DailyTask extends ContentItem {
  urgency: 'overdue' | 'today' | 'soon';
}

export type AssistantIntent =
  | 'get_today_plan'
  | 'create_idea'
  | 'generate_script'
  | 'check_research'
  | 'approve_content'
  | 'get_trends'
  | 'ask_knowledge'
  | 'get_analytics'
  | 'general_query'
  | 'unclear';
