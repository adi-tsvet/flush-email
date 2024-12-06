import { NextResponse } from "next/server";
import sql from "mssql"; // Use the mssql library
import db from "../../../../database/db"; // Connection pool
import { authConfig } from "@/app/api/auth/authConfig";
import { getServerSession } from "next-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyName = searchParams.get("companyName");

  try {
    const pool = await db; // Ensure the database connection is ready

    if (companyName) {
      // Case-insensitive search for specific company format
      const result = await pool
        .request()
        .input("companyName", sql.NVarChar, companyName.toLowerCase())
        .query(
          "SELECT email_format, domain FROM CompanyEmailFormats WHERE LOWER(company_name) = @companyName"
        );

      const companyFormat = result.recordset[0]; // Retrieve the first result

      if (!companyFormat) {
        return NextResponse.json(
          { message: "No format found for the specified company" },
          { status: 404 }
        );
      }

      // Return both `email_format` and `domain`
      return NextResponse.json({
        email_format: companyFormat.email_format,
        domain: companyFormat.domain,
      });
    } else {
      // Fetch all formats
      const result = await pool
        .request()
        .query("SELECT * FROM CompanyEmailFormats ORDER BY company_name");

      return NextResponse.json(result.recordset);
    }
  } catch (error) {
    console.error("Error fetching company formats:", error);
    return NextResponse.json(
      { error: "Failed to fetch company formats." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { company_name, domain, email_format } = await request.json();

  if (!company_name || !domain || !email_format) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  try {
    const pool = await db; // Ensure the database connection is ready

    await pool
      .request()
      .input("company_name", sql.NVarChar, company_name)
      .input("domain", sql.NVarChar, domain)
      .input("email_format", sql.NVarChar, email_format)
      .query(
        "INSERT INTO CompanyEmailFormats (company_name, domain, email_format) VALUES (@company_name, @domain, @email_format)"
      );

    return NextResponse.json({ message: "Company format added successfully" });
  } catch (error) {
    console.error("Error saving company format:", error);
    return NextResponse.json(
      { error: "Failed to save company format." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { id, company_name, domain, email_format } = await request.json();

  if (!id || !company_name || !domain || !email_format) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  try {
    const pool = await db; // Ensure the database connection is ready

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("company_name", sql.NVarChar, company_name)
      .input("domain", sql.NVarChar, domain)
      .input("email_format", sql.NVarChar, email_format)
      .query(
        "UPDATE CompanyEmailFormats SET company_name = @company_name, domain = @domain, email_format = @email_format WHERE id = @id"
      );

    return NextResponse.json({ message: "Company format updated successfully" });
  } catch (error) {
    console.error("Error updating company format:", error);
    return NextResponse.json(
      { error: "Failed to update company format." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const pool = await db; // Ensure the database connection is ready

    // Get the user's session info
    const session = await getServerSession(authConfig);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if the user is an admin
    const userResult = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT is_admin FROM Users WHERE id = @userId");

    const user = userResult.recordset[0];

    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Proceed to delete the company format
    await pool
      .request()
      .input("id", sql.Int, Number(id))
      .query("DELETE FROM CompanyEmailFormats WHERE id = @id");

    return NextResponse.json({ message: "Company format deleted successfully" });
  } catch (error) {
    console.error("Error deleting company format:", error);
    return NextResponse.json(
      { error: "Failed to delete company format." },
      { status: 500 }
    );
  }
}
