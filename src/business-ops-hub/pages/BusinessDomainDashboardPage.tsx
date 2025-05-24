import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * BusinessDomainDashboardPage
 * - Displays all business domains as cards with status visualization.
 * - Phase 2: Core Interface Development (step 1)
 */

type BusinessDomain = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  order_index?: number;
};

const BusinessDomainDashboardPage: React.FC = () => {
  const [domains, setDomains] = useState<BusinessDomain[]>([]);
  const [domainStats, setDomainStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [priorityTasks, setPriorityTasks] = useState<Record<string, any[]>>({});

  // TODO: Replace with actual company_id from context/auth
  const companyId = "demo-company-id";

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase
        .from("business_domains")
        .select("*")
        .order("order_index", { ascending: true }),
      supabase
        .from("domain_step_statistics")
        .select("*")
        .eq("company_id", companyId),
    ])
      .then(async ([domainRes, statsRes]) => {
        setDomains(domainRes.data || []);
        const statsMap: Record<string, any> = {};
        (statsRes.data || []).forEach((stat: any) => {
          statsMap[stat.domain_id] = stat;
        });
        setDomainStats(statsMap);

        // Fetch top priority tasks for each domain
        const { domainJourneyAdapter } = await import("../services/domainJourneyAdapter.service");
        const tasksMap: Record<string, any[]> = {};
        await Promise.all(
          (domainRes.data || []).map(async (domain: any) => {
            const steps = await domainJourneyAdapter.getStepsForDomain(domain.id);
            // Filter for incomplete steps, sort by relevance/priority, take top 3
            const topTasks = (steps || [])
              .filter((s: any) => !s.step?.status || s.step.status !== "completed")
              .sort((a: any, b: any) => (b.relevance_score || 0) - (a.relevance_score || 0))
              .slice(0, 3)
              .map((s: any) => s.step);
            tasksMap[domain.id] = topTasks;
          })
        );
        setPriorityTasks(tasksMap);
      })
      .finally(() => setLoading(false));
  }, [companyId]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Business Domain Dashboard</h1>
      {loading ? (
        <div className="text-gray-500">Loading domains...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {domains.map((domain) => {
            const stat = domainStats[domain.id];
            const percent = stat ? stat.completion_percentage : 0;
            return (
              <div
                key={domain.id}
                className="rounded-lg shadow bg-white p-5 flex flex-col items-center border"
                style={{ borderColor: domain.color || "#e5e7eb" }}
              >
                <div
                  className="w-14 h-14 flex items-center justify-center rounded-full mb-3"
                  style={{
                    background: domain.color || "#f3f4f6",
                    color: "#fff",
                    fontSize: "2rem",
                  }}
                >
                  {domain.icon ? (
                    <span>{domain.icon}</span>
                  ) : (
                    <span role="img" aria-label="Domain">
                      🏢
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-1">{domain.name}</h2>
                <p className="text-gray-600 text-sm mb-2 text-center">{domain.description}</p>
                {/* Status visualization */}
                <div className="w-full mt-2">
                  <div className="h-2 rounded bg-gray-200">
                    <div
                      className="h-2 rounded"
                      style={{
                        width: `${percent}%`,
                        background: domain.color || "#3b82f6",
                        transition: "width 0.3s",
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    {percent}% Complete
                  </div>
                </div>
                {/* Top priority tasks */}
                <div className="mt-3 w-full">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Top Priority Tasks</div>
                  <ul className="text-xs text-gray-600 list-disc pl-4">
                    {(priorityTasks[domain.id] || []).length === 0 ? (
                      <li className="text-gray-400 italic">No outstanding tasks</li>
                    ) : (
                      priorityTasks[domain.id].map((task, idx) => (
                        <li key={task?.id || idx}>
                          {task?.name || "Untitled Task"}
                          {task?.status && (
                            <span className="ml-2 text-xs text-blue-500">[{task.status}]</span>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BusinessDomainDashboardPage;
