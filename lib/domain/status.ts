import type { ContentStatus } from './types';

const allowed: Record<ContentStatus, ContentStatus[]> = {
  IDEA: ['PLANNED', 'ARCHIVED'],
  PLANNED: ['RESEARCHING', 'SCRIPT_DRAFT', 'BLOCKED', 'ARCHIVED'],
  RESEARCHING: ['SCRIPT_DRAFT', 'BLOCKED'],
  SCRIPT_DRAFT: ['REVIEW', 'BLOCKED'],
  REVIEW: ['APPROVED', 'SCRIPT_DRAFT', 'REJECTED'],
  APPROVED: ['RECORDING', 'SCHEDULED', 'REJECTED'],
  RECORDING: ['EDITING', 'BLOCKED'],
  EDITING: ['SCHEDULED', 'BLOCKED'],
  SCHEDULED: ['PUBLISHED', 'BLOCKED'],
  PUBLISHED: ['ANALYZING'],
  ANALYZING: ['LEARNED'],
  LEARNED: ['ARCHIVED'],
  BLOCKED: ['PLANNED', 'RESEARCHING', 'SCRIPT_DRAFT', 'ARCHIVED'],
  REJECTED: ['SCRIPT_DRAFT', 'ARCHIVED'],
  ARCHIVED: [],
};

export type UserContentStatus = 'Draft' | 'Researching' | 'Review' | 'Approved' | 'To Shoot' | 'Editing / Ready' | 'Published' | 'Needs Attention' | 'Rejected' | 'Archived';

const userStatus: Record<ContentStatus, UserContentStatus> = {
  IDEA: 'Draft',
  PLANNED: 'Draft',
  RESEARCHING: 'Researching',
  SCRIPT_DRAFT: 'Review',
  REVIEW: 'Review',
  APPROVED: 'Approved',
  RECORDING: 'To Shoot',
  EDITING: 'Editing / Ready',
  SCHEDULED: 'Editing / Ready',
  PUBLISHED: 'Published',
  ANALYZING: 'Published',
  LEARNED: 'Published',
  BLOCKED: 'Needs Attention',
  REJECTED: 'Rejected',
  ARCHIVED: 'Archived',
};

export function canTransition(from: ContentStatus, to: ContentStatus): boolean {
  return from === to || (allowed[from]?.includes(to) ?? false);
}

export const canTransitionTo = canTransition;

export function assertTransition(from: ContentStatus, to: ContentStatus): void {
  if (!canTransition(from, to)) throw new Error(`Invalid content transition: ${from} -> ${to}`);
}

export function nextStates(from: ContentStatus): ContentStatus[] {
  return allowed[from] ?? [];
}

export function toUserStatus(status: ContentStatus): UserContentStatus {
  return userStatus[status];
}

export function nextActionForStatus(status: ContentStatus): string {
  switch (status) {
    case 'IDEA': return 'Build script';
    case 'PLANNED': return 'Create script';
    case 'RESEARCHING': return 'Check research';
    case 'SCRIPT_DRAFT':
    case 'REVIEW': return 'Review script';
    case 'APPROVED': return 'Schedule shoot';
    case 'RECORDING': return 'Shoot this';
    case 'EDITING': return 'Finish edit';
    case 'SCHEDULED': return 'Publish';
    case 'BLOCKED': return 'Resolve issue';
    case 'REJECTED': return 'Revise script';
    default: return 'Open content';
  }
}
