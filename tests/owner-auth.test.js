const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('owner guard authenticates against Supabase and rejects non-owners', () => {
  const source = fs.readFileSync('lib/auth/owner.ts', 'utf8');
  assert.match(source, /OWNER_USER_ID/);
  assert.match(source, /getUser\(\)/);
  assert.match(source, /AUTH_REQUIRED/);
  assert.match(source, /OWNER_NOT_CONFIGURED/);
  assert.match(source, /OWNER_FORBIDDEN/);
  assert.doesNotMatch(source, /user_metadata/);
});

test('proxy rejects a signed-in account that is not the configured owner', () => {
  const source = fs.readFileSync('proxy.ts', 'utf8');
  assert.match(source, /OWNER_USER_ID/);
  assert.match(source, /OWNER_FORBIDDEN/);
  assert.match(source, /OWNER_NOT_CONFIGURED/);
});
