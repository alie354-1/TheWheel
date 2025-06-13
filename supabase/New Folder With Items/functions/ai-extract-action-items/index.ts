import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.20.0";
import { corsHeaders } from "../_shared/cors.ts";

console.log("ai-extract-action-items function booting up");

const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
let openai: OpenAI | null = null;

if (openaiApiKey) {
  openai = new OpenAI({
    apiKey: openaiApiKey,
  });
} else {
  console.warn(
    "OPENAI_API_KEY not set for Edge Function. Action item extraction will be disabled."
  );
}

interface ActionItem {
  text: string;
  priority?: 'high' | 'medium' | 'low';
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

    console.log(`Extracting action items from text: "${text.substring(0, 50)}..."`);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert in identifying actionable tasks from text. Analyze the following user comment and extract any specific action items or tasks suggested. For each action item, provide a concise description. Respond in JSON format: [{\"text\": \"action_item_description\", \"priority\": \"high|medium|low_optional\"}]",
        },
        { role: "user", content: text },
      ],
      temperature: 0.4,
      max_tokens: 150,
    });
    
    const resultText = response.choices[0].message?.content;
    if (!resultText) {
      throw new Error("OpenAI response content is empty for action item extraction");
    }
    
    const result: ActionItem[] = JSON.parse(resultText);

    return new Response(JSON.stringify(Array.isArray(result) ? result : []), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in ai-extract-action-items function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
