import Database from 'better-sqlite3';
import path from 'path';

// Define the database path
const dbPath = path.resolve(process.cwd(), 'database', 'emails.db');
const db = new Database(dbPath);

// Ensure the table exists with the correct schema
db.exec(`
  CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_at TEXT NOT NULL,
    thread_id TEXT NOT NULL,
    follow_up INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_email_formats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT UNIQUE NOT NULL,
  domain TEXT NOT NULL,
  email_format TEXT NOT NULL -- Example: "first.last@domain.com"
);

`);

export default db;
