import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from "@mui/icons-material";
import { reminderService, Reminder } from "../lib/services/reminder.service";
import { useCompany } from "../lib/hooks/useCompany";

const SCHEDULE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "0 9 * * *", label: "Every day at 9am (cron)" },
];

const CHANNEL_OPTIONS = [
  { value: "in-app", label: "In-App" },
  { value: "email", label: "Email" },
  { value: "slack", label: "Slack" },
];

const NotificationSettingsPage: React.FC = () => {
  const { currentCompany } = useCompany();
  const companyId = currentCompany?.id || "";
  const userId = "demo-user-id"; // TODO: get from auth context

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    type: "custom",
    title: "",
    body: "",
    schedule: "daily",
    next_run: "",
    channels: ["in-app"],
    is_active: true,
  });
  // Notification preferences state
  const [preferences, setPreferences] = useState<any[]>([]);
  const [prefLoading, setPrefLoading] = useState(false);

  const fetchReminders = async () => {
    setLoading(true);
    const data = await reminderService.listReminders(userId, companyId);
    setReminders(data);
    setLoading(false);
  };

  useEffect(() => {
    if (userId && companyId) fetchReminders();
  }, [userId, companyId]);

  const fetchPreferences = async () => {
    setPrefLoading(true);
    const data = await notificationService.getUserNotificationPreferences(userId, companyId);
    setPreferences(data);
    setPrefLoading(false);
  };

  useEffect(() => {
    if (userId && companyId) fetchPreferences();
  }, [userId, companyId]);

  const handleOpenDialog = (reminder?: Reminder) => {
    if (reminder) {
      setEditId(reminder.id);
      setForm({
        type: reminder.type,
        title: reminder.title,
        body: reminder.body || "",
        schedule: reminder.schedule,
        next_run: reminder.next_run,
        channels: reminder.channels,
        is_active: reminder.is_active,
      });
    } else {
      setEditId(null);
      setForm({
        type: "custom",
        title: "",
        body: "",
        schedule: "daily",
        next_run: "",
        channels: ["in-app"],
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.schedule || !form.next_run) return;
    if (editId) {
      await reminderService.updateReminder(editId, form);
    } else {
      await reminderService.createReminder({
        ...form,
        user_id: userId,
        company_id: companyId,
      });
    }
    setDialogOpen(false);
    fetchReminders();
  };

  const handleDelete = async (id: string) => {
    await reminderService.deleteReminder(id);
    fetchReminders();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Notification Settings & Reminders
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Manage your scheduled reminders and notification preferences.
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog()}
        sx={{ mb: 2 }}
      >
        New Reminder
      </Button>
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Notification Channel Preferences
        </Typography>
        {prefLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}>
            <CircularProgress />
          </Box>
        ) : preferences.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No notification preferences found.
          </Typography>
        ) : (
          <List>
            {preferences.map((pref) => (
              <ListItem key={pref.event_type} divider>
                <ListItemText
                  primary={pref.event_type}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Channels: {Array.isArray(pref.channels) ? pref.channels.join(", ") : ""}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enabled: {pref.is_enabled ? "Yes" : "No"}
                      </Typography>
                    </>
                  }
                />
                <Box>
                  <TextField
                    select
                    label="Channels"
                    value={pref.channels || []}
                    onChange={async e => {
                      const newChannels = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
                      await notificationService.updateNotificationPreference(
                        userId,
                        companyId,
                        pref.event_type,
                        { channels: newChannels }
                      );
                      fetchPreferences();
                    }}
                    size="small"
                    SelectProps={{ multiple: true }}
                    sx={{ minWidth: 180, mr: 2 }}
                  >
                    {CHANNEL_OPTIONS.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </TextField>
                  <Button
                    size="small"
                    variant={pref.is_enabled ? "contained" : "outlined"}
                    color={pref.is_enabled ? "success" : "inherit"}
                    onClick={async () => {
                      await notificationService.updateNotificationPreference(
                        userId,
                        companyId,
                        pref.event_type,
                        { isEnabled: !pref.is_enabled }
                      );
                      fetchPreferences();
                    }}
                  >
                    {pref.is_enabled ? "Enabled" : "Disabled"}
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : reminders.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No reminders found.
          </Typography>
        ) : (
          <List>
            {reminders.map((reminder) => (
              <ListItem key={reminder.id} divider
                secondaryAction={
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(reminder)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(reminder.id)}><DeleteIcon /></IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={reminder.title}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {reminder.body}
                      </Typography>
                      <Box mt={1}>
                        <Chip label={reminder.schedule} size="small" sx={{ mr: 1 }} />
                        <Chip label={reminder.channels.join(", ")} size="small" />
                        <Chip label={reminder.is_active ? "Active" : "Inactive"} size="small" color={reminder.is_active ? "success" : "default"} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Next: {new Date(reminder.next_run).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Edit Reminder" : "New Reminder"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Body"
            value={form.body}
            onChange={e => setForm({ ...form, body: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
          />
          <TextField
            select
            label="Schedule"
            value={form.schedule}
            onChange={e => setForm({ ...form, schedule: e.target.value })}
            fullWidth
            margin="normal"
          >
            {SCHEDULE_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Next Run (ISO date/time)"
            value={form.next_run}
            onChange={e => setForm({ ...form, next_run: e.target.value })}
            fullWidth
            margin="normal"
            placeholder="2025-05-11T09:00:00Z"
          />
          <TextField
            select
            label="Channels"
            value={form.channels}
            onChange={e => setForm({ ...form, channels: Array.isArray(e.target.value) ? e.target.value : [e.target.value] })}
            fullWidth
            margin="normal"
            SelectProps={{ multiple: true }}
          >
            {CHANNEL_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary" disabled={!form.title || !form.schedule || !form.next_run}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NotificationSettingsPage;
