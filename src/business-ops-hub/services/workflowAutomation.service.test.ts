import workflowAutomationService, { WorkflowAutomation } from "./workflowAutomation.service";

describe("workflowAutomationService", () => {
  const companyId = "test-company-id";
  const domainId = "test-domain-id";

  let createdId: string | undefined;

  it("should create a new automation", async () => {
    const automation: Omit<WorkflowAutomation, "id" | "created_at"> = {
      company_id: companyId,
      domain_id: domainId,
      trigger_type: "status_change",
      trigger_config: { from: "in_progress", to: "completed" },
      action_type: "notify",
      action_config: { message: "Task completed!" },
      is_active: true,
    };
    const result = await workflowAutomationService.createAutomation(automation);
    expect(result).toHaveProperty("id");
    expect(result.company_id).toBe(companyId);
    createdId = result.id;
  });

  it("should list automations for a company", async () => {
    const automations = await workflowAutomationService.listAutomations(companyId);
    expect(Array.isArray(automations)).toBe(true);
    expect(automations.some(a => a.company_id === companyId)).toBe(true);
  });

  it("should update an automation", async () => {
    if (!createdId) return;
    const updated = await workflowAutomationService.updateAutomation(createdId, { is_active: false });
    expect(updated.is_active).toBe(false);
  });

  it("should delete an automation", async () => {
    if (!createdId) return;
    await expect(workflowAutomationService.deleteAutomation(createdId)).resolves.toBeUndefined();
  });
});
