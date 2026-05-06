import sql from "../../utils/sql.js";
import { auth } from "../../../../auth.js";

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: taskId } = params;
    const userId = session.user.id;
    const { status } = await request.json();

    // Check if user is assigned to task or is admin of project
    const [taskInfo] = await sql`
      SELECT t.*, p.admin_id 
      FROM tasks t 
      JOIN projects p ON t.project_id = p.id 
      WHERE t.id = ${taskId}
    `;

    if (!taskInfo)
      return Response.json({ error: "Task not found" }, { status: 404 });

    const canUpdate =
      taskInfo.assigned_to === userId || taskInfo.admin_id === userId;

    if (!canUpdate)
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const [updatedTask] = await sql`
      UPDATE tasks 
      SET status = ${status}
      WHERE id = ${taskId}
      RETURNING *
    `;

    await sql`
      INSERT INTO activity_logs (project_id, user_id, action, message)
      VALUES (${taskInfo.project_id}, ${userId}, 'task_status_updated', ${`Task "${taskInfo.title}" status changed to ${status}.`})
    `;

    return Response.json(updatedTask);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: taskId } = params;
    const userId = session.user.id;
    const { title, description, due_date, priority, assigned_to } =
      await request.json();

    // Only project admin or creator can edit task details fully
    const [taskInfo] = await sql`
      SELECT t.*, p.admin_id 
      FROM tasks t 
      JOIN projects p ON t.project_id = p.id 
      WHERE t.id = ${taskId}
    `;

    if (!taskInfo)
      return Response.json({ error: "Task not found" }, { status: 404 });

    if (taskInfo.admin_id !== userId && taskInfo.created_by !== userId) {
      return Response.json(
        { error: "Only project admins or task creators can edit task details" },
        { status: 403 },
      );
    }

    const [updatedTask] = await sql`
      UPDATE tasks 
      SET title = COALESCE(${title}, title),
          description = COALESCE(${description}, description),
          due_date = COALESCE(${due_date}, due_date),
          priority = COALESCE(${priority}, priority),
          assigned_to = COALESCE(${assigned_to}, assigned_to)
      WHERE id = ${taskId}
      RETURNING *
    `;

    return Response.json(updatedTask);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: taskId } = params;
    const userId = session.user.id;

    const [taskInfo] = await sql`
      SELECT t.*, p.admin_id 
      FROM tasks t 
      JOIN projects p ON t.project_id = p.id 
      WHERE t.id = ${taskId}
    `;

    if (!taskInfo)
      return Response.json({ error: "Task not found" }, { status: 404 });

    if (taskInfo.admin_id !== userId && taskInfo.created_by !== userId) {
      return Response.json(
        { error: "Only project admins or task creators can delete tasks" },
        { status: 403 },
      );
    }

    await sql`DELETE FROM tasks WHERE id = ${taskId}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
