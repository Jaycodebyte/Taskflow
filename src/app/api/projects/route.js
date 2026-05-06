import sql from "@/app/api/utils/sql";
import {
  getLocalProjects,
  useLocalStore,
} from "@/app/api/utils/localStore";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    if (useLocalStore()) {
      return Response.json(
        getLocalProjects().filter(
          (project) =>
            project.admin_id === userId ||
            project.members?.some((member) => member.id === userId),
        ),
      );
    }

    // Get projects where user is either admin or member
    const projects = await sql`
      SELECT p.*, u.name as admin_name 
      FROM projects p
      JOIN users u ON p.admin_id = u.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.admin_id = ${userId} OR pm.user_id = ${userId}
      GROUP BY p.id, u.name
      ORDER BY p.created_at DESC
    `;

    return Response.json(projects);
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
    const { name, description, deadline } = await request.json();

    if (useLocalStore()) {
      if (session.user.role !== "admin") {
        return Response.json(
          { error: "Only admins can create projects" },
          { status: 403 },
        );
      }

      const project = {
        id: Date.now(),
        name,
        description,
        deadline,
        admin_id: userId,
        admin_name: session.user.name || "Admin",
        members: [],
        created_at: new Date().toISOString(),
      };
      getLocalProjects().unshift(project);
      return Response.json(project);
    }

    const [currentUser] =
      await sql`SELECT role FROM users WHERE id = ${userId}`;

    if (currentUser?.role !== "admin") {
      return Response.json(
        { error: "Only admins can create projects" },
        { status: 403 },
      );
    }

    const [project] = await sql`
      INSERT INTO projects (name, description, deadline, admin_id)
      VALUES (${name}, ${description}, ${deadline}, ${userId})
      RETURNING *
    `;

    // Log activity
    await sql`
      INSERT INTO activity_logs (project_id, user_id, action, message)
      VALUES (${project.id}, ${userId}, 'project_created', ${`Project "${name}" was created.`})
    `;

    return Response.json(project);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
