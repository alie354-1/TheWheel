import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

/**
 * UnifiedTaskListPage
 * - Aggregates all tasks across all business domains for the current company.
 * - Supports filtering by domain and status, sorting, custom task creation, drag-and-drop reordering, and dependency visualization.
 */

type Task = {
  id: string;
  name: string;
  domain_id: string;
  domain_name: string;
  status: string;
  priority: number;
  phase_name?: string;
};

type BusinessDomain = {
  id: string;
  name: string;
  color?: string;
};

type TaskDependency = {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  type: string;
};

const UnifiedTaskListPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [domains, setDomains] = useState<BusinessDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDomain, setFilterDomain] = useState<string | "">("");
  const [filterStatus, setFilterStatus] = useState<string | "">("");
  const [sortBy, setSortBy] = useState<"priority" | "name" | "status">("priority");
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [showDeps, setShowDeps] = useState<string | null>(null);

  // Custom task creation form state
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    domain_id: "",
    priority: 0,
    phase_name: "",
  });
  const [creating, setCreating] = useState(false);

  // TODO: Replace with actual company_id from context/auth
  const companyId = "demo-company-id";

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase
        .from("domain_steps_status")
        .select("*")
        .eq("company_id", companyId),
      supabase
        .from("business_domains")
        .select("id, name, color"),
    ])
      .then(async ([taskRes, domainRes]) => {
        const taskList =
          (taskRes.data || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            domain_id: t.domain_id,
            domain_name: t.domain_name,
            status: t.status,
            priority: t.priority || 0,
            phase_name: t.phase_name,
          })) || [];
        setTasks(taskList);
        setDomains(domainRes.data || []);

        // Fetch dependencies for all tasks in the list
        if (taskList.length > 0) {
          const ids = taskList.map((t) => t.id);
          const { data: depData } = await supabase
            .from("task_dependencies")
            .select("*")
            .in("task_id", ids)
            .or(`depends_on_task_id.in.(${ids.join(",")})`);
          setDependencies(depData || []);
        }
      })
      .finally(() => setLoading(false));
  }, [companyId]);

  // Filtering and sorting
  const filteredTasks = tasks
    .filter((t) => (filterDomain ? t.domain_id === filterDomain : true))
    .filter((t) => (filterStatus ? t.status === filterStatus : true))
    .sort((a, b) => {
      if (sortBy === "priority") return (b.priority || 0) - (a.priority || 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return 0;
    });

  // Drag-and-drop handler
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(filteredTasks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    // Update priorities in UI
    setTasks((prev) => {
      // Only update the filtered tasks' priorities, keep others unchanged
      const updated = prev.map((t) => {
        const idx = reordered.findIndex((rt) => rt.id === t.id);
        if (idx !== -1) {
          return { ...t, priority: reordered.length - idx }; // Higher index = lower priority
        }
        return t;
      });
      return updated;
    });

    // Persist new order (priority) in DB
    for (let i = 0; i < reordered.length; i++) {
      const task = reordered[i];
      await supabase
        .from("domain_steps")
        .update({ priority: reordered.length - i })
        .eq("id", task.id);
    }
  };

  // Helper: Get blockers and blocked tasks for a given task
  const getBlockers = (taskId: string) =>
    dependencies.filter((d) => d.task_id === taskId && d.type === "blocks");
  const getBlockedBy = (taskId: string) =>
    dependencies.filter((d) => d.depends_on_task_id === taskId && d.type === "blocks");

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Unified Task List</h1>
      {/* Custom Task Creation Form */}
      <form
        className="mb-6 bg-white rounded shadow p-4 flex flex-wrap gap-4 items-end"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!newTask.name || !newTask.domain_id) return;
          setCreating(true);
          // Insert into domain_steps (company-specific)
          const { data, error } = await supabase
            .from("domain_steps")
            .insert({
              name: newTask.name,
              custom_name: newTask.name,
              custom_description: newTask.description,
              domain_id: newTask.domain_id,
              company_id: companyId,
              priority: newTask.priority,
            })
            .select()
            .single();
          if (!error && data) {
            // Optimistically add to UI (fetching again would be more robust)
            setTasks((prev) => [
              {
                id: data.id,
                name: newTask.name,
                domain_id: newTask.domain_id,
                domain_name: domains.find((d) => d.id === newTask.domain_id)?.name || "",
                status: "not_started",
                priority: newTask.priority,
                phase_name: newTask.phase_name,
              },
              ...prev,
            ]);
            setNewTask({
              name: "",
              description: "",
              domain_id: "",
              priority: 0,
              phase_name: "",
            });
          }
          setCreating(false);
        }}
      >
        <div>
          <label className="block text-sm font-medium mb-1">Task Name</label>
          <input
            type="text"
            className="border rounded px-2 py-1 w-48"
            value={newTask.name}
            onChange={(e) => setNewTask((t) => ({ ...t, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Domain</label>
          <select
            className="border rounded px-2 py-1 w-40"
            value={newTask.domain_id}
            onChange={(e) => setNewTask((t) => ({ ...t, domain_id: e.target.value }))}
            required
          >
            <option value="">Select Domain</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            type="text"
            className="border rounded px-2 py-1 w-64"
            value={newTask.description}
            onChange={(e) => setNewTask((t) => ({ ...t, description: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <input
            type="number"
            className="border rounded px-2 py-1 w-20"
            value={newTask.priority}
            onChange={(e) => setNewTask((t) => ({ ...t, priority: Number(e.target.value) }))}
            min={0}
            max={10}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
          disabled={creating || !newTask.name || !newTask.domain_id}
        >
          {creating ? "Creating..." : "Add Task"}
        </button>
      </form>
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <label>
          <span className="mr-2 text-sm">Domain:</span>
          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mr-2 text-sm">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="skipped">Skipped</option>
          </select>
        </label>
        <label>
          <span className="mr-2 text-sm">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border rounded px-2 py-1"
          >
            <option value="priority">Priority</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
          </select>
        </label>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading tasks...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="task-list">
            {(provided) => (
              <table
                className="min-w-full bg-white rounded shadow"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Task</th>
                    <th className="px-4 py-2 text-left">Domain</th>
                    <th className="px-4 py-2 text-left">Phase</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Priority</th>
                    <th className="px-4 py-2 text-left">Dependencies</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 py-6">
                        No tasks found.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task, idx) => {
                      const blockers = getBlockers(task.id);
                      const blockedBy = getBlockedBy(task.id);
                      return (
                        <Draggable key={task.id} draggableId={task.id} index={idx}>
                          {(dragProvided, dragSnapshot) => (
                            <tr
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`border-t ${dragSnapshot.isDragging ? "bg-blue-50" : ""}`}
                            >
                              <td className="px-4 py-2">{task.name}</td>
                              <td className="px-4 py-2">
                                <span
                                  className="inline-block w-3 h-3 rounded-full mr-2"
                                  style={{
                                    background: domains.find((d) => d.id === task.domain_id)?.color || "#e5e7eb",
                                  }}
                                ></span>
                                {task.domain_name}
                              </td>
                              <td className="px-4 py-2">{task.phase_name || "-"}</td>
                              <td className="px-4 py-2 flex gap-2 items-center">
                                <span>{task.status}</span>
                                {/* Quick status actions */}
                                <button
                                  className="ml-2 px-2 py-1 rounded bg-green-100 text-green-700 text-xs"
                                  disabled={task.status === "completed"}
                                  onClick={async () => {
                                    await supabase
                                      .from("company_journey_steps")
                                      .update({ status: "completed" })
                                      .eq("id", task.id);
                                    setTasks((prev) =>
                                      prev.map((t) =>
                                        t.id === task.id ? { ...t, status: "completed" } : t
                                      )
                                    );
                                  }}
                                >
                                  Complete
                                </button>
                                <button
                                  className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs"
                                  disabled={task.status === "in_progress"}
                                  onClick={async () => {
                                    await supabase
                                      .from("company_journey_steps")
                                      .update({ status: "in_progress" })
                                      .eq("id", task.id);
                                    setTasks((prev) =>
                                      prev.map((t) =>
                                        t.id === task.id ? { ...t, status: "in_progress" } : t
                                      )
                                    );
                                  }}
                                >
                                  In Progress
                                </button>
                                <button
                                  className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs"
                                  disabled={task.status === "skipped"}
                                  onClick={async () => {
                                    await supabase
                                      .from("company_journey_steps")
                                      .update({ status: "skipped" })
                                      .eq("id", task.id);
                                    setTasks((prev) =>
                                      prev.map((t) =>
                                        t.id === task.id ? { ...t, status: "skipped" } : t
                                      )
                                    );
                                  }}
                                >
                                  Skip
                                </button>
                              </td>
                              <td className="px-4 py-2">{task.priority}</td>
                              <td className="px-4 py-2">
                                {(blockers.length > 0 || blockedBy.length > 0) ? (
                                  <button
                                    className="text-xs text-blue-600 underline"
                                    onClick={() => setShowDeps(showDeps === task.id ? null : task.id)}
                                  >
                                    {blockers.length > 0 && (
                                      <span title="Blocks other tasks">🔗</span>
                                    )}
                                    {blockedBy.length > 0 && (
                                      <span title="Blocked by other tasks">⛔</span>
                                    )}
                                    {showDeps === task.id && (
                                      <div className="absolute bg-white border rounded shadow p-2 mt-2 z-10">
                                        <div>
                                          <strong>Blocks:</strong>
                                          {blockers.length === 0 ? (
                                            <span className="ml-2 text-gray-400">None</span>
                                          ) : (
                                            <ul className="ml-2">
                                              {blockers.map((dep) => {
                                                const depTask = tasks.find((t) => t.id === dep.depends_on_task_id);
                                                return (
                                                  <li key={dep.id}>
                                                    {depTask ? depTask.name : dep.depends_on_task_id}
                                                  </li>
                                                );
                                              })}
                                            </ul>
                                          )}
                                        </div>
                                        <div className="mt-2">
                                          <strong>Blocked By:</strong>
                                          {blockedBy.length === 0 ? (
                                            <span className="ml-2 text-gray-400">None</span>
                                          ) : (
                                            <ul className="ml-2">
                                              {blockedBy.map((dep) => {
                                                const depTask = tasks.find((t) => t.id === dep.task_id);
                                                return (
                                                  <li key={dep.id}>
                                                    {depTask ? depTask.name : dep.task_id}
                                                  </li>
                                                );
                                              })}
                                            </ul>
                                          )}
                                        </div>
                                        <button
                                          className="mt-2 text-xs text-gray-500 underline"
                                          onClick={() => setShowDeps(null)}
                                        >
                                          Close
                                        </button>
                                      </div>
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      );
                    })
                  )}
                  {provided.placeholder}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default UnifiedTaskListPage;
