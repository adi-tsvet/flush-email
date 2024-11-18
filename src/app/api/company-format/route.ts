import { NextResponse } from "next/server";
import db from "../../../../database/db"; // Adjust this path for your database setup

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyName = searchParams.get("companyName");

  try {
    if (companyName) {
      // Case-insensitive search for specific company format
      const stmt = db.prepare(
        "SELECT email_format, domain FROM company_email_formats WHERE LOWER(company_name) = ?"
      );
      const companyFormat = stmt.get(companyName.toLowerCase());

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
      const stmt = db.prepare("SELECT * FROM company_email_formats ORDER BY company_name");
      const formats = stmt.all();
      return NextResponse.json(formats);
    }
  } catch (error) {
    console.error("Error fetching company formats:", error);
    return NextResponse.json({ error: "Failed to fetch company formats." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { company_name, domain, email_format } = await request.json();

  if (!company_name || !domain || !email_format) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  try {
    db.prepare(
      "INSERT INTO company_email_formats (company_name, domain, email_format) VALUES (?, ?, ?)"
    ).run(company_name, domain, email_format);

    return NextResponse.json({ message: "Company format added successfully" });
  } catch (error) {
    console.error("Error saving company format:", error);
    return NextResponse.json({ error: "Failed to save company format." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { id, company_name, domain, email_format } = await request.json();

  if (!id || !company_name || !domain || !email_format) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  try {
    db.prepare(
      "UPDATE company_email_formats SET company_name = ?, domain = ?, email_format = ? WHERE id = ?"
    ).run(company_name, domain, email_format, id);

    return NextResponse.json({ message: "Company format updated successfully" });
  } catch (error) {
    console.error("Error updating company format:", error);
    return NextResponse.json({ error: "Failed to update company format." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    db.prepare("DELETE FROM company_email_formats WHERE id = ?").run(Number(id));
    return NextResponse.json({ message: "Company format deleted successfully" });
  } catch (error) {
    console.error("Error deleting company format:", error);
    return NextResponse.json({ error: "Failed to delete company format." }, { status: 500 });
  }
}
