import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const audioBlob = await req.blob();
    // In a real implementation, you would send this blob to a speech-to-text API
    // For this example, we'll just return a dummy transcription.
    const dummyTranscription = "This is a transcribed voice note. In a real application, this would be the output of an AI speech-to-text service.";

    return new Response(JSON.stringify({ transcription: dummyTranscription }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
