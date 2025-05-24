import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, List, ListItem, ListItemText } from "@mui/material";

interface ToolValueDashboardProps {
  toolId?: string;
  companyId?: string;
}

const ToolValueDashboard: React.FC<ToolValueDashboardProps> = ({ toolId, companyId }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!toolId || !companyId) {
      setAnalytics(null);
      return;
    }
    setLoading(true);
    fetch(`/api/business-ops-hub/tool-analytics?companyId=${encodeURIComponent(companyId)}&toolId=${encodeURIComponent(toolId)}`)
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [toolId, companyId]);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Tool Value Dashboard
      </Typography>
      {!toolId ? (
        <Typography variant="body2" color="text.secondary">
          Select a tool to view value analytics.
        </Typography>
      ) : loading ? (
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Loading analytics...
          </Typography>
        </Box>
      ) : !analytics ? (
        <Typography variant="body2" color="text.secondary">
          No analytics data found for this tool.
        </Typography>
      ) : (
        <Box>
          <Typography variant="subtitle1" sx={{ mt: 1 }}>Usage</Typography>
          <List dense>
            <ListItem>
              <ListItemText primary={`Active Users: ${analytics.usage.activeUsers}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Sessions (30d): ${analytics.usage.sessionsLast30Days}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Avg. Session Duration: ${analytics.usage.avgSessionDurationMin} min`} />
            </ListItem>
          </List>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>ROI</Typography>
          <List dense>
            <ListItem>
              <ListItemText primary={`Estimated Savings: $${analytics.roi.estimatedSavingsUSD}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Time Saved: ${analytics.roi.timeSavedHours} hours`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Payback Period: ${analytics.roi.paybackPeriodMonths} months`} />
            </ListItem>
          </List>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Impact</Typography>
          <List dense>
            {analytics.impact.kpiImprovements.map((kpi: any, idx: number) => (
              <ListItem key={idx}>
                <ListItemText
                  primary={`${kpi.kpi}: ${kpi.before} → ${kpi.after}`}
                />
              </ListItem>
            ))}
            <ListItem>
              <ListItemText primary={`User Satisfaction: ${analytics.impact.userSatisfaction} / 5`} />
            </ListItem>
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default ToolValueDashboard;
