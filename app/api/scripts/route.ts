import {NextResponse} from 'next/server'; import {z} from 'zod'; import {buildDraft} from '@/lib/ai/script-engine';
const schema=z.object({topic:z.string().min(3).max(1000),verifiedFacts:z.array(z.string()).default([])});
export async function POST(req:Request){try{const body=schema.parse(await req.json());return NextResponse.json({script:buildDraft(body.topic,body.verifiedFacts)})}catch{return NextResponse.json({error:'Script generate nahi ho paya.'},{status:400})}}
