const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('password recovery is available without exposing it to the private app', () => {
  const login = fs.readFileSync('app/login/page.tsx', 'utf8');
  const reset = fs.readFileSync('app/reset-password/page.tsx', 'utf8');
  const callback = fs.readFileSync('app/auth/callback/route.ts', 'utf8');
  const authClient = fs.readFileSync('lib/auth/client.ts', 'utf8');
  const proxy = fs.readFileSync('proxy.ts', 'utf8');
  const shell = fs.readFileSync('components/AppShell.tsx', 'utf8');

  assert.match(login, /Forgot password/i);
  assert.match(reset, /updatePassword/);
  assert.match(reset, /\/auth\/callback/);
  assert.match(callback, /exchangeCodeForSession/);
  assert.match(callback, /reset-password/);
  assert.match(authClient, /resetPasswordForEmail/);
  assert.match(proxy, /'\/reset-password'/);
  assert.match(shell, /path === "\/reset-password"/);
});
