import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.20.0";
import { corsHeaders } from "../_shared/cors.ts";

console.log("ai-recognize-intent function booting up");

const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
let openai: OpenAI | null = null;

if (openaiApiKey) {
  openai = new OpenAI({
    apiKey: openaiApiKey,
  });
} else {
  console.warn(
    "OPENAI_API_KEY not set for Edge Function. Intent recognition will be disabled."
  );
}

interface IntentRecognitionResult {
  intent: 'question' | 'suggestion' | 'criticism' | 'praise' | 'concern' | 'other';
  confidence: number;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!openai) {
    return new Response(
      JSON.stringify({ error: "AI service not initialized (API key missing)" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }

  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: "Missing 'text' parameter or invalid type" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Recognizing intent for text: "${text.substring(0, 50)}..."`);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an intent recognition expert. Analyze the following user comment and determine its primary intent (question, suggestion, criticism, praise, concern, other). Respond in JSON format: {\"intent\": \"intent_type\", \"confidence\": float_number_0_to_1}",
        },
        { role: "user", content: text },
      ],
      temperature: 0.3,
      max_tokens: 50,
    });
    
    const resultText = response.choices[0].message?.content;
    if (!resultText) {
      throw new Error("OpenAI response content is empty for intent recognition");
    }

    const result: IntentRecognitionResult = JSON.parse(resultText);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in ai-recognize-intent function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
