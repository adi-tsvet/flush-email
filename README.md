# **Flush Email**

Flush Email is a feature-rich email management application built with Next.js and Microsoft SQL Server (MSSQL). It provides reusable email templates, recipient list customization, and dynamic placeholders for personalized communication. The app features a responsive UI, role-based templates, and advanced email-sending capabilities to enhance productivity.

---

## **Features**

- **User Authentication**
  - Secure login and registration using NextAuth.
  - Role-based template access (private and public templates).

- **Template Management**
  - Add, edit, and delete email templates.
  - Support for placeholders like `{firstname}` and `{jobrole}` for dynamic content.
  - Toggle visibility between public and private templates.

- **Responsive Design**
  - Fully responsive layout optimized for mobile, tablet, and desktop devices.
  - Sidebar navigation with a hamburger menu for mobile devices.

- **Email Sending**
  - Integration with Gmail for email delivery.
  - Dynamic content insertion using placeholders.

- **Database Management**
  - MSSQL integration for robust database handling.
  - Table models for `Users`, `Emails`, `EmailTemplates`, and `CompanyEmailFormats`.

---

## **Tech Stack**

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API routes
- **Database**: Microsoft SQL Server (MSSQL)
- **Authentication**: NextAuth.js
- **Email Sending**: Nodemailer
- **ORM**: TypeORM

---

## **Setup Instructions**

### **Prerequisites**
- Install [Node.js](https://nodejs.org/) (16.x or above).
- Set up an MSSQL database instance.
- Install [Git](https://git-scm.com/).

### **Environment Variables**
Create a `.env` file in the root directory with the following keys:

`env
MSSQL_USER=your_mssql_username
MSSQL_PASSWORD=your_mssql_password
MSSQL_SERVER=your_mssql_server
MSSQL_DATABASE=your_mssql_database
MSSQL_PORT=1433
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000`

### **Installation**
- Clone the repository:
`git clone https://github.com/yourusername/flush-email.git
cd flush-email`
- Install dependencies:
  `npm install`
- Run the development server:
  `npm run dev`
- Open the app in your browser at `http://localhost:3000`.

### **Database Setup**
- Use the provided SQL schema to create the database tables in your MSSQL instance:
`USE FlushEmailDB;

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    gmail_id NVARCHAR(255) NOT NULL,
    gmail_app_password NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Emails (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    recipient NVARCHAR(255) NOT NULL,
    subject NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    sent_at DATETIME NOT NULL,
    follow_up INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE EmailTemplates (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    subject NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    visibility NVARCHAR(10) DEFAULT 'private',
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE CompanyEmailFormats (
    id INT IDENTITY(1,1) PRIMARY KEY,
    company_name NVARCHAR(255) UNIQUE NOT NULL,
    domain NVARCHAR(255) NOT NULL,
    email_format NVARCHAR(255) NOT NULL
);`

### **Building for Production**
- Build the project:
`npm run build`
- Start the production server:
`npm run start`

## **Usage**
- Login or Register: Access the app by logging in with your credentials or registering a new account.
- Manage Templates:
 - Create new email templates with placeholders like {firstname}.
 - Toggle between private and public templates.
 - Edit or delete existing templates.
- Send Emails:
 - Use templates to compose and send personalized emails to a list of recipients.

## **License**
This project is licensed under the MIT License. See the LICENSE file for details.

## **Acknowledgements**
- Next.js
- TypeORM
- TailwindCSS
- Nodemailer
- Amazon RDS










