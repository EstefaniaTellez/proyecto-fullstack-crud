USE ProjectManagementDb;
GO

CREATE PROCEDURE sp_assignments_by_project
    @project_id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        d.developer_id,
        d.full_name,
        d.email,
        d.seniority,
        a.role,
        a.weekly_hours,
        a.assignment_date
    FROM
        assignments a
    INNER JOIN
        developers d ON a.developer_id = d.developer_id
    WHERE
        a.project_id = @project_id
        AND a.is_deleted = 0;
END;
GO