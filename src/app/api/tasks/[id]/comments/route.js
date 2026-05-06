import sql from "../../../utils/sql.js";
import { auth } from "../../../../../auth.js";

export async function GET(request, { params }) {
  try {
    const { id: taskId } = params;
    const comments = await sql`
      SELECT c.*, u.name as user_name 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ${taskId}
      ORDER BY c.created_at ASC
    `;
    return Response.json(comments);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: taskId } = params;
    const userId = session.user.id;
    const { content } = await request.json();

    const [comment] = await sql`
      INSERT INTO comments (task_id, user_id, content)
      VALUES (${taskId}, ${userId}, ${content})
      RETURNING *
    `;

    return Response.json(comment);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
