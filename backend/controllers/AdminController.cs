using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SystemBackend.Data;
using SystemBackend.DTOs;
using SystemBackend.Helpers;
using SystemBackend.Models;

namespace SystemBackend.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("appointments")]
        public async Task<IActionResult> GetAllAppointments()
        {
            // Return all appointments for admin-level monitoring and reporting.
            // This endpoint provides operational data that can also support dashboard visuals and summaries.
            var appointments = await _context.Appointments
                .Include(a => a.PatientProfile)
                .ThenInclude(p => p.User)
                .Include(a => a.DoctorProfile)
                .ThenInclude(d => d.User)
                .OrderByDescending(a => a.RequestedAt)
                .Select(a => new AppointmentResponseDto
                {
                    Id = a.Id,
                    DoctorProfileId = a.DoctorProfileId,
                    DoctorName = a.DoctorProfile != null && a.DoctorProfile.User != null
                        ? a.DoctorProfile.User.FullName
                        : "Doctor",
                    PatientProfileId = a.PatientProfileId,
                    PatientName = a.PatientProfile != null && a.PatientProfile.User != null
                        ? a.PatientProfile.User.FullName
                        : "Patient",
                    AppointmentDate = a.AppointmentDate,
                    AppointmentTime = a.AppointmentTime,
                    Mode = a.Mode,
                    Status = a.Status,
                    PaymentStatus = a.PaymentStatus,
                    PaymentAmount = a.PaymentAmount,
                    OnlineMeetingLink = a.OnlineMeetingLink,
                    PhysicalLocation = a.PhysicalLocation,
                    Notes = a.Notes,
                    QueuePosition = a.QueuePosition,
                    IsWaitingList = a.IsWaitingList,
                    CanCancel = false,
                    RequestedAt = a.RequestedAt,
                    CancellationDeadlineUtc = a.RequestedAt.AddHours(12)
                })
                .ToListAsync();

            return Ok(appointments);
        }

        [HttpGet("appointments/upcoming")]
        public async Task<IActionResult> GetUpcomingAppointments()
        {
            // Return all upcoming non-cancelled appointments for operational monitoring.
            // This supports future schedule visibility and reporting for the admin dashboard.
            var today = DateTime.UtcNow.Date;

            var appointments = await _context.Appointments
                .Include(a => a.PatientProfile)
                .ThenInclude(p => p.User)
                .Include(a => a.DoctorProfile)
                .ThenInclude(d => d.User)
                .Where(a => a.AppointmentDate.Date >= today && a.Status != "Cancelled")
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.AppointmentTime)
                .ThenBy(a => a.QueuePosition)
                .Select(a => new AppointmentResponseDto
                {
                    Id = a.Id,
                    DoctorProfileId = a.DoctorProfileId,
                    DoctorName = a.DoctorProfile != null && a.DoctorProfile.User != null
                        ? a.DoctorProfile.User.FullName
                        : "Doctor",
                    PatientProfileId = a.PatientProfileId,
                    PatientName = a.PatientProfile != null && a.PatientProfile.User != null
                        ? a.PatientProfile.User.FullName
                        : "Patient",
                    AppointmentDate = a.AppointmentDate,
                    AppointmentTime = a.AppointmentTime,
                    Mode = a.Mode,
                    Status = a.Status,
                    PaymentStatus = a.PaymentStatus,
                    PaymentAmount = a.PaymentAmount,
                    OnlineMeetingLink = a.OnlineMeetingLink,
                    PhysicalLocation = a.PhysicalLocation,
                    Notes = a.Notes,
                    QueuePosition = a.QueuePosition,
                    IsWaitingList = a.IsWaitingList,
                    CanCancel = false,
                    RequestedAt = a.RequestedAt,
                    CancellationDeadlineUtc = a.RequestedAt.AddHours(12)
                })
                .ToListAsync();

            return Ok(appointments);
        }

        [HttpGet("high-risk-patients")]
        public async Task<IActionResult> GetHighRiskPatients(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? bookingStatus)
        {
            // This endpoint supports analytics and intervention tracking for patients with high-risk symptom results.
            // It identifies the latest high-risk check per patient and then checks whether they booked an appointment afterward.
            var effectiveStartDate = startDate?.Date ?? DateTime.UtcNow.Date.AddMonths(-3);
            var effectiveEndDate = endDate?.Date ?? DateTime.UtcNow.Date;

            var latestHighRiskChecks = await _context.SymptomSubmissions
                .Include(s => s.PatientProfile)
                .ThenInclude(p => p.User)
                .Where(s =>
                    s.SubmittedAt.Date >= effectiveStartDate &&
                    s.SubmittedAt.Date <= effectiveEndDate &&
                    s.RiskLevel.ToLower() == "high")
                .GroupBy(s => s.PatientProfileId)
                .Select(g => g.OrderByDescending(x => x.SubmittedAt).First())
                .ToListAsync();

            var patientIds = latestHighRiskChecks.Select(x => x.PatientProfileId).ToList();

            var appointments = await _context.Appointments
                .Include(a => a.DoctorProfile)
                .ThenInclude(d => d.User)
                .Where(a =>
                    patientIds.Contains(a.PatientProfileId) &&
                    a.Status != "Cancelled")
                .ToListAsync();

            var response = latestHighRiskChecks
                .Select(check =>
                {
                    var patientAppointments = appointments
                        .Where(a =>
                            a.PatientProfileId == check.PatientProfileId &&
                            a.RequestedAt > check.SubmittedAt)
                        .OrderByDescending(a => a.RequestedAt)
                        .ToList();

                    var latestAppointment = patientAppointments.FirstOrDefault();
                    var hasAppointmentAfterCheck = patientAppointments.Any();

                    return new
                    {
                        patientProfileId = check.PatientProfileId,
                        patientUserId = check.PatientProfile?.UserId ?? 0,
                        patientName = check.PatientProfile?.User?.FullName ?? "Patient",
                        patientEmail = check.PatientProfile?.User?.Email ?? "",
                        latestRiskLevel = check.RiskLevel,
                        predictedCategory = check.PredictedCategory,
                        probabilityScore = check.ProbabilityScore,
                        urgencyLevel = check.UrgencyLevel,
                        advisoryNote = check.AdvisoryNote,
                        redFlagDetected = check.RedFlagDetected,
                        symptomList = check.SymptomList,
                        submittedAt = check.SubmittedAt,
                        hasAppointment = hasAppointmentAfterCheck,
                        latestAppointmentId = latestAppointment?.Id,
                        latestAppointmentDate = latestAppointment?.AppointmentDate,
                        latestAppointmentTime = latestAppointment?.AppointmentTime,
                        latestAppointmentStatus = latestAppointment?.Status,
                        latestDoctorName = latestAppointment?.DoctorProfile?.User?.FullName ?? "-"
                    };
                })
                .ToList();

            // Apply optional filtering based on whether the patient booked a consultation after the high-risk result.
            if (!string.IsNullOrWhiteSpace(bookingStatus))
            {
                var normalizedBookingStatus = bookingStatus.Trim().ToLower();

                if (normalizedBookingStatus == "booked")
                {
                    response = response.Where(x => x.hasAppointment).ToList();
                }
                else if (normalizedBookingStatus == "notbooked")
                {
                    response = response.Where(x => !x.hasAppointment).ToList();
                }
            }

            return Ok(response.OrderByDescending(x => x.submittedAt));
        }

        [HttpPost("high-risk-patients/{patientProfileId}/send-reminder")]
        public async Task<IActionResult> SendConsultationReminder(int patientProfileId)
        {
            // Send a reminder notification to a patient whose latest symptom result was high risk
            // and who has not booked an appointment after that result.
            var patient = await _context.PatientProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == patientProfileId);

            if (patient == null || patient.User == null)
            {
                return NotFound(new { message = "Patient not found." });
            }

            var latestHighRiskCheck = await _context.SymptomSubmissions
                .Where(s => s.PatientProfileId == patientProfileId && s.RiskLevel.ToLower() == "high")
                .OrderByDescending(s => s.SubmittedAt)
                .FirstOrDefaultAsync();

            if (latestHighRiskCheck == null)
            {
                return BadRequest(new { message = "No high-risk symptom check found for this patient." });
            }

            var hasAppointment = await _context.Appointments
                .AnyAsync(a =>
                    a.PatientProfileId == patientProfileId &&
                    a.Status != "Cancelled" &&
                    a.RequestedAt > latestHighRiskCheck.SubmittedAt);

            if (hasAppointment)
            {
                return BadRequest(new { message = "This patient has already booked an appointment after the high-risk symptom check." });
            }

            var notification = new Notification
            {
                UserId = patient.UserId,
                Title = "Consultation Reminder",
                Message = $"Your recent symptom check on {latestHighRiskCheck.SubmittedAt:yyyy-MM-dd} showed a high-risk result. Please book a consultation as soon as possible for medical review.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Consultation reminder sent successfully." });
        }

        [HttpPost("doctors")]
        public async Task<IActionResult> RegisterDoctor([FromBody] RegisterDoctorDto request)
        {
            // Allow the admin to register a new doctor and create the related doctor profile.
            if (request == null ||
                string.IsNullOrWhiteSpace(request.FullName) ||
                string.IsNullOrWhiteSpace(request.Specialization) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new
                {
                    message = "Full name, specialization, email, and password are required."
                });
            }

            var normalizedEmail = request.Email.Trim().ToLower();

            var existingUser = await _context.Users
                .AnyAsync(u => u.Email.ToLower() == normalizedEmail);

            if (existingUser)
            {
                return BadRequest(new { message = "Email is already registered." });
            }

            var user = new User
            {
                FullName = request.FullName.Trim(),
                Email = normalizedEmail,
                Role = "Doctor",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                PasswordHash = PasswordHelper.HashPassword(request.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var slotsPerDay = request.SlotsPerDay < 0 ? 0 : request.SlotsPerDay;
            var onlineSlots = slotsPerDay / 2;
            var physicalSlots = slotsPerDay - onlineSlots;

            var doctorProfile = new DoctorProfile
            {
                UserId = user.Id,
                Specialization = request.Specialization.Trim(),
                PhoneNumber = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
                Qualification = string.IsNullOrWhiteSpace(request.Qualifications) ? null : request.Qualifications.Trim(),
                AvailableDays = string.IsNullOrWhiteSpace(request.AvailableDays) ? null : request.AvailableDays.Trim(),
                DailyCapacity = slotsPerDay,
                OnlineSlotsPerDay = onlineSlots,
                PhysicalSlotsPerDay = physicalSlots,
                OnlineConsultationTime = string.IsNullOrWhiteSpace(request.OnlineTime) ? null : request.OnlineTime.Trim(),
                PhysicalConsultationTime = string.IsNullOrWhiteSpace(request.PhysicalTime) ? null : request.PhysicalTime.Trim(),
                Location = string.IsNullOrWhiteSpace(request.PhysicalLocation) ? null : request.PhysicalLocation.Trim(),
                LicenseNumber = null,
                SlotDurationMinutes = 30
            };

            _context.DoctorProfiles.Add(doctorProfile);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Doctor registered successfully.",
                doctorId = doctorProfile.Id,
                email = user.Email
            });
        }

        [HttpGet("doctors")]
        public async Task<IActionResult> GetAllDoctors()
        {
            // Return all registered doctors for admin viewing and operational management.
            var doctors = await _context.DoctorProfiles
                .Include(d => d.User)
                .OrderBy(d => d.User!.FullName)
                .Select(d => new
                {
                    d.Id,
                    FullName = d.User != null ? d.User.FullName : "Doctor",
                    Email = d.User != null ? d.User.Email : "",
                    d.Specialization,
                    d.PhoneNumber,
                    d.AvailableDays,
                    SlotsPerDay = d.DailyCapacity,
                    PhysicalLocation = d.Location,
                    d.OnlineConsultationTime,
                    d.PhysicalConsultationTime,
                    IsActive = d.User != null && d.User.IsActive
                })
                .ToListAsync();

            return Ok(doctors);
        }

        [HttpGet("patients")]
        public async Task<IActionResult> GetAllPatients()
        {
            // Return all patients for admin viewing and general system oversight.
            var patients = await _context.PatientProfiles
                .Include(p => p.User)
                .OrderBy(p => p.User!.FullName)
                .Select(p => new
                {
                    p.Id,
                    PatientName = p.User != null ? p.User.FullName : "Patient",
                    Email = p.User != null ? p.User.Email : "",
                    p.DateOfBirth,
                    p.Gender
                })
                .ToListAsync();

            return Ok(patients);
        }
    }
}