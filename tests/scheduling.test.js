const test=require('node:test'); const assert=require('node:assert/strict');
function dailyPlan(items,date='2026-09-08'){return items.filter(i=>i.status!=='ARCHIVED'&&(!i.scheduled_date||i.scheduled_date<=date)).sort((a,b)=>b.priority-a.priority).slice(0,3)}
function blocked(items,ids){const m=new Map(items.map(x=>[x.id,x]));return ids.slice(1).filter((id,i)=>{const prev=m.get(ids[i]);return m.get(id)&&prev&&prev.status!=='PUBLISHED'&&prev.status!=='LEARNED'}).filter((id)=>m.get(id).status!=='PUBLISHED')}
test('daily plan returns top three actionable items',()=>{const xs=[1,2,3,4].map((n)=>({id:String(n),priority:n,status:'PLANNED'}));assert.deepEqual(dailyPlan(xs).map(x=>x.id),['4','3','2'])});
test('dependency chain flags unpublished predecessor',()=>{const xs=[{id:'1',status:'PLANNED'},{id:'2',status:'PLANNED'},{id:'3',status:'PUBLISHED'}];assert.deepEqual(blocked(xs,['1','2','3']),['2'])});
