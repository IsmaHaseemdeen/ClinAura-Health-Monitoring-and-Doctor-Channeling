using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SystemBackend.Data;
using SystemBackend.DTOs;
using SystemBackend.Models;

namespace SystemBackend.Controllers
{
    [Authorize(Roles = "Patient")]
    [ApiController]
    [Route("api/documents")]
    public class HealthDocumentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public HealthDocumentController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpPost("upload")]
        public async Task<ActionResult> UploadDocument([FromForm] UploadHealthDocumentDto request)
        {
            if (request.File == null || request.File.Length == 0)
            {
                return BadRequest(new { message = "A file is required." });
            }

            var allowedTypes = new[] { "application/pdf", "image/jpeg", "image/png" };
            if (!allowedTypes.Contains(request.File.ContentType))
            {
                return BadRequest(new { message = "Only PDF, JPG, and PNG files are allowed." });
            }

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var patientProfile = await _context.PatientProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patientProfile == null)
            {
                return NotFound(new { message = "Patient profile not found." });
            }

            var uploadsFolder = Path.Combine(_environment.ContentRootPath, "Uploads");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var originalFileName = Path.GetFileName(request.File.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}_{originalFileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            var document = new HealthDocument
            {
                PatientProfileId = patientProfile.Id,
                FileName = originalFileName,
                FilePath = filePath,
                ContentType = request.File.ContentType,
                DocumentCategory = request.DocumentCategory,
                DocumentDate = request.DocumentDate,
                Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
                UploadedAt = DateTime.UtcNow
            };

            _context.HealthDocuments.Add(document);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Document uploaded successfully.",
                documentId = document.Id,
                fileName = document.FileName,
                category = document.DocumentCategory,
                documentDate = document.DocumentDate
            });
        }

        [HttpGet]
        public async Task<ActionResult> GetMyDocuments()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var patientProfile = await _context.PatientProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patientProfile == null)
            {
                return NotFound(new { message = "Patient profile not found." });
            }

            var documents = await _context.HealthDocuments
                .Where(d => d.PatientProfileId == patientProfile.Id)
                .OrderByDescending(d => d.UploadedAt)
                .Select(d => new
                {
                    d.Id,
                    d.FileName,
                    d.ContentType,
                    d.DocumentCategory,
                    d.DocumentDate,
                    d.Notes,
                    d.UploadedAt
                })
                .ToListAsync();

            return Ok(documents);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetDocumentById(int id)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var patientProfile = await _context.PatientProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patientProfile == null)
            {
                return NotFound(new { message = "Patient profile not found." });
            }

            var document = await _context.HealthDocuments
                .Where(d => d.Id == id && d.PatientProfileId == patientProfile.Id)
                .Select(d => new
                {
                    d.Id,
                    d.FileName,
                    d.ContentType,
                    d.DocumentCategory,
                    d.DocumentDate,
                    d.Notes,
                    d.UploadedAt
                })
                .FirstOrDefaultAsync();

            if (document == null)
            {
                return NotFound(new { message = "Document not found." });
            }

            return Ok(document);
        }

        [HttpGet("{id}/view")]
        public async Task<IActionResult> ViewDocument(int id)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var patientProfile = await _context.PatientProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patientProfile == null)
            {
                return NotFound(new { message = "Patient profile not found." });
            }

            var document = await _context.HealthDocuments
                .FirstOrDefaultAsync(d => d.Id == id && d.PatientProfileId == patientProfile.Id);

            if (document == null)
            {
                return NotFound(new { message = "Document not found." });
            }

            if (!System.IO.File.Exists(document.FilePath))
            {
                return NotFound(new { message = "Document file is missing from storage." });
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(document.FilePath);

            return File(fileBytes, document.ContentType);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var patientProfile = await _context.PatientProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patientProfile == null)
            {
                return NotFound(new { message = "Patient profile not found." });
            }

            var document = await _context.HealthDocuments
                .FirstOrDefaultAsync(d => d.Id == id && d.PatientProfileId == patientProfile.Id);

            if (document == null)
            {
                return NotFound(new { message = "Document not found." });
            }

            if (!string.IsNullOrWhiteSpace(document.FilePath) && System.IO.File.Exists(document.FilePath))
            {
                System.IO.File.Delete(document.FilePath);
            }

            _context.HealthDocuments.Remove(document);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Document deleted successfully." });
        }
    }
}