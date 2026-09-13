import {getAIProvider} from './provider'; import type {IdeaProposal} from '../domain/types';
export async function processIdea(raw:string):Promise<IdeaProposal>{const r=await getAIProvider().generate({system:'Return JSON only.',prompt:`${raw}`});return JSON.parse(r.text) as IdeaProposal}
