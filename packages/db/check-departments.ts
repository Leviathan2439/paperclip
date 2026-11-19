import postgres from "postgres";
import { resolveMigrationConnection } from "./src/migration-runtime.js";

async function main() {
  const connection = await resolveMigrationConnection();
  const sql = postgres(connection.connectionString, { max: 1 });

  try {
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'departments',
          'department_responsibilities'
        )
      ORDER BY table_name
    `;

    console.log("Department tables:", tables.map(t => t.table_name));
  } finally {
    await sql.end();
    await connection.stop();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
