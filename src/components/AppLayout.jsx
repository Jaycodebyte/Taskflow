import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  User,
  LogOut,
  Menu,
  X,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Toaster } from "sonner";
import useUser from "@/utils/useUser";
import useAuth from "@/utils/useAuth";

export default function AppLayout({ children }) {
  const { data: user, loading: userLoading } = useUser();
  const { signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync profile to database on load
  useEffect(() => {
    if (user && !userLoading) {
      fetch("/api/auth/profile", {
        method: "GET",
      }).catch(console.error);
    }
  }, [user, userLoading]);

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#357AFF] border-t-transparent"></div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Projects", icon: Briefcase, href: "/projects" },
    { name: "My Tasks", icon: CheckSquare, href: "/my-tasks" },
    ...(user?.role === "admin"
      ? [{ name: "Admin Console", icon: ShieldCheck, href: "/dashboard#admin" }]
      : []),
    { name: "Profile", icon: User, href: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Toaster position="top-right" richColors />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-[#357AFF] rounded-lg flex items-center justify-center">
            <CheckSquare className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">TaskFlow</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-0 z-40 bg-white border-r transition-transform md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        w-64 flex flex-col shrink-0
      `}
      >
        <div className="p-6 flex items-center gap-2">
          <div className="h-10 w-10 bg-[#357AFF] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <CheckSquare className="text-white h-6 w-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-gray-900">
            TaskFlow
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-[#357AFF] rounded-xl transition-all group font-medium"
            >
              <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
              {item.name}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t mt-auto">
          {user ? (
            <div className="px-4 py-3 mb-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold uppercase">
                {user.name?.[0] || user.email?.[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              </div>
              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ${
                user.role === "admin"
                  ? "bg-blue-50 text-[#357AFF]"
                  : "bg-emerald-50 text-emerald-600"
              }`}>
                {user.role || "member"}
              </span>
            </div>
          ) : (
            <a
              href="/account/signin"
              className="flex items-center gap-3 px-4 py-3 mb-4 bg-[#357AFF] text-white rounded-xl font-medium"
            >
              Sign In
            </a>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full rounded-xl transition-colors font-medium"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">{children}</main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
