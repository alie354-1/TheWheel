import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Rating } from "@mui/material";
import { trackDecisionEvent } from "../services/domain.service";

interface DecisionFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  userId: string;
  companyId: string;
  eventType?: string; // e.g., "task_completed"
}

const DecisionFeedbackModal: React.FC<DecisionFeedbackModalProps> = ({
  open,
  onClose,
  taskId,
  userId,
  companyId,
  eventType = "task_completed"
}) => {
  const [outcome, setOutcome] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await trackDecisionEvent({
      user_id: userId,
      company_id: companyId,
      event_type: eventType,
      context: { task_id: taskId },
      data: { outcome, rating }
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Task Outcome & Feedback</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Please provide feedback or describe the outcome of this task. This will help improve future recommendations.
        </Typography>
        <TextField
          label="Outcome / Notes"
          value={outcome}
          onChange={e => setOutcome(e.target.value)}
          fullWidth
          multiline
          minRows={3}
          margin="normal"
        />
        <Typography gutterBottom>How successful was this task?</Typography>
        <Rating
          name="task-success-rating"
          value={rating}
          onChange={(_, value) => setRating(value)}
          max={5}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting || (!outcome && !rating)}>
          Submit Feedback
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DecisionFeedbackModal;
