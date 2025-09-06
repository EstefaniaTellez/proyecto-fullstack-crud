USE ProjectManagementDb;
GO

-- Insertar datos de ejemplo en 'projects'
INSERT INTO projects (name, client, start_date, end_date, status, is_deleted) VALUES
('Sistema de Gestión Interna', 'Contoso Ltd', '2024-01-15', '2024-06-15', 'in_progress', 0),
('App Móvil de Banco', 'Financial Innovations Inc.', '2024-03-01', NULL, 'planned', 0),
('Portal de Clientes E-commerce', 'Awesome Shop', '2023-11-01', '2024-02-01', 'closed', 0);
GO

-- Insertar datos de ejemplo en 'developers'
INSERT INTO developers (full_name, email, seniority, is_active) VALUES
('María García', 'maria.garcia@email.com', 'SR', 1),
('Carlos Rodríguez', 'carlos.rodriguez@email.com', 'SSR', 1),
('Ana Fernández', 'ana.fernandez@email.com', 'JR', 1);
GO

-- Insertar datos de ejemplo en 'assignments'
-- NOTA: Los project_id y developer_id dependerán de los valores generados automáticamente (IDENTITY). Ajusta los números (1,2,3) si es necesario.
INSERT INTO assignments (project_id, developer_id, role, weekly_hours, assignment_date, is_deleted) VALUES
(1, 1, 'Tech Lead', 35, '2024-01-10', 0),
(1, 2, 'Backend Developer', 40, '2024-01-12', 0),
(2, 3, 'Frontend Developer', 25, '2024-02-25', 0);
GO