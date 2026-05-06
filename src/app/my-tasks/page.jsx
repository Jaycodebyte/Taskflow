import { useQuery } from "@tanstack/react-query";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Flag,
  Calendar,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import useUser from "@/utils/useUser";
import { format } from "date-fns";

export default function MyTasksPage() {
  const { data: user } = useUser();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["my-tasks", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch(`/api/tasks?assignedTo=${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-8 flex-1 overflow-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">My Tasks</h1>
            <p className="text-gray-500 mt-1">
              Focus on what's assigned to you.
            </p>
          </div>
        </header>

        {/* Task List */}
        <div className="space-y-4">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-3xl border border-gray-100 h-24 animate-pulse"
              ></div>
            ))
          ) : tasks?.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-6 group"
              >
                <div className="flex items-center gap-6 min-w-0 flex-1">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      task.status === "done"
                        ? "bg-emerald-50 text-emerald-500"
                        : "bg-blue-50 text-[#357AFF]"
                    }`}
                  >
                    <CheckSquare className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`font-bold text-lg text-gray-900 truncate ${task.status === "done" ? "line-through text-gray-400" : ""}`}
                    >
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1 font-medium">
                        <Flag
                          className={`h-4 w-4 ${
                            task.priority === "high"
                              ? "text-rose-500"
                              : task.priority === "medium"
                                ? "text-amber-500"
                                : "text-blue-500"
                          }`}
                        />
                        <span className="capitalize">
                          {task.priority} Priority
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-medium">
                        <Calendar className="h-4 w-4" />
                        Due{" "}
                        {task.due_date
                          ? format(new Date(task.due_date), "MMM dd")
                          : "No Date"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${
                      task.status === "todo"
                        ? "bg-slate-50 text-slate-600 border-slate-100"
                        : task.status === "in_progress"
                          ? "bg-amber-50 text-amber-600 border-amber-100"
                          : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckSquare className="h-10 w-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Clean slate!
              </h3>
              <p className="text-gray-500">
                You don't have any tasks assigned to you right now.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
