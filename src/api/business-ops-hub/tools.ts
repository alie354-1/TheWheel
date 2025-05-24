import type { NextApiRequest, NextApiResponse } from "next";
import { companyToolsService } from "../../lib/services/companyTools.service";

// GET /api/business-ops-hub/tools?companyId=...&search=...&category=...
// GET /api/business-ops-hub/tools/:toolId
// GET /api/business-ops-hub/tools/:toolId/implementation-guide

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId, search, category } = req.query;
    const { toolId } = req.query;

    // Tool details or implementation guide
    if (req.method === "GET" && toolId) {
      // Tool details for comparison
      if (req.url?.endsWith("/implementation-guide")) {
        // Stub: return a static implementation guide for now
        res.status(200).json({
          toolId,
          steps: [
            { title: "Step 1: Prepare", description: "Gather requirements and team." },
            { title: "Step 2: Configure", description: "Set up the tool with your company data." },
            { title: "Step 3: Train", description: "Train your team on tool usage." },
            { title: "Step 4: Launch", description: "Go live and monitor adoption." }
          ]
        });
        return;
      } else {
        // Tool details
        if (!companyId) {
          res.status(400).json({ error: "Missing companyId" });
          return;
        }
        const tools = await companyToolsService.getCompanyTools(companyId as string);
        const tool = tools.find((t: any) => t.tool_id === toolId);
        if (!tool) {
          res.status(404).json({ error: "Tool not found" });
          return;
        }
        res.status(200).json(tool);
        return;
      }
    }

    // Tool search/filter
    if (req.method === "GET") {
      if (!companyId) {
        res.status(400).json({ error: "Missing companyId" });
        return;
      }
      let tools = await companyToolsService.getCompanyTools(companyId as string);
      if (search) {
        const s = (search as string).toLowerCase();
        tools = tools.filter((t: any) =>
          t.name?.toLowerCase().includes(s) ||
          t.description?.toLowerCase().includes(s)
        );
      }
      if (category) {
        tools = tools.filter((t: any) => t.category === category);
      }
      res.status(200).json({ tools });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
