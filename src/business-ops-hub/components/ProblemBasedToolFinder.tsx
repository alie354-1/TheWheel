import React from "react";
import { Box, Typography, Paper } from "@mui/material";

/**
 * ProblemBasedToolFinder
 * 
 * Allows users to describe a business problem and receive tool recommendations.
 * To be integrated with NLP-based search and recommendations.
 */
const ProblemBasedToolFinder: React.FC = () => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Find Tools by Problem
      </Typography>
      <Box>
        {/* TODO: Implement problem-based tool search and recommendations */}
        <Typography variant="body2" color="text.secondary">
          Problem-based tool finder coming soon.
        </Typography>
      </Box>
    </Paper>
  );
};

export default ProblemBasedToolFinder;
