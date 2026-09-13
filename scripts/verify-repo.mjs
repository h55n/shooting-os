import {existsSync,readFileSync} from 'node:fs';
const required=['app/page.tsx','app/ideas/page.tsx','app/content/c1/page.tsx','supabase/migrations/0001_initial.sql','docs/PRD.md','docs/PRODUCTION_HANDOFF.md'];
const missing=required.filter(x=>!existsSync(x)); if(missing.length){console.error('Missing:',missing);process.exit(1)}
const sql=readFileSync('supabase/migrations/0001_initial.sql','utf8'); for(const s of ['vector','row level security','match_knowledge']) if(!sql.toLowerCase().includes(s)) throw new Error(`Missing schema safeguard: ${s}`);
console.log('Repository structural verification: PASS');
