const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const ts = require('typescript');

function loadTs(path) {
  const source = fs.readFileSync(path, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', output)(require, mod, mod.exports);
  return mod.exports;
}

test('content engine defines all fourteen initial categories', () => {
  const { CONTENT_CATEGORIES } = loadTs('lib/content-engine/categories.ts');
  assert.equal(CONTENT_CATEGORIES.length, 14);
  assert.ok(CONTENT_CATEGORIES.every((category) => category.requiredBlocks.length >= 3));
});

test('hook shortlist only returns category-compatible hook patterns', () => {
  const hooks = loadTs('lib/content-engine/hooks.ts');
  const list = hooks.getHookPatternsForCategory('common-mistake');
  assert.ok(list.length > 0);
  assert.ok(list.every((pattern) => pattern.compatibleCategories.includes('common-mistake') || pattern.compatibleCategories.includes('*')));
});

test('duration estimator uses spoken word rate instead of trusting model timing', () => {
  const { estimateDurationSeconds, fitsTargetDuration } = loadTs('lib/content-engine/duration.ts');
  const words = Array.from({ length: 130 }, () => 'word').join(' ');
  assert.equal(estimateDurationSeconds(words, 130), 60);
  assert.equal(fitsTargetDuration(words, 60, { minWpm: 125, maxWpm: 145 }), true);
});

test('quality gate catches missing hook, filler and duration overflow', () => {
  const { runQualityGate } = loadTs('lib/content-engine/quality-gate.ts');
  const result = runQualityGate({
    hook: '',
    setup: 'Hello guys welcome back to another video.',
    mainPoint: Array.from({ length: 220 }, () => 'bahut').join(' '),
    takeaway: 'Bas itna yaad rakho.',
    cta: '',
    production: { visuals: [], broll: [], onScreenText: [], delivery: [] },
    targetDurationSeconds: 30,
  });
  assert.equal(result.passed, false);
  assert.ok(result.repairTargets.includes('hook'));
  assert.ok(result.checks.some((check) => check.id === 'generic-filler' && !check.passed));
  assert.ok(result.checks.some((check) => check.id === 'duration-fit' && !check.passed));
});
