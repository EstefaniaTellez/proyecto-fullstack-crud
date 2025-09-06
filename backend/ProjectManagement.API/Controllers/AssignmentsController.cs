using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.API.Models;
using ProjectManagement.API.Repositories;
using ProjectManagement.API.Data;

namespace ProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssignmentsController : ControllerBase
    {
        private readonly IGenericRepository<Assignment> _assignmentRepository;
        private readonly ProjectManagementContext _context;

        public AssignmentsController(IGenericRepository<Assignment> assignmentRepository, ProjectManagementContext context)
        {
            _assignmentRepository = assignmentRepository;
            _context = context;
        }

        // POST: api/Assignments
        [HttpPost]
        public async Task<ActionResult<Assignment>> CreateAssignment(Assignment assignment)
        {
            try
            {
                // Validación del modelo (400 Bad Request)
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Validación de reglas de negocio (400 Bad Request)
                if (assignment.WeeklyHours < 1 || assignment.WeeklyHours > 40)
                    return BadRequest("Las horas semanales deben estar entre 1 y 40");

                // Verificar si el proyecto existe (404 Not Found)
                var projectExists = await _context.Projects
                    .AnyAsync(p => p.ProjectId == assignment.ProjectId && !p.IsDeleted);
                if (!projectExists)
                    return NotFound($"El proyecto con ID {assignment.ProjectId} no existe o fue eliminado");

                // Verificar si el desarrollador existe (404 Not Found)
                var developerExists = await _context.Developers
                    .AnyAsync(d => d.DeveloperId == assignment.DeveloperId && d.IsActive);
                if (!developerExists)
                    return NotFound($"El desarrollador con ID {assignment.DeveloperId} no existe o está inactivo");

                // Verificar si ya existe la asignación (409 Conflict)
                var existingAssignment = await _context.Assignments
                    .FirstOrDefaultAsync(a => a.ProjectId == assignment.ProjectId && 
                                             a.DeveloperId == assignment.DeveloperId &&
                                             !a.IsDeleted);

                if (existingAssignment != null)
                    return Conflict("El desarrollador ya está asignado a este proyecto");

                await _assignmentRepository.AddAsync(assignment);
                
                return CreatedAtAction(nameof(GetAssignment), 
                    new { projectId = assignment.ProjectId, developerId = assignment.DeveloperId }, 
                    assignment);
            }
            catch (DbUpdateException dbEx)
            {
                // Error específico de base de datos (400 Bad Request)
                return BadRequest($"Error de base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                // Error interno del servidor (500 Internal Server Error)
                return StatusCode(500, "Error interno del servidor al crear la asignación");
            }
        }

        // DELETE: api/Assignments/5/10
        [HttpDelete("{projectId}/{developerId}")]
        public async Task<IActionResult> DeleteAssignment(int projectId, int developerId)
        {
            try
            {
                var assignment = await _context.Assignments
                    .FirstOrDefaultAsync(a => a.ProjectId == projectId && 
                                             a.DeveloperId == developerId &&
                                             !a.IsDeleted);

                if (assignment == null)
                    return NotFound("Asignación no encontrada");

                // Eliminación lógica (soft delete)
                assignment.IsDeleted = true;
                _context.Assignments.Update(assignment);
                await _context.SaveChangesAsync();
                
                return NoContent();
            }
            catch (DbUpdateException dbEx)
            {
                return BadRequest($"Error de base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor al eliminar la asignación");
            }
        }

        // GET: api/Assignments/5/10
        [HttpGet("{projectId}/{developerId}")]
        public async Task<ActionResult<Assignment>> GetAssignment(int projectId, int developerId)
        {
            try
            {
                var assignment = await _context.Assignments
                    .FirstOrDefaultAsync(a => a.ProjectId == projectId && 
                                             a.DeveloperId == developerId &&
                                             !a.IsDeleted);
                
                if (assignment == null)
                    return NotFound("Asignación no encontrada");

                return Ok(assignment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor al obtener la asignación");
            }
        }

        // GET: api/Assignments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Assignment>>> GetAllAssignments()
        {
            try
            {
                var assignments = await _assignmentRepository.GetAllAsync();
                return Ok(assignments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor al obtener las asignaciones");
            }
        }

        // PUT: api/Assignments/5/10
        [HttpPut("{projectId}/{developerId}")]
        public async Task<IActionResult> UpdateAssignment(int projectId, int developerId, Assignment assignment)
        {
            try
            {
                // Validación de coincidencia de IDs (400 Bad Request)
                if (projectId != assignment.ProjectId || developerId != assignment.DeveloperId)
                    return BadRequest("Los IDs de la URL no coinciden con los del cuerpo de la solicitud");

                // Validación del modelo (400 Bad Request)
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Validación de reglas de negocio (400 Bad Request)
                if (assignment.WeeklyHours < 1 || assignment.WeeklyHours > 40)
                    return BadRequest("Las horas semanales deben estar entre 1 y 40");

                // Verificar si la asignación existe (404 Not Found)
                var existingAssignment = await _context.Assignments
                    .FirstOrDefaultAsync(a => a.ProjectId == projectId && 
                                             a.DeveloperId == developerId &&
                                             !a.IsDeleted);

                if (existingAssignment == null)
                    return NotFound("Asignación no encontrada");

                // Verificar si el proyecto existe (404 Not Found)
                var projectExists = await _context.Projects
                    .AnyAsync(p => p.ProjectId == assignment.ProjectId && !p.IsDeleted);
                if (!projectExists)
                    return NotFound($"El proyecto con ID {assignment.ProjectId} no existe o fue eliminado");

                // Verificar si el desarrollador existe (404 Not Found)
                var developerExists = await _context.Developers
                    .AnyAsync(d => d.DeveloperId == assignment.DeveloperId && d.IsActive);
                if (!developerExists)
                    return NotFound($"El desarrollador con ID {assignment.DeveloperId} no existe o está inactivo");

                await _assignmentRepository.UpdateAsync(assignment);
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict("La asignación fue modificada por otro usuario. Por favor, refresque la página e intente nuevamente.");
            }
            catch (DbUpdateException dbEx)
            {
                return BadRequest($"Error de base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor al actualizar la asignación");
            }
        }
    }
}