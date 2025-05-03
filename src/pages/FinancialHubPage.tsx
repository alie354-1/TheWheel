import React, { useEffect, useState } from "react";
import { financialHubService } from "../lib/services/financialHub.service";
import { financialAnalyticsService } from "../lib/services/financialAnalytics.service";
import { appSettingsService } from "../lib/services/appSettings.service";

// Assume companyId is available via props, context, or authentication
const companyId = "REPLACE_WITH_COMPANY_ID";

function RunwayCalculator({ budget }: { budget: any[] }) {
  const totalMonthly = budget
    .filter(line => line.period === "monthly")
    .reduce((sum, line) => sum + parseFloat(line.amount || 0), 0);
  const cash = 100000; // Placeholder: get from company financials
  const runway = totalMonthly > 0 ? (cash / totalMonthly).toFixed(1) : "∞";
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold">Runway Calculator</h3>
      <div>Monthly Burn: ${totalMonthly.toLocaleString()}</div>
      <div>Cash on Hand: ${cash.toLocaleString()}</div>
      <div>Runway: {runway} months</div>
    </div>
  );
}

function BreakEvenCalculator({ budget }: { budget: any[] }) {
  const monthlyRevenue = 20000; // Placeholder
  const totalMonthly = budget
    .filter(line => line.period === "monthly")
    .reduce((sum, line) => sum + parseFloat(line.amount || 0), 0);
  const breakEven = totalMonthly > 0 ? (totalMonthly / monthlyRevenue).toFixed(2) : "0";
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold">Break-Even Calculator</h3>
      <div>Monthly Revenue: ${monthlyRevenue.toLocaleString()}</div>
      <div>Monthly Costs: ${totalMonthly.toLocaleString()}</div>
      <div>Break-Even: {breakEven} months</div>
    </div>
  );
}

function FinancialHubPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [companyBudget, setCompanyBudget] = useState<any[]>([]);
  const [loadingBudget, setLoadingBudget] = useState(true);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [budgetStats, setBudgetStats] = useState<any | null>(null);
  const [benchmarkMinCount, setBenchmarkMinCount] = useState<number>(5);

  useEffect(() => {
    fetchTemplates();
    fetchCompanyBudget();
    fetchBenchmarks();
    fetchBudgetStats();
    fetchBenchmarkMinCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTemplates() {
    const data = await financialHubService.getBudgetTemplates();
    setTemplates(data || []);
  }

  async function fetchCompanyBudget() {
    setLoadingBudget(true);
    const data = await financialHubService.getCompanyBudget(companyId);
    setCompanyBudget(data || []);
    setLoadingBudget(false);
  }

  async function fetchBenchmarks() {
    const data = await financialAnalyticsService.getCategoryBenchmarks();
    setBenchmarks(data || []);
  }

  async function fetchBudgetStats() {
    const data = await financialAnalyticsService.getCompanyBudgetStats(companyId);
    setBudgetStats(data || null);
  }

  async function fetchBenchmarkMinCount() {
    const setting = await appSettingsService.getAppSetting("benchmark_min_count");
    setBenchmarkMinCount(setting ? parseInt(setting.value, 10) : 5);
  }

  function renderAnalytics() {
    const totalBudget = companyBudget.reduce((sum, line) => sum + parseFloat(line.amount || 0), 0);
    return (
      <div>
        <div className="mb-2">Total Budget: ${totalBudget.toLocaleString()}</div>
        {budgetStats && (
          <div className="mb-2">
            <span>Monthly Burn: ${parseFloat(budgetStats.monthly_burn || 0).toLocaleString()}</span>
          </div>
        )}
        <div className="mb-2 font-semibold">Category Benchmarks:</div>
        <table className="mb-4">
          <thead>
            <tr>
              <th>Category</th>
              <th>Company</th>
              <th>Peer Avg</th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map(bm => {
              const companyLine = companyBudget.find(line => line.category === bm.category);
              return (
                <tr key={bm.category}>
                  <td>{bm.category}</td>
                  <td>${companyLine ? parseFloat(companyLine.amount || 0).toLocaleString() : "0"}</td>
                  <td>
                    {bm.count >= benchmarkMinCount
                      ? `$${parseFloat(bm.avg_amount || 0).toLocaleString()}`
                      : <span className="text-gray-500">Not enough data available</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mb-2 text-gray-500">[More analytics and peer comparisons coming soon]</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Financial Hub</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Budget Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map(template => (
            <div
              key={template.id}
              className="border rounded p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedTemplate(template)}
            >
              <h3 className="text-lg font-semibold">{template.name}</h3>
              <div className="text-sm text-gray-600">{template.description}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Calculators</h2>
        {loadingBudget ? (
          <span>Loading company budget...</span>
        ) : (
          <>
            <RunwayCalculator budget={companyBudget} />
            <BreakEvenCalculator budget={companyBudget} />
          </>
        )}
        <div className="text-gray-500">[More calculators coming soon]</div>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Analytics & Benchmarks</h2>
        {loadingBudget ? (
          <span>Loading analytics...</span>
        ) : (
          renderAnalytics()
        )}
      </div>
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded shadow-lg max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-2xl"
              onClick={() => setSelectedTemplate(null)}
              title="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2">{selectedTemplate.name}</h2>
            <div className="mb-2">{selectedTemplate.description}</div>
            {/* TODO: Show template categories, preview, and import to company budget */}
            <button className="btn btn-primary mt-4">
              Import to My Company Budget
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialHubPage;
