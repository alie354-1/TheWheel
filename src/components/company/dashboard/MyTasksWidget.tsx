import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase'; // Assuming direct Supabase access for tasks
import { useAuthStore } from '../../../lib/store';
import { ListChecks, Plus } from 'lucide-react'; // Using ListChecks icon

// Basic Task interface (adjust based on actual tasks table structure)
interface Task {
  id: string;
  title: string;
  status: string; // e.g., 'pending', 'in_progress', 'completed'
  due_date?: string;
}

interface MyTasksWidgetProps {
  companyId: string;
}

const MyTasksWidget: React.FC<MyTasksWidgetProps> = ({ companyId }) => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyTasks = async () => {
      if (!companyId || !user) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch tasks assigned to the user for this company, limit for summary view
        const { data, error: taskError } = await supabase
          .from('tasks')
          .select('id, title, status, due_date')
          .eq('company_id', companyId)
          .eq('user_id', user.id) // Filter by current user
          .neq('status', 'completed') // Exclude completed tasks for summary
          .order('due_date', { ascending: true, nullsFirst: false }) // Show soonest due first
          .limit(5); // Limit to 5 tasks for the widget

        if (taskError) throw taskError;

        setTasks(data || []);
      } catch (err: any) {
        console.error("Error fetching tasks for widget:", err);
        setError(err.message || "Failed to load tasks");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTasks();
  }, [companyId, user]);

  const overdueTasks = tasks.filter(task => task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed').length; // Ensure overdue isn't completed

  return (
    // Use shadow-lg for consistency, add h-full for grid alignment if needed
    <div className="card bg-base-100 shadow-lg h-full">
       {/* Adjusted padding */}
      <div className="card-body p-5">
        <h3 className="card-title text-lg font-semibold mb-3"> {/* Increased size/margin */}
           <ListChecks className="w-5 h-5 mr-1 text-primary" /> {/* Added color */}
           My Tasks
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-6"> {/* Increased padding */}
            <span className="loading loading-spinner loading-md"></span> {/* Larger spinner */}
          </div>
        ) : error ? (
           <div className="alert alert-error text-sm p-3"> {/* Use alert for error */}
             <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <span>{error}</span>
          </div>
        ) : (
          <div className="flex flex-col justify-between flex-grow"> {/* Use flex to push buttons down */}
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center flex-grow flex items-center justify-center">No pending tasks found.</p> // Centered text
            ) : (
              <div>
                {overdueTasks > 0 && (
                  <p className="text-sm text-error font-semibold mb-2">{overdueTasks} task(s) overdue!</p>
                )}
                {/* Improved list styling */}
                <ul className="space-y-2 text-sm max-h-40 overflow-y-auto mb-4 pr-2"> {/* Increased max-height, added padding-right */}
                  {tasks.map(task => (
                    <li key={task.id} className="flex items-center justify-between gap-2 border-b border-base-200 pb-1 last:border-b-0">
                      {/* TODO: Link to task detail page or task tab */}
                      <span className="truncate hover:text-primary cursor-pointer flex-1" title={task.title} onClick={() => alert(`View Task: ${task.title} (TODO)`)}>
                        {task.title}
                      </span>
                      {task.due_date && (
                        <span className={`badge badge-outline badge-sm ${new Date(task.due_date) < new Date() ? 'badge-error' : 'border-gray-300 text-gray-500'}`}>
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="card-actions justify-between items-center mt-4"> {/* Increased margin */}
               {/* TODO: Link to the main Tasks tab */}
               <button className="btn btn-sm btn-primary btn-outline" onClick={() => alert('Navigate to Tasks Tab (TODO)')}>
                 View All Tasks
               </button>
               {/* TODO: Implement Quick Add Task functionality */}
               <button className="btn btn-sm btn-primary gap-1" title="Add New Task" onClick={() => alert('Quick Add Task (TODO)')}> {/* Removed btn-circle for text, added gap */}
                 <Plus className="w-4 h-4" /> Add Task
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasksWidget;
