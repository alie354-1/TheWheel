import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, TextField, InputAdornment, IconButton, List, ListItem, ListItemText, Checkbox, CircularProgress, ListItemButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

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

interface ToolSearchBarProps {
  companyId: string;
  onSelectTools?: (tools: Tool[]) => void;
}

const ToolSearchBar: React.FC<ToolSearchBarProps> = ({ companyId, onSelectTools }) => {
  const [search, setSearch] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    fetch(`/api/business-ops-hub/tools?companyId=${encodeURIComponent(companyId)}&search=${encodeURIComponent(search)}`)
      .then(res => res.json())
      .then(data => {
        setTools(data.tools || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [companyId, search]);

  const handleSelect = (tool: Tool) => {
    const newSelected = new Set(selected);
    if (newSelected.has(tool.tool_id)) {
      newSelected.delete(tool.tool_id);
    } else {
      newSelected.add(tool.tool_id);
    }
    setSelected(newSelected);
    if (onSelectTools) {
      onSelectTools(tools.filter(t => newSelected.has(t.tool_id)));
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box display="flex" alignItems="center" gap={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tools by name, category, or feature..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {/* TODO: Add filter dropdowns for category, domain, etc. */}
      </Box>
      {loading ? (
        <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Loading tools...
          </Typography>
        </Box>
      ) : (
        <List dense sx={{ mt: 1, maxHeight: 200, overflow: "auto" }}>
          {tools.map(tool => (
            <ListItem
              key={tool.tool_id}
              secondaryAction={
                <Box display="flex" alignItems="center" gap={1}>
                  <Checkbox
                    edge="end"
                    checked={selected.has(tool.tool_id)}
                    tabIndex={-1}
                    disableRipple
                    onChange={() => handleSelect(tool)}
                  />
                  {/* Micro-feedback: thumbs up/down for tool */}
                  <IconButton
                    size="small"
                    aria-label="Thumbs up"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await fetch("/api/business-ops-hub/recommendation-feedback", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userId: "anonymous", // TODO: replace with actual user id if available
                          companyId,
                          recommendationId: tool.tool_id,
                          action: "tool_thumbs_up"
                        }),
                      });
                    }}
                  >
                    👍
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Thumbs down"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await fetch("/api/business-ops-hub/recommendation-feedback", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userId: "anonymous", // TODO: replace with actual user id if available
                          companyId,
                          recommendationId: tool.tool_id,
                          action: "tool_thumbs_down"
                        }),
                      });
                    }}
                  >
                    👎
                  </IconButton>
                </Box>
              }
            >
              <ListItemButton
                onClick={() => handleSelect(tool)}
                selected={selected.has(tool.tool_id)}
              >
                <ListItemText
                  primary={tool.name}
                  secondary={tool.category ? `Category: ${tool.category}` : undefined}
                />
              </ListItemButton>
            </ListItem>
          ))}
          {tools.length === 0 && !loading && (
            <ListItem>
              <ListItemText primary="No tools found." />
            </ListItem>
          )}
        </List>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Select tools to compare or view details.
      </Typography>
    </Paper>
  );
};

export default ToolSearchBar;
