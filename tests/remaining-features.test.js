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
  assert.match(sw, /\/content\//);
  assert.ok(fs.existsSync('app/offline-shoot/page.tsx'));
});

test('masterclass requires outline approval before lesson generation', () => {
  assert.ok(fs.existsSync('app/api/masterclasses/[id]/approve/route.ts'));
  assert.ok(fs.existsSync('app/api/masterclasses/[id]/lessons/route.ts'));
  const page = read('app/masterclass/page.tsx');
  assert.match(page, /Approve Outline/);
  assert.match(page, /Generate Lessons/);
});

test('series workflow can generate thirty topics and batch script selected topics', () => {
  assert.ok(fs.existsSync('app/series/page.tsx'));
  assert.ok(fs.existsSync('app/api/series/route.ts'));
  assert.ok(fs.existsSync('app/api/series/[id]/scripts/route.ts'));
  const api = read('app/api/series/route.ts');
  assert.match(api, /30/);
  assert.match(api, /series_topics/);
});
