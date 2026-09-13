const test=require('node:test'); const assert=require('node:assert/strict');
function unsupported(text,facts){const personal=/\b(I|I've|I am|maine|main|mera|mere)\b.{0,80}\b(won|represented|competed|medal|champion|national|international|olympic|CRPF|NCC)\b/i;if(!personal.test(text))return [];return text.split(/(?<=[.!?])\s+/).filter(s=>personal.test(s)&&!facts.some(f=>s.toLowerCase().includes(f.toLowerCase())))}
test('unsupported personal achievement is flagged',()=>assert.equal(unsupported('I won a national medal.',[]).length,1));
test('verified personal fact is not flagged',()=>assert.equal(unsupported('I won a national medal.', ['won a national medal']).length,0));
