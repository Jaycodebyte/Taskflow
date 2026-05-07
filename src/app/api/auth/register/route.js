import { hash } from "argon2";
import sql from "../../utils/sql.js";

export async function POST(request) {
  try {
    const { email, password, name, role } = await request.json();
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const safeName =
      typeof name === "string" && name.trim().length > 0
        ? name.trim()
        : "User";
    const safeRole = ["admin", "member"].includes(role) ? role : null;

    if (!normalizedEmail || !password || !safeRole) {
      return Response.json({ error: "Email, password, and role are required." }, { status: 400 });
    }

    const passwordHash = await hash(password);

    const [authUser] = await sql`
      INSERT INTO auth_users (email, name, "emailVerified", image)
      VALUES (${normalizedEmail}, ${safeName}, NULL, NULL)
      ON CONFLICT (email)
      DO UPDATE SET name = EXCLUDED.name
      RETURNING id, email, name
    `;

    await sql`
      INSERT INTO auth_accounts
        ("userId", provider, type, "providerAccountId", password)
      VALUES
        (${authUser.id}, 'credentials', 'credentials', ${authUser.id}, ${passwordHash})
      ON CONFLICT (provider, "providerAccountId")
      DO UPDATE SET password = EXCLUDED.password
    `;

    const [profile] = await sql`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (${authUser.id}, ${safeName}, ${normalizedEmail}, 'EXTERNAL_AUTH', ${safeRole})
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role
      RETURNING id, name, email, role
    `;

    return Response.json(profile);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Unable to create account." }, { status: 500 });
  }
}
