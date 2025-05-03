/**
 * Tool Submission Service
 * - Submit user tools for promotion to global tools db
 * - AI enrichment of tool details
 * - Admin review and promotion
 */

export const toolSubmissionService = {
  // Submit a tool for a journey step
  async submitToolSubmission({
    submittedBy,
    companyId,
    name,
    url,
    description,
    category,
    subcategory,
    tags,
    journeyStepId
  }: {
    submittedBy: string;
    companyId: string;
    name: string;
    url?: string;
    description?: string;
    category?: string;
    subcategory?: string;
    tags?: string[];
    journeyStepId?: string;
  }) {
    // TODO: Insert into tool_submissions (status: pending)
    // TODO: Trigger AI enrichment (if needed)
    // Return submission id or status
  },

  // AI enrichment of tool details (can be called after submission)
  async enrichToolSubmission(toolSubmissionId: string) {
    // TODO: Use AI to fill in missing details (public info, scraping, etc.)
    // Update tool_submissions.ai_enriched and ai_enriched_fields
  },

  // Admin approves and promotes tool to global db
  async promoteToolSubmission(toolSubmissionId: string, promotedBy: string) {
    // TODO: Insert into journey_step_tools, update tool_submissions.status to 'approved'
    // Log in tool_promotion_logs
  },

  // Admin rejects tool submission
  async rejectToolSubmission(toolSubmissionId: string, rejectedBy: string, reason: string) {
    // TODO: Update tool_submissions.status to 'rejected', set status_reason
    // Log in tool_promotion_logs
  },

  // List tool submissions for moderation
  async listPendingToolSubmissions() {
    // TODO: Fetch all tool_submissions with status 'pending'
  }
};
