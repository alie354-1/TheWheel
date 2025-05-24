import { supabase } from "@/lib/supabase";

/**
 * Get recommended steps for a company/domain based on community data.
 * Suggests steps that are frequently added by other companies to the same domain,
 * but not yet present in the current company's domain.
 *
 * @param companyId - The current company
 * @param domainId - The domain to suggest steps for
 * @param limit - Max number of suggestions
 */
export async function getStepSuggestionsForDomain(
  companyId: string,
  domainId: string,
  limit: number = 5
): Promise<{ step_id: string; count: number }[]> {
  // 1. Find steps most frequently added to this domain by other companies
  // 2. Exclude steps already present in this company's domain

  // Get step_ids already present in this company's domain
  const { data: existing, error: existingError } = await supabase
    .from("domain_steps")
    .select("step_id")
    .eq("domain_id", domainId)
    .eq("company_id", companyId);

  if (existingError) {
    console.error("Failed to fetch existing steps for company/domain:", existingError);
    return [];
  }
  const existingStepIds = (existing || []).map((row: any) => row.step_id);

  // Fetch all 'add' logs for this domain by other companies, excluding steps already present
  let logs, error;
  if (existingStepIds.length > 0) {
    ({ data: logs, error } = await supabase
      .from("domain_step_logs")
      .select("step_id")
      .eq("domain_id", domainId)
      .neq("company_id", companyId)
      .eq("action", "add")
      .not("step_id", "in", `(${existingStepIds.map((id) => `'${id}'`).join(",")})`)
    );
  } else {
    ({ data: logs, error } = await supabase
      .from("domain_step_logs")
      .select("step_id")
      .eq("domain_id", domainId)
      .neq("company_id", companyId)
      .eq("action", "add")
    );
  }

  if (error) {
    console.error("Failed to fetch step suggestions:", error);
    return [];
  }

  // Aggregate counts in JS
  const countMap: Record<string, number> = {};
  (logs || []).forEach((row: any) => {
    if (!row.step_id) return;
    countMap[row.step_id] = (countMap[row.step_id] || 0) + 1;
  });

  // Sort by count descending and return top N
  return Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([step_id, count]) => ({ step_id, count }));
}
