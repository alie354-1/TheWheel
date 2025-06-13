import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.20.0";
import { corsHeaders } from "../_shared/cors.ts";

console.log("ai-generate-summary function booting up");

const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
let openai: OpenAI | null = null;

if (openaiApiKey) {
  openai = new OpenAI({
    apiKey: openaiApiKey,
  });
} else {
  console.warn(
    "OPENAI_API_KEY not set for Edge Function. Summary generation will be disabled."
  );
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

    console.log(`Generating summary for text: "${text.substring(0, 50)}..."`);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert summarizer. Briefly summarize the following user comment in one sentence. Respond with only the summary text.",
        },
        { role: "user", content: text },
      ],
      temperature: 0.5,
      max_tokens: 60, 
    });
    
    const summary = response.choices[0].message?.content?.trim() || "";
    
    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in ai-generate-summary function:", error);
    return new Response(JSON.stringify({ error: error.message, summary: "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
