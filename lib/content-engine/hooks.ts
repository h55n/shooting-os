export interface HookPattern {
  id: string;
  family: string;
  template: string;
  compatibleCategories: string[];
}

export const HOOK_PATTERNS: HookPattern[] = [
  { id: 'mistake-direct', family: 'mistake', template: 'Agar aap ___ kar rahe ho, ye galti mat karo...', compatibleCategories: ['common-mistake', 'problem-solution'] },
  { id: 'warning-before-practice', family: 'warning', template: 'Agli practice se pehle ek cheez check kar lena...', compatibleCategories: ['common-mistake', 'problem-solution', 'equipment-setup'] },
  { id: 'myth-break', family: 'myth', template: 'Shooting mein ___ ke baare mein jo sabse common belief hai, woh poora sach nahi hai.', compatibleCategories: ['myth'] },
  { id: 'question-direct', family: 'question', template: '___ improve kyun nahi ho raha? Sabse pehle ye samjho.', compatibleCategories: ['beginner-education', 'comparison', 'faq', 'pathway', 'equipment-setup'] },
  { id: 'specific-outcome', family: 'specific-outcome', template: 'Agar aap ___ better karna chahte ho, is ek point par focus karo.', compatibleCategories: ['beginner-education', 'demonstration', 'quick-tip', 'pathway'] },
  { id: 'story-pressure', family: 'story-opening', template: 'Ek competition mein mujhe ___ samajh aaya — aur lesson simple tha.', compatibleCategories: ['personal-story', 'competition-story', 'mental-performance'] },
  { id: 'demo-show', family: 'demonstration', template: 'Main aapko ___ ka difference abhi practically dikhata hoon.', compatibleCategories: ['demonstration'] },
  { id: 'comparison-choice', family: 'comparison', template: '___ aur ___ mein actual difference ye hai.', compatibleCategories: ['comparison', 'equipment-setup'] },
  { id: 'expert-observation', family: 'expert-observation', template: 'Maine shooters mein ek pattern baar-baar dekha hai: ___.', compatibleCategories: ['competition-story', 'expert-take', 'mental-performance'] },
  { id: 'audience-callout', family: 'audience-callout', template: 'Agar aap shooting mein naye ho, ___ pehle samjho.', compatibleCategories: ['beginner-education', 'quick-tip', 'faq'] },
  { id: 'curiosity-gap', family: 'curiosity', template: 'Chhota sa ___ change result ko itna affect kyun karta hai?', compatibleCategories: ['*'] },
  { id: 'contrarian', family: 'contrarian', template: '___ par zyada focus karna kabhi-kabhi ulta problem bana deta hai.', compatibleCategories: ['myth', 'expert-take'] },
];

export function getHookPatternsForCategory(categoryId: string): HookPattern[] {
  return HOOK_PATTERNS.filter((pattern) => pattern.compatibleCategories.includes(categoryId) || pattern.compatibleCategories.includes('*'));
}

export function fillHookTemplate(pattern: HookPattern, replacements: string[]): string {
  let result = pattern.template;
  for (const replacement of replacements) result = result.replace('___', replacement.trim());
  return result;
}
