export interface QualityScript {
  hook: string;
  setup?: string;
  mainPoint: string;
  storyOrExample?: string;
  takeaway: string;
  cta?: string;
  production: {
    visuals: string[];
    broll: string[];
    onScreenText: string[];
    delivery: string[];
  };
  targetDurationSeconds: number;
}

export interface QualityCheck {
  id: string;
  passed: boolean;
  message: string;
  target?: string;
}

export interface QualityGateResult {
  passed: boolean;
  checks: QualityCheck[];
  repairTargets: string[];
}

const FILLER = [
  'hello guys welcome back',
  'in today\'s video',
  'without further ado',
  'let\'s dive in',
  'game changer',
  'unlock your potential',
];

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

function spokenText(script: QualityScript): string {
  return [script.hook, script.setup, script.mainPoint, script.storyOrExample, script.takeaway, script.cta]
    .filter(Boolean)
    .join(' ');
}

export function runQualityGate(script: QualityScript): QualityGateResult {
  const text = spokenText(script);
  const lower = text.toLowerCase();
  const words = wordCount(text);
  const minWords = Math.floor((script.targetDurationSeconds / 60) * 115);
  const maxWords = Math.ceil((script.targetDurationSeconds / 60) * 165);

  const checks: QualityCheck[] = [
    { id: 'hook-present', passed: script.hook.trim().length >= 6, message: 'Hook should be immediately understandable.', target: 'hook' },
    { id: 'main-point-present', passed: script.mainPoint.trim().length >= 12, message: 'Script needs one clear main point.', target: 'mainPoint' },
    { id: 'takeaway-present', passed: script.takeaway.trim().length >= 6, message: 'Script needs a clear payoff/takeaway.', target: 'takeaway' },
    { id: 'generic-filler', passed: !FILLER.some((phrase) => lower.includes(phrase)), message: 'Remove generic creator/AI filler language.', target: 'setup' },
    { id: 'duration-fit', passed: words >= minWords && words <= maxWords, message: `Spoken word count ${words} should fit roughly ${script.targetDurationSeconds}s.`, target: 'duration' },
    { id: 'hook-length', passed: wordCount(script.hook) <= 24, message: 'Hook should be short enough to land quickly.', target: 'hook' },
  ];

  const repairTargets = Array.from(new Set(checks.filter((check) => !check.passed && check.target).map((check) => check.target!)));
  return { passed: checks.every((check) => check.passed), checks, repairTargets };
}
