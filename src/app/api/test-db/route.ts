import { NextResponse } from "next/server";
import sql from "mssql";

const dbConfig = {
  user: process.env.MSSQL_USER!,
  password: process.env.MSSQL_PASSWORD!,
  server: "localhost",
  database: process.env.MSSQL_DATABASE!,
  options: {
    encrypt: true, // Use SSL
    trustServerCertificate: true, // Trust the self-signed certificate
  },
  port: parseInt(process.env.MSSQL_PORT || "1433"),
};

export async function GET() {
  let pool: sql.ConnectionPool | null = null; // Initialize the pool

  try {
    // Create a connection pool
    pool = await sql.connect(dbConfig);

    // Test the connection with a simple query
    await pool.request().query("SELECT 1 AS isConnected");

    return NextResponse.json(
      { message: "Database connected successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Database Connection Failed:", error.message);

    return NextResponse.json(
      { error: "Database connection failed", details: error.message },
      { status: 500 }
    );
  } finally {
    // Close the pool connection if it was created
    if (pool) {
      await pool.close();
    }
  }
}
