import { supabase } from '../supabase.ts';

class AIService {
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const { data, error } = await supabase.functions.invoke('ai-transcribe-voice-note', {
      body: audioBlob,
      headers: {
        'Content-Type': 'audio/webm',
      },
    });

    if (error) {
      console.error('Error calling transcription function:', error);
      throw new Error('Transcription failed.');
    }

    return data.transcription;
  }
}

export const aiService = new AIService();
