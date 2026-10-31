using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using SystemBackend.Data;
using SystemBackend.DTOs;
using SystemBackend.Models;
using SystemBackend.Services;

namespace SystemBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/symptoms")]
    public class SymptomsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly PythonPredictionService _pythonPredictionService;

        public SymptomsController(
            ApplicationDbContext context,
            PythonPredictionService pythonPredictionService)
        {
            _context = context;
            _pythonPredictionService = pythonPredictionService;
        }

        [HttpPost("submit")]
        public async Task<ActionResult<SymptomResultDto>> SubmitSymptoms([FromBody] SubmitSymptomsDto request)
        {
            // Read the logged-in user's identifier from the JWT token.
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Stop the request if the token does not contain a valid user identifier.
            if (string.IsNullOrWhiteSpace(userIdClaim))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var userId = int.Parse(userIdClaim);

            // Find the patient profile linked to the authenticated user.
            var patientProfile = await _context.PatientProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            // The symptom checker can only continue if the patient profile exists.
            if (patientProfile == null)
            {
                return NotFound(new { message = "Patient profile not found." });
            }

            // Validate the main concern area because it is required for both UX flow and prediction context.
            if (string.IsNullOrWhiteSpace(request.ConcernArea))
            {
                return BadRequest(new { message = "Please select the main concern area." });
            }

            // At least one symptom is required for meaningful prediction.
            if (request.Symptoms == null || !request.Symptoms.Any())
            {
                return BadRequest(new { message = "Please select at least one symptom." });
            }

            // Validate severity input before sending the request to the prediction layer.
            if (string.IsNullOrWhiteSpace(request.SeverityLevel))
            {
                return BadRequest(new { message = "Please select how strong the symptoms feel." });
            }

            // Validate duration input because it is part of the risk and urgency calculation.
            if (string.IsNullOrWhiteSpace(request.Duration))
            {
                return BadRequest(new { message = "Please select how long the symptoms have been present." });
            }

            // Build a Python-specific request DTO so the backend can pass structured data to the ML layer.
            var pythonRequest = new PythonSymptomPredictionRequestDto
            {
                ConcernArea = request.ConcernArea,
                Symptoms = request.Symptoms,
                SeverityLevel = request.SeverityLevel,
                Duration = request.Duration,
                Smoking = request.Smoking,
                PhysicalActivity = request.PhysicalActivity,
                SleepQuality = request.SleepQuality,
                KnownCondition = request.KnownCondition,
                RedFlagAnswers = request.RedFlagAnswers ?? new List<string>()
            };

            // Call the Python prediction service and receive the raw JSON response.
            var rawPrediction = await _pythonPredictionService.GetPredictionAsync(pythonRequest);

            // Convert the JSON prediction output into a strongly typed DTO for backend use.
            var prediction = JsonSerializer.Deserialize<SymptomResultDto>(
                rawPrediction,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

            // Return a server error if the prediction response could not be converted properly.
            if (prediction == null)
            {
                return StatusCode(500, new { message = "Prediction result could not be processed." });
            }

            // Extract the highest probability from the top predictions so it can be stored in the database.
            var topProbability = prediction.Top3Predictions != null && prediction.Top3Predictions.Any()
                ? prediction.Top3Predictions.Max(p => p.Probability)
                : 0;

            // Save both the original patient input and the returned prediction summary for future review and history tracking.
            var submission = new SymptomSubmission
            {
                PatientProfileId = patientProfile.Id,
                ConcernArea = request.ConcernArea,
                SymptomList = string.Join(", ", request.Symptoms),
                SeverityLevel = request.SeverityLevel,
                Duration = request.Duration,
                Smoking = request.Smoking,
                PhysicalActivity = request.PhysicalActivity,
                SleepQuality = request.SleepQuality,
                KnownCondition = request.KnownCondition,
                PredictedCategory = prediction.TopCategoryDisplayName,
                ProbabilityScore = topProbability,
                RiskLevel = prediction.RiskLevel,
                UrgencyLevel = prediction.UrgencyLevel,
                AdvisoryNote = prediction.AdvisoryNote,
                RedFlagDetected = prediction.RedFlagDetected,
                SubmittedAt = DateTime.UtcNow
            };

            _context.SymptomSubmissions.Add(submission);
            await _context.SaveChangesAsync();

            // Return the live prediction back to the frontend so it can be shown immediately to the patient.
            return Ok(prediction);
        }

        [HttpGet("latest")]
        public async Task<ActionResult> GetLatestResult()
        {
            // Read the authenticated user's identifier from the token.
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var userId = int.Parse(userIdClaim);

            // Find the patient profile belonging to the current user.
            var patientProfile = await _context.PatientProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patientProfile == null)
            {
                return NotFound(new { message = "Patient profile not found." });
            }

            // Retrieve the most recent symptom submission for this patient.
            var latest = await _context.SymptomSubmissions
                .Where(s => s.PatientProfileId == patientProfile.Id)
                .OrderByDescending(s => s.SubmittedAt)
                .Select(s => new
                {
                    s.Id,
                    s.ConcernArea,
                    s.SymptomList,
                    s.SeverityLevel,
                    s.Duration,
                    s.PredictedCategory,
                    s.ProbabilityScore,
                    s.RiskLevel,
                    s.UrgencyLevel,
                    s.AdvisoryNote,
                    s.RedFlagDetected,
                    s.SubmittedAt
                })
                .FirstOrDefaultAsync();

            // Inform the frontend when no history exists yet for the patient.
            if (latest == null)
            {
                return NotFound(new { message = "No symptom check history found." });
            }

            return Ok(latest);
        }

        [HttpGet("history")]
        public async Task<ActionResult> GetSymptomHistory(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? riskLevel)
        {
            // Read the authenticated user's identifier from the token.
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var userId = int.Parse(userIdClaim);

            // Find the patient profile that owns the symptom history.
            var patientProfile = await _context.PatientProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patientProfile == null)
            {
                return NotFound(new { message = "Patient profile not found." });
            }

            // Default the history view to the most recent three months when no start date is supplied.
            var defaultStartDate = DateTime.UtcNow.Date.AddMonths(-3);

            // Start with all submissions belonging to the current patient.
            var query = _context.SymptomSubmissions
                .Where(s => s.PatientProfileId == patientProfile.Id);

            // Apply the effective start date filter.
            var effectiveStartDate = startDate?.Date ?? defaultStartDate;
            query = query.Where(s => s.SubmittedAt.Date >= effectiveStartDate);

            // Apply the end date filter only when the client provides one.
            if (endDate.HasValue)
            {
                var effectiveEndDate = endDate.Value.Date;
                query = query.Where(s => s.SubmittedAt.Date <= effectiveEndDate);
            }

            // Apply an optional risk-level filter for focused history review.
            if (!string.IsNullOrWhiteSpace(riskLevel))
            {
                var normalizedRiskLevel = riskLevel.Trim().ToLower();
                query = query.Where(s => s.RiskLevel.ToLower() == normalizedRiskLevel);
            }

            // Return the filtered history ordered from most recent to oldest.
            var history = await query
                .OrderByDescending(s => s.SubmittedAt)
                .Select(s => new
                {
                    s.Id,
                    s.ConcernArea,
                    s.SymptomList,
                    s.SeverityLevel,
                    s.Duration,
                    s.PredictedCategory,
                    s.ProbabilityScore,
                    s.RiskLevel,
                    s.UrgencyLevel,
                    s.AdvisoryNote,
                    s.RedFlagDetected,
                    s.SubmittedAt
                })
                .ToListAsync();

            return Ok(history);
        }
    }
}