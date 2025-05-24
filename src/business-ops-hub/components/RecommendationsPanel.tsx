import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, CircularProgress, Alert } from "@mui/material";

interface Recommendation {
  id?: string;
  title: string;
  description?: string;
  type?: string;
  [key: string]: any;
}

interface RecommendationsPanelProps {
  companyId: string;
  userId?: string;
  context?: any;
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ companyId, userId, context }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);

  const [crossDomainBlockers, setCrossDomainBlockers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/business-ops-hub/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId, userId, context }),
        });
        if (!res.ok) throw new Error("Failed to fetch recommendations");
        const data = await res.json();
        setRecommendations(data.recommendations || []);
        setCrossDomainBlockers(data.crossDomainBlockers || []);
      } catch (err: any) {
        setError(err.message || "Error fetching recommendations");
      }
      setLoading(false);
    }
    if (companyId) fetchRecommendations();
  }, [companyId, userId, context]);

  const handleAccept = async (recId: string) => {
    setAccepted((prev) => [...prev, recId]);
    // Send feedback to backend
    try {
      await fetch("/api/business-ops-hub/recommendation-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || "anonymous",
          companyId,
          recommendationId: recId,
          action: "accept"
        }),
      });
    } catch (e) {
      // Ignore errors for now
    }
    // Log decision event
    try {
      const rec = recommendations.find(r => (r.id || recommendations.indexOf(r).toString()) === recId);
      await fetch("/api/business-ops-hub/decision-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          user_id: userId,
          event_type: "recommendation_accepted",
          context: { recommendation_id: recId },
          data: rec,
        }),
      });
    } catch (e) {
      // Ignore logging errors for now
    }
  };

  const handleReject = async (recId: string) => {
    setRejected((prev) => [...prev, recId]);
    // Send feedback to backend
    try {
      await fetch("/api/business-ops-hub/recommendation-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || "anonymous",
          companyId,
          recommendationId: recId,
          action: "reject"
        }),
      });
    } catch (e) {
      // Ignore errors for now
    }
    // Log decision event
    try {
      const rec = recommendations.find(r => (r.id || recommendations.indexOf(r).toString()) === recId);
      await fetch("/api/business-ops-hub/decision-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          user_id: userId,
          event_type: "recommendation_rejected",
          context: { recommendation_id: recId },
          data: rec,
        }),
      });
    } catch (e) {
      // Ignore logging errors for now
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <CircularProgress size={24} />
          <Typography>Loading recommendations...</Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if ((!recommendations || recommendations.length === 0) && (!crossDomainBlockers || crossDomainBlockers.length === 0)) {
    return null;
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        AI Recommendations
      </Typography>
      {/* Cross-Domain Blockers */}
      {crossDomainBlockers && crossDomainBlockers.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="error" gutterBottom>
            Cross-Domain Blockers
          </Typography>
          {crossDomainBlockers.map((blocker, idx) => (
            <Box key={blocker.id || idx} sx={{ mb: 2, p: 2, border: "1px solid #f44336", borderRadius: 2, background: "#fff5f5" }}>
              <Typography variant="body1" color="error" sx={{ fontWeight: 600 }}>
                {blocker.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Domains involved: {blocker.domains && blocker.domains.join(", ")}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Resolution Steps:</strong>
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {blocker.resolutionSteps && blocker.resolutionSteps.map((step: string, i: number) => (
                  <li key={i}>
                    <Typography variant="body2" color="text.secondary">
                      {step}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Box>
          ))}
        </Box>
      )}
      {/* Standard Recommendations */}
      {recommendations.map((rec, idx) => {
        const recId = rec.id || idx.toString();
        if (accepted.includes(recId) || rejected.includes(recId)) return null;
        return (
          <Box key={recId} sx={{ mb: 2, p: 2, border: "1px solid #eee", borderRadius: 2 }}>
            <Typography variant="subtitle1">{rec.title}</Typography>
            {rec.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {rec.description}
              </Typography>
            )}
            {/* Explanation UI */}
            {rec.explanation && (
              <Box sx={{ mb: 1 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" color="text.secondary">
                    Why this recommendation?
                  </Typography>
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                    Confidence: {rec.explanation.confidence_score}%
                  </Typography>
                </Box>
                <details>
                  <summary style={{ cursor: "pointer", color: "#1976d2" }}>
                    View explanation
                  </summary>
                  <Box sx={{ pl: 2, pt: 0.5 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Key factors:</strong>
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {rec.explanation.key_factors.map((factor: string, i: number) => (
                        <li key={i}>
                          <Typography variant="body2" color="text.secondary">
                            {factor}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Reasoning:</strong>
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {rec.explanation.reasoning.map((reason: string, i: number) => (
                        <li key={i}>
                          <Typography variant="body2" color="text.secondary">
                            {reason}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                    {/* Feedback on explanation */}
                    <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Was this explanation helpful?
                      </Typography>
                      <Button
                        size="small"
                        onClick={async () => {
                          await fetch("/api/business-ops-hub/recommendation-feedback", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              userId: userId || "anonymous",
                              companyId,
                              recommendationId: recId,
                              action: "explanation_thumbs_up"
                            }),
                          });
                        }}
                        aria-label="Thumbs up"
                      >
                        👍
                      </Button>
                      <Button
                        size="small"
                        onClick={async () => {
                          await fetch("/api/business-ops-hub/recommendation-feedback", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              userId: userId || "anonymous",
                              companyId,
                              recommendationId: recId,
                              action: "explanation_thumbs_down"
                            }),
                          });
                        }}
                        aria-label="Thumbs down"
                      >
                        👎
                      </Button>
                    </Box>
                  </Box>
                </details>
              </Box>
            )}
            <Box display="flex" gap={1} alignItems="center" sx={{ mb: 1 }}>
              <Button size="small" variant="contained" color="primary" onClick={() => handleAccept(recId)}>
                Accept
              </Button>
              <Button size="small" variant="outlined" color="secondary" onClick={() => handleReject(recId)}>
                Reject
              </Button>
              {/* TODO: Add "Customize" button/logic if needed */}
            </Box>
            {/* Micro-feedback: thumbs up/down */}
            <Box display="flex" gap={1} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Was this recommendation helpful?
              </Typography>
              <Button
                size="small"
                onClick={async () => {
                  await fetch("/api/business-ops-hub/recommendation-feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      userId: userId || "anonymous",
                      companyId,
                      recommendationId: recId,
                      action: "thumbs_up"
                    }),
                  });
                }}
                aria-label="Thumbs up"
              >
                👍
              </Button>
              <Button
                size="small"
                onClick={async () => {
                  await fetch("/api/business-ops-hub/recommendation-feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      userId: userId || "anonymous",
                      companyId,
                      recommendationId: recId,
                      action: "thumbs_down"
                    }),
                  });
                }}
                aria-label="Thumbs down"
              >
                👎
              </Button>
            </Box>
          </Box>
        );
      })}
    </Paper>
  );
};

export default RecommendationsPanel;
