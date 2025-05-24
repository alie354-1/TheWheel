import React, { useEffect, useState } from "react";
import workflowAutomationService, { WorkflowAutomation } from "../services/workflowAutomation.service";
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const TRIGGERS = [
  { value: "status_change", label: "Status Change" },
  { value: "new_comment", label: "New Comment" },
  { value: "time_elapsed", label: "Time Elapsed" }
];
const ACTIONS = [
  { value: "assign", label: "Assign Task" },
  { value: "notify", label: "Send Notification" },
  { value: "update_status", label: "Update Status" }
];

const companyId = "demo-company-id"; // Replace with real company context

const BusinessOpsAutomationsPage: React.FC = () => {
  const [automations, setAutomations] = useState<WorkflowAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
const [form, setForm] = useState<any>({
  trigger_type: "",
  trigger_config: "",
  action_type: "",
  action_config: "",
  actions: [],
  conditions: "",
  is_active: true
});
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const data = await workflowAutomationService.listAutomations(companyId);
      setAutomations(data);
    } catch (err) {
      alert("Failed to load automations");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleOpenDialog = (automation?: WorkflowAutomation) => {
    if (automation) {
      setEditingId(automation.id);
      setForm({
        trigger_type: automation.trigger_type,
        trigger_config: JSON.stringify(automation.trigger_config, null, 2),
        action_type: automation.action_type,
        action_config: JSON.stringify(automation.action_config, null, 2),
        actions: automation.actions ? [...automation.actions] : [],
        conditions: automation.conditions ? JSON.stringify(automation.conditions, null, 2) : "",
        is_active: automation.is_active
      });
    } else {
      setEditingId(null);
      setForm({
        trigger_type: "",
        trigger_config: "",
        action_type: "",
        action_config: "",
        actions: [],
        conditions: "",
        is_active: true
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        company_id: companyId,
        trigger_type: form.trigger_type,
        trigger_config: JSON.parse(form.trigger_config || "{}"),
        is_active: form.is_active
      };
      // If actions array is used, save to new field, else fallback to legacy
      if (form.actions && form.actions.length > 0) {
        payload.actions = form.actions.map((a: any) => ({
          type: a.type,
          config: JSON.parse(a.config || "{}")
        }));
        // Optionally, clear legacy fields
        payload.action_type = "";
        payload.action_config = {};
      } else {
        payload.action_type = form.action_type;
        payload.action_config = JSON.parse(form.action_config || "{}");
      }
      // Add conditions if provided
      if (form.conditions && form.conditions.trim().length > 0) {
        try {
          payload.conditions = JSON.parse(form.conditions);
        } catch (e) {
          alert("Invalid JSON in conditions field.");
          return;
        }
      }
      if (editingId) {
        await workflowAutomationService.updateAutomation(editingId, payload);
      } else {
        await workflowAutomationService.createAutomation(payload);
      }
      setDialogOpen(false);
      fetchAutomations();
    } catch (err) {
      alert("Failed to save automation. Check JSON fields.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this automation?")) return;
    try {
      await workflowAutomationService.deleteAutomation(id);
      fetchAutomations();
    } catch (err) {
      alert("Failed to delete automation");
    }
  };

  return (
    <Box maxWidth="md" mx="auto" py={6}>
      <Typography variant="h4" gutterBottom>
        Workflow Automations
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Automate repetitive tasks and streamline your business operations. Create rules that trigger actions based on events.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} sx={{ mb: 3 }}>
        New Automation
      </Button>
      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : automations.length === 0 ? (
          <Typography color="text.secondary" align="center">No automations found.</Typography>
        ) : (
          <List>
            {automations.map(a => (
              <ListItem key={a.id} divider
                secondaryAction={
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(a)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(a.id)}><DeleteIcon /></IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={`${a.trigger_type} → ${a.action_type} ${a.is_active ? "" : "(inactive)"}`}
                  secondary={
                    <span>
                      <b>Trigger:</b> <code>{JSON.stringify(a.trigger_config)}</code><br />
                      <b>Action:</b> <code>{JSON.stringify(a.action_config)}</code>
                    </span>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Automation" : "New Automation"}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Trigger Type"
            value={form.trigger_type}
            onChange={e => setForm({ ...form, trigger_type: e.target.value })}
            fullWidth
            margin="normal"
          >
            {TRIGGERS.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </TextField>
          <TextField
            label="Trigger Config (JSON)"
            value={form.trigger_config}
            onChange={e => setForm({ ...form, trigger_config: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
          />
          {/* Multi-action editor */}
          <Box mt={2} mb={1}>
            <Typography variant="subtitle1">Actions (Multi-step)</Typography>
            {form.actions && form.actions.length > 0 && form.actions.map((action: any, idx: number) => (
              <Paper key={idx} sx={{ p: 2, mb: 1, background: "#f9f9f9" }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    select
                    label="Action Type"
                    value={action.type}
                    onChange={e => {
                      const updated = [...form.actions];
                      updated[idx].type = e.target.value;
                      setForm({ ...form, actions: updated });
                    }}
                    sx={{ minWidth: 160 }}
                  >
                    {ACTIONS.map(a => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
                  </TextField>
                  <TextField
                    label="Action Config (JSON)"
                    value={action.config}
                    onChange={e => {
                      const updated = [...form.actions];
                      updated[idx].config = e.target.value;
                      setForm({ ...form, actions: updated });
                    }}
                    sx={{ flex: 1 }}
                    multiline
                    minRows={1}
                  />
                  <IconButton
                    aria-label="Remove"
                    onClick={() => {
                      const updated = [...form.actions];
                      updated.splice(idx, 1);
                      setForm({ ...form, actions: updated });
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
            <Button
              variant="outlined"
              size="small"
              onClick={() => setForm({
                ...form,
                actions: [
                  ...(form.actions || []),
                  { type: ACTIONS[0].value, config: "{}" }
                ]
              })}
              sx={{ mt: 1 }}
            >
              Add Action
            </Button>
          </Box>
          {/* Legacy single-action fields for backward compatibility */}
          <Box mt={2}>
            <Typography variant="subtitle2" color="text.secondary">
              (For legacy/compatibility: Single Action)
            </Typography>
            <TextField
              select
              label="Action Type"
              value={form.action_type}
              onChange={e => setForm({ ...form, action_type: e.target.value })}
              fullWidth
              margin="normal"
            >
              {ACTIONS.map(a => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
            </TextField>
            <TextField
              label="Action Config (JSON)"
              value={form.action_config}
              onChange={e => setForm({ ...form, action_config: e.target.value })}
              fullWidth
              margin="normal"
              multiline
              minRows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BusinessOpsAutomationsPage;
