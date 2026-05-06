import { readFile } from "node:fs/promises";
import pg from "pg";

const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_PUBLIC_URL or DATABASE_URL is required.");
}

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("railway.internal")
    ? false
    : { rejectUnauthorized: false },
});

try {
  const schema = await readFile(new URL("../database.schema.sql", import.meta.url), "utf8");
  await pool.query(schema);

  const result = await pool.query(
    "select table_name from information_schema.tables where table_schema = 'public' order by table_name"
  );
  console.log(result.rows.map((row) => row.table_name).join(","));
} finally {
  await pool.end();
}
