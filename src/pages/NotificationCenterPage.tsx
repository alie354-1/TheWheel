import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  CircularProgress,
  Button,
} from "@mui/material";
import { MarkEmailRead as MarkReadIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { notificationService } from "../lib/services/notification.service";
import { useCompany } from "../lib/hooks/useCompany";
import { Notification } from "../lib/types/journey-unified.types";

const NotificationCenterPage: React.FC = () => {
  const { currentCompany } = useCompany();
  const companyId = currentCompany?.id || "";
  const userId = "demo-user-id"; // TODO: get from auth context

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    const data = await notificationService.getUserNotifications(userId, { limit: 50 });
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId]);

  const handleMarkAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId, userId);
    fetchNotifications();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Notification Center
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        View all your notifications and reminders in one place.
      </Typography>
      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No notifications found.
          </Typography>
        ) : (
          <List>
            {notifications.map((notif) => (
              <ListItem key={notif.id} divider
                secondaryAction={
                  <Box>
                    {!notif.is_read && (
                      <IconButton onClick={() => handleMarkAsRead(notif.id)} title="Mark as read">
                        <MarkReadIcon />
                      </IconButton>
                    )}
                    {/* TODO: Add delete/archive action if needed */}
                  </Box>
                }
              >
                <ListItemText
                  primary={notif.title}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {notif.body}
                      </Typography>
                      <Box mt={1}>
                        <Chip label={notif.event_type} size="small" sx={{ mr: 1 }} />
                        <Chip label={notif.priority} size="small" />
                        <Chip label={notif.is_read ? "Read" : "Unread"} size="small" color={notif.is_read ? "default" : "primary"} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notif.created_at).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      <Box mt={2}>
        <Button variant="outlined" onClick={fetchNotifications}>
          Refresh
        </Button>
      </Box>
    </Container>
  );
};

export default NotificationCenterPage;
