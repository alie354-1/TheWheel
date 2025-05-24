import {
  getPriorityTasks,
  getAllDomains,
  getDomainById,
  getDomainStatistics,
  createDomain,
  updateDomain,
  deleteDomain,
  getDomainStepTree,
  getTaskDependencies,
  getTaskBlockers,
  createDomainStep,
  updateDomainStep,
  deleteDomainStep,
  assignTaskToUser,
  getTaskComments,
  addTaskComment,
  unlockTaskPriority,
  lockTaskPriority,
  trackDecisionEvent,
  supabaseClient
} from "./domain.service";

describe("domainService", () => {
  it("should fetch priority tasks for a domain", async () => {
    // Mock supabase.rpc
    const mockRpc = jest.fn().mockResolvedValue({ data: [{ id: "1", name: "Test Task", status: "in_progress" }], error: null });
    (supabaseClient as any).rpc = mockRpc;

    const result = await getPriorityTasks("domain-1", "company-1", 3);
    expect(mockRpc).toHaveBeenCalledWith("get_priority_tasks", { p_domain_id: "domain-1", p_limit: 3 });
    expect(result).toEqual([{ id: "1", name: "Test Task", status: "in_progress" }]);
  });
});
