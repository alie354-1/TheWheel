import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Stack,
  Skeleton,
} from "@mui/material";
import { BusinessDomain } from "../types/domain.types";
import { DomainSummary } from "../types/domain-extended.types";
import DomainTaskPreview from "./DomainTaskPreview";

export interface DomainCardProps {
  domain: BusinessDomain;
  summary?: DomainSummary;
  isLoading?: boolean;
  onClick: () => void;
  active?: boolean;
  companyId?: string;
}

/**
 * Compute a health color for the domain based on completion and status.
 * Green: >80% complete, Yellow: 40-80%, Red: <40% or many skipped/cancelled.
 */
function getDomainHealthColor(summary?: DomainSummary): "success.main" | "warning.main" | "error.main" | "grey.400" {
  if (!summary) return "grey.400";
  if (summary.completionPercentage >= 80 && summary.skippedSteps + summary.cancelledSteps < 2) return "success.main";
  if (summary.completionPercentage >= 40) return "warning.main";
  return "error.main";
}

/**
 * Component to display a business domain card
 * Shows domain info and statistics with progress indicators and health
 */
const DomainCard: React.FC<DomainCardProps> = ({
  domain,
  summary,
  isLoading = false,
  onClick,
  active = false,
  companyId,
}) => {
  const healthColor = getDomainHealthColor(summary);

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderColor: active ? "primary.main" : "divider",
        boxShadow: active ? 3 : 1,
        position: "relative",
      }}
    >
      {/* Health indicator dot */}
      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 14,
          height: 14,
          borderRadius: "50%",
          bgcolor: healthColor,
          border: "2px solid white",
          zIndex: 2,
        }}
        title={
          healthColor === "success.main"
            ? "Healthy"
            : healthColor === "warning.main"
            ? "Attention needed"
            : healthColor === "error.main"
            ? "At risk"
            : "Unknown"
        }
      />
      <CardActionArea
        onClick={onClick}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
        }}
      >
        <CardContent sx={{ width: "100%", p: 2, pb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            {domain.icon && (
              <Box
                component="div"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: domain.color || "primary.main",
                  color: "white",
                  mr: 2,
                  fontSize: 24,
                }}
              >
                {domain.icon}
              </Box>
            )}
            <Typography variant="h6" component="div">
              {domain.name}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              height: 60,
            }}
          >
            {domain.description}
          </Typography>

          {isLoading ? (
            <Box sx={{ width: "100%", mt: 2 }}>
              <Skeleton variant="rectangular" width="100%" height={16} sx={{ mb: 1, borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="60%" height={24} sx={{ mb: 1, borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="80%" height={32} sx={{ borderRadius: 1 }} />
            </Box>
          ) : summary ? (
            <>
              <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Completion
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {summary.completionPercentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={summary.completionPercentage}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  mb: 2,
                  bgcolor: "grey.200",
                  "& .MuiLinearProgress-bar": { bgcolor: healthColor },
                }}
              />

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                <Chip
                  size="small"
                  label={`${summary.completedSteps} completed`}
                  color="success"
                  variant="outlined"
                />
                {summary.inProgressSteps > 0 && (
                  <Chip
                    size="small"
                    label={`${summary.inProgressSteps} in progress`}
                    color="info"
                    variant="outlined"
                  />
                )}
                {summary.notStartedSteps > 0 && (
                  <Chip
                    size="small"
                    label={`${summary.notStartedSteps} not started`}
                    color="default"
                    variant="outlined"
                  />
                )}
                {summary.skippedSteps > 0 && (
                  <Chip
                    size="small"
                    label={`${summary.skippedSteps} skipped`}
                    color="warning"
                    variant="outlined"
                  />
                )}
                {summary.pausedSteps > 0 && (
                  <Chip
                    size="small"
                    label={`${summary.pausedSteps} paused`}
                    color="warning"
                    variant="outlined"
                  />
                )}
                {summary.cancelledSteps > 0 && (
                  <Chip
                    size="small"
                    label={`${summary.cancelledSteps} cancelled`}
                    color="error"
                    variant="outlined"
                  />
                )}
                {summary.totalSteps > 0 && (
                  <Chip
                    size="small"
                    label={`${summary.totalSteps} total`}
                    color="default"
                    variant="outlined"
                  />
                )}
              </Stack>
              {/* Priority Task Preview */}
              {companyId && (
                <DomainTaskPreview domainId={domain.id} companyId={companyId} />
              )}
            </>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: "italic" }}>
              No statistics available
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DomainCard;
