import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client (assumes env vars are set)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/business-ops-hub/recommendation-feedback
// Body: { userId, companyId, recommendationId, action, comment? }
// GET /api/business-ops-hub/recommendation-feedback?companyId=...&userId=...&recommendationId=...
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { userId, companyId, recommendationId, action, comment } = req.body;
      if (!userId || !companyId || !recommendationId || !action) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }
      const { error } = await supabase
        .from("recommendation_feedback")
        .insert({
          user_id: userId,
          company_id: companyId,
          recommendation_id: recommendationId,
          action,
          comment: comment || null,
        });
      if (error) throw new Error(error.message);
      res.status(200).json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  } else if (req.method === "GET") {
    try {
      const { companyId, userId, recommendationId, limit = 100 } = req.query;
      let query = supabase
        .from("recommendation_feedback")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(Number(limit));
      if (companyId) query = query.eq("company_id", companyId);
      if (userId) query = query.eq("user_id", userId);
      if (recommendationId) query = query.eq("recommendation_id", recommendationId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      res.status(200).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
