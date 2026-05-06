import sql from "../../utils/sql.js";
import { useLocalStore } from "../../utils/localStore.js";
import { auth } from "../../../../auth.js";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (useLocalStore()) {
      return Response.json({
        id: session.user.id,
        name: session.user.name || "User",
        email: session.user.email,
        role: session.user.role || "member",
      });
    }

    const userId = session.user.id;
    const users =
      await sql`SELECT id, name, email, role FROM users WHERE id = ${userId}`;
    const user = users[0];

    if (!user) {
      // If user doesn't exist in our custom users table yet, create them from session info
      // This handles the first-time login case
      const newUser = await sql`
        INSERT INTO users (id, name, email, password_hash, role)
        VALUES (${userId}, ${session.user.name || "User"}, ${session.user.email}, 'EXTERNAL_AUTH', 'member')
        RETURNING id, name, email, role
      `;
      return Response.json(newUser[0]);
    }

    return Response.json(user);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { name, role } = await request.json();
    const safeRole = ["admin", "member"].includes(role) ? role : null;

    if (useLocalStore()) {
      return Response.json({
        id: userId,
        name: name || session.user.name || "User",
        email: session.user.email,
        role: safeRole || "member",
      });
    }

    const existingUser =
      await sql`SELECT id FROM users WHERE id = ${userId}`;

    if (!existingUser[0]) {
      const [newUser] = await sql`
        INSERT INTO users (id, name, email, password_hash, role)
        VALUES (
          ${userId},
          ${name || session.user.name || "User"},
          ${session.user.email},
          'EXTERNAL_AUTH',
          ${safeRole || "member"}
        )
        RETURNING id, name, email, role
      `;

      return Response.json(newUser);
    }

    const [updatedUser] = await sql`
      UPDATE users 
      SET name = COALESCE(${name || null}, name), 
          role = COALESCE(${safeRole}, role)
      WHERE id = ${userId}
      RETURNING id, name, email, role
    `;

    return Response.json(updatedUser);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
