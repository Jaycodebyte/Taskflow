import pg from "pg";

const NullishQueryFunction = () => {
  throw new Error(
    "No database connection string was provided. Perhaps process.env.DATABASE_URL has not been set"
  );
};
NullishQueryFunction.transaction = () => {
  throw new Error(
    "No database connection string was provided. Perhaps process.env.DATABASE_URL has not been set"
  );
};

const pool = process.env.DATABASE_URL
  ? new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("railway.internal")
        ? false
        : { rejectUnauthorized: false },
    })
  : null;

function buildTaggedQuery(strings, values) {
  return strings.reduce((query, chunk, index) => {
    return `${query}${chunk}${index < values.length ? `$${index + 1}` : ""}`;
  }, "");
}

const sql = pool
  ? async (queryOrStrings, ...values) => {
      if (Array.isArray(queryOrStrings) && "raw" in queryOrStrings) {
        const query = buildTaggedQuery(queryOrStrings, values);
        const result = await pool.query(query, values);
        return result.rows;
      }

      const result = await pool.query(queryOrStrings, values[0] || []);
      return result.rows;
    }
  : NullishQueryFunction;

export default sql;
