import type { NextApiRequest, NextApiResponse } from "next";
import { CoreRecommendationService } from "../../lib/services/recommendation/core.service";
import { AssistantRecommendationService } from "../../lib/services/recommendation/assistant.service";
import { recommendationService } from "../../business-ops-hub/services/recommendation.service";

// POST /api/business-ops-hub/recommendations
// Body: { companyId: string, userId?: string, context?: any }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { companyId, userId, context } = req.body;
    if (!companyId) {
      res.status(400).json({ error: "Missing companyId" });
      return;
    }
    // Example: get general recommendations for the company
    const recommendations = await CoreRecommendationService.getRecommendations(companyId, context || {});
    // Get cross-domain blockers
    const blockers = await recommendationService.getCrossDomainBlockers();
    // Optionally: get step assistant data if userId/context provided
    let assistantData = null;
    if (userId && context && context.stepId) {
      assistantData = await AssistantRecommendationService.getStepAssistantData(userId, context.stepId);
    }
    res.status(200).json({
      recommendations,
      crossDomainBlockers: blockers,
      assistantData
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
