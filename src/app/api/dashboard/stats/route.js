import sql from "../../utils/sql.js";
import {
  getLocalProjects,
  getLocalTasks,
  useLocalStore,
} from "../../utils/localStore.js";
import { auth } from "../../../../auth.js";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    if (useLocalStore()) {
      const projects = getLocalProjects().filter(
        (project) =>
          project.admin_id === userId ||
          project.members?.some((member) => member.id === userId),
      );
      const projectIds = new Set(projects.map((project) => String(project.id)));
      const tasks = getLocalTasks().filter(
        (task) =>
          projectIds.has(String(task.project_id)) || task.assigned_to === userId,
      );
      const myTasks = tasks.filter((task) => task.assigned_to === userId);
      const completedTasks = tasks.filter((task) => task.status === "done");
      const todoTasks = tasks.filter((task) => task.status === "todo");
      const inProgressTasks = tasks.filter(
        (task) => task.status === "in_progress",
      );
      const overdueTasks = tasks.filter(
        (task) =>
          task.due_date &&
          new Date(task.due_date) < new Date() &&
          task.status !== "done",
      );

      return Response.json({
        stats: {
          totalProjects: projects.length,
          myTasks: myTasks.length,
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          overdueTasks: overdueTasks.length,
          completionPercentage:
            tasks.length > 0
              ? Math.round((completedTasks.length / tasks.length) * 100)
              : 0,
        },
        statusStats: [
          { name: "To Do", value: todoTasks.length },
          { name: "In Progress", value: inProgressTasks.length },
          { name: "Done", value: completedTasks.length },
        ],
        recentActivity: projects.slice(0, 10).map((project) => ({
          id: project.id,
          message: `Project "${project.name}" is available.`,
          project_name: project.name,
          created_at: project.created_at || new Date().toISOString(),
        })),
      });
    }

    const [stats] = await sql`
      SELECT 
        (SELECT COUNT(*) FROM projects WHERE admin_id = ${userId} OR id IN (SELECT project_id FROM project_members WHERE user_id = ${userId})) as total_projects,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = ${userId}) as my_tasks,
        (SELECT COUNT(*) FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.admin_id = ${userId} OR t.assigned_to = ${userId}) as total_tasks,
        (SELECT COUNT(*) FROM tasks t JOIN projects p ON t.project_id = p.id WHERE (p.admin_id = ${userId} OR t.assigned_to = ${userId}) AND t.status = 'done') as completed_tasks,
        (SELECT COUNT(*) FROM tasks t JOIN projects p ON t.project_id = p.id WHERE (p.admin_id = ${userId} OR t.assigned_to = ${userId}) AND t.status = 'todo') as todo_tasks,
        (SELECT COUNT(*) FROM tasks t JOIN projects p ON t.project_id = p.id WHERE (p.admin_id = ${userId} OR t.assigned_to = ${userId}) AND t.status = 'in_progress') as in_progress_tasks,
        (SELECT COUNT(*) FROM tasks t JOIN projects p ON t.project_id = p.id WHERE (p.admin_id = ${userId} OR t.assigned_to = ${userId}) AND t.due_date < NOW() AND t.status != 'done') as overdue_tasks
    `;

    const statusStats = [
      { name: "To Do", value: parseInt(stats.todo_tasks) || 0 },
      { name: "In Progress", value: parseInt(stats.in_progress_tasks) || 0 },
      { name: "Done", value: parseInt(stats.completed_tasks) || 0 },
    ];

    const recentActivity = await sql`
      SELECT al.*, u.name as user_name, p.name as project_name
      FROM activity_logs al
      JOIN users u ON al.user_id = u.id
      JOIN projects p ON al.project_id = p.id
      WHERE al.project_id IN (
        SELECT id FROM projects WHERE admin_id = ${userId}
        UNION
        SELECT project_id FROM project_members WHERE user_id = ${userId}
      )
      ORDER BY al.created_at DESC
      LIMIT 10
    `;

    return Response.json({
      stats: {
        totalProjects: parseInt(stats.total_projects),
        myTasks: parseInt(stats.my_tasks),
        totalTasks: parseInt(stats.total_tasks),
        completedTasks: parseInt(stats.completed_tasks),
        overdueTasks: parseInt(stats.overdue_tasks),
        completionPercentage:
          stats.total_tasks > 0
            ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
            : 0,
      },
      statusStats,
      recentActivity,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
