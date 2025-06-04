// supabase/functions/ai-detect-expertise/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Hello from Functions/ai-detect-expertise!");

serve(async (req: Request) => {
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

    // Placeholder for actual AI expertise detection
    // This would involve more sophisticated NLP to analyze the comment's depth,
    // technical language, specificity, etc.
    // For now, simulate based on comment length and some keywords.
    let expertiseScore = 0.0;
    const technicalKeywords = ["technical", "architecture", "database", "algorithm", "scalability", "performance", "integration"];
    const businessKeywords = ["market", "strategy", "revenue", "monetization", "customer", "competition", "business model"];
    const designKeywords = ["ux", "ui", "visual", "aesthetic", "layout", "typography", "user experience", "design system"];

    const lowerText = text.toLowerCase();

    if (text.length > 200) expertiseScore += 0.2; // Longer comments might indicate more thought
    if (text.length > 500) expertiseScore += 0.2;

    let keywordCount = 0;
    [...technicalKeywords, ...businessKeywords, ...designKeywords].forEach(keyword => {
      if (lowerText.includes(keyword)) keywordCount++;
    });

    if (keywordCount > 2) expertiseScore += 0.2;
    if (keywordCount > 5) expertiseScore += 0.2;
    
    // Simulate some randomness or more complex factors
    if (Math.random() < 0.3) expertiseScore += 0.1;


    // Clamp score between 0 and 1
    expertiseScore = Math.max(0, Math.min(1, expertiseScore));
    // Round to 2 decimal places
    expertiseScore = parseFloat(expertiseScore.toFixed(2));

    return new Response(JSON.stringify({ expertise_score: expertiseScore }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in ai-detect-expertise function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
