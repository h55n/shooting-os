import type {ContentStatus} from './types';

/** Valid state transitions for content items (server-enforced). */
const allowed:Record<ContentStatus,ContentStatus[]>= {
  IDEA:['PLANNED','ARCHIVED'],
  PLANNED:['RESEARCHING','SCRIPT_DRAFT','BLOCKED','ARCHIVED'],
  RESEARCHING:['SCRIPT_DRAFT','BLOCKED'],
  SCRIPT_DRAFT:['REVIEW','BLOCKED'],
  REVIEW:['APPROVED','SCRIPT_DRAFT','REJECTED'],
  APPROVED:['RECORDING','SCHEDULED','REJECTED'],
  RECORDING:['EDITING','BLOCKED'],
  EDITING:['SCHEDULED','BLOCKED'],
  SCHEDULED:['PUBLISHED','BLOCKED'],
  PUBLISHED:['ANALYZING'],
  ANALYZING:['LEARNED'],
  LEARNED:['ARCHIVED'],
  BLOCKED:['PLANNED','RESEARCHING','SCRIPT_DRAFT','ARCHIVED'],
  REJECTED:['SCRIPT_DRAFT','ARCHIVED'],
  ARCHIVED:[],
};

export function canTransition(from:ContentStatus, to:ContentStatus): boolean {
  return from === to || (allowed[from]?.includes(to) ?? false);
}

/** Alias used by API routes for readability. */
export const canTransitionTo = canTransition;

export function assertTransition(from:ContentStatus, to:ContentStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid content transition: ${from} -> ${to}`);
  }
}

/** Get all valid next states from a given status. */
export function nextStates(from: ContentStatus): ContentStatus[] {
  return allowed[from] ?? [];
}
