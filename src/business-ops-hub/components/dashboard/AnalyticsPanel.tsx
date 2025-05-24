import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import dashboardAnalyticsService from "../../services/dashboardAnalytics.service";

const BUILT_IN_KPI_OPTIONS = [
  { value: "tasks_completed", label: "Tasks Completed" },
  { value: "tasks_at_risk", label: "Tasks At Risk" },
  { value: "blocked_tasks", label: "Blocked Tasks" },
  { value: "urgent_items", label: "Urgent Items" },
  { value: "avg_completion_time", label: "Avg. Completion Time" },
  { value: "skipped_steps", label: "Skipped Steps" },
  { value: "predictive_trends", label: "Predictive Trends" },
  { value: "benchmarks", label: "Benchmarks" },
];

type CustomKPI = {
  id: string;
  name: string;
  formula: string;
  target: number | null;
};

export const AnalyticsPanel: React.FC = () => {
  const [selectedKPI, setSelectedKPI] = useState("tasks_completed");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Custom KPI state
  const [customKPIs, setCustomKPIs] = useState<CustomKPI[]>([]);
  const [customKPIDialogOpen, setCustomKPIDialogOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<CustomKPI | null>(null);
  const [kpiForm, setKpiForm] = useState({ name: "", formula: "", target: "" });

  // Combine built-in and custom KPIs for selection
  const KPI_OPTIONS = [
    ...BUILT_IN_KPI_OPTIONS,
    ...customKPIs.map(kpi => ({ value: `custom_${kpi.id}`, label: kpi.name })),
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate analytics fetch
    setTimeout(() => {
      setAnalyticsData({
        value: Math.floor(Math.random() * 100),
        trend: "+5%",
        benchmark: "Top 25%",
        details: "This is a placeholder for analytics data."
      });
      setLoading(false);
    }, 600);
  }, [selectedKPI, filter, customKPIs]);

  // Custom KPI dialog handlers
  const openAddKPIDialog = () => {
    setEditingKPI(null);
    setKpiForm({ name: "", formula: "", target: "" });
    setCustomKPIDialogOpen(true);
  };

  const openEditKPIDialog = (kpi: CustomKPI) => {
    setEditingKPI(kpi);
    setKpiForm({
      name: kpi.name,
      formula: kpi.formula,
      target: kpi.target !== null ? String(kpi.target) : "",
    });
    setCustomKPIDialogOpen(true);
  };

  const handleKPIDialogClose = () => {
    setCustomKPIDialogOpen(false);
    setEditingKPI(null);
    setKpiForm({ name: "", formula: "", target: "" });
  };

  const handleKPIFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKpiForm({ ...kpiForm, [e.target.name]: e.target.value });
  };

  const handleKPIDialogSave = () => {
    if (!kpiForm.name.trim()) return;
    if (editingKPI) {
      setCustomKPIs(prev =>
        prev.map(kpi =>
          kpi.id === editingKPI.id
            ? { ...kpi, name: kpiForm.name, formula: kpiForm.formula, target: kpiForm.target ? Number(kpiForm.target) : null }
            : kpi
        )
      );
    } else {
      setCustomKPIs(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: kpiForm.name,
          formula: kpiForm.formula,
          target: kpiForm.target ? Number(kpiForm.target) : null,
        },
      ]);
    }
    handleKPIDialogClose();
  };

  const handleDeleteKPI = (id: string) => {
    setCustomKPIs(prev => prev.filter(kpi => kpi.id !== id));
    // If the deleted KPI was selected, reset selection
    if (selectedKPI === `custom_${id}`) setSelectedKPI("tasks_completed");
  };

  // Find selected custom KPI if any
  const selectedCustomKPI = selectedKPI.startsWith("custom_")
    ? customKPIs.find(kpi => `custom_${kpi.id}` === selectedKPI)
    : null;

  const handleExport = () => {
    // TODO: Implement real export logic
    alert("Exporting report (placeholder)");
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Analytics & Reporting
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <FormControl size="small">
          <InputLabel id="kpi-select-label">KPI / Report</InputLabel>
          <Select
            labelId="kpi-select-label"
            value={selectedKPI}
            label="KPI / Report"
            onChange={e => setSelectedKPI(e.target.value)}
          >
            {KPI_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel id="filter-select-label">Filter</InputLabel>
          <Select
            labelId="filter-select-label"
            value={filter}
            label="Filter"
            onChange={e => setFilter(e.target.value)}
          >
            <MenuItem value="all">All Domains</MenuItem>
            <MenuItem value="finance">Finance</MenuItem>
            <MenuItem value="product">Product</MenuItem>
            <MenuItem value="hr">HR</MenuItem>
            <MenuItem value="marketing">Marketing</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={handleExport}>
          Export Report
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={openAddKPIDialog}
        >
          Add Custom KPI
        </Button>
      </Box>

      {/* List custom KPIs with edit/delete */}
      {customKPIs.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Custom KPIs
          </Typography>
          <List dense>
            {customKPIs.map(kpi => (
              <ListItem
                key={kpi.id}
                secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={() => openEditKPIDialog(kpi)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteKPI(kpi.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={kpi.name}
                  secondary={`Formula: ${kpi.formula || "N/A"}${kpi.target !== null ? ` | Target: ${kpi.target}` : ""}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Custom KPI Dialog */}
      <Dialog open={customKPIDialogOpen} onClose={handleKPIDialogClose}>
        <DialogTitle>{editingKPI ? "Edit Custom KPI" : "Add Custom KPI"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="KPI Name"
            fullWidth
            value={kpiForm.name}
            onChange={handleKPIFormChange}
          />
          <TextField
            margin="dense"
            name="formula"
            label="Formula (description or calculation)"
            fullWidth
            value={kpiForm.formula}
            onChange={handleKPIFormChange}
          />
          <TextField
            margin="dense"
            name="target"
            label="Target Value"
            type="number"
            fullWidth
            value={kpiForm.target}
            onChange={handleKPIFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleKPIDialogClose}>Cancel</Button>
          <Button onClick={handleKPIDialogSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
          <CircularProgress size={24} />
          <Typography>Loading analytics...</Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {KPI_OPTIONS.find(opt => opt.value === selectedKPI)?.label}
          </Typography>
          <Typography variant="h4" color="primary" gutterBottom>
            {analyticsData?.value ?? "--"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Trend: {analyticsData?.trend} &nbsp;|&nbsp; Benchmark: {analyticsData?.benchmark}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {analyticsData?.details}
          </Typography>
          {/* Predictive Insights */}
          {selectedKPI === "predictive_trends" && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="secondary">
                Predictive Insights (Placeholder)
              </Typography>
              <Typography variant="body2">
                Based on current trends, you are projected to complete 90% of tasks by next quarter.
              </Typography>
            </Box>
          )}
          {/* Benchmarks */}
          {selectedKPI === "benchmarks" && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="secondary">
                Benchmarking (Placeholder)
              </Typography>
              <Typography variant="body2">
                Your company is in the top 25% for task completion rate compared to similar organizations.
              </Typography>
            </Box>
          )}
          {/* Custom KPI Target Tracking */}
          {selectedCustomKPI && selectedCustomKPI.target !== null && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="secondary">
                Target Progress
              </Typography>
              <Typography variant="body2">
                Current Value: {analyticsData?.value ?? "--"} / Target: {selectedCustomKPI.target}
              </Typography>
              <Typography variant="body2" color="success.main">
                {analyticsData?.value >= selectedCustomKPI.target
                  ? "Target achieved!"
                  : `Progress: ${Math.round(
                      ((analyticsData?.value ?? 0) / selectedCustomKPI.target) * 100
                    )}%`}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default AnalyticsPanel;
