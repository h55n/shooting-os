const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function source(path) {
  return fs.readFileSync(path, 'utf8');
}

test('sensitive AI routes enforce the owner guard before invoking providers or service role', () => {
  for (const path of [
    'app/api/assistant/route.ts',
    'app/api/ideas/route.ts',
    'app/api/ai/analyze-trend/route.ts',
    'app/api/ai/generate-course/route.ts',
    'app/api/scripts/route.ts',
  ]) {
    const text = source(path);
    assert.match(text, /requireOwner/);
    if (text.includes('getAIProvider')) assert.match(text, /export async function POST[\s\S]*?requireOwner\(\)[\s\S]*?getAIProvider/);
  }
});

test('Assist renders restricted formatted output rather than literal markdown lines', () => {
  const page = source('app/assistant/page.tsx');
  const renderer = source('components/assistant/markdown-reply.tsx');
  assert.match(page, /MarkdownReply/);
  assert.doesNotMatch(page, /msg\.text\.split\('\\n'\)/);
  assert.doesNotMatch(renderer, /dangerouslySetInnerHTML/);
  assert.match(renderer, /safeHref/);
  assert.match(renderer, /list-decimal/);
});

test('AI provider honours explicit configuration and never logs provider response bodies', () => {
  const provider = source('lib/ai/provider.ts');
  assert.match(provider, /AI_PROVIDER/);
  assert.match(provider, /AI_FALLBACK_PROVIDERS/);
  assert.doesNotMatch(provider, /await res\.text\(\)/);
  assert.doesNotMatch(provider, /err\.message/);
  assert.doesNotMatch(provider, /response_format/);
});

test('Assist grounds ambiguous terminology in the product shooting domain and never invents biography', () => {
  const route = source('app/api/assistant/route.ts');
  assert.match(route, /precision shooting/i);
  assert.match(route, /without attributing it to M N Rehman/i);
  assert.match(route, /never describe M N Rehman as an actor/i);
});

test('Assist remains available when grounding or chat persistence is temporarily unavailable', () => {
  const route = source('app/api/assistant/route.ts');
  assert.match(route, /export const maxDuration = 60/);
  assert.match(route, /knowledge retrieval unavailable/);
  assert.match(route, /conversation persistence unavailable/);
  assert.match(route, /persisted = false/);
});

test('ideas and content support reversible owner-only trash', () => {
  const migration = source('supabase/migrations/20260914105233_add_owner_trash_support.sql');
  const ideas = source('app/api/ideas/route.ts');
  const content = source('app/api/content/[id]/trash/route.ts');
  const repository = source('lib/repositories/content.ts');
  assert.match(migration, /trashed_at/);
  assert.match(ideas, /export async function DELETE/);
  assert.match(content, /requireOwner/);
  assert.match(repository, /trashed_at/);
});
