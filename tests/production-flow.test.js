const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');

const migrationPath = 'supabase/migrations/0004_creation_and_production_flow.sql';

test('creation/production migration is additive and supports core persisted flows', () => {
  assert.ok(fs.existsSync(migrationPath), '0004 creation/production migration must exist');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  assert.match(sql, /add column if not exists category_id/i);
  assert.match(sql, /create table if not exists public\.first_ten_journeys/i);
  assert.match(sql, /create table if not exists public\.first_ten_items/i);
  assert.match(sql, /create or replace function public\.create_content_from_idea/i);
  assert.match(sql, /create or replace function public\.approve_content/i);
  assert.match(sql, /create or replace function public\.mark_content_shot/i);
  assert.doesNotMatch(sql, /drop table/i);
  assert.doesNotMatch(sql, /disable row level security/i);
});

test('product exposes persistent script and production routes', () => {
  for (const path of [
    'app/api/ideas/[id]/script/route.ts',
    'app/api/content/[id]/script/route.ts',
    'app/api/content/[id]/schedule/route.ts',
    'app/api/content/[id]/shot/route.ts',
  ]) assert.ok(fs.existsSync(path), `${path} should exist`);
});

test('shooting view and masterclass are first-class product routes', () => {
  assert.ok(fs.existsSync('app/content/[id]/shoot/page.tsx'));
  assert.ok(fs.existsSync('app/masterclass/page.tsx'));
});
