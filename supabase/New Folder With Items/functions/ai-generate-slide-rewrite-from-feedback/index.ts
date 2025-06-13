import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Supabase function: ai-generate-slide-rewrite-from-feedback started.');

// Define expected input structure (mirroring types from your main app if possible)
interface CommentInput {
  id: string;
  textContent: string;
  authorDisplayName?: string;
  commentType?: string; // e.g., 'Suggestion', 'Concern'
  declaredRole?: string;
  // Add other relevant comment properties, e.g., authorRole, sentimentScore, etc.
}

interface SlideElementInput {
  id: string;
  type: string; // e.g., 'text', 'image', 'chart' (align with BlockType from main app)
  data: any; // Content of the element, e.g., { textContent: "..." }
}

interface SlideContentInput {
  title: string;
  elements: SlideElementInput[];
  // Potentially other slide-level metadata
}

interface RequestPayload {
  deckId: string;
  slideId: string;
  comments: CommentInput[];
  slideContent: SlideContentInput;
  aggregatedInsightsSummary?: string; // Added field
}

// Define expected output structure for a single suggestion
// This structure should be transformable by DeckService into a DeckAiUpdateProposal
interface AiGeneratedSuggestion {
  proposalCategory: 'ContentEdit' | 'NewSlideElement' | 'SlideRestructure' | 'GeneralAdvice';
  targetElementId?: string; 
  originalContentSnippet?: string; 
  suggestedContent?: any; 
  newElementData?: { 
    componentType: string; // Should align with BlockType from main app
    data: any;             
    layout?: { x: number; y: number; width: number; height: number };
  };
  restructureOperation?: 'ReorderElement' | 'DeleteElement' | 'AddNewSlideAfter' | 'ReorderSlide';
  restructureDetails?: { [key: string]: any; };
  description: string;
  reasoning?: string;
  confidenceScore: number;
}

// Interface for a hypothetical raw response from an AI model
interface RawAIModelResponseItem {
  type: 'text_edit' | 'new_element' | 'advice' | 'slide_restructure';
  target_element_id?: string;
  original_text_snippet?: string;
  suggested_text?: string; // For text_edit
  element_type?: string;   // For new_element (e.g., 'textBlock', 'chartBlock')
  content_data?: any;      // For new_element
  suggested_layout?: { x: number; y: number; width: number; height: number }; // For new_element
  advice_text?: string;    // For advice
  operation?: 'ReorderElement' | 'DeleteElement' | 'AddNewSlideAfter' | 'ReorderSlide'; // For slide_restructure
  operation_details?: any; // For slide_restructure
  reasoning_for_suggestion: string;
  confidence_level: number; // e.g., 0 to 1
}


serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json() as RequestPayload;

    if (!payload.deckId || !payload.slideId || !payload.comments || !payload.slideContent) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: deckId, slideId, comments, or slideContent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`[ai-generate-slide-rewrite-from-feedback] Received request for deckId: ${payload.deckId}, slideId: ${payload.slideId}`);
    console.log(`[ai-generate-slide-rewrite-from-feedback] Number of comments: ${payload.comments.length}`);

    // --- Actual AI Logic Placeholder ---

    // 1. PREPARE INPUT FOR AI MODEL:
    const feedbackText = payload.comments.map(c => `${c.authorDisplayName || 'Reviewer'} (${c.declaredRole || 'N/A'}, type: ${c.commentType || 'General'}): ${c.textContent}`).join("\n---\n");
    const slideContext = `Slide Title: ${payload.slideContent.title}\nElements:\n${payload.slideContent.elements.map(e => `  - ID: ${e.id}, Type: ${e.type}, Content: ${JSON.stringify(e.data).substring(0, 100)}...`).join("\n")}`;
    
    // 2. CONSTRUCT PROMPT FOR AI MODEL:
    const prompt = `
      Given the following slide content and user feedback, generate actionable improvement proposals.
      For each proposal, specify the category ('ContentEdit', 'NewSlideElement', 'SlideRestructure', 'GeneralAdvice'),
      target element ID (if applicable), original content snippet (if applicable), suggested content or new element data,
      reasoning, and a confidence score (0.0-1.0).

      Slide Content:
      ${slideContext}

      User Feedback:
      ${feedbackText}
      ${payload.aggregatedInsightsSummary ? `\nAggregated Insights Summary for these comments/slide:\n${payload.aggregatedInsightsSummary}` : ''}

      Generate proposals:
    `;
    // console.log("[ai-generate-slide-rewrite-from-feedback] Constructed Prompt:", prompt); // Log full prompt for debugging if needed

    // 3. CALL EXTERNAL AI MODEL (e.g., OpenAI, Anthropic)
    // const apiKey = Deno.env.get("OPENAI_API_KEY"); // Securely get API key from env vars
    // if (!apiKey) { 
    //   console.error("OPENAI_API_KEY not set in environment variables.");
    //   return new Response(JSON.stringify({ error: "AI service not configured." }), { status: 500 });
    // }
    // const aiModelEndpoint = "https://api.openai.com/v1/chat/completions"; // Example
    // const aiResponse = await fetch(aiModelEndpoint, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": \`Bearer \${apiKey}\`,
    //   },
    //   body: JSON.stringify({
    //     model: "gpt-3.5-turbo", // Or your preferred model
    //     messages: [{ role: "user", content: prompt }],
    //     // Add other parameters like max_tokens, temperature as needed
    //   }),
    // });
    // if (!aiResponse.ok) {
    //   const errorBody = await aiResponse.text();
    //   console.error("AI model API error:", aiResponse.status, errorBody);
    //   throw new Error(\`AI model API request failed: \${aiResponse.status}\`);
    // }
    // const rawAiData = await aiResponse.json();
    // const rawSuggestions: RawAIModelResponseItem[] = parseOpenAIResponse(rawAiData); // You'd need a parser

    // MOCK AI RESPONSE (simulating what an AI might return based on RawAIModelResponseItem)
    const mockRawSuggestions: RawAIModelResponseItem[] = [
      {
        type: 'text_edit',
        target_element_id: payload.slideContent.elements.length > 0 ? payload.slideContent.elements[0].id : "slide_title",
        original_text_snippet: payload.slideContent.elements.length > 0 && payload.slideContent.elements[0].data.textContent ? payload.slideContent.elements[0].data.textContent.substring(0,50) : payload.slideContent.title.substring(0,50),
        suggested_text: `Revised: ${payload.slideContent.elements.length > 0 && payload.slideContent.elements[0].data.textContent ? payload.slideContent.elements[0].data.textContent : payload.slideContent.title} - now much clearer and impactful!`,
        reasoning_for_suggestion: "Improved clarity and impact based on feedback about conciseness.",
        confidence_level: 0.92
      },
      {
        type: 'new_element',
        element_type: "text", // Corresponds to BlockType
        content_data: { textContent: "Key Takeaway: This slide highlights the significant market growth potential." },
        suggested_layout: { x: 10, y: payload.slideContent.elements.reduce((maxY, el) => Math.max(maxY, el.data.y + el.data.height), 100) + 20, width: 300, height: 50 },
        reasoning_for_suggestion: "Feedback indicated a summary or key takeaway was missing for this slide.",
        confidence_level: 0.85
      },
      {
        type: 'advice',
        advice_text: "Consider using a more vibrant color for the chart on this slide to improve visual appeal.",
        reasoning_for_suggestion: "Multiple comments mentioned the current chart colors are hard to distinguish.",
        confidence_level: 0.70
      }
    ];

    // 4. PARSE AI MODEL RESPONSE and format into AiGeneratedSuggestion[] structure.
    const suggestions: AiGeneratedSuggestion[] = mockRawSuggestions.map((raw): AiGeneratedSuggestion | null => {
      switch (raw.type) {
        case 'text_edit':
          return {
            proposalCategory: 'ContentEdit',
            targetElementId: raw.target_element_id,
            originalContentSnippet: raw.original_text_snippet,
            suggestedContent: { newText: raw.suggested_text },
            description: raw.reasoning_for_suggestion || `Suggests editing text for element: ${raw.target_element_id}`,
            reasoning: raw.reasoning_for_suggestion,
            confidenceScore: raw.confidence_level,
          };
        case 'new_element':
          return {
            proposalCategory: 'NewSlideElement',
            newElementData: {
              componentType: raw.element_type!, // Assert non-null as it's expected for this type
              data: raw.content_data!,
              layout: raw.suggested_layout,
            },
            description: raw.reasoning_for_suggestion || `Suggests adding a new '${raw.element_type}' element.`,
            reasoning: raw.reasoning_for_suggestion,
            confidenceScore: raw.confidence_level,
          };
        case 'slide_restructure': // Example for a restructure operation
          return {
            proposalCategory: 'SlideRestructure',
            targetElementId: raw.target_element_id, // Could be slide ID or element ID depending on operation
            restructureOperation: raw.operation,
            restructureDetails: raw.operation_details,
            description: raw.reasoning_for_suggestion || `Suggests restructuring: ${raw.operation}`,
            reasoning: raw.reasoning_for_suggestion,
            confidenceScore: raw.confidence_level,
          };
        case 'advice':
          return {
            proposalCategory: 'GeneralAdvice',
            description: raw.advice_text || "General feedback provided.",
            reasoning: raw.reasoning_for_suggestion,
            confidenceScore: raw.confidence_level,
          };
        default:
          console.warn("Unknown raw suggestion type:", raw);
          return null;
      }
    }).filter(s => s !== null) as AiGeneratedSuggestion[]; // Filter out any nulls from unknown types
    
    const responsePayload = {
      deckId: payload.deckId,
      slideId: payload.slideId,
      suggestions: suggestions,
    };

    return new Response(
      JSON.stringify(responsePayload),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    const err = error as Error;
    console.error('[ai-generate-slide-rewrite-from-feedback] Error:', err.message, err.stack);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
