import { useQuery } from "@tanstack/react-query";
import {
  User,
  Mail,
  Shield,
  Calendar,
  CheckSquare,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import useUser from "@/utils/useUser";
import { format } from "date-fns";

export default function ProfilePage() {
  const { data: user } = useUser();

  const { data: stats } = useQuery({
    queryKey: ["profile-stats", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  if (!user) return null;

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-8 flex-1 overflow-auto">
        <header>
          <h1 className="text-3xl font-black text-gray-900">Profile</h1>
          <p className="text-gray-500 mt-1">
            Manage your account and view your performance.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
              <div className="h-24 w-24 bg-gradient-to-br from-[#357AFF] to-indigo-600 rounded-full flex items-center justify-center text-3xl text-white font-black mx-auto mb-6 shadow-xl shadow-blue-100">
                {user.name?.[0] || user.email?.[0]}
              </div>
              <h3 className="text-2xl font-black text-gray-900">
                {user.name || "Team Member"}
              </h3>
              <p className="text-gray-500 font-medium mb-8">{user.email}</p>

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <Shield className="h-5 w-5 text-[#357AFF]" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Role
                    </p>
                    <p className="text-sm font-bold text-gray-700 capitalize">
                      {user.role || "Member"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <Calendar className="h-5 w-5 text-[#357AFF]" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Joined
                    </p>
                    <p className="text-sm font-bold text-gray-700">May 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
                <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#357AFF]">
                  <Briefcase className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">
                    Collaborating in
                  </p>
                  <h4 className="text-3xl font-black text-gray-900">
                    {stats?.stats?.totalProjects || 0} Projects
                  </h4>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
                <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                  <CheckSquare className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">Completed</p>
                  <h4 className="text-3xl font-black text-gray-900">
                    {stats?.stats?.completedTasks || 0} Tasks
                  </h4>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 mb-8">
                Productivity Stats
              </h3>
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-700">
                      Overall Task Completion
                    </span>
                    <span className="text-sm font-black text-[#357AFF]">
                      {stats?.stats?.completionPercentage || 0}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#357AFF] transition-all duration-1000"
                      style={{
                        width: `${stats?.stats?.completionPercentage || 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-6 pt-4">
                  <div className="text-center p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-3xl font-black text-gray-900 mb-1">
                      {stats?.stats?.myTasks || 0}
                    </p>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Assigned
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-3xl font-black text-rose-500 mb-1">
                      {stats?.stats?.overdueTasks || 0}
                    </p>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Overdue
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-3xl font-black text-emerald-500 mb-1">
                      {stats?.stats?.completedTasks || 0}
                    </p>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Done
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
