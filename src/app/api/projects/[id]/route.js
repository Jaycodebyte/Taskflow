import sql from "../../utils/sql.js";
import {
  getLocalProjects,
  useLocalStore,
} from "../../utils/localStore.js";
import { auth } from "../../../../auth.js";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: projectId } = params;
    const userId = session.user.id;

    if (useLocalStore()) {
      const project = getLocalProjects().find(
        (item) => String(item.id) === String(projectId),
      );

      if (!project) {
        return Response.json({ error: "Project not found" }, { status: 404 });
      }

      const hasAccess =
        project.admin_id === userId ||
        project.members?.some((member) => member.id === userId);

      if (!hasAccess) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }

      return Response.json({ ...project, members: project.members || [] });
    }

    // Check if user has access
    const [access] = await sql`
      SELECT p.id 
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.id = ${projectId} AND (p.admin_id = ${userId} OR pm.user_id = ${userId})
    `;

    if (!access) return Response.json({ error: "Forbidden" }, { status: 403 });

    const [project] = await sql`
      SELECT p.*, u.name as admin_name 
      FROM projects p
      JOIN users u ON p.admin_id = u.id
      WHERE p.id = ${projectId}
    `;

    const members = await sql`
      SELECT u.id, u.name, u.email, u.role
      FROM users u
      JOIN project_members pm ON u.id = pm.user_id
      WHERE pm.project_id = ${projectId}
    `;

    return Response.json({ ...project, members });
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

    const { id: projectId } = params;
    const userId = session.user.id;
    const { name, description, deadline } = await request.json();

    if (useLocalStore()) {
      const project = getLocalProjects().find(
        (item) => String(item.id) === String(projectId),
      );

      if (!project || project.admin_id !== userId) {
        return Response.json(
          { error: "Forbidden or not found" },
          { status: 403 },
        );
      }

      Object.assign(project, {
        name: name || project.name,
        description: description || project.description,
        deadline: deadline || project.deadline,
      });

      return Response.json(project);
    }

    // Only admin can update
    const [project] = await sql`
      UPDATE projects 
      SET name = COALESCE(${name}, name),
          description = COALESCE(${description}, description),
          deadline = COALESCE(${deadline}, deadline)
      WHERE id = ${projectId} AND admin_id = ${userId}
      RETURNING *
    `;

    if (!project)
      return Response.json(
        { error: "Forbidden or not found" },
        { status: 403 },
      );

    return Response.json(project);
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

    const { id: projectId } = params;
    const userId = session.user.id;

    if (useLocalStore()) {
      const projects = getLocalProjects();
      const index = projects.findIndex(
        (item) => String(item.id) === String(projectId),
      );

      if (index === -1 || projects[index].admin_id !== userId) {
        return Response.json(
          { error: "Forbidden or not found" },
          { status: 403 },
        );
      }

      projects.splice(index, 1);
      return Response.json({ success: true });
    }

    const [deleted] = await sql`
      DELETE FROM projects 
      WHERE id = ${projectId} AND admin_id = ${userId}
      RETURNING id
    `;

    if (!deleted)
      return Response.json(
        { error: "Forbidden or not found" },
        { status: 403 },
      );

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
