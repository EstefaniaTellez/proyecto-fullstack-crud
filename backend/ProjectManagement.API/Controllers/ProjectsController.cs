using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.API.Models;
using ProjectManagement.API.Repositories;
using ProjectManagement.API.Data;

namespace ProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly IGenericRepository<Project> _projectRepository;
        private readonly ProjectManagementContext _context;

        public ProjectsController(IGenericRepository<Project> projectRepository, ProjectManagementContext context)
        {
            _projectRepository = projectRepository;
            _context = context;
        }

        // GET: api/Projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
            try
            {
                var projects = await _projectRepository.GetAllAsync();
                return Ok(projects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor al obtener los proyectos");
            }
        }

        // GET: api/Projects/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            try
            {
                var project = await _projectRepository.GetByIdAsync(id);

                if (project == null)
                {
                    return NotFound("Proyecto no encontrado");
                }

                return Ok(project);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor al obtener el proyecto");
            }
        }

        // PUT: api/Projects/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProject(int id, Project project)
        {
            try
            {
                // Validación de coincidencia de IDs (400 Bad Request)
                if (id != project.ProjectId)
                {
                    return BadRequest("El ID de la URL no coincide con el ID del proyecto");
                }

                // Validación del modelo (400 Bad Request)
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Validación de reglas de negocio (400 Bad Request)
                if (string.IsNullOrEmpty(project.Name))
                {
                    return BadRequest("El nombre del proyecto es requerido");
                }

                if (string.IsNullOrEmpty(project.Status))
                {
                    return BadRequest("El estado del proyecto es requerido");
                }

                if (!IsValidStatus(project.Status))
                {
                    return BadRequest("El estado debe ser: planned, in_progress, paused o closed");
                }

                if (project.StartDate == default)
                {
                    return BadRequest("La fecha de inicio es requerida");
                }

                if (project.EndDate.HasValue && project.EndDate < project.StartDate)
                {
                    return BadRequest("La fecha de fin no puede ser anterior a la fecha de inicio");
                }

                // Verificar si el proyecto existe (404 Not Found)
                var existingProject = await _projectRepository.GetByIdAsync(id);
                if (existingProject == null)
                {
                    return NotFound("Proyecto no encontrado");
                }

                // Verificar duplicado de nombre (409 Conflict)
                var nameExists = await _context.Projects
                    .AnyAsync(p => p.Name == project.Name && 
                                  p.ProjectId != id && 
                                  !p.IsDeleted);
                
                if (nameExists)
                {
                    return Conflict("Ya existe un proyecto con este nombre");
                }

                await _projectRepository.UpdateAsync(project);
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict("El proyecto fue modificado por otro usuario. Por favor, refresque la página e intente nuevamente.");
            }
            catch (DbUpdateException dbEx)
            {
                return BadRequest($"Error de base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor al actualizar el proyecto");
            }
        }

        // POST: api/Projects
        [HttpPost]
        public async Task<ActionResult<Project>> PostProject(Project project)
        {
            try
            {
                // Validación del modelo (400 Bad Request)
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Validación de reglas de negocio (400 Bad Request)
                if (string.IsNullOrEmpty(project.Name))
                {
                    return BadRequest("El nombre del proyecto es requerido");
                }

                if (string.IsNullOrEmpty(project.Status))
                {
                    return BadRequest("El estado del proyecto es requerido");
                }

                if (!IsValidStatus(project.Status))
                {
                    return BadRequest("El estado debe ser: planned, in_progress, paused o closed");
                }

                if (project.StartDate == default)
                {
                    return BadRequest("La fecha de inicio es requerida");
                }

                if (project.EndDate.HasValue && project.EndDate < project.StartDate)
                {
                    return BadRequest("La fecha de fin no puede ser anterior a la fecha de inicio");
                }

                // Verificar duplicado de nombre (409 Conflict)
                var nameExists = await _context.Projects
                    .AnyAsync(p => p.Name == project.Name && !p.IsDeleted);
                
                if (nameExists)
                {
                    return Conflict("Ya existe un proyecto con este nombre");
                }

                // Asegurar que el proyecto se crea como no eliminado
                project.IsDeleted = false;

                await _projectRepository.AddAsync(project);
                
                return CreatedAtAction(nameof(GetProject), 
                    new { id = project.ProjectId }, 
                    project);
            }
            catch (DbUpdateException dbEx)
            {
                return BadRequest($"Error de base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor al crear el proyecto");
            }
        }

        // DELETE: api/Projects/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            try
            {
                // Verificar si el proyecto tiene asignaciones activas (409 Conflict)
                var hasActiveAssignments = await _context.Assignments
                    .AnyAsync(a => a.ProjectId == id && !a.IsDeleted);
                
                if (hasActiveAssignments)
                {
                    return Conflict("No se puede eliminar el proyecto porque tiene asignaciones activas");
                }

                var result = await _projectRepository.DeleteAsync(id);
                
                if (!result)
                {
                    return NotFound("Proyecto no encontrado");
                }

                return NoContent();
            }
            catch (DbUpdateException dbEx)
            {
                return BadRequest($"Error de base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor al eliminar el proyecto");
            }
        }

        // GET: api/Projects/5/assignments
        [HttpGet("{id}/assignments")]
        public async Task<ActionResult<IEnumerable<AssignmentInfo>>> GetProjectAssignments(int id)
        {
            try
            {
                // Verificar si el proyecto existe (404 Not Found)
                var projectExists = await _projectRepository.GetByIdAsync(id);
                if (projectExists == null)
                {
                    return NotFound("Proyecto no encontrado");
                }

                // Llamar al stored procedure
                var assignments = await _context.Set<AssignmentInfo>()
                    .FromSqlRaw("EXEC sp_assignments_by_project @project_id = {0}", id)
                    .ToListAsync();

                return Ok(assignments);
            }
            catch (DbUpdateException dbEx)
            {
                return BadRequest($"Error de base de datos: {dbEx.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor al obtener las asignaciones del proyecto");
            }
        }

        // Métodos de validación auxiliares
        private bool IsValidStatus(string status)
        {
            return status == "planned" || status == "in_progress" || status == "paused" || status == "closed";
        }

        private async Task<bool> ProjectExists(int id)
        {
            var project = await _projectRepository.GetByIdAsync(id);
            return project != null;
        }
    }
}