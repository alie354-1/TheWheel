// supabase/functions/ai-analyze-sentiment/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Hello from Functions/ai-analyze-sentiment!");

serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: "Missing or invalid 'text' parameter" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Placeholder for actual AI sentiment analysis
    // In a real scenario, this would call an AI model (e.g., OpenAI, a custom model)
    // For now, let's simulate a simple sentiment score based on keywords
    let sentimentScore = 0;
    const positiveKeywords = ["good", "great", "excellent", "love", "like", "amazing", "wonderful", "positive"];
    const negativeKeywords = ["bad", "terrible", "poor", "hate", "dislike", "awful", "negative", "problem"];

    const lowerText = text.toLowerCase();
    positiveKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) sentimentScore += 0.2;
    });
    negativeKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) sentimentScore -= 0.2;
    });

    // Clamp score between -1 and 1
    sentimentScore = Math.max(-1, Math.min(1, sentimentScore));
    // Round to 2 decimal places
    sentimentScore = parseFloat(sentimentScore.toFixed(2));

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (sentimentScore > 0.1) sentiment = 'positive';
    else if (sentimentScore < -0.1) sentiment = 'negative';

    return new Response(JSON.stringify({ sentiment: sentiment, score: sentimentScore }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in ai-analyze-sentiment function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
