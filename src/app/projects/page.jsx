import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Briefcase,
  Calendar,
  Users,
  ChevronRight,
  Trash2,
  Edit2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import useUser from "@/utils/useUser";
import { format } from "date-fns";

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const isAdmin = user?.role === "admin";

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    refetchInterval: 2000,
  });

  const createProject = useMutation({
    mutationFn: async (newProject) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error || "Failed to create project");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully!");
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteProject = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
  });

  const filteredProjects = projects?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-8 flex-1 overflow-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Projects</h1>
            <p className="text-gray-500 mt-1">
              Manage and track all your team collaborations.
            </p>
          </div>
          {isAdmin ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#357AFF] text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#2E69DE] transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              New Project
            </button>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white px-5 py-3 text-sm font-bold text-gray-500">
              Member access: projects are created by admins.
            </div>
          )}
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#357AFF] focus:ring-4 focus:ring-blue-50 transition-all text-gray-900 font-medium"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-3xl border border-gray-100 h-64 animate-pulse"
              >
                <div className="h-8 w-3/4 bg-gray-100 rounded-lg mb-4"></div>
                <div className="h-20 w-full bg-gray-50 rounded-xl mb-4"></div>
                <div className="h-6 w-1/2 bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredProjects?.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      if (confirm("Delete project?"))
                        deleteProject.mutate(project.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Briefcase className="h-6 w-6 text-[#357AFF]" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2 truncate">
                    {project.name}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 min-h-[40px]">
                    {project.description || "No description provided."}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Calendar className="h-4 w-4" />
                    Due{" "}
                    {project.deadline
                      ? format(new Date(project.deadline), "MMM dd, yyyy")
                      : "No deadline"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Users className="h-4 w-4" />
                    Admin: {project.admin_name}
                  </div>
                </div>

                <a
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-2xl text-[#357AFF] font-bold hover:bg-blue-50 transition-colors group/btn"
                >
                  View Details
                  <ChevronRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-500 mb-8">
              {isAdmin
                ? "Ready to start something new with your team?"
                : "Ask an admin to add you to a project."}
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#357AFF] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#2E69DE] transition-all"
              >
                Create First Project
              </button>
            )}
          </div>
        )}

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900">
                  New Project
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  createProject.mutate(Object.fromEntries(formData));
                }}
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Project Name
                  </label>
                  <input
                    name="name"
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#357AFF] transition-all"
                    placeholder="e.g. Q3 Roadmap"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#357AFF] transition-all h-32"
                    placeholder="Briefly describe the project goals..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Deadline
                  </label>
                  <input
                    name="deadline"
                    type="date"
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#357AFF] transition-all"
                  />
                </div>
                <button
                  disabled={createProject.isPending}
                  className="w-full bg-[#357AFF] text-white py-4 rounded-2xl font-bold hover:bg-[#2E69DE] transition-all disabled:opacity-50"
                >
                  {createProject.isPending ? "Creating..." : "Create Project"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
