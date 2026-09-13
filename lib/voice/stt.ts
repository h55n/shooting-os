export interface STTProvider{transcribe(audio:Blob):Promise<string>}
export class MockSTT implements STTProvider{async transcribe(){return 'Voice transcription provider configured nahi hai. Transcript manually confirm karein.'}}
export function getSTTProvider(){return new MockSTT()}
