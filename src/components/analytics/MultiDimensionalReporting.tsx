import React, { useState, useEffect } from "react";
import { fetchAnalyticsAggregates, AnalyticsAggregate } from "@/lib/services/analytics.service";
import { exportToCSV } from "./exportUtils";

/**
 * MultiDimensionalReporting
 * 
 * Displays multi-dimensional analytics and reporting for business operations, including:
 * - Cross-domain metrics
 * - Comparative analysis (teams, time periods, domains)
 * - Customizable report dimensions and filters
 * - Scheduled report configuration
 * 
 * Follows BOH UX: progressive disclosure, accessibility, responsive design.
 */
const teams = ["All Teams", "Team Alpha", "Team Beta"];
const domains = ["All Domains", "Marketing", "Sales", "Product", "Finance"];
const timePeriods = ["Last 7 days", "Last 30 days", "This Quarter", "Custom"];
const frequencies = ["None", "Daily", "Weekly", "Monthly"];

const MultiDimensionalReporting: React.FC = () => {
  // State for comparison controls
  const [selectedTeam, setSelectedTeam] = useState(teams[0]);
  const [selectedDomain, setSelectedDomain] = useState(domains[0]);
  const [selectedTime, setSelectedTime] = useState(timePeriods[0]);

  // State for scheduling
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [frequency, setFrequency] = useState(frequencies[0]);
  const [recipients, setRecipients] = useState("");

  // Report data
  const [reportGenerated, setReportGenerated] = useState(false);
  const [comparativeData, setComparativeData] = useState<AnalyticsAggregate[]>([]);
  const [loading, setLoading] = useState(false);

  // Simulate companyId for demo
  const companyId = "demo-company-id";

  // Fetch comparative data when report is generated
  useEffect(() => {
    if (!reportGenerated) {
      setComparativeData([]);
      return;
    }
    setLoading(true);
    // For demo, just fetch all aggregates and filter client-side
    fetchAnalyticsAggregates(companyId)
      .then((data) => {
        // Filter by selected dimensions (in real implementation, use server-side filters)
        const filtered = (data || []).filter(agg => {
          // Simulate dimension matching
          const teamMatch = selectedTeam === "All Teams" || agg.dimensions?.team === selectedTeam;
          const domainMatch = selectedDomain === "All Domains" || agg.dimensions?.domain === selectedDomain;
          // Time period filtering would require date logic; skip for demo
          return teamMatch && domainMatch;
        });
        setComparativeData(filtered);
      })
      .finally(() => setLoading(false));
  }, [reportGenerated, selectedTeam, selectedDomain, selectedTime, companyId]);

  return (
    <section
      aria-labelledby="multi-dimensional-reporting-title"
      className="bg-white rounded-lg shadow p-6 mb-6"
      style={{ minHeight: 320 }}
    >
      <h2 id="multi-dimensional-reporting-title" className="text-xl font-semibold mb-4">
        Multi-Dimensional Reporting
      </h2>
      <form
        className="flex flex-col gap-4 mb-4"
        onSubmit={e => {
          e.preventDefault();
          setReportGenerated(true);
        }}
      >
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Team</label>
            <select
              className="select select-bordered"
              value={selectedTeam}
              onChange={e => setSelectedTeam(e.target.value)}
            >
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Domain</label>
            <select
              className="select select-bordered"
              value={selectedDomain}
              onChange={e => setSelectedDomain(e.target.value)}
            >
              {domains.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time Period</label>
            <select
              className="select select-bordered"
              value={selectedTime}
              onChange={e => setSelectedTime(e.target.value)}
            >
              {timePeriods.map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <button type="submit" className="btn btn-primary">
            Generate Report
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setReportGenerated(false)}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Scheduling Controls */}
      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="checkbox"
            checked={scheduleEnabled}
            onChange={e => setScheduleEnabled(e.target.checked)}
          />
          <span className="text-sm font-medium">Schedule this report</span>
        </label>
        {scheduleEnabled && (
          <div className="flex flex-wrap gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium mb-1">Frequency</label>
              <select
                className="select select-bordered"
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
              >
                {frequencies.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Recipients (comma-separated emails)</label>
              <input
                type="text"
                className="input input-bordered"
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
          </div>
        )}
      </div>

      {/* Report Output */}
      <div className="mt-6">
        {reportGenerated ? (
          <div className="bg-gray-50 border rounded p-4">
            <h3 className="font-semibold mb-2">Report Results</h3>
            <div className="text-sm text-gray-600 mb-2">
              <strong>Team:</strong> {selectedTeam} &nbsp;|&nbsp;
              <strong>Domain:</strong> {selectedDomain} &nbsp;|&nbsp;
              <strong>Time Period:</strong> {selectedTime}
            </div>
            {loading ? (
              <div className="text-gray-400 text-xs mb-2">Loading comparative data...</div>
            ) : comparativeData.length > 0 ? (
              <table className="table table-sm w-full mb-2">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>Dimensions</th>
                    <th>Calculated At</th>
                  </tr>
                </thead>
                <tbody>
                  {comparativeData.map((agg, idx) => (
                    <tr key={agg.id || idx}>
                      <td>{agg.metric_name}</td>
                      <td>{typeof agg.value === "object" ? JSON.stringify(agg.value) : String(agg.value)}</td>
                      <td>
                        {Object.entries(agg.dimensions || {})
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")}
                      </td>
                      <td>{agg.calculated_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-400 text-xs mb-2">No comparative data found for the selected criteria.</div>
            )}
            <div className="flex gap-2 mt-2">
              <button
                className="btn btn-sm btn-outline"
                type="button"
                onClick={() =>
                  exportToCSV(
                    comparativeData.map(row => ({
                      metric: row.metric_name,
                      value: typeof row.value === "object" ? JSON.stringify(row.value) : String(row.value),
                      dimensions: Object.entries(row.dimensions || {})
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", "),
                      calculated_at: row.calculated_at,
                    })),
                    `report_${selectedTeam}_${selectedDomain}_${selectedTime}.csv`
                  )
                }
              >
                Export CSV
              </button>
              <button className="btn btn-sm btn-outline" type="button">Export Excel</button>
              <button className="btn btn-sm btn-outline" type="button">Export PDF</button>
            </div>
            {scheduleEnabled && (
              <div className="mt-2 text-xs text-blue-600">
                This report is scheduled for <strong>{frequency}</strong> delivery to: {recipients || "N/A"}
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            Select dimensions, filters, and metrics to generate custom reports and comparative analytics.
          </div>
        )}
      </div>
    </section>
  );
};

export default MultiDimensionalReporting;
