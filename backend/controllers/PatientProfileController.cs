using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SystemBackend.Data;
using SystemBackend.Models;

namespace SystemBackend.Controllers
{
    [Authorize(Roles = "Patient")]
    [ApiController]
    [Route("api/patient")]
    public class PatientProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PatientProfileController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("profile")]
        public async Task<ActionResult<PatientProfile>> GetProfile()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var profile = await _context.PatientProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                return NotFound(new { message = "Profile not found." });
            }

            return Ok(profile);
        }

        [HttpPut("profile")]
        public async Task<ActionResult<PatientProfile>> UpdateProfile([FromBody] PatientProfile updatedProfile)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            if (updatedProfile == null)
            {
                return BadRequest(new { message = "Profile data is required." });
            }

            var profile = await _context.PatientProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                return NotFound(new { message = "Profile not found." });
            }

            profile.DateOfBirth = updatedProfile.DateOfBirth;
            profile.Gender = updatedProfile.Gender?.Trim() ?? string.Empty;
            profile.HeightCm = updatedProfile.HeightCm;
            profile.WeightKg = updatedProfile.WeightKg;
            profile.MedicalHistory = updatedProfile.MedicalHistory?.Trim();
            profile.LifestyleNotes = updatedProfile.LifestyleNotes?.Trim();
            profile.ConsentAccepted = updatedProfile.ConsentAccepted;
            profile.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var refreshedProfile = await _context.PatientProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            return Ok(refreshedProfile);
        }
    }
}