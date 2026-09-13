/**
 * Claim Validator — production-grade personal claim safety gate.
 *
 * Validates generated content for unsupported personal claims about the father
 * before allowing approval. Never fabricates — only verifies.
 */

export interface Claim {
  id: string;
  content: string;
  claimType: ClaimType;
  verification: ClaimVerification;
  confidence: number;
  blockingReason?: string;
  evidenceIds: string[];
}

export type ClaimType =
  | 'personal_achievement'
  | 'personal_fact'
  | 'technical_claim'
  | 'research_finding'
  | 'general_statement';

export type ClaimVerification = 'supported' | 'unsupported' | 'disputed' | 'needs_review';

export interface ClaimValidationResult {
  passed: boolean;
  blockedClaims: Claim[];
  warningClaims: Claim[];
  approvedClaims: Claim[];
  summary: string;
  fatherFacingMessage?: string;
}

// Patterns that signal a personal claim about the father
const PERSONAL_ACHIEVEMENT_PATTERNS: RegExp[] = [
  /maine?\s+.*(medal|gold|silver|bronze|win|won|champion|represent)/i,
  /mujhe?\s+.*(award|prize|select|represent|national|international)/i,
  /i\s+(won|won|represented|achieved|completed|trained)/i,
  /mere?\s+.*(career|experience|record|achievement)/i,
  /(national|state|district)\s+(champion|winner|gold|silver|bronze)/i,
  /represented?\s+india/i,
  /olympic/i,
  /world\s+cup/i,
  /asian\s+(games|championship)/i,
  /commonwealth/i,
  /30\s+year|25\s+year|20\s+year/i, // unverified coaching duration
];

const NEEDS_REVIEW_INDICATORS = [
  'NEEDS_FATHER_INPUT',
  'VERIFICATION REQUIRED',
  '[PERSONAL CLAIM',
  'father mentioned',
];

/**
 * Validates a script for unsupported personal claims.
 * This is a deterministic rule-based check — fast and reliable.
 * For production, this should be complemented by an LLM-based semantic check.
 */
export function validateClaims(params: {
  scriptText: string;
  personalClaimsFromGeneration?: string[];
  verifiedFacts?: string[];
}): ClaimValidationResult {
  const { scriptText, personalClaimsFromGeneration = [], verifiedFacts = [] } = params;

  const blockedClaims: Claim[] = [];
  const warningClaims: Claim[] = [];

  // Check claims flagged by the AI generation itself
  for (const claim of personalClaimsFromGeneration) {
    const isVerified = verifiedFacts.some(
      (f) => f.toLowerCase().includes(claim.toLowerCase().slice(0, 20))
    );

    const claimObj: Claim = {
      id: crypto.randomUUID(),
      content: claim,
      claimType: 'personal_achievement',
      verification: isVerified ? 'supported' : 'unsupported',
      confidence: isVerified ? 0.8 : 0.1,
      evidenceIds: [],
      blockingReason: isVerified ? undefined : 'Claim not found in verified knowledge base.',
    };

    if (isVerified) {
      warningClaims.push(claimObj);
    } else {
      blockedClaims.push(claimObj);
    }
  }

  // Check for placeholder markers from generation
  for (const indicator of NEEDS_REVIEW_INDICATORS) {
    if (scriptText.includes(indicator)) {
      warningClaims.push({
        id: crypto.randomUUID(),
        content: `Script contains placeholder: "${indicator}"`,
        claimType: 'personal_fact',
        verification: 'needs_review',
        confidence: 0,
        evidenceIds: [],
        blockingReason: 'Placeholder not replaced with verified content.',
      });
    }
  }

  // Pattern-based detection on full script text
  for (const pattern of PERSONAL_ACHIEVEMENT_PATTERNS) {
    const match = scriptText.match(pattern);
    if (match) {
      const sentence = extractSentenceAround(scriptText, match.index ?? 0);
      const isVerified = verifiedFacts.some(
        (f) => f.toLowerCase().includes(sentence.toLowerCase().slice(0, 30))
      );

      if (!isVerified) {
        const exists = blockedClaims.some((c) => c.content === sentence) ||
                       warningClaims.some((c) => c.content === sentence);
        if (!exists) {
          blockedClaims.push({
            id: crypto.randomUUID(),
            content: sentence,
            claimType: 'personal_achievement',
            verification: 'unsupported',
            confidence: 0.3,
            evidenceIds: [],
            blockingReason: 'Personal achievement/fact pattern detected without evidence in knowledge base.',
          });
        }
      }
    }
  }

  const passed = blockedClaims.length === 0;

  const summary = passed
    ? `Validation passed. ${warningClaims.length} item(s) flagged for awareness.`
    : `Validation FAILED. ${blockedClaims.length} unsupported personal claim(s) must be resolved before approval.`;

  const fatherFacingMessage = passed
    ? undefined
    : 'Ye claim verified Knowledge Base mein nahi hai. Source milne tak main ise final script mein include nahi karunga.';

  return {
    passed,
    blockedClaims,
    warningClaims,
    approvedClaims: [],
    summary,
    fatherFacingMessage,
  };
}

function extractSentenceAround(text: string, index: number): string {
  const start = Math.max(0, text.lastIndexOf('.', index) + 1);
  const end = text.indexOf('.', index + 1);
  return text.slice(start, end > -1 ? end + 1 : undefined).trim().slice(0, 200);
}
