import React, { useEffect, useState } from "react";
import { fetchAnalyticsAggregates, AnalyticsAggregate } from "@/lib/services/analytics.service";

/**
 * PredictiveInsightsPanel
 * 
 * Displays predictive analytics for business operations, including:
 * - Completion forecasting
 * - Bottleneck prediction
 * - Tool adoption projections
 * - Team velocity
 * 
 * Follows BOH UX: progressive disclosure, accessibility, responsive design.
 */
interface PredictiveInsightsPanelProps {
  companyId?: string;
}

const PredictiveInsightsPanel: React.FC<PredictiveInsightsPanelProps> = ({ companyId }) => {
  const [aggregates, setAggregates] = useState<AnalyticsAggregate[]>([]);
  const [loading, setLoading] = useState(true);

  // For demo, use a placeholder companyId if not provided
  const effectiveCompanyId = companyId || "demo-company-id";

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchAnalyticsAggregates(effectiveCompanyId)
      .then((data) => {
        if (mounted) setAggregates(data || []);
      })
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [effectiveCompanyId]);

  // Helper to get metric value by name
  const getMetric = (name: string) => {
    const agg = aggregates.find(a => a.metric_name === name);
    return agg?.value?.value || agg?.value || "N/A";
  };

  return (
    <section
      aria-labelledby="predictive-insights-title"
      className="bg-white rounded-lg shadow p-6 mb-6"
      style={{ minHeight: 240 }}
    >
      <h2 id="predictive-insights-title" className="text-xl font-semibold mb-4">
        Predictive Insights
      </h2>
      {loading ? (
        <div className="text-gray-400 text-sm">Loading predictive analytics...</div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Completion Forecasting */}
          <div>
            <h3 className="font-medium text-gray-700">Completion Forecast</h3>
            <div className="text-gray-500 text-sm">
              Projected completion date:{" "}
              <span className="font-semibold">{getMetric("completion_forecast")}</span>
            </div>
          </div>
          {/* Bottleneck Prediction */}
          <div>
            <h3 className="font-medium text-gray-700">Bottleneck Prediction</h3>
            <div className="text-gray-500 text-sm">
              Next likely bottleneck:{" "}
              <span className="font-semibold">{getMetric("bottleneck_prediction")}</span>
            </div>
          </div>
          {/* Tool Adoption Projections */}
          <div>
            <h3 className="font-medium text-gray-700">Tool Adoption</h3>
            <div className="text-gray-500 text-sm">
              Adoption rate:{" "}
              <span className="font-semibold">{getMetric("tool_adoption_projection")}</span>
            </div>
          </div>
          {/* Team Velocity */}
          <div>
            <h3 className="font-medium text-gray-700">Team Velocity</h3>
            <div className="text-gray-500 text-sm">
              Current velocity:{" "}
              <span className="font-semibold">{getMetric("team_velocity")}</span>
            </div>
          </div>
        </div>
      )}
      {/* TODO: Add progressive disclosure for detailed insights and visualizations */}
    </section>
  );
};

export default PredictiveInsightsPanel;
