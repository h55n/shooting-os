const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');

const categories = fs.readFileSync('lib/content-engine/categories.ts', 'utf8');
const hooks = fs.readFileSync('lib/content-engine/hooks.ts', 'utf8');
const duration = fs.readFileSync('lib/content-engine/duration.ts', 'utf8');
const quality = fs.readFileSync('lib/content-engine/quality-gate.ts', 'utf8');

test('content engine defines all fourteen initial categories', () => {
  assert.equal((categories.match(/\bcore\('/g) || []).length, 14);
  for (const id of ['beginner-education','common-mistake','myth','personal-story','competition-story','demonstration','quick-tip','comparison','expert-take','problem-solution','faq','pathway','mental-performance','equipment-setup']) {
    assert.match(categories, new RegExp(`'${id}'`));
  }
});

test('hook library is data-driven and category compatible', () => {
  assert.match(hooks, /HOOK_PATTERNS/);
  assert.match(hooks, /compatibleCategories/);
  assert.match(hooks, /getHookPatternsForCategory/);
  assert.match(hooks, /common-mistake/);
});

test('duration estimator derives timing from spoken word rate', () => {
  assert.match(duration, /estimateDurationSeconds/);
  assert.match(duration, /wordsPerMinute/);
  assert.match(duration, /\(words \/ wordsPerMinute\) \* 60/);
  assert.match(duration, /fitsTargetDuration/);
});

test('quality gate includes hook, filler and duration checks with repair targets', () => {
  assert.match(quality, /hook-present/);
  assert.match(quality, /generic-filler/);
  assert.match(quality, /duration-fit/);
  assert.match(quality, /repairTargets/);
  assert.match(quality, /hello guys welcome back/);
});
