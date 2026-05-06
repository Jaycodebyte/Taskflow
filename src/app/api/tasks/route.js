import sql from "../utils/sql.js";
import {
  getLocalTasks,
  useLocalStore,
} from "../utils/localStore.js";
import { auth } from "../../../auth.js";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    if (useLocalStore()) {
      const projectId = new URL(request.url).searchParams.get("projectId");
      return Response.json(
        getLocalTasks().filter(
          (task) => !projectId || String(task.project_id) === String(projectId),
        ),
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const assignedTo = searchParams.get("assignedTo");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    let query =
      "SELECT t.*, u.name as assigned_to_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE 1=1";
    const params = [];

    if (projectId) {
      params.push(projectId);
      query += ` AND project_id = $${params.length}`;
    }
    if (assignedTo) {
      params.push(assignedTo);
      query += ` AND assigned_to = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (priority) {
      params.push(priority);
      query += ` AND priority = $${params.length}`;
    }

    query += " ORDER BY created_at DESC";

    const tasks = await sql(query, params);
    return Response.json(tasks);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const {
      title,
      description,
      due_date,
      priority,
      status,
      project_id,
      assigned_to,
    } = await request.json();

    if (useLocalStore()) {
      const task = {
        id: Date.now(),
        title,
        description,
        due_date,
        priority,
        status: status || "todo",
        project_id,
        assigned_to,
        assigned_to_name: assigned_to ? "Local Member" : null,
        created_by: session.user.id,
        created_at: new Date().toISOString(),
      };
      getLocalTasks().unshift(task);
      return Response.json(task);
    }

    // Check if user is admin of the project
    const [project] = await sql`
      SELECT admin_id FROM projects WHERE id = ${project_id}
    `;

    if (!project || project.admin_id !== userId) {
      return Response.json(
        { error: "Only project admins can create tasks" },
        { status: 403 },
      );
    }

    const [task] = await sql`
      INSERT INTO tasks (title, description, due_date, priority, status, project_id, assigned_to, created_by)
      VALUES (${title}, ${description}, ${due_date}, ${priority}, ${status}, ${project_id}, ${assigned_to}, ${userId})
      RETURNING *
    `;

    await sql`
      INSERT INTO activity_logs (project_id, user_id, action, message)
      VALUES (${project_id}, ${userId}, 'task_created', ${`Task "${title}" was created.`})
    `;

    return Response.json(task);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
