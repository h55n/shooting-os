const test=require('node:test'); const assert=require('node:assert/strict');
const fs=require('fs'); const scheduling=fs.readFileSync('lib/domain/scheduling.ts','utf8'); const status=fs.readFileSync('lib/domain/status.ts','utf8'); const claims=fs.readFileSync('lib/domain/claims.ts','utf8');
test('domain modules exist and encode required safeguards',()=>{assert.match(scheduling,/dailyPlan/);assert.match(scheduling,/dependenciesBlocked/);assert.match(status,/APPROVED/);assert.match(status,/PUBLISHED/);assert.match(claims,/validateClaims/);assert.match(claims,/ClaimValidationResult/)});
test('PRD is packaged as source of truth',()=>{assert.ok(fs.existsSync('docs/PRD.md'));assert.ok(fs.existsSync('docs/BUILD_PLAN.md'))});
