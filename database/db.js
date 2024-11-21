import Database from "better-sqlite3";
import path from "path";

// Define the database path
const dbPath = path.resolve(process.cwd(), "database", "emails.db");
const db = new Database(dbPath);

// Ensure the table exists with the correct schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL, -- Unique username for login
    password TEXT NOT NULL, -- Hashed password for security
    gmail_id TEXT NOT NULL, -- Gmail address for sending emails
    gmail_app_password TEXT NOT NULL, -- Gmail App Password for sending emails
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- When the user was created
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP -- When the user last updated their info
  );

  CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, -- Foreign key linking to the users table
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_at TEXT NOT NULL,
    follow_up INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Ensure emails are removed if the user is deleted
  );

  CREATE TABLE IF NOT EXISTS email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, -- Foreign key linking to the users table
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    visibility TEXT DEFAULT 'private', -- 'private' or 'public'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Ensure templates are removed if the user is deleted
  );

  CREATE TABLE IF NOT EXISTS company_email_formats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT UNIQUE NOT NULL,
    domain TEXT NOT NULL,
    email_format TEXT NOT NULL -- Example: "first.last@domain.com"
  );
`);

export default db;
