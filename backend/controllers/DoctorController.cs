using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SystemBackend.Data;
using SystemBackend.DTOs;
using SystemBackend.Models;

namespace SystemBackend.Controllers
{
    [Authorize(Roles = "Doctor")]
    [ApiController]
    [Route("api/doctor")]
    public class DoctorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DoctorController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetDoctorProfile()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim))
                return Unauthorized(new { message = "User ID not found in token." });

            var userId = int.Parse(userIdClaim);

            var doctorProfile = await _context.DoctorProfiles
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (doctorProfile == null)
                return NotFound(new { message = "Doctor profile not found." });

            return Ok(new
            {
                doctorProfile.Id,
                doctorProfile.UserId,
                FullName = doctorProfile.User != null ? doctorProfile.User.FullName : "",
                Email = doctorProfile.User != null ? doctorProfile.User.Email : "",
                doctorProfile.Specialization,
                doctorProfile.LicenseNumber,
                doctorProfile.PhoneNumber,
                doctorProfile.Location,
                doctorProfile.Qualification,
                doctorProfile.Bio,
                doctorProfile.AvailableDays,
                doctorProfile.SlotDurationMinutes,
                doctorProfile.DailyCapacity,
                doctorProfile.OnlineSlotsPerDay,
                doctorProfile.PhysicalSlotsPerDay,
                doctorProfile.OnlineConsultationTime,
                doctorProfile.PhysicalConsultationTime
            });
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateDoctorProfile([FromBody] DoctorProfileUpdateDto request)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim))
                return Unauthorized(new { message = "User ID not found in token." });

            var userId = int.Parse(userIdClaim);

            var doctorProfile = await _context.DoctorProfiles
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (doctorProfile == null)
                return NotFound(new { message = "Doctor profile not found." });

            doctorProfile.AvailableDays = string.IsNullOrWhiteSpace(request.AvailableDays)
                ? null
                : request.AvailableDays.Trim();

            doctorProfile.DailyCapacity = request.DailyCapacity;
            doctorProfile.OnlineSlotsPerDay = request.OnlineSlotsPerDay;
            doctorProfile.PhysicalSlotsPerDay = request.PhysicalSlotsPerDay;
            doctorProfile.OnlineConsultationTime = string.IsNullOrWhiteSpace(request.OnlineConsultationTime)
                ? null
                : request.OnlineConsultationTime.Trim();
            doctorProfile.PhysicalConsultationTime = string.IsNullOrWhiteSpace(request.PhysicalConsultationTime)
                ? null
                : request.PhysicalConsultationTime.Trim();
            doctorProfile.Location = string.IsNullOrWhiteSpace(request.Location)
                ? null
                : request.Location.Trim();
            doctorProfile.SlotDurationMinutes = request.SlotDurationMinutes;
            doctorProfile.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Doctor profile updated successfully."
            });
        }

        [HttpGet("appointments")]
        public async Task<IActionResult> GetDoctorAppointments()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim))
                return Unauthorized(new { message = "User ID not found in token." });

            var userId = int.Parse(userIdClaim);

            var doctorProfile = await _context.DoctorProfiles
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (doctorProfile == null)
                return NotFound(new { message = "Doctor profile not found." });

            var appointments = await _context.Appointments
                .Where(a =>
                    a.DoctorProfileId == doctorProfile.Id &&
                    a.Status != "Cancelled")
                .Include(a => a.PatientProfile)
                .ThenInclude(p => p.User)
                .OrderByDescending(a => a.AppointmentDate)
                .ThenBy(a => a.AppointmentTime)
                .ToListAsync();

            var patientIds = appointments.Select(a => a.PatientProfileId).Distinct().ToList();
            var appointmentIds = appointments.Select(a => a.Id).ToList();

            var latestSymptoms = await _context.SymptomSubmissions
                .Where(s => patientIds.Contains(s.PatientProfileId))
                .GroupBy(s => s.PatientProfileId)
                .Select(g => g.OrderByDescending(x => x.SubmittedAt).First())
                .ToListAsync();

            var symptomMap = latestSymptoms.ToDictionary(s => s.PatientProfileId);

            var documents = await _context.HealthDocuments
                .Where(d => patientIds.Contains(d.PatientProfileId))
                .OrderByDescending(d => d.UploadedAt)
                .ToListAsync();

            var docMap = documents
                .GroupBy(d => d.PatientProfileId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var notes = await _context.ConsultationNotes
                .Where(c => appointmentIds.Contains(c.AppointmentId))
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            var noteMap = notes
                .GroupBy(c => c.AppointmentId)
                .ToDictionary(g => g.Key, g => g.First());

            var response = appointments.Select(a =>
            {
                noteMap.TryGetValue(a.Id, out var note);

                return new
                {
                    a.Id,
                    PatientName = a.PatientProfile?.User?.FullName ?? "Patient",
                    a.AppointmentDate,
                    a.AppointmentTime,
                    a.Mode,
                    a.Status,
                    a.PaymentStatus,
                    a.PaymentAmount,
                    a.Notes,
                    a.OnlineMeetingLink,
                    a.PhysicalLocation,
                    a.RequestedAt,

                    patient = new
                    {
                        a.PatientProfile?.Id,
                        a.PatientProfile?.Gender,
                        a.PatientProfile?.DateOfBirth,
                        a.PatientProfile?.HeightCm,
                        a.PatientProfile?.WeightKg,
                        a.PatientProfile?.MedicalHistory,
                        a.PatientProfile?.LifestyleNotes
                    },

                    latestSymptomCheck = symptomMap.ContainsKey(a.PatientProfileId)
                        ? new
                        {
                            symptomMap[a.PatientProfileId].SymptomList,
                            symptomMap[a.PatientProfileId].PredictedCategory,
                            symptomMap[a.PatientProfileId].ProbabilityScore,
                            symptomMap[a.PatientProfileId].RiskLevel,
                            symptomMap[a.PatientProfileId].UrgencyLevel,
                            symptomMap[a.PatientProfileId].AdvisoryNote,
                            symptomMap[a.PatientProfileId].SubmittedAt
                        }
                        : null,

                    healthDocuments = docMap.ContainsKey(a.PatientProfileId)
                        ? docMap[a.PatientProfileId]
                            .Select(d => (object)new
                            {
                                d.Id,
                                d.FileName,
                                d.DocumentCategory,
                                d.DocumentDate,
                                d.UploadedAt,
                                d.Notes
                            })
                            .ToList()
                        : new List<object>(),

                    consultationNote = note == null
                        ? null
                        : new
                        {
                            note.Notes,
                            note.Recommendations,
                            note.CreatedAt
                        }
                };
            }).ToList();

            return Ok(response);
        }

        [HttpGet("health-records/{id}/view")]
        public async Task<IActionResult> ViewHealthRecord(int id)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim))
                return Unauthorized(new { message = "User ID not found in token." });

            var userId = int.Parse(userIdClaim);

            var doctorProfile = await _context.DoctorProfiles
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (doctorProfile == null)
                return NotFound(new { message = "Doctor profile not found." });

            var document = await _context.HealthDocuments
                .Include(d => d.PatientProfile)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (document == null)
                return NotFound(new { message = "Document not found." });

            var hasRelatedAppointment = await _context.Appointments.AnyAsync(a =>
                a.DoctorProfileId == doctorProfile.Id &&
                a.PatientProfileId == document.PatientProfileId &&
                a.Status != "Cancelled");

            if (!hasRelatedAppointment)
                return Unauthorized(new { message = "Access denied." });

            if (!System.IO.File.Exists(document.FilePath))
                return NotFound(new { message = "Document file not found." });

            var fileBytes = await System.IO.File.ReadAllBytesAsync(document.FilePath);
            return File(fileBytes, document.ContentType, document.FileName);
        }

        [HttpPost("consultation-notes")]
        public async Task<IActionResult> CreateConsultationNote([FromBody] CreateConsultationNoteDto request)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim))
                return Unauthorized(new { message = "User ID not found in token." });

            var userId = int.Parse(userIdClaim);

            var doctorProfile = await _context.DoctorProfiles
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (doctorProfile == null)
                return NotFound(new { message = "Doctor profile not found." });

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a =>
                    a.Id == request.AppointmentId &&
                    a.DoctorProfileId == doctorProfile.Id);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found for this doctor." });

            var note = new ConsultationNote
            {
                AppointmentId = appointment.Id,
                DoctorProfileId = doctorProfile.Id,
                PatientProfileId = appointment.PatientProfileId,
                Notes = request.Notes,
                Recommendations = request.Recommendations,
                CreatedAt = DateTime.UtcNow
            };

            _context.ConsultationNotes.Add(note);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Consultation note saved successfully.",
                consultationNoteId = note.Id
            });
        }
    }
}