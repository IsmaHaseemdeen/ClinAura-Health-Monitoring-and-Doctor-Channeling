using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SystemBackend.Data;

namespace SystemBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/analytics")]
    public class AnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnalyticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /* =========================================================
           GET SYMPTOM HISTORY ANALYTICS
           Returns the logged-in patient's past symptom submissions
           in a simple chart-friendly format.

           This replaces the old lab trends feature because the
           lab value module was removed from the system.
        ========================================================= */
        [HttpGet("symptom-trends")]
        public async Task<IActionResult> GetSymptomTrends()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var userId = int.Parse(userIdClaim);

            var patient = await _context.PatientProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patient == null)
            {
                return NotFound(new { message = "Patient profile not found." });
            }

            var symptomHistory = await _context.SymptomSubmissions
                .Where(s => s.PatientProfileId == patient.Id)
                .OrderBy(s => s.SubmittedAt)
                .Select(s => new
                {
                    s.Id,
                    s.SubmittedAt,
                    s.PredictedCategory,
                    s.ProbabilityScore,
                    s.RiskLevel,
                    s.UrgencyLevel,
                    s.AdvisoryNote
                })
                .ToListAsync();

            if (!symptomHistory.Any())
            {
                return Ok(new List<object>());
            }

            return Ok(symptomHistory);
        }
    }
}