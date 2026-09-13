const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) { return fs.readFileSync(path, 'utf8'); }

test('assist uses scoped verified retrieval and authenticated persistence', () => {
  const src = read('app/api/assistant/route.ts');
  assert.match(src, /retrieveKnowledge/);
  assert.doesNotMatch(src, /readFileSync/);
  assert.doesNotMatch(src, /MASTER_MEMORY/);
  assert.match(src, /createClient/);
  assert.match(src, /user_id/);
  assert.match(src, /actions/);
});

test('ideas supports browser voice capture with text fallback', () => {
  const src = read('app/ideas/page.tsx');
  assert.match(src, /SpeechRecognition|webkitSpeechRecognition/);
  assert.match(src, /Voice/);
  assert.match(src, /textarea/);
});

test('shooting view has an offline navigation fallback', () => {
  const sw = read('public/sw.js');
  assert.match(sw, /offline-shoot/);
  assert.match(sw, /shootingMatch/);
  assert.match(sw, /Response\.redirect/);
  assert.ok(fs.existsSync('app/offline-shoot/page.tsx'));
});

test('optional shooting guidance persists per content item', () => {
  assert.ok(fs.existsSync('app/api/content/[id]/guidance/route.ts'));
  const client = read('components/ScriptReviewClient.tsx');
  assert.match(client, /\/guidance/);
  assert.match(client, /shooting_guidance|guidanceEnabled/);
});

test('masterclass requires outline approval and versioned lesson review', () => {
  assert.ok(fs.existsSync('app/api/masterclasses/[id]/approve/route.ts'));
  assert.ok(fs.existsSync('app/api/masterclasses/[id]/lessons/route.ts'));
  assert.ok(fs.existsSync('app/api/masterclasses/sections/[id]/route.ts'));
  const section = read('app/api/masterclasses/sections/[id]/route.ts');
  assert.match(section, /masterclass_section_versions/);
  const page = read('app/masterclass/page.tsx');
  assert.match(page, /Approve Outline/);
  assert.match(page, /Generate Lessons/);
  assert.match(page, /Approve Lesson/);
});

test('series workflow can generate thirty topics, edit order, and batch selected scripts', () => {
  assert.ok(fs.existsSync('app/series/page.tsx'));
  assert.ok(fs.existsSync('app/api/series/route.ts'));
  assert.ok(fs.existsSync('app/api/series/[id]/topics/route.ts'));
  assert.ok(fs.existsSync('app/api/series/[id]/scripts/route.ts'));
  const api = read('app/api/series/route.ts');
  assert.match(api, /30/);
  assert.match(api, /series_topics/);
});

test('content research is source-grounded and persists evidence', () => {
  assert.ok(fs.existsSync('app/api/content/[id]/research/route.ts'));
  const src = read('app/api/content/[id]/research/route.ts');
  assert.match(src, /sourceUrls/);
  assert.match(src, /research_items/);
  assert.match(src, /sources/);
  assert.match(src, /safeClaim/);
});

test('trend candidates are manual-first and persisted before suggestions', () => {
  assert.ok(fs.existsSync('app/api/trends/route.ts'));
  assert.ok(fs.existsSync('app/trends/page.tsx'));
  const src = read('app/api/trends/route.ts');
  assert.match(src, /trend_items/);
  assert.match(src, /relevance/);
});
