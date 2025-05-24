import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, Chip, Skeleton, IconButton, Menu, MenuItem, Tooltip, Snackbar, Alert } from "@mui/material";
import { useDrag, useDrop, DragSourceMonitor, DropTargetMonitor } from "react-dnd";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import { getPriorityTasks, updateDomainStep } from "../services/domain.service";
import { DomainStepDetail, DomainStepStatus } from "../types/domain.types";

export interface DomainTaskPreviewProps {
  domainId: string;
  companyId: string;
}

const MAX_TASKS = 3;

const statusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "success";
    case "in_progress":
      return "info";
    case "not_started":
      return "default";
    case "skipped":
      return "warning";
    case "paused":
      return "warning";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

const ITEM_TYPE = "TASK_PREVIEW_ITEM";

const DomainTaskPreview: React.FC<DomainTaskPreviewProps> = ({ domainId, companyId }) => {
  const [tasks, setTasks] = useState<DomainStepDetail[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTaskId, setMenuTaskId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function fetchTasks() {
      setLoading(true);
      try {
        const result = await getPriorityTasks(domainId, companyId, MAX_TASKS + 1);
        if (isMounted) setTasks(result);
      } catch {
        if (isMounted) setTasks([]);
      }
      setLoading(false);
    }
    fetchTasks();
    return () => { isMounted = false; };
  }, [domainId, companyId]);

  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={32} sx={{ mb: 1, borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="80%" height={24} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: "italic" }}>
        No priority tasks. <span style={{ color: "#1976d2", cursor: "pointer" }} onClick={() => navigate(`/business-ops-hub/domain/${domainId}`)}>Add task</span>
      </Typography>
    );
  }

  const showMore = tasks.length > MAX_TASKS;
  const displayTasks = showMore ? tasks.slice(0, MAX_TASKS) : tasks;

  // Drag-and-drop logic for tasks
  const moveTask = (from: number, to: number) => {
    if (from === to) return;
    setTasks((prev) => {
      if (!prev) return prev;
      const updated = [...prev];
      const [removed] = updated.splice(from, 1);
      updated.splice(to, 0, removed);
      // Update priority_order in backend (for demo, just update UI)
      // In a real implementation, batch update after drag end
      updated.forEach((t, idx) => {
        t.priority = idx;
      });
      // Persist new order
      updateDomainStep(updated[to].id, { priority: to });
      return updated;
    });
  };

  // Draggable task row
  const DraggableTaskRow: React.FC<{ task: DomainStepDetail; index: number }> = ({ task, index }) => {
    const ref = useRef<HTMLDivElement>(null);

    const [, drop] = useDrop({
      accept: ITEM_TYPE,
      hover(item: { index: number }, monitor: DropTargetMonitor) {
        if (!ref.current) return;
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;
        moveTask(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });

    const [{ isDragging }, drag] = useDrag({
      type: ITEM_TYPE,
      item: { index },
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    drag(drop(ref));

    return (
      <Box
        ref={ref}
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 0.5,
          opacity: isDragging ? 0.5 : 1,
          cursor: "move",
          background: isDragging ? "#f5f5f5" : "transparent",
          borderRadius: 1,
          px: 0.5,
        }}
      >
        <Chip
          size="small"
          label={task.status.replace("_", " ")}
          color={statusColor(task.status)}
          sx={{ mr: 1 }}
        />
        <Typography variant="body2" sx={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {task.name}
        </Typography>
        {/* Lock/unlock priority */}
        <Tooltip title={task.is_priority_locked ? "Unlock priority (allow auto-adjustment)" : "Lock priority (manual override)"}>
          <IconButton
            size="small"
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await updateDomainStep(task.id, { is_priority_locked: !task.is_priority_locked });
                setTasks((prev) =>
                  prev
                    ? prev.map((t) =>
                        t.id === task.id
                          ? { ...t, is_priority_locked: !task.is_priority_locked }
                          : t
                      )
                    : prev
                );
                setSnackbar({
                  open: true,
                  message: task.is_priority_locked
                    ? "Priority unlocked (auto-adjustment enabled)"
                    : "Priority locked (manual override enabled)",
                  severity: "success",
                });
              } catch {
                setSnackbar({
                  open: true,
                  message: "Failed to update priority lock",
                  severity: "error",
                });
              }
            }}
            aria-label={task.is_priority_locked ? "Unlock priority" : "Lock priority"}
            sx={{ ml: 1 }}
          >
            {task.is_priority_locked ? "🔒" : "🔓"}
          </IconButton>
        </Tooltip>
        {/* Manual priority order input if locked */}
        {task.is_priority_locked && (
          <input
            type="number"
            min={0}
            step={1}
            value={task.locked_priority_order ?? ""}
            style={{ width: 40, marginLeft: 4, marginRight: 4 }}
            onChange={async (e) => {
              const newOrder = parseFloat(e.target.value);
              try {
                await updateDomainStep(task.id, { locked_priority_order: newOrder });
                setTasks((prev) =>
                  prev
                    ? prev.map((t) =>
                        t.id === task.id
                          ? { ...t, locked_priority_order: newOrder }
                          : t
                      )
                    : prev
                );
                setSnackbar({
                  open: true,
                  message: "Manual priority updated",
                  severity: "success",
                });
              } catch {
                setSnackbar({
                  open: true,
                  message: "Failed to update manual priority",
                  severity: "error",
                });
              }
            }}
            title="Manual priority order (lower = higher priority)"
          />
        )}
        {/* Quick status update menu */}
        <Tooltip title="Quick actions">
          <IconButton
            size="small"
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
              setMenuTaskId(task.id);
            }}
            aria-label="Quick actions"
            sx={{ ml: 1 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {/* Status update menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl) && menuTaskId === task.id}
          onClose={() => {
            setAnchorEl(null);
            setMenuTaskId(null);
          }}
        >
          {task.status !== "completed" && (
            <MenuItem
              onClick={async () => {
                setAnchorEl(null);
                setMenuTaskId(null);
                try {
                  await updateDomainStep(task.id, { status: DomainStepStatus.COMPLETED });
                  setTasks((prev) =>
                    prev
                      ? prev.map((t) => (t.id === task.id ? { ...t, status: "completed" } : t))
                      : prev
                  );
                  // Log decision event
                  try {
                    await fetch("/api/business-ops-hub/decision-events", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        company_id: companyId,
                        // TODO: Replace with actual user id from auth context if available
                        user_id: undefined,
                        event_type: "task_completed",
                        context: {
                          domain_id: domainId,
                          task_id: task.id,
                          task_name: task.name,
                        },
                        data: task,
                      }),
                    });
                  } catch (e) {
                    // Ignore logging errors for now
                  }
                  setSnackbar({ open: true, message: "Task marked as complete", severity: "success" });
                } catch {
                  setSnackbar({ open: true, message: "Failed to update status", severity: "error" });
                }
              }}
            >
              Mark as Complete
            </MenuItem>
          )}
          {task.status !== "in_progress" && (
            <MenuItem
              onClick={async () => {
                setAnchorEl(null);
                setMenuTaskId(null);
                try {
                  await updateDomainStep(task.id, { status: DomainStepStatus.IN_PROGRESS });
                  setTasks((prev) =>
                    prev
                      ? prev.map((t) => (t.id === task.id ? { ...t, status: "in_progress" } : t))
                      : prev
                  );
                  setSnackbar({ open: true, message: "Task marked as in progress", severity: "success" });
                } catch {
                  setSnackbar({ open: true, message: "Failed to update status", severity: "error" });
                }
              }}
            >
              Mark as In Progress
            </MenuItem>
          )}
          {task.status !== "not_started" && (
            <MenuItem
              onClick={async () => {
                setAnchorEl(null);
                setMenuTaskId(null);
                try {
                  await updateDomainStep(task.id, { status: DomainStepStatus.NOT_STARTED });
                  setTasks((prev) =>
                    prev
                      ? prev.map((t) => (t.id === task.id ? { ...t, status: "not_started" } : t))
                      : prev
                  );
                  setSnackbar({ open: true, message: "Task marked as not started", severity: "success" });
                } catch {
                  setSnackbar({ open: true, message: "Failed to update status", severity: "error" });
                }
              }}
            >
              Mark as Not Started
            </MenuItem>
          )}
        </Menu>
      </Box>
    );
  };

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Priority Tasks
        </Typography>
        {displayTasks.map((task, idx) => (
          <DraggableTaskRow key={task.id} task={task} index={idx} />
        ))}
        {showMore && (
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <Typography variant="body2" color="primary" sx={{ mr: 1 }}>
              More tasks...
            </Typography>
            <IconButton
              size="small"
              onClick={() => navigate(`/business-ops-hub/domain/${domainId}`)}
              aria-label="View all tasks"
            >
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DomainTaskPreview;
