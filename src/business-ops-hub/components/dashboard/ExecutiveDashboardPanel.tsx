import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, List, ListItem, ListItemText, Chip, Divider } from "@mui/material";
import dashboardAnalyticsService, {
  CompanySummary,
  Recommendation as AnalyticsRecommendation,
  Blocker as AnalyticsBlocker,
  RiskItem
} from "../../services/dashboardAnalytics.service";
import { recommendationService, Recommendation, Blocker } from "../../services/recommendation.service";

interface ExecutiveDashboardPanelProps {
  companyId: string;
}

const ExecutiveDashboardPanel: React.FC<ExecutiveDashboardPanelProps> = ({ companyId }) => {
  const [summary, setSummary] = useState<CompanySummary | null>(null);
  const [analyticsRecommendations, setAnalyticsRecommendations] = useState<AnalyticsRecommendation[]>([]);
  const [analyticsBlockers, setAnalyticsBlockers] = useState<AnalyticsBlocker[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New: Recommendations and blockers from recommendationService
  const [companyRecommendations, setCompanyRecommendations] = useState<Recommendation[]>([]);
  const [crossDomainBlockers, setCrossDomainBlockers] = useState<Blocker[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      dashboardAnalyticsService.getCompanySummary(companyId),
      dashboardAnalyticsService.getCompanyRecommendations(companyId),
      dashboardAnalyticsService.getCompanyBlockers(companyId),
      dashboardAnalyticsService.getCompanyRisks(companyId),
      recommendationService.getCompanyWideRecommendations(),
      recommendationService.getCrossDomainBlockers()
    ]).then(([summary, recs, blockers, risks, recServiceRecs, recServiceBlockers]) => {
      if (mounted) {
        setSummary(summary);
        setAnalyticsRecommendations(recs);
        setAnalyticsBlockers(blockers);
        setRisks(risks);
        setCompanyRecommendations(recServiceRecs);
        setCrossDomainBlockers(recServiceBlockers);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [companyId]);

  if (loading || !summary) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Executive Dashboard
        </Typography>
        <Typography>Loading company intelligence...</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Executive Dashboard
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Macro Progress Summary */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item>
          <Chip label={`Completed: ${summary.completed}`} color="success" />
        </Grid>
        <Grid item>
          <Chip label={`At Risk: ${summary.atRisk}`} color="warning" />
        </Grid>
        <Grid item>
          <Chip label={`Blocked: ${summary.blocked}`} color="error" />
        </Grid>
        <Grid item>
          <Chip label={`Urgent: ${summary.urgent}`} color="secondary" />
        </Grid>
      </Grid>

      {/* Company-wide Recommendations (from recommendationService) */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Company-wide Recommendations
        </Typography>
        <List dense>
          {companyRecommendations.map((rec) => (
            <ListItem key={rec.id}>
              <ListItemText
                primary={rec.title}
                secondary={rec.explanation}
                secondaryTypographyProps={{ color: "info.main" }}
              />
            </ListItem>
          ))}
          {/* Fallback: analytics recommendations */}
          {companyRecommendations.length === 0 &&
            analyticsRecommendations.map((rec, idx) => (
              <ListItem key={idx}>
                <ListItemText primary={rec.message} />
              </ListItem>
            ))}
        </List>
      </Box>

      {/* Cross-Domain Blockers (from recommendationService) */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Cross-Domain Blockers
        </Typography>
        <List dense>
          {crossDomainBlockers.map((b) => (
            <ListItem key={b.id}>
              <ListItemText
                primary={b.description}
                secondary={b.resolutionSteps.join(" → ")}
                secondaryTypographyProps={{ color: "error" }}
              />
            </ListItem>
          ))}
          {/* Fallback: analytics blockers */}
          {crossDomainBlockers.length === 0 &&
            analyticsBlockers.map((b, idx) => (
              <ListItem key={idx}>
                <ListItemText
                  primary={b.item}
                  secondary={b.reason}
                  secondaryTypographyProps={{ color: "error" }}
                />
              </ListItem>
            ))}
        </List>
      </Box>

      {/* Adaptive Guidance: Skipped/Risky Items */}
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Skipped or Risky Items
        </Typography>
        <List dense>
          {risks.map((r, idx) => (
            <ListItem key={idx}>
              <ListItemText
                primary={r.item}
                secondary={r.reason}
                secondaryTypographyProps={{ color: "warning.main" }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default ExecutiveDashboardPanel;
