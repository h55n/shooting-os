export interface DurationRange { minWpm: number; maxWpm: number }

export function countSpokenWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

export function estimateDurationSeconds(text: string, wordsPerMinute = 140): number {
  const words = countSpokenWords(text);
  if (!words) return 0;
  return Math.round((words / wordsPerMinute) * 60);
}

export function targetWordRange(targetSeconds: number, range: DurationRange = { minWpm: 125, maxWpm: 155 }) {
  return {
    minWords: Math.floor((targetSeconds / 60) * range.minWpm),
    maxWords: Math.ceil((targetSeconds / 60) * range.maxWpm),
  };
}

export function fitsTargetDuration(text: string, targetSeconds: number, range: DurationRange = { minWpm: 125, maxWpm: 155 }): boolean {
  const words = countSpokenWords(text);
  const target = targetWordRange(targetSeconds, range);
  return words >= target.minWords && words <= target.maxWords;
}
