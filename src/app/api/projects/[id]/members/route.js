import sql from "../../../utils/sql.js";
import {
  getLocalProjects,
  getLocalUsers,
  useLocalStore,
} from "../../../utils/localStore.js";
import { auth } from "../../../../../auth.js";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: projectId } = params;
    const userId = session.user.id;
    const { email } = await request.json();

    if (useLocalStore()) {
      const project = getLocalProjects().find(
        (item) => String(item.id) === String(projectId),
      );

      if (!project || project.admin_id !== userId) {
        return Response.json(
          { error: "Only project admins can add members" },
          { status: 403 },
        );
      }

      const existingUser = [...getLocalUsers().values()].find(
        (user) => user.email === email,
      );

      if (!existingUser) {
        return Response.json(
          { error: "User not found. They must sign up first." },
          { status: 404 },
        );
      }

      const member = {
        id: existingUser.id,
        name: existingUser.name || email.split("@")[0],
        email: existingUser.email,
        role: existingUser.role || "member",
      };

      project.members ||= [];
      if (!project.members.some((item) => item.email === email)) {
        project.members.push(member);
      }

      return Response.json({ success: true, user: member });
    }

    // Check if current user is admin
    const [project] = await sql`
      SELECT admin_id FROM projects WHERE id = ${projectId}
    `;

    if (!project || project.admin_id !== userId) {
      return Response.json(
        { error: "Only project admins can add members" },
        { status: 403 },
      );
    }

    // Find user by email
    const [userToAdd] = await sql`
      SELECT id, name FROM users WHERE email = ${email}
    `;

    if (!userToAdd) {
      return Response.json(
        { error: "User not found. They must sign up first." },
        { status: 404 },
      );
    }

    // Add to project
    await sql`
      INSERT INTO project_members (project_id, user_id)
      VALUES (${projectId}, ${userToAdd.id})
      ON CONFLICT DO NOTHING
    `;

    await sql`
      INSERT INTO activity_logs (project_id, user_id, action, message)
      VALUES (${projectId}, ${userId}, 'member_added', ${`User ${userToAdd.name} was added to the project.`})
    `;

    return Response.json({ success: true, user: userToAdd });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
