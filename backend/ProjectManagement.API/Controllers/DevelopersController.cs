using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.API.Models;
using ProjectManagement.API.Repositories;
using ProjectManagement.API.Data;

namespace ProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DevelopersController : ControllerBase
    {
        private readonly IGenericRepository<Developer> _developerRepository;
        private readonly ProjectManagementContext _context;

        public DevelopersController(IGenericRepository<Developer> developerRepository, ProjectManagementContext context)
        {
            _developerRepository = developerRepository;
            _context = context;
        }

        // GET: api/Developers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Developer>>> GetDevelopers()
        {
            try
            {
                var developers = await _developerRepository.GetAllAsync();
                return Ok(developers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor al obtener los desarrolladores");
            }
        }

        // GET: api/Developers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Developer>> GetDeveloper(int id)
        {
            try
            {
                var developer = await _developerRepository.GetByIdAsync(id);

                if (developer == null)
                {
                    return NotFound("Desarrollador no encontrado");
                }

                return Ok(developer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor al obtener el desarrollador");
            }
        }

        // PUT: api/Developers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDeveloper(int id, Developer developer)
        {
            try
            {
                // Validación de coincidencia de IDs (400 Bad Request)
                if (id != developer.DeveloperId)
                {
                    return BadRequest("El ID de la URL no coincide con el ID del desarrollador");
                }

                // Validación del modelo (400 Bad Request)
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Validación de reglas de negocio (400 Bad Request)
                if (string.IsNullOrEmpty(developer.FullName))
                {
                    return BadRequest("El nombre completo es requerido");
                }

                if (string.IsNullOrEmpty(developer.Email))
                {
                    return BadRequest("El email es requerido");
                }

                if (!IsValidEmail(developer.Email))
                {
                    return BadRequest("El formato del email no es válido");
                }

                if (!IsValidSeniority(developer.Seniority))
                {
                    return BadRequest("La seniority debe ser JR, SSR o SR");
                }

                // Verificar si el desarrollador existe (404 Not Found)
                var existingDeveloper = await _developerRepository.GetByIdAsync(id);
                if (existingDeveloper == null)
                {
                    return NotFound("Desarrollador no encontrado");
                }

                // Verificar duplicado de email (409 Conflict)
                var emailExists = await _context.Developers
                    .AnyAsync(d => d.Email == developer.Email && 
                                  d.DeveloperId != id && 
                                  d.IsActive);
                
                if (emailExists)
                {
                    return Conflict("Ya existe un desarrollador con este email");
                }

                await _developerRepository.UpdateAsync(developer);
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict("El desarrollador fue modificado por otro usuario. Por favor, refresque la página e intente nuevamente.");
            }
            catch (DbUpdateException dbEx)
            {
                return BadRequest($"Error de base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor al actualizar el desarrollador");
            }
        }

        // POST: api/Developers
        [HttpPost]
        public async Task<ActionResult<Developer>> PostDeveloper(Developer developer)
        {
            try
            {
                // Validación del modelo (400 Bad Request)
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Validación de reglas de negocio (400 Bad Request)
                if (string.IsNullOrEmpty(developer.FullName))
                {
                    return BadRequest("El nombre completo es requerido");
                }

                if (string.IsNullOrEmpty(developer.Email))
                {
                    return BadRequest("El email es requerido");
                }

                if (!IsValidEmail(developer.Email))
                {
                    return BadRequest("El formato del email no es válido");
                }

                if (!IsValidSeniority(developer.Seniority))
                {
                    return BadRequest("La seniority debe ser JR, SSR o SR");
                }

                // Verificar duplicado de email (409 Conflict)
                var emailExists = await _context.Developers
                    .AnyAsync(d => d.Email == developer.Email && d.IsActive);
                
                if (emailExists)
                {
                    return Conflict("Ya existe un desarrollador con este email");
                }

                // Asegurar que el desarrollador se crea como activo
                developer.IsActive = true;

                await _developerRepository.AddAsync(developer);
                
                return CreatedAtAction(nameof(GetDeveloper), 
                    new { id = developer.DeveloperId }, 
                    developer);
            }
            catch (DbUpdateException dbEx)
            {
                return BadRequest($"Error de base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor al crear el desarrollador");
            }
        }

        [HttpPatch("{id}/status")]
public async Task<IActionResult> ToggleStatus(int id, [FromBody] bool isActive)
{
    var developer = await _developerRepository.GetByIdAsync(id);
    if (developer == null)
        return NotFound("Desarrollador no encontrado");

    developer.IsActive = isActive;
    await _developerRepository.UpdateAsync(developer);

    return NoContent();
}


        // DELETE: api/Developers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDeveloper(int id)
        {
            try
            {
                // Verificar si el desarrollador tiene asignaciones activas (409 Conflict)
                var hasActiveAssignments = await _context.Assignments
                    .AnyAsync(a => a.DeveloperId == id && !a.IsDeleted);
                
                if (hasActiveAssignments)
                {
                    return Conflict("No se puede eliminar el desarrollador porque tiene asignaciones activas");
                }

                var result = await _developerRepository.DeleteAsync(id);
                
                if (!result)
                {
                    return NotFound("Desarrollador no encontrado");
                }

                return NoContent();
            }
            catch (DbUpdateException dbEx)
            {
                return BadRequest($"Error de base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor al eliminar el desarrollador");
            }
        }

        // Métodos de validación auxiliares
        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        private bool IsValidSeniority(string seniority)
        {
            return seniority == "JR" || seniority == "SSR" || seniority == "SR";
        }

        private async Task<bool> DeveloperExists(int id)
        {
            var developer = await _developerRepository.GetByIdAsync(id);
            return developer != null;
        }
    }
}