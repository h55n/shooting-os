const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');

const auth = fs.readFileSync('lib/auth/server.ts', 'utf8');
const proxy = fs.readFileSync('proxy.ts', 'utf8');
const shell = fs.readFileSync('components/AppShell.tsx', 'utf8');

test('product auth has no role API', () => {
  assert.doesNotMatch(auth, /requireRole|getRole|\bRole\b/);
});

test('proxy protects the owner app without role routing', () => {
  assert.doesNotMatch(proxy, /profiles.*role|x-user-role|\/operator/);
  assert.doesNotMatch(proxy, /'\/signup'/);
  assert.match(proxy, /x-user-id/);
});

test('mobile navigation is Home Ideas Plan Content Masterclass', () => {
  for (const label of ['Home', 'Ideas', 'Plan', 'Content', 'Masterclass']) {
    assert.match(shell, new RegExp(`label: ["']${label}["']`));
  }
  assert.doesNotMatch(shell, /label: ["']Help["']/);
  assert.match(shell, /href="\/assistant"/);
});

test('single-owner migration is additive and replaces role policies', () => {
  const migrationPath = 'supabase/migrations/0003_single_owner_model.sql';
  assert.ok(fs.existsSync(migrationPath), '0003 single-owner migration must exist');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  assert.match(sql, /drop policy if exists projects_staff/i);
  assert.match(sql, /auth\.role\(\)\s*=\s*'authenticated'/i);
  assert.doesNotMatch(sql, /disable row level security/i);
});
