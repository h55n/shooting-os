import type {ContentItem} from '../domain/types';
export const demoItems:ContentItem[]=[
{id:'c1',title:'Trigger Control — Beginner Mistake',content_type:'reel',pillar:'Shooting Education',status:'REVIEW',priority:10,scheduled_date:new Date().toISOString().slice(0,10),series:'30 Days Beginner Shooting',task:'Script review'},
{id:'c2',title:'Breathing Technique',content_type:'youtube_short',pillar:'Shooting Education',status:'RECORDING',priority:9,scheduled_date:new Date().toISOString().slice(0,10),series:'30 Days Beginner Shooting',task:'Recording'},
{id:'c3',title:'Competition Pressure',content_type:'youtube',pillar:'Performance and Competition',status:'RESEARCHING',priority:8,scheduled_date:new Date().toISOString().slice(0,10),task:'Research'}];
