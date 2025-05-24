import React from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

interface Tool {
  company_tool_id: string;
  tool_id: string;
  name: string;
  category?: string;
  description?: string;
  url?: string;
  source?: string;
  added_by?: string;
  added_at?: string;
  documents?: any[];
}

interface ToolComparisonPanelProps {
  tools: Tool[];
  onSelectTool?: (toolId: string) => void;
}

const ToolComparisonPanel: React.FC<ToolComparisonPanelProps> = ({ tools, onSelectTool }) => {
  if (!tools || tools.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tool Comparison
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select tools to compare.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Tool Comparison
      </Typography>
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Attribute</TableCell>
              {tools.map(tool => (
                <TableCell
                  key={tool.tool_id}
                  sx={{ cursor: onSelectTool ? "pointer" : undefined, fontWeight: "bold" }}
                  onClick={onSelectTool ? () => onSelectTool(tool.tool_id) : undefined}
                >
                  {tool.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Category</TableCell>
              {tools.map(tool => (
                <TableCell key={tool.tool_id}>{tool.category || "-"}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Description</TableCell>
              {tools.map(tool => (
                <TableCell key={tool.tool_id}>{tool.description || "-"}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Source</TableCell>
              {tools.map(tool => (
                <TableCell key={tool.tool_id}>{tool.source || "-"}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>URL</TableCell>
              {tools.map(tool => (
                <TableCell key={tool.tool_id}>
                  {tool.url ? (
                    <a href={tool.url} target="_blank" rel="noopener noreferrer">{tool.url}</a>
                  ) : "-"}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};

export default ToolComparisonPanel;
