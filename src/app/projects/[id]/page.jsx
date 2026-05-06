import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Settings,
  Users,
  CheckSquare,
  Layout,
  List,
  MoreVertical,
  Calendar,
  Flag,
  Trash2,
  X,
  UserPlus,
  MessageSquare,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import { format } from "date-fns";

export default function ProjectDetailsPage({ params }) {
  const { id } = params;
  const [view, setView] = useState("board"); // 'list' or 'board'
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // Added for task details
  const queryClient = useQueryClient();

  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
  } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    refetchInterval: 2000,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?projectId=${id}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    refetchInterval: 2000,
  });

  const createTask = useMutation({
    mutationFn: async (newTask) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTask, project_id: id }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create task");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      toast.success("Task created!");
      setIsTaskModalOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", id] }),
  });

  const addMember = useMutation({
    mutationFn: async (email) => {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add member");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Member added!");
      setIsMemberModalOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = [
    { id: "todo", name: "To Do", color: "bg-slate-500" },
    { id: "in_progress", name: "In Progress", color: "bg-amber-500" },
    { id: "done", name: "Done", color: "bg-emerald-500" },
  ];

  if (projectLoading)
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-[#357AFF] border-t-transparent rounded-full"></div>
        </div>
      </AppLayout>
    );

  if (projectError || !project)
    return (
      <AppLayout>
        <div className="flex-1 p-8">
          <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-black text-gray-900">
              Project unavailable
            </h1>
            <p className="mt-2 font-medium text-gray-500">
              This project could not be loaded. It may not exist in the current
              local session.
            </p>
            <a
              href="/projects"
              className="mt-6 inline-flex rounded-2xl bg-[#357AFF] px-5 py-3 font-bold text-white hover:bg-[#2E69DE]"
            >
              Back to projects
            </a>
          </div>
        </div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-8 flex-1 flex flex-col min-h-0">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <a
                href="/projects"
                className="text-gray-400 hover:text-gray-600 font-bold transition-colors"
              >
                Projects
              </a>
              <span className="text-gray-300">/</span>
              <h1 className="text-3xl font-black text-gray-900">
                {project.name}
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Users className="h-4 w-4" />
                {project.members?.length || 0} Members
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Calendar className="h-4 w-4" />
                Due{" "}
                {project.deadline
                  ? format(new Date(project.deadline), "MMM dd, yyyy")
                  : "No deadline"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="p-3 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
              title="Add Member"
            >
              <UserPlus className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="bg-[#357AFF] text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#2E69DE] transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              New Task
            </button>
          </div>
        </header>

        {/* View Toggle */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => setView("board")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === "board" ? "bg-white shadow-sm text-[#357AFF]" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Layout className="h-4 w-4" />
              Kanban Board
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === "list" ? "bg-white shadow-sm text-[#357AFF]" : "text-gray-500 hover:text-gray-700"}`}
            >
              <List className="h-4 w-4" />
              List View
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        {view === "board" && (
          <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max h-full">
              {columns.map((col) => (
                <div key={col.id} className="w-[350px] flex flex-col gap-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${col.color}`}
                      ></div>
                      <h3 className="font-black text-gray-900 uppercase tracking-wider text-sm">
                        {col.name}
                      </h3>
                      <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-0.5 rounded-full font-black">
                        {tasks?.filter((t) => t.status === col.id).length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 bg-gray-50/50 p-3 rounded-[2rem] border border-gray-100/50 overflow-y-auto">
                    {tasks
                      ?.filter((t) => t.status === col.id)
                      .map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={() => setSelectedTask(task)}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="flex-1 overflow-auto">
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                      Task
                    </th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                      Assigned To
                    </th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tasks?.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[250px]">
                          {task.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] text-indigo-600 font-black">
                            {task.assigned_to_name?.[0] || "?"}
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            {task.assigned_to_name || "Unassigned"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-[#357AFF] transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals */}
        {isTaskModalOpen && (
          <Modal onClose={() => setIsTaskModalOpen(false)} title="New Task">
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                createTask.mutate(Object.fromEntries(formData));
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Task Title
                </label>
                <input
                  name="title"
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#357AFF]"
                  placeholder="What needs to be done?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Priority
                  </label>
                  <select
                    name="priority"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#357AFF]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#357AFF]"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Due Date
                </label>
                <input
                  name="due_date"
                  type="date"
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#357AFF]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Assign To (User ID or Email placeholder)
                </label>
                <select
                  name="assigned_to"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#357AFF]"
                >
                  <option value="">Unassigned</option>
                  {project.members?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                disabled={createTask.isPending}
                className="w-full bg-[#357AFF] text-white py-4 rounded-2xl font-bold hover:bg-[#2E69DE] transition-all disabled:opacity-50"
              >
                {createTask.isPending ? "Creating..." : "Create Task"}
              </button>
            </form>
          </Modal>
        )}

        {isMemberModalOpen && (
          <Modal
            onClose={() => setIsMemberModalOpen(false)}
            title="Add Team Member"
          >
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                addMember.mutate(formData.get("email"));
              }}
            >
              <p className="text-sm text-gray-500">
                Invite people to collaborate on this project. They must have an
                account first.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#357AFF]"
                  placeholder="colleague@example.com"
                />
              </div>
              <button
                disabled={addMember.isPending}
                className="w-full bg-[#357AFF] text-white py-4 rounded-2xl font-bold hover:bg-[#2E69DE] transition-all disabled:opacity-50"
              >
                {addMember.isPending ? "Inviting..." : "Add to Team"}
              </button>
            </form>
          </Modal>
        )}

        {/* Task Detail Modal */}
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            projectId={id}
          />
        )}
      </div>
    </AppLayout>
  );
}

function TaskDetailModal({ task, onClose, projectId }) {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", task.id],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${task.id}/comments`);
      return res.json();
    },
  });

  const addComment = useMutation({
    mutationFn: async (content) => {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", task.id] });
      setCommentText("");
    },
  });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 border-b flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </div>
            <h2 className="text-3xl font-black text-gray-900">{task.title}</h2>
            <p className="text-gray-500 mt-2 font-medium">
              {task.description || "No description provided."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#357AFF]" />
            Comments
          </h3>

          <div className="space-y-6">
            {comments?.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black shrink-0 uppercase">
                    {comment.user_name?.[0]}
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900 text-sm">
                        {comment.user_name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 italic py-8">
                No comments yet. Start the conversation!
              </p>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-white">
          <form
            className="relative"
            onSubmit={(e) => {
              e.preventDefault();
              if (commentText.trim()) addComment.mutate(commentText);
            }}
          >
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#357AFF] focus:ring-4 focus:ring-blue-50 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || addComment.isPending}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[#357AFF] text-white rounded-xl hover:bg-[#2E69DE] transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-blue-100"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <PriorityBadge priority={task.priority} />
        <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="h-4 w-4 text-gray-400" />
        </button>
      </div>
      <h4 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-[#357AFF] transition-colors">
        {task.title}
      </h4>
      <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
        {task.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <Calendar className="h-3 w-3" />
          {task.due_date
            ? format(new Date(task.due_date), "MMM dd")
            : "No Date"}
        </div>
        <div
          className="h-8 w-8 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-gray-600 font-black shadow-sm"
          title={task.assigned_to_name}
        >
          {task.assigned_to_name?.[0] || "?"}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    todo: "bg-slate-50 text-slate-600 border-slate-100",
    in_progress: "bg-amber-50 text-amber-600 border-amber-100",
    done: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${styles[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    low: "text-blue-500 bg-blue-50",
    medium: "text-amber-500 bg-amber-50",
    high: "text-rose-500 bg-rose-50",
  };
  return (
    <div
      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${styles[priority]}`}
    >
      <Flag className="h-3 w-3 fill-current" />
      {priority}
    </div>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
