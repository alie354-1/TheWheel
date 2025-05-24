import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, List, ListItem, ListItemText, Chip, Box, IconButton, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { supabase } from "@/lib/supabase";

interface Notification {
  id: string;
  domain_id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  status: string;
  created_at: string;
  read_at?: string;
}

export const NotificationCenter: React.FC<{ userId: string }> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchNotifications() {
      setLoading(true);
      try {
        // In a real implementation, use a service method
        const { data, error } = await supabase
          .from("domain_notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (isMounted && data) setNotifications(data);
      } catch {
        if (isMounted) setNotifications([]);
      }
      setLoading(false);
    }
    fetchNotifications();
    return () => { isMounted = false; };
  }, [userId]);

  return (
    <Card sx={{ mt: 4, mb: 4 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Notifications</Typography>
        </Box>
        {loading ? (
          <Typography variant="body2" color="text.secondary">Loading...</Typography>
        ) : notifications.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No notifications.</Typography>
        ) : (
          <List>
            {notifications.map((n) => (
              <ListItem key={n.id} sx={{ bgcolor: n.status === "unread" ? "#e3f2fd" : undefined }}>
                <ListItemText
                  primary={n.title}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">{n.message}</Typography>
                      <Typography variant="caption" color="text.secondary">{new Date(n.created_at).toLocaleString()}</Typography>
                    </>
                  }
                />
                <Chip
                  size="small"
                  label={n.priority}
                  color={n.priority === "high" ? "error" : n.priority === "medium" ? "warning" : "default"}
                  sx={{ ml: 1 }}
                />
                {n.status === "unread" && (
                  <Chip size="small" label="Unread" color="primary" sx={{ ml: 1 }} />
                )}
                {/* Nudge actions */}
                {n.notification_type === "nudge" && (
                  <Box sx={{ ml: 2, display: "flex", gap: 1 }}>
                    <IconButton size="small" title="Dismiss" onClick={() => {/* TODO: implement dismiss */}}>
                      <span role="img" aria-label="dismiss">❌</span>
                    </IconButton>
                    <IconButton size="small" title="Snooze" onClick={() => {/* TODO: implement snooze */}}>
                      <span role="img" aria-label="snooze">😴</span>
                    </IconButton>
                    <IconButton size="small" title="Act" onClick={() => {/* TODO: implement act */}}>
                      <span role="img" aria-label="act">🚀</span>
                    </IconButton>
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
