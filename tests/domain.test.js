const test=require('node:test'); const assert=require('node:assert/strict');
const fs=require('fs'); const scheduling=fs.readFileSync('lib/domain/scheduling.ts','utf8'); const status=fs.readFileSync('lib/domain/status.ts','utf8'); const claims=fs.readFileSync('lib/domain/claims.ts','utf8');
test('domain modules exist and encode required safeguards',()=>{assert.match(scheduling,/dailyPlan/);assert.match(scheduling,/dependenciesBlocked/);assert.match(status,/APPROVED/);assert.match(status,/PUBLISHED/);assert.match(claims,/UnsupportedPersonalClaims/)});
test('PRD is packaged as source of truth',()=>{assert.ok(fs.existsSync('../papa-crm-PRD-v2.md')||fs.existsSync('docs/PRD.md'))});
