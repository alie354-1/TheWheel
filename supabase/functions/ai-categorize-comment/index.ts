// supabase/functions/ai-categorize-comment/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Hello from Functions/ai-categorize-comment!");

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

    // Placeholder for actual AI comment categorization
    // This would involve NLP to understand the main topic of the comment.
    // For now, simulate based on keywords.
    let category = "General";
    const lowerText = text.toLowerCase();

    const categories: { [key: string]: string[] } = {
      "Clarity": ["unclear", "confusing", "explain", "clarify", "understand", "meaning"],
      "Design": ["visual", "aesthetic", "layout", "color", "font", "look", "feel", "ui", "ux", "style"],
      "Market": ["market size", "target audience", "customer", "competition", "go-to-market", "positioning"],
      "Business Logic": ["business model", "revenue", "monetization", "strategy", "pricing", "financials", "validation"],
      "Technical": ["technical", "architecture", "database", "algorithm", "scalability", "performance", "integration", "feature"],
      "Content": ["content", "story", "narrative", "message", "text", "copy", "information"],
      "Presentation": ["slide", "flow", "order", "delivery", "presenting", "structure"],
    };

    let bestMatchCount = 0;
    for (const cat in categories) {
      let currentMatchCount = 0;
      categories[cat].forEach(keyword => {
        if (lowerText.includes(keyword)) {
          currentMatchCount++;
        }
      });
      if (currentMatchCount > bestMatchCount) {
        bestMatchCount = currentMatchCount;
        category = cat;
      }
    }
    
    // If no strong keyword match, keep it General or apply other logic
    if (bestMatchCount === 0 && text.length < 50) {
        category = "General/Brief";
    }

    // For now, return a single category with a placeholder confidence
    // The aiService.ts expects TopicCategorizationResult[]
    // The deck_comments table expects a single text category.
    // This function will return what aiService expects, and the service layer will adapt.
    const result = [{ category: category, confidence: bestMatchCount > 0 ? 0.75 : 0.5 }];

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in ai-categorize-comment function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
