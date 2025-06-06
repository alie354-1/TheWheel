import { Step } from "../types/journey.types";

/**
 * Placeholder data for journey steps.
 * Only a few example steps are included here for demonstration.
 */
export const steps: Step[] = [
  {
    id: "5fd19381-e786-4160-9c2d-019b0db63ea9",
    name: "Define Vision & Mission",
    primary_phase_id: "cde121c1-4d02-478c-b809-621debc79539",
    primary_domain_id: "cbd48e25-32a1-4a38-bf7e-c08bbee5207f",
    secondary_phase_id: undefined,
    secondary_domain_id: undefined,
    description: "Crafting a clear vision and mission sets the strategic direction, aligns your team, and helps you attract investors, partners, and talent.",
    difficulty: "Low",
    time_estimate: "None",
    coverage_notes: "Articulate a one-sentence vision. Brainstorm core values. Align them to your long-term goals.",
    howto_without_tools: "Without Tools: 1) Write down 5 core beliefs you want your company to embody. 2) Share with 3 advisors & refine.",
    audience: "Founders & early-stage teams",
    active: true,
    snippet_references: [
      "https://www.ycombinator.com/library/4a-define-your-company-mission",
      "https://strategyzer.com/canvas/business-model-canvas"
    ],
    resource_links: [
      "https://www.notion.so/Vision-Statement-Template",
      "https://www.slideshare.net/vision-mission-examples"
    ],
    created_at: "2025-06-02T09:00:00Z"
  },
  {
    id: "0005eb82-5a12-4efd-83d0-bc335ec0328e",
    name: "Conduct Market Research",
    primary_phase_id: "cde121c1-4d02-478c-b809-621debc79539",
    primary_domain_id: "cbd48e25-32a1-4a38-bf7e-c08bbee5207f",
    secondary_phase_id: undefined,
    secondary_domain_id: undefined,
    description: "Understanding your target market and competitor landscape is critical for positioning, pricing, and product-market fit.",
    difficulty: "Medium",
    time_estimate: "2-4 weeks",
    coverage_notes: "Identify top 5 competitors. Survey 50 potential customers. Summarize insights in a 5-page deck.",
    howto_without_tools: "Without Tools: 1) Use Google Forms + spreadsheets. 2) Conduct 10 phone interviews per week.",
    audience: "Founders & PMs",
    active: true,
    snippet_references: [
      "https://leanstartup.co/",
      "https://hbr.org/1999/01/a-simple-framework-for-marketanalysis"
    ],
    resource_links: [
      "https://notion.so/market-research-template",
      "https://miro.com/templates/market-research"
    ],
    created_at: "2025-06-02T09:00:00Z"
  },
  {
    id: "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
    name: "Validate Product-Market Fit",
    primary_phase_id: "phase-product",
    primary_domain_id: "domain-product",
    secondary_phase_id: "phase-strategy",
    secondary_domain_id: undefined,
    description: "Talk to 15-25 potential customers to identify real needs for your product.",
    difficulty: "Medium",
    time_estimate: "2 weeks",
    coverage_notes: "Interview customers, summarize findings, iterate on product idea.",
    howto_without_tools: "Without Tools: 1) Schedule calls. 2) Use a spreadsheet to track insights.",
    audience: "Founders, Product Managers",
    active: true,
    snippet_references: [
      "https://www.ycombinator.com/library/4a-define-your-company-mission"
    ],
    resource_links: [
      "https://www.notion.so/PMF-Validation-Template"
    ],
    created_at: "2025-06-03T09:00:00Z"
  },
  {
    id: "b2c3d4e5-f6a1-2345-6789-abcdef012345",
    name: "Build MVP",
    primary_phase_id: "phase-product",
    primary_domain_id: "domain-product",
    secondary_phase_id: undefined,
    secondary_domain_id: "domain-ops",
    description: "Create a minimum viable product to test your core hypothesis.",
    difficulty: "High",
    time_estimate: "4 weeks",
    coverage_notes: "Define MVP scope, build core features, launch to early users.",
    howto_without_tools: "Without Tools: 1) Use no-code tools. 2) Focus on one core feature.",
    audience: "Product Teams",
    active: true,
    snippet_references: [
      "https://strategyzer.com/canvas/business-model-canvas"
    ],
    resource_links: [
      "https://www.notion.so/MVP-Builder-Template"
    ],
    created_at: "2025-06-03T09:00:00Z"
  },
  {
    id: "c3d4e5f6-a1b2-3456-7890-abcdef123456",
    name: "Set Up Financial Model",
    primary_phase_id: "phase-ops",
    primary_domain_id: "domain-finance",
    secondary_phase_id: undefined,
    secondary_domain_id: undefined,
    description: "Build a simple financial model to forecast revenue, costs, and runway.",
    difficulty: "Medium",
    time_estimate: "1 week",
    coverage_notes: "Use a spreadsheet template. Estimate costs and revenue for 12 months.",
    howto_without_tools: "Without Tools: 1) Use Google Sheets. 2) Research industry benchmarks.",
    audience: "Founders, CFOs",
    active: true,
    snippet_references: [
      "https://www.notion.so/Financial-Model-Template"
    ],
    resource_links: [
      "https://www.notion.so/Financial-Model-Template"
    ],
    created_at: "2025-06-03T09:00:00Z"
  },
  {
    id: "d4e5f6a1-b2c3-4567-8901-abcdef234567",
    name: "Incorporate Company",
    primary_phase_id: "phase-ops",
    primary_domain_id: "domain-ops",
    secondary_phase_id: undefined,
    secondary_domain_id: undefined,
    description: "Register your company as a legal entity.",
    difficulty: "Low",
    time_estimate: "3 days",
    coverage_notes: "Choose entity type, file paperwork, get EIN.",
    howto_without_tools: "Without Tools: 1) Use state website. 2) Consult a legal advisor.",
    audience: "Founders",
    active: true,
    snippet_references: [
      "https://www.notion.so/Incorporation-Checklist"
    ],
    resource_links: [
      "https://www.notion.so/Incorporation-Checklist"
    ],
    created_at: "2025-06-03T09:00:00Z"
  }
];
