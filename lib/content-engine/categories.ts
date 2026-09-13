export type ContentCategoryId =
  | 'beginner-education' | 'common-mistake' | 'myth' | 'personal-story'
  | 'competition-story' | 'demonstration' | 'quick-tip' | 'comparison'
  | 'expert-take' | 'problem-solution' | 'faq' | 'pathway'
  | 'mental-performance' | 'equipment-setup';

export interface ContentCategory {
  id: ContentCategoryId;
  name: string;
  description: string;
  bestFor: string[];
  requiredBlocks: string[];
  optionalBlocks: string[];
  hookFamilies: string[];
  pacingRules: string[];
  visualDefaults: string[];
}

const core = (id: ContentCategoryId, name: string, description: string, hookFamilies: string[], visualDefaults: string[]): ContentCategory => ({
  id, name, description, bestFor: [name],
  requiredBlocks: ['hook', 'mainPoint', 'takeaway'],
  optionalBlocks: ['setup', 'storyOrExample', 'cta'],
  hookFamilies,
  pacingRules: ['one dominant idea', 'spoken sentences', 'payoff before CTA'],
  visualDefaults,
});

export const CONTENT_CATEGORIES: ContentCategory[] = [
  core('beginner-education', 'Beginner Education', 'Teach one foundational concept simply.', ['audience-callout', 'question', 'specific-outcome'], ['talking-head', 'simple-demo']),
  core('common-mistake', 'Common Mistake', 'Expose and correct a common error.', ['mistake', 'warning', 'curiosity'], ['talking-head', 'before-after-demo']),
  core('myth', 'Myth / Misconception', 'Correct a believable misconception.', ['myth', 'contrarian', 'curiosity'], ['talking-head', 'comparison']),
  core('personal-story', 'Personal Story', 'Use a grounded personal story with a clear lesson.', ['story-opening', 'curiosity'], ['talking-head', 'archive-broll']),
  core('competition-story', 'Competition Story / Lesson', 'Use competition context to teach a transferable lesson.', ['story-opening', 'warning', 'expert-observation'], ['talking-head', 'competition-broll']),
  core('demonstration', 'Demonstration / Technique', 'Show a technique visually and explain why it works.', ['demonstration', 'specific-outcome'], ['hands-on-demo', 'close-up']),
  core('quick-tip', 'Quick Tip', 'Deliver one practical improvement quickly.', ['specific-outcome', 'audience-callout'], ['talking-head', 'simple-demo']),
  core('comparison', 'Comparison', 'Contrast two approaches so the difference is obvious.', ['comparison', 'question'], ['split-demo', 'side-by-side']),
  core('expert-take', 'Opinion / Expert Take', 'Give a reasoned expert view without fake certainty.', ['expert-observation', 'contrarian'], ['talking-head']),
  core('problem-solution', 'Problem → Solution', 'Name a practical problem and give a focused fix.', ['warning', 'mistake', 'specific-outcome'], ['problem-demo', 'solution-demo']),
  core('faq', 'Question / FAQ', 'Answer a real audience question directly.', ['question', 'audience-callout'], ['talking-head']),
  core('pathway', 'Pathway / Career Guidance', 'Explain a pathway, decision or next step.', ['question', 'specific-outcome'], ['talking-head', 'on-screen-steps']),
  core('mental-performance', 'Mental Performance', 'Teach a mental skill using concrete behavior.', ['curiosity', 'expert-observation', 'story-opening'], ['talking-head', 'practice-broll']),
  core('equipment-setup', 'Equipment / Setup', 'Explain equipment or setup only where it materially helps.', ['comparison', 'question', 'warning'], ['equipment-close-up', 'simple-demo']),
];

export function getContentCategory(id: ContentCategoryId): ContentCategory | undefined {
  return CONTENT_CATEGORIES.find((category) => category.id === id);
}

/** Cheap deterministic first-pass classification. AI may refine only when ambiguous. */
export function inferContentCategory(text: string): ContentCategoryId {
  const value = text.toLowerCase();
  const rules: Array<[RegExp, ContentCategoryId]> = [
    [/mistake|galti|wrong|avoid/, 'common-mistake'],
    [/myth|misconception|sach nahi|belief/, 'myth'],
    [/competition|match|pressure|tournament/, 'competition-story'],
    [/story|journey|meri kahani|experience/, 'personal-story'],
    [/mental|mindset|focus|pressure|confidence/, 'mental-performance'],
    [/career|start shooting|path|academy|begin kaise/, 'pathway'],
    [/equipment|rifle|pistol|setup|gear/, 'equipment-setup'],
    [/compare|vs\.?|difference|better/, 'comparison'],
    [/show|demonstrat|stance|grip|trigger|aim/, 'demonstration'],
    [/why|kaise|how|what|question|\?/, 'faq'],
    [/problem|fix|solution|improve/, 'problem-solution'],
    [/tip|quick|one thing/, 'quick-tip'],
    [/opinion|i think|mera maanna|expert/, 'expert-take'],
  ];
  return rules.find(([pattern]) => pattern.test(value))?.[1] ?? 'beginner-education';
}
