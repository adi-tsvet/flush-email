-- nano create_tables.sql
-- Save and exit the file:

-- Press Ctrl+O, then press Enter to save.
-- Press Ctrl+X to exit the nano editor.

-- CREATE DATABASE FlushEmailDB;
-- GO

-- sqlcmd -S database-flush-email.czjm6iq37yab.us-east-1.rds.amazonaws.com,1433 -U admin -P 'Capricon97' -i create_tables.sql

-- sudo ssh -L 1433:flush-email-mssql.czjm6iq37yab.us-east-1.rds.amazonaws.com:1433 -N -i  ec2-user@3.84.249.0
-- sudo nano /etc/systemd/system/ssh-tunnel.service



USE FlushEmailDB;
GO

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing ID
    username NVARCHAR(50) UNIQUE NOT NULL, -- Unique username
    password NVARCHAR(255) NOT NULL, -- Hashed password
    gmail_id NVARCHAR(255) NOT NULL, -- Gmail address for sending emails
    gmail_app_password NVARCHAR(255) NOT NULL, -- Gmail App Password
    created_at DATETIME DEFAULT GETDATE(), -- Creation timestamp
    updated_at DATETIME DEFAULT GETDATE() -- Last update timestamp
);
GO

CREATE TABLE Emails (
    id INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing ID
    user_id INT NOT NULL, -- Foreign key linking to Users
    recipient NVARCHAR(255) NOT NULL,
    subject NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    sent_at DATETIME NOT NULL,
    follow_up INT DEFAULT 0, -- Follow-up status
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
GO

CREATE TABLE EmailTemplates (
    id INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing ID
    user_id INT NOT NULL, -- Foreign key linking to Users
    title NVARCHAR(255) NOT NULL,
    subject NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    visibility NVARCHAR(10) DEFAULT 'private', -- 'private' or 'public'
    created_at DATETIME DEFAULT GETDATE(), -- Creation timestamp
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
GO

CREATE TABLE CompanyEmailFormats (
    id INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing ID
    company_name NVARCHAR(255) UNIQUE NOT NULL,
    domain NVARCHAR(255) NOT NULL,
    email_format NVARCHAR(255) NOT NULL -- Example: "first.last@domain.com"
);
GO
