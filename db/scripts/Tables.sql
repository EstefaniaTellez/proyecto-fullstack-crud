CREATE DATABASE ProjectManagementDb;
GO

USE ProjectManagementDb;
GO

-- Tabla 'projects'
CREATE TABLE projects (
    project_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL UNIQUE,
    client NVARCHAR(200),
    start_date DATE NOT NULL,
    end_date DATE,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('planned', 'in_progress', 'paused', 'closed')),
    is_deleted BIT NOT NULL DEFAULT 0
);
GO

-- Tabla 'developers'
CREATE TABLE developers (
    developer_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(200) NOT NULL,
    email NVARCHAR(200) NOT NULL UNIQUE,
    seniority NVARCHAR(10) NOT NULL CHECK (seniority IN ('JR', 'SSR', 'SR')),
    is_active BIT NOT NULL DEFAULT 1
);
GO

-- Tabla 'assignments'
CREATE TABLE assignments (
    project_id INT NOT NULL,
    developer_id INT NOT NULL,
    role NVARCHAR(50) NOT NULL,
    weekly_hours INT NOT NULL CHECK (weekly_hours BETWEEN 1 AND 40),
    assignment_date DATE NOT NULL,
    is_deleted BIT NOT NULL DEFAULT 0,
    CONSTRAINT PK_assignments PRIMARY KEY (project_id, developer_id),
    CONSTRAINT FK_assignment_project FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    CONSTRAINT FK_assignment_developer FOREIGN KEY (developer_id) REFERENCES developers(developer_id) ON DELETE CASCADE
);
GO