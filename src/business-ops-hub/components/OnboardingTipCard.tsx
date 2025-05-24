import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, IconButton, Box, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LightbulbIcon from "@mui/icons-material/Lightbulb";

const TIP_KEY = "boh_onboarding_tip_dismissed";

export const OnboardingTipCard: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(TIP_KEY) === "1");
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(TIP_KEY, "1");
  };

  if (dismissed) return null;

  return (
    <Card
      sx={{
        mb: 3,
        background: "#fffde7",
        borderLeft: "6px solid #ffd600",
        boxShadow: 1,
        position: "relative",
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center" }}>
        <LightbulbIcon sx={{ color: "#ffd600", fontSize: 32, mr: 2 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Welcome to the Business Operations Hub!
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Start by creating or customizing your business domains. Drag and drop to reorder, archive domains you don't need, and use the quick actions to manage your top priority tasks.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            Need help? Check out the <a href="/docs/BUSINESS_OPERATIONS_HUB_USER_EXPERIENCE.md" target="_blank" rel="noopener noreferrer">user guide</a>.
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleDismiss}
          aria-label="Dismiss tip"
          sx={{ ml: 2 }}
        >
          <CloseIcon />
        </IconButton>
      </CardContent>
    </Card>
  );
};

export default OnboardingTipCard;
