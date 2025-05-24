import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Button, Checkbox, Stepper, Step, StepLabel } from "@mui/material";
/**
 * TODO: Replace this with the actual import and implementation for tool recommendations.
 * The previous import of { recommendationService, ToolRecommendation } was invalid.
 * Define ToolRecommendation type locally for now.
 */
type ToolRecommendation = {
  guideSteps: string[];
};

interface ToolImplementationGuideProps {
  toolId?: string;
}

const ToolImplementationGuide: React.FC<ToolImplementationGuideProps> = ({ toolId }) => {
  const [toolRec, setToolRec] = useState<ToolRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  // TODO: Implement actual recommendation fetching logic using getStepSuggestionsForDomain or similar
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!toolId) {
      setToolRec(null);
      setCompletedSteps([]);
      setActiveStep(0);
      return;
    }
    setLoading(true);
    // TODO: Replace with actual recommendation fetching logic
    // Example: fetch guide steps for the toolId and setToolRec accordingly
    setTimeout(() => {
      // Placeholder: simulate a guide with 3 steps
      if (toolId) {
        setToolRec({
          guideSteps: [
            "Step 1: Prepare your environment.",
            "Step 2: Configure the tool.",
            "Step 3: Validate the implementation."
          ]
        });
        setCompletedSteps([false, false, false]);
        setActiveStep(0);
      } else {
        setToolRec(null);
        setCompletedSteps([]);
        setActiveStep(0);
      }
      setLoading(false);
    }, 500);
  }, [toolId]);

  const handleStepToggle = (idx: number) => {
    setCompletedSteps(prev => {
      const updated = [...prev];
      updated[idx] = !updated[idx];
      return updated;
    });
  };

  const handleNext = () => {
    setActiveStep(prev => Math.min(prev + 1, (toolRec?.guideSteps.length || 1) - 1));
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Tool Implementation Guide
      </Typography>
      {!toolId ? (
        <Typography variant="body2" color="text.secondary">
          Select a tool to view its implementation guide.
        </Typography>
      ) : loading ? (
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Loading guide...
          </Typography>
        </Box>
      ) : !toolRec ? (
        <Typography variant="body2" color="text.secondary">
          No implementation guide found for this tool.
        </Typography>
      ) : (
        <>
          {/* Stepper for walkthrough */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
            {toolRec.guideSteps.map((step, idx) => (
              <Step key={idx} completed={completedSteps[idx]}>
                <StepLabel>{`Step ${idx + 1}`}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">{`Step ${activeStep + 1}:`}</Typography>
            <Typography variant="body1">{toolRec.guideSteps[activeStep]}</Typography>
            <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
              <Checkbox
                checked={completedSteps[activeStep] || false}
                onChange={() => handleStepToggle(activeStep)}
                inputProps={{ "aria-label": "Mark step as complete" }}
              />
              <Typography variant="caption" color="text.secondary">
                Mark as complete
              </Typography>
            </Box>
            <Box display="flex" gap={1} sx={{ mt: 1 }}>
              <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                Previous
              </Button>
              <Button size="small" onClick={handleNext} disabled={activeStep === toolRec.guideSteps.length - 1}>
                Next
              </Button>
            </Box>
          </Box>
          {/* List of all steps with completion */}
          <List dense>
            {toolRec.guideSteps.map((step, idx) => (
              <ListItem key={idx} alignItems="flex-start">
                <Checkbox
                  checked={completedSteps[idx] || false}
                  onChange={() => handleStepToggle(idx)}
                  inputProps={{ "aria-label": `Mark step ${idx + 1} as complete` }}
                />
                <ListItemText
                  primary={`${idx + 1}. ${step}`}
                  primaryTypographyProps={{ style: idx === activeStep ? { fontWeight: "bold" } : {} }}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
      {/* Micro-feedback: thumbs up/down for the guide */}
      {toolId && toolRec && toolRec.guideSteps.length > 0 && (
        <Box display="flex" gap={1} alignItems="center" sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Was this guide helpful?
          </Typography>
          <Button
            size="small"
            onClick={async () => {
              await fetch("/api/business-ops-hub/recommendation-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: "anonymous", // TODO: replace with actual user id if available
                  companyId: undefined, // TODO: replace with actual company id if available
                  recommendationId: toolId,
                  action: "guide_thumbs_up"
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
                  userId: "anonymous", // TODO: replace with actual user id if available
                  companyId: undefined, // TODO: replace with actual company id if available
                  recommendationId: toolId,
                  action: "guide_thumbs_down"
                }),
              });
            }}
            aria-label="Thumbs down"
          >
            👎
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ToolImplementationGuide;
