import type { Script, ScriptSections } from '../domain/types';
import { validateClaims } from '../domain/claims';

export function buildDraft(topic: string, verifiedFacts: string[] = []): Script {
  const sections: ScriptSections = {
    hook: `${topic} — beginner ko sabse pehle kya samajhna chahiye?`,
    body: `Is topic ko simple rakhein aur practice ke waqt ek hi correction par focus karein.`,
    keyExplanation: `Concept ko step-by-step samjhein; bina verified evidence ke technical result claim nahi karna hai.`,
    practicalExample: `Practice session mein controlled repetition karke apni feel observe karein.`,
    fatherExperience: '',
    action: 'Next practice mein is point ko consciously apply karein.',
    cta: 'Agar useful laga toh save karein.'
  };
  
  const text = Object.values(sections).join(' ');
  const validation = validateClaims({ scriptText: text, verifiedFacts });
  
  const personalClaims = [
    ...validation.blockedClaims.map(c => c.content),
    ...validation.warningClaims.map(c => c.content)
  ];

  return {
    contentItemId: 'draft',
    sections,
    version: 1,
    personalClaims,
    status: 'draft',
  };
}
