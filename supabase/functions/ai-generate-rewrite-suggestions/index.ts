import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.20.0";
import { corsHeaders } from "../_shared/cors.ts";

console.log("ai-generate-rewrite-suggestions function booting up");

const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
let openai: OpenAI | null = null;

if (openaiApiKey) {
  openai = new OpenAI({
    apiKey: openaiApiKey,
  });
} else {
  console.warn(
    "OPENAI_API_KEY not set for Edge Function. Rewrite suggestions will be disabled."
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
    const { originalText, context, feedbackPrompt } = await req.json();
    if (!originalText || typeof originalText !== 'string') {
      return new Response(
        JSON.stringify({ error: "Missing 'originalText' parameter or invalid type" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Generating rewrite suggestions for text: "${originalText.substring(0, 50)}..."`);

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "You are an expert copywriter and editor specializing in creating impactful and clear content for pitch decks. Your task is to provide 2-3 alternative phrasings for the given text. Focus on enhancing clarity, conciseness, and overall impact. Consider the context and any specific feedback provided.",
      },
      {
        role: "user",
        content: `Original Text: "${originalText}"\n${context ? `Context: ${context}\n` : ''}${feedbackPrompt ? `Feedback/Instruction: ${feedbackPrompt}\n` : ''}\nPlease provide 2-3 improved versions of the original text. Respond with a JSON array of strings, like ["suggestion1", "suggestion2", "suggestion3"].`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: messages,
      temperature: 0.7,
      max_tokens: 300,
    });
    
    const resultText = response.choices[0].message?.content;
    if (!resultText) {
      throw new Error("OpenAI response content is empty for rewrite suggestions");
    }

    let suggestions: string[] = [originalText]; // Fallback
    try {
      const parsedSuggestions = JSON.parse(resultText);
      if (Array.isArray(parsedSuggestions) && parsedSuggestions.every(s => typeof s === 'string')) {
        suggestions = parsedSuggestions;
      }
    } catch (e) {
      console.warn("AI did not return valid JSON for suggestions. Attempting to parse plain text from Edge Function.");
      suggestions = resultText.split('\n').map(s => s.trim()).filter(s => s.length > 0 && s !== originalText);
      if (suggestions.length === 0) suggestions = [originalText]; // Ensure fallback if parsing fails badly
    }
    
    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in ai-generate-rewrite-suggestions function:", error);
    return new Response(JSON.stringify({ error: error.message, suggestions: [originalText] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
