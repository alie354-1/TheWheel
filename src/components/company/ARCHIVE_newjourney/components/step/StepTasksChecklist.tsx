import React, { useState, useEffect, useCallback } from "react";
import { createTaskQuick } from "../../../../../components/tasks/taskCreationApi.ts";
import { useParams } from "react-router-dom";
import { supabase } from "../../../../../lib/supabase.ts";
import { companyService } from "../../../../../lib/services/company.service.ts";
import CreateTaskDialog from "../../../../../components/tasks/CreateTaskDialog.tsx";

interface StepTasksChecklistProps {
  initialTasks?: string[];
  tasks?: string[];
  onTasksChange?: (tasks: string[]) => void;
  stepId?: string;
}

interface DBTask {
  id: string;
  title: string;
  status?: string;
  completed?: boolean;
  user_id?: string;
}

export const StepTasksChecklist: React.FC<StepTasksChecklistProps> = ({
  initialTasks = [],
  tasks: controlledTasks,
  onTasksChange,
  stepId: propStepId,
}) => {
  const { stepId: routeStepId, companyId } = useParams<{ stepId: string; companyId?: string }>();
  const stepId = propStepId || routeStepId;
  const [tasks, setTasks] = useState<{ text: string; completed: boolean; custom: boolean; id?: string; user_id?: string }[]>(
    initialTasks.map((t) => ({ text: t, completed: false, custom: false }))
  );
  const [teamMembers, setTeamMembers] = useState<{ user_id: string; user_email?: string; role?: string }[]>([]);
  const [customTask, setCustomTask] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<DBTask | null>(null);

  // Fetch team members for the company
  useEffect(() => {
    if (!companyId) return;
    companyService.getCompanyMembers(companyId).then(({ data, error }) => {
      if (!error && data) setTeamMembers(data);
    });
  }, [companyId]);

  // Fetch tasks for this step from the database
  const fetchTasksForStep = useCallback(async () => {
    if (!stepId) return;
    const { data, error } = await supabase
      .from("standup_tasks")
      .select("id, title, status, user_id")
      .eq("step_id", stepId);

    if (error) {
      alert("Failed to fetch tasks: " + error.message);
      return;
    }
    if (data) {
      setTasks(
        data.map((t: DBTask) => ({
          id: t.id,
          text: t.title,
          completed: t.status === "completed",
          custom: true,
          user_id: t.user_id,
        }))
      );
    }
  }, [stepId]);

  useEffect(() => {
    fetchTasksForStep();
    // eslint-disable-next-line
  }, [stepId]);

  // If controlled, update local state when prop changes
  useEffect(() => {
    if (controlledTasks) {
      setTasks(
        controlledTasks.map((t) => ({ text: t, completed: false, custom: true }))
      );
    }
  }, [controlledTasks]);

  const toggleTask = async (idx: number) => {
    const task = tasks[idx];
    if (!task.id) return;
    const newCompleted = !task.completed;
    setTasks((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, completed: newCompleted } : t))
    );
    // Persist to DB
    await supabase
      .from("standup_tasks")
      .update({ status: newCompleted ? "completed" : "pending" })
      .eq("id", task.id);
    fetchTasksForStep();
  };

  const addCustomTask = async () => {
    if (customTask.trim() && stepId) {
      setCreating(true);
      try {
        // Debug: log stepId before creating task
        console.log("Creating task for stepId:", stepId, "task:", customTask.trim());
        // Create the task in the main task manager (instant, name only)
        await createTaskQuick(customTask.trim(), stepId);
        setCustomTask("");
        setShowInput(false);
        fetchTasksForStep();
      } catch (err: any) {
        // Enhanced error handling
        let message = "Failed to create task.";
        if (err && err.message) {
          message += " " + err.message;
        } else if (typeof err === "object") {
          message += " " + JSON.stringify(err);
        }
        alert(message);
        // Optionally, log to console for debugging
        console.error("Task creation error:", err, "stepId:", stepId, "customTask:", customTask.trim());
      } finally {
        setCreating(false);
      }
    } else {
      if (!stepId) {
        alert("No valid stepId provided for task creation.");
        console.error("No valid stepId for addCustomTask. customTask:", customTask, "stepId:", stepId);
      }
    }
  };

  // Fetch full task for editing
  const handleEdit = async (task: DBTask) => {
    if (!task.id) return;
    const { data, error } = await supabase
      .from("standup_tasks")
      .select("*")
      .eq("id", task.id)
      .single();
    if (error) {
      alert("Failed to load task for editing: " + error.message);
      return;
    }
    // Ensure status is one of the allowed values for TaskForm
    let status: "pending" | "in_progress" | "completed" | undefined = "pending";
    if (data.status === "in_progress" || data.status === "completed") {
      status = data.status;
    } else if (data.status === "pending") {
      status = "pending";
    } else {
      status = undefined;
    }
    // Only allow valid status values for the modal
    let validStatus: "pending" | "in_progress" | "completed" | undefined = undefined;
    if (status === "pending" || status === "in_progress" || status === "completed") {
      validStatus = status;
    }
    // Remove status if not valid
    const taskForModal = { ...data };
    if (validStatus) {
      taskForModal.status = validStatus;
    } else {
      delete taskForModal.status;
    }
    setEditingTask(taskForModal);
  };

  // Save handler for modal (create or update)
  const handleEditSave = async (taskData: any) => {
    if (editingTask && editingTask.id) {
      try {
        // Only update fields that exist in the DB (title, description, status, etc.)
        const updateFields: any = {
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          task_type: taskData.task_type,
          estimated_hours: taskData.estimated_hours,
          due_date: taskData.due_date,
          // Add more fields as needed, but avoid arrays/objects unless supported by your schema
        };
        const { error } = await supabase
          .from("standup_tasks")
          .update(updateFields)
          .eq("id", editingTask.id);
        if (error) {
          alert("Failed to update task: " + error.message);
          return;
        }
        alert("Task updated successfully!");
      } catch (err: any) {
        alert("Unexpected error: " + (err?.message || err));
        return;
      }
    }
    setEditingTask(null);
    fetchTasksForStep();
  };

  const handleEditClose = () => {
    setEditingTask(null);
    fetchTasksForStep();
  };

  const handleDelete = async (task: DBTask) => {
    if (!task.id) return;
    if (window.confirm("Are you sure you want to delete this task?")) {
      await supabase.from("standup_tasks").delete().eq("id", task.id);
      fetchTasksForStep();
    }
  };

  // Notify parent on tasks change if controlled
  useEffect(() => {
    if (onTasksChange && !controlledTasks) {
      onTasksChange(tasks.map((t) => t.text));
    }
    // eslint-disable-next-line
  }, [tasks]);

  return (
    <div>
      <ul className="list-disc pl-5 space-y-1 text-gray-700">
        {tasks.map((task, idx) => (
          <li key={task.id || idx} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(idx)}
              className="h-4 w-4"
            />
            <span className={task.completed ? "line-through text-gray-400" : ""}>{task.text}</span>
            {/* Assignee display only (no dropdown) */}
            {teamMembers.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">
                {task.user_id
                  ? (teamMembers.find((m) => m.user_id === task.user_id)?.user_email || task.user_id)
                  : "Unassigned"}
              </span>
            )}
            {task.id && (
              <>
                <button
                  className="ml-2 text-blue-600 hover:underline text-xs"
                  onClick={() => handleEdit({ id: task.id || "", title: task.text })}
                >
                  Edit
                </button>
                <button
                  className="ml-1 text-red-600 hover:underline text-xs"
                  onClick={() => handleDelete({ id: task.id || "", title: task.text })}
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      {showInput ? (
        <div className="mt-2 flex items-center space-x-2">
          <input
            type="text"
            value={customTask}
            onChange={(e) => setCustomTask(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
            placeholder="Add your own task..."
            onKeyDown={(e) => e.key === "Enter" && addCustomTask()}
            autoFocus
            disabled={creating}
          />
          <button
            className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
            onClick={addCustomTask}
            disabled={creating}
          >
            {creating ? "Adding..." : "Add"}
          </button>
          <button
            className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm"
            onClick={() => setShowInput(false)}
            disabled={creating}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          className="text-blue-600 hover:underline text-sm mt-2"
          onClick={() => setShowInput(true)}
        >
          + Add Your Own Task
        </button>
      )}
      {editingTask && (
        <CreateTaskDialog
          isOpen={!!editingTask}
          onClose={handleEditClose}
          onTaskCreated={handleEditSave}
          task={{
            ...editingTask,
            status:
              editingTask && (editingTask.status === "pending" || editingTask.status === "in_progress" || editingTask.status === "completed")
                ? editingTask.status
                : undefined,
          }}
          teamMembers={teamMembers}
          currentUserId={teamMembers.length > 0 ? teamMembers[0].user_id : undefined}
        />
      )}
    </div>
  );
};
