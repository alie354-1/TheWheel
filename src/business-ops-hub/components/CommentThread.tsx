import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, List, ListItem, ListItemText, TextField, Button, CircularProgress, Chip } from "@mui/material";
import { TaskComment } from "../types/domain.types";
import { getTaskComments, addTaskComment } from "../services/domain.service";

interface CommentThreadProps {
  taskId: string;
}

const POLL_INTERVAL = 5000; // 5 seconds

const CommentThread: React.FC<CommentThreadProps> = ({ taskId }) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // TODO: Replace with real user ID from auth context
  const userId = "demo-user-id";

  // Fetch comments (with polling)
  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await getTaskComments(taskId);
      setComments(data);
      setError(null);
    } catch (err: any) {
      setError("Failed to load comments");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
    pollRef.current = setInterval(fetchComments, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [taskId]);

  // Post a new comment
  const handlePost = async () => {
    if (!input.trim()) return;
    setPosting(true);
    try {
      // Simple mention extraction: find all @words
      const mentionMatches = input.match(/@(\w+)/g) || [];
      const mentions = mentionMatches.map(m => m.slice(1));
      await addTaskComment(taskId, userId, input, mentions);
      setInput("");
      fetchComments();
    } catch (err: any) {
      setError("Failed to post comment");
    }
    setPosting(false);
  };

  return (
    <Box>
      <Box mb={2}>
        <TextField
          label="Add a comment (use @username to mention)"
          value={input}
          onChange={e => setInput(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          maxRows={6}
          disabled={posting}
        />
        <Box mt={1} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handlePost}
            disabled={posting || !input.trim()}
          >
            {posting ? "Posting..." : "Post"}
          </Button>
        </Box>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}>
          <CircularProgress size={24} />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : comments.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
          No comments yet. Start the conversation!
        </Typography>
      ) : (
        <List>
          {comments.map(comment => (
            <ListItem key={comment.id} alignItems="flex-start" divider>
              <ListItemText
                primary={
                  <span>
                    <b>User:</b> {comment.user_id}{" "}
                    <span style={{ color: "#888", fontSize: 12 }}>
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </span>
                }
                secondary={
                  <span>
                    {comment.message.split(/(@\w+)/g).map((part, idx) =>
                      part.startsWith("@") ? (
                        <Chip
                          key={idx}
                          label={part}
                          size="small"
                          color="secondary"
                          sx={{ mx: 0.5, fontWeight: 600 }}
                        />
                      ) : (
                        <span key={idx}>{part}</span>
                      )
                    )}
                  </span>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default CommentThread;
