import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  CheckSquare,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  Plus,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AppLayout from "@/components/AppLayout";
import useUser from "@/utils/useUser";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: user } = useUser();
  const isAdmin = user?.role === "admin";
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (res.status === 401) {
        window.location.href = "/account/signin";
        return null;
      }
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: 2000,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-8 flex items-center justify-center flex-1">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-[#357AFF] border-t-transparent animate-spin"></div>
            <p className="text-gray-500 font-medium">
              Gathering your team's stats...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout>
        <div className="p-4 md:p-8 flex-1 overflow-auto">
          <div className="bg-white border border-red-100 rounded-3xl p-8 shadow-sm">
            <div className="h-12 w-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-5">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">
              Dashboard unavailable
            </h1>
            <p className="text-gray-500 font-medium">
              {error?.message || "We couldn't load your dashboard data."}
            </p>
            <a
              href="/account/signin"
              className="inline-flex mt-6 bg-[#357AFF] text-white px-5 py-3 rounded-2xl font-bold hover:bg-[#2E69DE] transition-colors"
            >
              Back to sign in
            </a>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { stats, statusStats, recentActivity } = data || {};
  const safeStatusStats = statusStats || [
    { name: "To Do", value: 0 },
    { name: "In Progress", value: 0 },
    { name: "Done", value: 0 },
  ];

  const COLORS = ["#357AFF", "#F59E0B", "#10B981"];

  const statCards = [
    {
      label: "Total Projects",
      value: stats?.totalProjects,
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "My Tasks",
      value: stats?.myTasks,
      icon: CheckSquare,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Overdue Tasks",
      value: stats?.overdueTasks,
      icon: Clock,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Completion Rate",
      value: `${stats?.completionPercentage}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-8 flex-1 overflow-auto">
        <header>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
          <h1 className="text-3xl font-black text-gray-900">
            {isAdmin ? "Admin Dashboard" : "Member Dashboard"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin
              ? "Manage projects, assign work, and monitor team progress."
              : "Track your assigned work and project activity."}
          </p>
            </div>
            <span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-black capitalize ${
              isAdmin
                ? "bg-blue-50 text-[#357AFF]"
                : "bg-emerald-50 text-emerald-600"
            }`}>
              {isAdmin ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              {user?.role || "member"}
            </span>
          </div>
        </header>

        {isAdmin ? (
          <section
            id="admin"
            className="grid gap-6 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm lg:grid-cols-3"
          >
            <div className="lg:col-span-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#357AFF]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900">
                Admin Console
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                Admins can create projects, add members, create tasks, and
                review delivery health.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
              <a
                href="/projects"
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4 font-black text-gray-800 transition-colors hover:border-[#357AFF] hover:bg-blue-50 hover:text-[#357AFF]"
              >
                <span className="flex items-center gap-3">
                  <Plus className="h-5 w-5" />
                  Create Project
                </span>
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="/projects"
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4 font-black text-gray-800 transition-colors hover:border-[#357AFF] hover:bg-blue-50 hover:text-[#357AFF]"
              >
                <span className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5" />
                  Manage Members
                </span>
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  Member Workspace
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                  Members focus on assigned tasks, comments, and project
                  updates. Project creation and member management are reserved
                  for admins.
                </p>
              </div>
              <a
                href="/my-tasks"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white transition-colors hover:bg-emerald-600"
              >
                View My Tasks
                <CheckSquare className="h-5 w-5" />
              </a>
            </div>
          </section>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bg} ${card.color} p-3 rounded-2xl`}>
                  <card.icon className="h-6 w-6" />
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium">{card.label}</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">
                {card.value}
              </h3>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#357AFF]" />
              Task Distribution
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={safeStatusStats}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                    {safeStatusStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Section */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              Recent Activity
            </h3>
            <div className="space-y-6">
              {recentActivity?.length > 0 ? (
                recentActivity.map((log, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="shrink-0 mt-1">
                      <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <Activity className="h-5 w-5 text-gray-400 group-hover:text-[#357AFF]" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 mb-0.5 truncate">
                        {log.message}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#357AFF] px-2 py-0.5 bg-blue-50 rounded-full">
                          {log.project_name}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                          {formatDistanceToNow(new Date(log.created_at))} ago
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium italic">
                    No recent activity found.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function BarChart3(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
