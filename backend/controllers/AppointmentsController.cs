using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;
using SystemBackend.Data;
using SystemBackend.DTOs;
using SystemBackend.Models;

namespace SystemBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/appointments")]
    public class AppointmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public AppointmentsController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [Authorize(Roles = "Patient")]
        [HttpGet("doctors")]
        public async Task<ActionResult> GetDoctorsForBooking()
        {
            // Return active doctors with booking-related settings such as available days, daily capacity, and consultation timings.
            var doctors = await _context.DoctorProfiles
                .AsNoTracking()
                .Include(d => d.User)
                .Where(d => d.User != null && d.User.IsActive)
                .OrderBy(d => d.User!.FullName)
                .Select(d => new
                {
                    d.Id,
                    fullName = d.User != null ? d.User.FullName : "Doctor",
                    d.Specialization,
                    d.Location,
                    d.AvailableDays,
                    d.DailyCapacity,
                    d.OnlineSlotsPerDay,
                    d.PhysicalSlotsPerDay,
                    d.OnlineConsultationTime,
                    d.PhysicalConsultationTime,
                    d.SlotDurationMinutes
                })
                .ToListAsync();

            return Ok(doctors);
        }

        [Authorize(Roles = "Patient")]
        [HttpGet("doctors/{doctorProfileId}/slots")]
        public async Task<ActionResult> GetAvailableSlots(
            int doctorProfileId,
            [FromQuery] DateTime appointmentDate,
            [FromQuery] string mode)
        {
            // Load the selected doctor and validate availability.
            var doctorProfile = await _context.DoctorProfiles
                .AsNoTracking()
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.Id == doctorProfileId);

            if (doctorProfile == null || doctorProfile.User == null || !doctorProfile.User.IsActive)
            {
                return NotFound(new { message = "Doctor profile not found." });
            }

            var normalizedMode = (mode ?? "").Trim();

            if (normalizedMode != "Online" && normalizedMode != "Physical")
            {
                return BadRequest(new { message = "Appointment mode must be either Online or Physical." });
            }

            // Generate the remaining free slots for the requested date and mode.
            var slots = await GetAvailableSlotsForDate(doctorProfile, appointmentDate.Date, normalizedMode);

            return Ok(new
            {
                doctorProfileId,
                appointmentDate = appointmentDate.Date,
                mode = normalizedMode,
                slots
            });
        }

        [Authorize(Roles = "Patient")]
        [HttpPost]
        public async Task<ActionResult<AppointmentResponseDto>> CreateAppointment([FromBody] CreateAppointmentDto request)
        {
            // Read the authenticated patient identity from the token.
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            // Validate the incoming booking request.
            if (request == null)
            {
                return BadRequest(new { message = "Appointment data is required." });
            }

            if (request.DoctorProfileId <= 0 ||
                request.AppointmentDate == default ||
                string.IsNullOrWhiteSpace(request.Mode))
            {
                return BadRequest(new
                {
                    message = "Doctor, appointment date, and mode are required."
                });
            }

            if (request.AdvancePaymentAmount <= 0)
            {
                return BadRequest(new { message = "A valid advance payment amount is required." });
            }

            var normalizedDate = request.AppointmentDate.Date;
            var normalizedMode = request.Mode.Trim();
            var normalizedAdvancePaymentMethod = (request.AdvancePaymentMethod ?? "").Trim();

            if (normalizedMode != "Online" && normalizedMode != "Physical")
            {
                return BadRequest(new { message = "Appointment mode must be either Online or Physical." });
            }

            if (normalizedAdvancePaymentMethod != "Card" && normalizedAdvancePaymentMethod != "Online Transfer")
            {
                return BadRequest(new { message = "Advance payment method must be Card or Online Transfer." });
            }

            // Validate card-specific payment fields.
            if (normalizedAdvancePaymentMethod == "Card")
            {
                if (string.IsNullOrWhiteSpace(request.CardHolderName) ||
                    string.IsNullOrWhiteSpace(request.CardNumber) ||
                    string.IsNullOrWhiteSpace(request.CardExpiryMonth) ||
                    string.IsNullOrWhiteSpace(request.CardExpiryYear) ||
                    string.IsNullOrWhiteSpace(request.CardCvv))
                {
                    return BadRequest(new { message = "All card payment details are required." });
                }
            }

            // Validate online-transfer-specific payment fields.
            if (normalizedAdvancePaymentMethod == "Online Transfer")
            {
                if (string.IsNullOrWhiteSpace(request.TransferBankName) ||
                    string.IsNullOrWhiteSpace(request.TransferReferenceNumber) ||
                    string.IsNullOrWhiteSpace(request.TransferReceiptBase64))
                {
                    return BadRequest(new { message = "Bank name, transfer reference, and receipt are required for online transfer." });
                }
            }

            // Load the patient profile of the logged-in user.
            var patientProfile = await _context.PatientProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patientProfile == null)
            {
                return NotFound(new { message = "Patient profile not found." });
            }

            // Load the selected doctor profile.
            var doctorProfile = await _context.DoctorProfiles
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.Id == request.DoctorProfileId);

            if (doctorProfile == null || doctorProfile.User == null || !doctorProfile.User.IsActive)
            {
                return NotFound(new { message = "Doctor profile not found." });
            }

            // Enforce auto-assignment so patients cannot manually take a slot.
            if (!request.AutoAssign || !string.IsNullOrWhiteSpace(request.AppointmentTime))
            {
                return BadRequest(new
                {
                    message = "Patients cannot manually choose a slot. The system auto-assigns the earliest available slot."
                });
            }

            // Find the earliest free slot from the requested date onward.
            var nextAvailable = await FindEarliestAvailableSlotAsync(
                doctorProfile,
                normalizedDate,
                normalizedMode);

            if (nextAvailable == null)
            {
                return BadRequest(new
                {
                    message = "No available slots were found for this doctor and consultation mode."
                });
            }

            var bookingDate = nextAvailable.Value.Date;
            var bookingSlot = nextAvailable.Value.Slot;

            // Prevent duplicate active bookings for the same patient, doctor, date, slot, and mode.
            var existingDuplicate = await _context.Appointments
                .FirstOrDefaultAsync(a =>
                    a.PatientProfileId == patientProfile.Id &&
                    a.DoctorProfileId == request.DoctorProfileId &&
                    a.AppointmentDate.Date == bookingDate &&
                    a.AppointmentTime == bookingSlot &&
                    a.Mode == normalizedMode &&
                    a.IsActive);

            if (existingDuplicate != null)
            {
                return BadRequest(new
                {
                    message = "You already have an active appointment for this doctor and slot."
                });
            }

            string? advanceReceiptPath = null;
            string? advanceReference = null;

            // Save transfer proof when the patient uses online transfer.
            if (normalizedAdvancePaymentMethod == "Online Transfer")
            {
                advanceReference = request.TransferReferenceNumber?.Trim();
                advanceReceiptPath = SaveBase64Receipt(
                    request.TransferReceiptBase64!,
                    request.TransferReceiptFileName,
                    "advance-receipts");
            }
            else if (normalizedAdvancePaymentMethod == "Card")
            {
                advanceReference = $"CARD-{DateTime.UtcNow:yyyyMMddHHmmss}";
            }

            // Calculate the queue position based on active appointments for the same doctor, booked date, and mode.
            // This reflects the patient's booking order for that specific day and consultation type.
            var nextQueuePosition = await _context.Appointments
                .Where(a =>
                    a.DoctorProfileId == request.DoctorProfileId &&
                    a.AppointmentDate.Date == bookingDate &&
                    a.Mode == normalizedMode &&
                    a.IsActive &&
                    a.Status != "Cancelled")
                .CountAsync() + 1;

            // Create the appointment record using the system-assigned earliest available slot.
            var appointment = new Appointment
            {
                PatientProfileId = patientProfile.Id,
                DoctorProfileId = request.DoctorProfileId,
                AppointmentDate = bookingDate,
                AppointmentTime = bookingSlot,
                Mode = normalizedMode,
                Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
                Status = "Pending Consultation",
                PaymentStatus = "Advance Paid",
                PaymentAmount = null,
                AdvancePaymentAmount = request.AdvancePaymentAmount,
                AdvancePaymentMethod = normalizedAdvancePaymentMethod,
                AdvancePaymentReference = advanceReference,
                AdvanceReceiptFileName = request.TransferReceiptFileName,
                AdvanceReceiptPath = advanceReceiptPath,
                AdvancePaidAt = DateTime.UtcNow,
                QueuePosition = nextQueuePosition,
                IsWaitingList = false,
                IsActive = true,
                RequestedAt = DateTime.UtcNow,
                OnlineMeetingLink = normalizedMode == "Online"
                    ? BuildOnlineMeetingLink(doctorProfile.Id, bookingDate, bookingSlot)
                    : null,
                PhysicalLocation = normalizedMode == "Physical"
                    ? doctorProfile.Location
                    : null
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            // Save the advance payment transaction as a payment record.
            var advancePaymentRecord = new AppointmentPayment
            {
                AppointmentId = appointment.Id,
                Amount = request.AdvancePaymentAmount,
                PaymentMethod = normalizedAdvancePaymentMethod,
                PaymentStage = "Advance",
                Status = "Successful",
                ReferenceNumber = advanceReference,
                ReceiptFileName = request.TransferReceiptFileName,
                ReceiptPath = advanceReceiptPath,
                OtpCode = null,
                OtpExpiresAt = null,
                IsOtpVerified = normalizedAdvancePaymentMethod == "Card",
                PaidAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _context.AppointmentPayments.Add(advancePaymentRecord);

            // Notify both the patient and doctor after successful booking.
            _context.Notifications.Add(new Notification
            {
                UserId = patientProfile.UserId,
                Title = "Appointment Booked",
                Message = $"Your appointment with {doctorProfile.User.FullName} has been auto-assigned for {bookingDate:yyyy-MM-dd} at {bookingSlot}. Queue number: {nextQueuePosition}. Advance payment of Rs. {request.AdvancePaymentAmount:0.00} was received via {normalizedAdvancePaymentMethod}.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            _context.Notifications.Add(new Notification
            {
                UserId = doctorProfile.UserId,
                Title = "New Appointment Booked",
                Message = $"{patientProfile.User?.FullName ?? "A patient"} was auto-assigned to {bookingDate:yyyy-MM-dd} at {bookingSlot} ({normalizedMode}). Queue number: {nextQueuePosition}. Advance payment completed.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            var response = MapAppointmentResponse(
                appointment,
                doctorProfile.User.FullName,
                patientProfile.User?.FullName ?? "Patient");

            return Ok(response);
        }

        [Authorize(Roles = "Patient")]
        [HttpGet("my")]
        public async Task<ActionResult> GetMyAppointments()
        {
            // Return all appointments belonging to the logged-in patient.
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var patientProfile = await _context.PatientProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patientProfile == null)
            {
                return NotFound(new { message = "Patient profile not found." });
            }

            var appointments = await _context.Appointments
                .AsNoTracking()
                .Where(a => a.PatientProfileId == patientProfile.Id)
                .Include(a => a.DoctorProfile)
                .ThenInclude(d => d.User)
                .Include(a => a.PatientProfile)
                .ThenInclude(p => p.User)
                .OrderByDescending(a => a.RequestedAt)
                .ToListAsync();

            var appointmentIds = appointments.Select(a => a.Id).ToList();

            var consultationNotes = await _context.ConsultationNotes
                .AsNoTracking()
                .Where(c => appointmentIds.Contains(c.AppointmentId))
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            var latestNotesByAppointment = consultationNotes
                .GroupBy(c => c.AppointmentId)
                .ToDictionary(g => g.Key, g => g.First());

            var response = appointments.Select(a =>
                MapAppointmentResponse(
                    a,
                    a.DoctorProfile?.User?.FullName ?? "Doctor",
                    a.PatientProfile?.User?.FullName ?? "Patient",
                    latestNotesByAppointment.ContainsKey(a.Id) ? latestNotesByAppointment[a.Id] : null))
                .ToList();

            return Ok(response);
        }

        [Authorize(Roles = "Patient")]
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelMyAppointment(int id)
        {
            // Allow patient-side cancellation only for active appointments within the allowed time window.
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var patientProfile = await _context.PatientProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patientProfile == null)
            {
                return NotFound(new { message = "Patient profile not found." });
            }

            var appointment = await _context.Appointments
                .Include(a => a.DoctorProfile)
                .ThenInclude(d => d.User)
                .FirstOrDefaultAsync(a => a.Id == id && a.PatientProfileId == patientProfile.Id);

            if (appointment == null)
            {
                return NotFound(new { message = "Appointment not found." });
            }

            if (!appointment.IsActive || appointment.Status == "Cancelled" || appointment.Status == "Completed")
            {
                return BadRequest(new { message = "This appointment can no longer be cancelled." });
            }

            var cancellationDeadline = appointment.RequestedAt.AddHours(12);

            if (DateTime.UtcNow > cancellationDeadline)
            {
                return BadRequest(new
                {
                    message = "You can cancel an appointment only within 12 hours from the booking time."
                });
            }

            appointment.Status = "Cancelled";
            appointment.PaymentStatus = "Not Due";
            appointment.PaymentAmount = null;
            appointment.IsActive = false;
            appointment.UpdatedAt = DateTime.UtcNow;

            // After a cancellation, compress the queue for the same doctor, date, and mode
            // so that remaining active appointments continue to reflect the correct booking order.
            var remainingAppointments = await _context.Appointments
                .Where(a =>
                    a.DoctorProfileId == appointment.DoctorProfileId &&
                    a.AppointmentDate.Date == appointment.AppointmentDate.Date &&
                    a.Mode == appointment.Mode &&
                    a.IsActive &&
                    a.Status != "Cancelled")
                .OrderBy(a => a.RequestedAt)
                .ThenBy(a => a.Id)
                .ToListAsync();

            for (int i = 0; i < remainingAppointments.Count; i++)
            {
                remainingAppointments[i].QueuePosition = i + 1;
                remainingAppointments[i].UpdatedAt = DateTime.UtcNow;
            }

            _context.Notifications.Add(new Notification
            {
                UserId = patientProfile.UserId,
                Title = "Appointment Cancelled",
                Message = $"Your appointment on {appointment.AppointmentDate:yyyy-MM-dd} at {appointment.AppointmentTime} was cancelled successfully.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            if (appointment.DoctorProfile?.UserId != null)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = appointment.DoctorProfile.UserId,
                    Title = "Appointment Cancelled",
                    Message = $"{patientProfile.User?.FullName ?? "A patient"} cancelled the appointment on {appointment.AppointmentDate:yyyy-MM-dd} at {appointment.AppointmentTime}.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Appointment cancelled successfully."
            });
        }

        [Authorize(Roles = "Doctor")]
        [HttpGet("doctor/pending")]
        public async Task<ActionResult> GetDoctorPendingAppointments()
        {
            // Return pending consultation appointments for the logged-in doctor together with useful patient context.
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var doctorProfile = await _context.DoctorProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (doctorProfile == null)
            {
                return NotFound(new { message = "Doctor profile not found." });
            }

            var appointments = await _context.Appointments
                .AsNoTracking()
                .Where(a =>
                    a.DoctorProfileId == doctorProfile.Id &&
                    a.Status == "Pending Consultation")
                .Include(a => a.PatientProfile)
                .ThenInclude(p => p.User)
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.Mode)
                .ThenBy(a => a.QueuePosition)
                .ThenBy(a => a.AppointmentTime)
                .Select(a => new
                {
                    id = a.Id,
                    patientProfileId = a.PatientProfileId,
                    patientName = a.PatientProfile != null && a.PatientProfile.User != null
                        ? a.PatientProfile.User.FullName
                        : "Patient",
                    appointmentDate = a.AppointmentDate,
                    appointmentTime = a.AppointmentTime,
                    mode = a.Mode,
                    status = a.Status,
                    paymentStatus = a.PaymentStatus,
                    paymentAmount = a.PaymentAmount,
                    notes = a.Notes,
                    onlineMeetingLink = a.OnlineMeetingLink,
                    physicalLocation = a.PhysicalLocation,
                    queuePosition = a.QueuePosition,
                    requestedAt = a.RequestedAt,
                    patient = new
                    {
                        id = a.PatientProfile != null ? a.PatientProfile.Id : 0,
                        dateOfBirth = a.PatientProfile != null ? a.PatientProfile.DateOfBirth : null,
                        gender = a.PatientProfile != null ? a.PatientProfile.Gender : null,
                        heightCm = a.PatientProfile != null ? a.PatientProfile.HeightCm : null,
                        weightKg = a.PatientProfile != null ? a.PatientProfile.WeightKg : null,
                        medicalHistory = a.PatientProfile != null ? a.PatientProfile.MedicalHistory : null,
                        lifestyleNotes = a.PatientProfile != null ? a.PatientProfile.LifestyleNotes : null
                    }
                })
                .ToListAsync();

            var patientIds = appointments.Select(a => (int)a.patientProfileId).Distinct().ToList();
            var appointmentIds = appointments.Select(a => (int)a.id).ToList();

            var latestSymptomChecks = await _context.SymptomSubmissions
                .AsNoTracking()
                .Where(s => patientIds.Contains(s.PatientProfileId))
                .GroupBy(s => s.PatientProfileId)
                .Select(g => g.OrderByDescending(x => x.SubmittedAt).First())
                .ToListAsync();

            var latestSymptomMap = latestSymptomChecks.ToDictionary(s => s.PatientProfileId);

            var allHealthDocuments = await _context.HealthDocuments
                .AsNoTracking()
                .Where(d => patientIds.Contains(d.PatientProfileId))
                .OrderByDescending(d => d.UploadedAt)
                .ToListAsync();

            var healthDocumentMap = allHealthDocuments
                .GroupBy(d => d.PatientProfileId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Take(5)
                        .Select(doc => (object)new
                        {
                            id = doc.Id,
                            fileName = doc.FileName,
                            documentCategory = doc.DocumentCategory,
                            documentDate = doc.DocumentDate,
                            uploadedAt = doc.UploadedAt,
                            notes = doc.Notes
                        })
                        .ToList()
                );

            var consultationNotes = await _context.ConsultationNotes
                .AsNoTracking()
                .Where(c => appointmentIds.Contains(c.AppointmentId))
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            var latestNotesByAppointment = consultationNotes
                .GroupBy(c => c.AppointmentId)
                .ToDictionary(g => g.Key, g => g.First());

            var response = appointments.Select(a =>
            {
                latestNotesByAppointment.TryGetValue(a.id, out var note);
                latestSymptomMap.TryGetValue(a.patientProfileId, out var symptomCheck);
                healthDocumentMap.TryGetValue(a.patientProfileId, out var healthDocs);

                return new
                {
                    a.id,
                    a.patientProfileId,
                    a.patientName,
                    a.appointmentDate,
                    a.appointmentTime,
                    a.mode,
                    a.status,
                    a.paymentStatus,
                    a.paymentAmount,
                    a.notes,
                    a.onlineMeetingLink,
                    a.physicalLocation,
                    a.queuePosition,
                    a.requestedAt,
                    patient = a.patient,
                    latestSymptomCheck = symptomCheck == null
                        ? null
                        : new
                        {
                            predictedCategory = symptomCheck.PredictedCategory,
                            probabilityScore = symptomCheck.ProbabilityScore,
                            riskLevel = symptomCheck.RiskLevel,
                            urgencyLevel = symptomCheck.UrgencyLevel,
                            advisoryNote = symptomCheck.AdvisoryNote,
                            symptomList = symptomCheck.SymptomList,
                            submittedAt = symptomCheck.SubmittedAt
                        },
                    healthDocuments = healthDocs != null ? healthDocs : new List<object>(),
                    consultationNote = note == null
                        ? null
                        : new
                        {
                            id = note.Id,
                            notes = note.Notes,
                            recommendations = note.Recommendations,
                            createdAt = note.CreatedAt
                        }
                };
            }).ToList();

            return Ok(response);
        }

        [Authorize(Roles = "Doctor")]
        [HttpGet("doctor/my")]
        public async Task<ActionResult> GetDoctorAppointments()
        {
            // Return all doctor appointments with patient context, symptom history, and document summaries.
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var doctorProfile = await _context.DoctorProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (doctorProfile == null)
            {
                return NotFound(new { message = "Doctor profile not found." });
            }

            var appointments = await _context.Appointments
                .AsNoTracking()
                .Where(a => a.DoctorProfileId == doctorProfile.Id)
                .Include(a => a.DoctorProfile)
                .ThenInclude(d => d.User)
                .Include(a => a.PatientProfile)
                .ThenInclude(p => p.User)
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.Mode)
                .ThenBy(a => a.QueuePosition)
                .ThenBy(a => a.AppointmentTime)
                .ToListAsync();

            var patientIds = appointments.Select(a => a.PatientProfileId).Distinct().ToList();
            var appointmentIds = appointments.Select(a => a.Id).ToList();

            var patientProfiles = await _context.PatientProfiles
                .AsNoTracking()
                .Where(p => patientIds.Contains(p.Id))
                .ToListAsync();

            var patientProfileMap = patientProfiles.ToDictionary(p => p.Id, p => p);

            var latestSymptomChecks = await _context.SymptomSubmissions
                .AsNoTracking()
                .Where(s => patientIds.Contains(s.PatientProfileId))
                .GroupBy(s => s.PatientProfileId)
                .Select(g => g.OrderByDescending(x => x.SubmittedAt).First())
                .ToListAsync();

            var latestSymptomMap = latestSymptomChecks.ToDictionary(s => s.PatientProfileId, s => s);

            var allHealthDocuments = await _context.HealthDocuments
                .AsNoTracking()
                .Where(d => patientIds.Contains(d.PatientProfileId))
                .OrderByDescending(d => d.UploadedAt)
                .ToListAsync();

            var healthDocumentMap = allHealthDocuments
                .GroupBy(d => d.PatientProfileId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var consultationNotes = await _context.ConsultationNotes
                .AsNoTracking()
                .Where(c => appointmentIds.Contains(c.AppointmentId))
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            var latestNotesByAppointment = consultationNotes
                .GroupBy(c => c.AppointmentId)
                .ToDictionary(g => g.Key, g => g.First());

            var response = appointments.Select(a =>
            {
                latestNotesByAppointment.TryGetValue(a.Id, out var note);

                return new
                {
                    id = a.Id,
                    doctorProfileId = a.DoctorProfileId,
                    doctorName = a.DoctorProfile?.User?.FullName ?? "Doctor",
                    patientProfileId = a.PatientProfileId,
                    patientName = a.PatientProfile?.User?.FullName ?? "Patient",
                    appointmentDate = a.AppointmentDate,
                    appointmentTime = a.AppointmentTime,
                    mode = a.Mode,
                    status = a.Status,
                    paymentStatus = a.PaymentStatus,
                    paymentAmount = a.PaymentAmount,
                    onlineMeetingLink = a.OnlineMeetingLink,
                    physicalLocation = a.PhysicalLocation,
                    notes = a.Notes,
                    queuePosition = a.QueuePosition,
                    isWaitingList = a.IsWaitingList,
                    canCancel = false,
                    requestedAt = a.RequestedAt,
                    cancellationDeadlineUtc = a.RequestedAt.AddHours(12),

                    patient = patientProfileMap.ContainsKey(a.PatientProfileId)
                        ? new
                        {
                            id = patientProfileMap[a.PatientProfileId].Id,
                            dateOfBirth = patientProfileMap[a.PatientProfileId].DateOfBirth,
                            gender = patientProfileMap[a.PatientProfileId].Gender,
                            heightCm = patientProfileMap[a.PatientProfileId].HeightCm,
                            weightKg = patientProfileMap[a.PatientProfileId].WeightKg,
                            medicalHistory = patientProfileMap[a.PatientProfileId].MedicalHistory,
                            lifestyleNotes = patientProfileMap[a.PatientProfileId].LifestyleNotes
                        }
                        : null,

                    latestSymptomCheck = latestSymptomMap.ContainsKey(a.PatientProfileId)
                        ? new
                        {
                            predictedCategory = latestSymptomMap[a.PatientProfileId].PredictedCategory,
                            probabilityScore = latestSymptomMap[a.PatientProfileId].ProbabilityScore,
                            riskLevel = latestSymptomMap[a.PatientProfileId].RiskLevel,
                            urgencyLevel = latestSymptomMap[a.PatientProfileId].UrgencyLevel,
                            advisoryNote = latestSymptomMap[a.PatientProfileId].AdvisoryNote,
                            symptomList = latestSymptomMap[a.PatientProfileId].SymptomList,
                            submittedAt = latestSymptomMap[a.PatientProfileId].SubmittedAt
                        }
                        : null,

                    healthDocuments = healthDocumentMap.ContainsKey(a.PatientProfileId)
                        ? healthDocumentMap[a.PatientProfileId]
                            .Select(doc => (object)new
                            {
                                id = doc.Id,
                                fileName = doc.FileName,
                                documentCategory = doc.DocumentCategory,
                                documentDate = doc.DocumentDate,
                                uploadedAt = doc.UploadedAt,
                                notes = doc.Notes
                            })
                            .ToList()
                        : new List<object>(),

                    consultationNote = note == null
                        ? null
                        : new
                        {
                            id = note.Id,
                            notes = note.Notes,
                            recommendations = note.Recommendations,
                            createdAt = note.CreatedAt
                        }
                };
            }).ToList();

            return Ok(response);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/upcoming")]
        public async Task<ActionResult> GetUpcomingAppointmentsForAdmin()
        {
            // Return future appointments for admin dashboard tracking.
            var today = DateTime.UtcNow.Date;

            var appointments = await _context.Appointments
                .AsNoTracking()
                .Where(a =>
                    a.AppointmentDate.Date >= today &&
                    a.Status != "Cancelled")
                .Include(a => a.DoctorProfile)
                .ThenInclude(d => d.User)
                .Include(a => a.PatientProfile)
                .ThenInclude(p => p.User)
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.Mode)
                .ThenBy(a => a.QueuePosition)
                .ThenBy(a => a.AppointmentTime)
                .ToListAsync();

            var response = appointments.Select(a =>
                MapAppointmentResponse(
                    a,
                    a.DoctorProfile?.User?.FullName ?? "Doctor",
                    a.PatientProfile?.User?.FullName ?? "Patient"))
                .ToList();

            return Ok(response);
        }

        [Authorize(Roles = "Doctor")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] UpdateAppointmentStatusDto request)
        {
            // Allow the doctor to mark an appointment as completed and assign consultation payment details.
            if (request == null || string.IsNullOrWhiteSpace(request.Status))
            {
                return BadRequest(new { message = "Appointment status is required." });
            }

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var doctorProfile = await _context.DoctorProfiles
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (doctorProfile == null)
            {
                return NotFound(new { message = "Doctor profile not found." });
            }

            var appointment = await _context.Appointments
                .Include(a => a.PatientProfile)
                .ThenInclude(p => p.User)
                .FirstOrDefaultAsync(a => a.Id == id && a.DoctorProfileId == doctorProfile.Id);

            if (appointment == null)
            {
                return NotFound(new { message = "Appointment not found." });
            }

            var normalizedStatus = request.Status.Trim();

            if (!normalizedStatus.Equals("Completed", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "Doctor can only change appointment status to Completed."
                });
            }

            if (appointment.Status == "Cancelled")
            {
                return BadRequest(new { message = "Cancelled appointments cannot be completed." });
            }

            if (request.PaymentAmount == null || request.PaymentAmount <= 0)
            {
                return BadRequest(new
                {
                    message = "A valid payment amount is required when completing the consultation."
                });
            }

            appointment.Status = "Completed";
            appointment.PaymentStatus = "Pending";
            appointment.PaymentAmount = request.PaymentAmount;
            appointment.OnlineMeetingLink = appointment.Mode == "Online"
                ? BuildOnlineMeetingLink(doctorProfile.Id, appointment.AppointmentDate, appointment.AppointmentTime)
                : null;
            appointment.PhysicalLocation = appointment.Mode == "Physical"
                ? doctorProfile.Location
                : null;

            appointment.IsActive = true;
            appointment.UpdatedAt = DateTime.UtcNow;

            var noteText = string.IsNullOrWhiteSpace(request.ConsultationNotes)
                ? null
                : request.ConsultationNotes.Trim();

            var recommendationText = string.IsNullOrWhiteSpace(request.Recommendations)
                ? null
                : request.Recommendations.Trim();

            // Save or update consultation notes after the appointment is completed.
            if (!string.IsNullOrWhiteSpace(noteText) || !string.IsNullOrWhiteSpace(recommendationText))
            {
                var existingConsultationNote = await _context.ConsultationNotes
                    .Where(c => c.AppointmentId == appointment.Id)
                    .OrderByDescending(c => c.CreatedAt)
                    .FirstOrDefaultAsync();

                if (existingConsultationNote == null)
                {
                    var consultationNote = new ConsultationNote
                    {
                        AppointmentId = appointment.Id,
                        DoctorProfileId = doctorProfile.Id,
                        PatientProfileId = appointment.PatientProfileId,
                        Notes = noteText ?? "",
                        Recommendations = recommendationText,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.ConsultationNotes.Add(consultationNote);
                }
                else
                {
                    existingConsultationNote.Notes = noteText ?? existingConsultationNote.Notes;
                    existingConsultationNote.Recommendations = recommendationText;
                    existingConsultationNote.CreatedAt = DateTime.UtcNow;
                }
            }

            // Create or update the pending consultation payment record.
            var existingPendingPayment = await _context.AppointmentPayments
                .FirstOrDefaultAsync(p =>
                    p.AppointmentId == appointment.Id &&
                    p.PaymentStage == "Consultation" &&
                    p.Status == "Pending");

            if (existingPendingPayment == null)
            {
                var paymentRecord = new AppointmentPayment
                {
                    AppointmentId = appointment.Id,
                    Amount = request.PaymentAmount.Value,
                    PaymentMethod = "Card",
                    PaymentStage = "Consultation",
                    Status = "Pending",
                    OtpCode = null,
                    OtpExpiresAt = null,
                    IsOtpVerified = false,
                    PaidAt = null,
                    CreatedAt = DateTime.UtcNow
                };

                _context.AppointmentPayments.Add(paymentRecord);
            }
            else
            {
                existingPendingPayment.Amount = request.PaymentAmount.Value;
                existingPendingPayment.Status = "Pending";
                existingPendingPayment.IsOtpVerified = false;
                existingPendingPayment.PaidAt = null;
            }

            if (appointment.PatientProfile?.UserId != null)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = appointment.PatientProfile.UserId,
                    Title = "Consultation Completed",
                    Message = $"Your consultation with the doctor on {appointment.AppointmentDate:yyyy-MM-dd} at {appointment.AppointmentTime} has been completed. Consultation payment of Rs. {request.PaymentAmount.Value:0.00} is now pending.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Appointment marked as completed successfully."
            });
        }

        [Authorize(Roles = "Patient")]
        [HttpPut("{id}/pay")]
        public async Task<IActionResult> PayForAppointment(int id, [FromBody] CompletePaymentDto request)
        {
            // Allow the patient to complete the final consultation payment after doctor completion.
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

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id && a.PatientProfileId == patientProfile.Id);

            if (appointment == null)
            {
                return NotFound(new { message = "Appointment not found." });
            }

            if (appointment.Status != "Completed")
            {
                return BadRequest(new
                {
                    message = "Payment can only be completed after consultation is completed."
                });
            }

            if (appointment.PaymentStatus == "Successful")
            {
                return BadRequest(new { message = "Payment has already been completed." });
            }

            if (appointment.PaymentStatus != "Pending")
            {
                return BadRequest(new { message = "This appointment is not ready for payment." });
            }

            if (appointment.PaymentAmount == null || appointment.PaymentAmount <= 0)
            {
                return BadRequest(new { message = "No valid payment amount has been assigned for this appointment." });
            }

            var paymentMethod = string.IsNullOrWhiteSpace(request?.PaymentMethod)
                ? "Card"
                : request.PaymentMethod.Trim();

            var paymentRecord = await _context.AppointmentPayments
                .FirstOrDefaultAsync(p =>
                    p.AppointmentId == appointment.Id &&
                    p.PaymentStage == "Consultation" &&
                    p.Status == "Pending");

            if (paymentRecord == null)
            {
                paymentRecord = new AppointmentPayment
                {
                    AppointmentId = appointment.Id,
                    Amount = appointment.PaymentAmount.Value,
                    PaymentMethod = paymentMethod,
                    PaymentStage = "Consultation",
                    Status = "Successful",
                    IsOtpVerified = true,
                    PaidAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };

                _context.AppointmentPayments.Add(paymentRecord);
            }
            else
            {
                paymentRecord.Amount = appointment.PaymentAmount.Value;
                paymentRecord.PaymentMethod = paymentMethod;
                paymentRecord.Status = "Successful";
                paymentRecord.IsOtpVerified = true;
                paymentRecord.PaidAt = DateTime.UtcNow;
            }

            appointment.PaymentStatus = "Successful";
            appointment.UpdatedAt = DateTime.UtcNow;

            _context.Notifications.Add(new Notification
            {
                UserId = patientProfile.UserId,
                Title = "Payment Successful",
                Message = $"Your consultation payment of Rs. {appointment.PaymentAmount.Value:0.00} for the appointment on {appointment.AppointmentDate:yyyy-MM-dd} at {appointment.AppointmentTime} was completed successfully.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Payment completed successfully."
            });
        }

        private AppointmentResponseDto MapAppointmentResponse(
            Appointment appointment,
            string doctorName,
            string patientName,
            ConsultationNote? consultationNote = null)
        {
            // Convert the appointment entity into a frontend-friendly response DTO.
            var cancellationDeadline = appointment.RequestedAt.AddHours(12);

            var canCancel =
                appointment.Status == "Pending Consultation" &&
                appointment.IsActive &&
                DateTime.UtcNow <= cancellationDeadline;

            return new AppointmentResponseDto
            {
                Id = appointment.Id,
                DoctorProfileId = appointment.DoctorProfileId,
                DoctorName = doctorName,
                PatientProfileId = appointment.PatientProfileId,
                PatientName = patientName,
                AppointmentDate = appointment.AppointmentDate,
                AppointmentTime = appointment.AppointmentTime,
                Mode = appointment.Mode,
                Status = appointment.Status,
                PaymentStatus = appointment.PaymentStatus,
                PaymentAmount = appointment.PaymentAmount,
                OnlineMeetingLink = appointment.OnlineMeetingLink,
                PhysicalLocation = appointment.PhysicalLocation,
                Notes = appointment.Notes,
                QueuePosition = appointment.QueuePosition,
                IsWaitingList = false,
                CanCancel = canCancel,
                RequestedAt = appointment.RequestedAt,
                CancellationDeadlineUtc = cancellationDeadline,
                ConsultationNotes = consultationNote?.Notes,
                Recommendations = consultationNote?.Recommendations
            };
        }

        private async Task<List<string>> GetAvailableSlotsForDate(
            DoctorProfile doctorProfile,
            DateTime date,
            string mode)
        {
            // First confirm that the doctor works on the requested day.
            if (!IsDoctorAvailableOnDate(doctorProfile, date))
            {
                return new List<string>();
            }

            // Generate all slots for the day, then remove the already-booked ones.
            var allSlots = GenerateSlotsForDate(doctorProfile, mode);
            if (!allSlots.Any())
            {
                return new List<string>();
            }

            var bookedSlots = await _context.Appointments
                .AsNoTracking()
                .Where(a =>
                    a.DoctorProfileId == doctorProfile.Id &&
                    a.AppointmentDate.Date == date &&
                    a.Mode == mode &&
                    a.IsActive &&
                    a.Status != "Cancelled")
                .Select(a => a.AppointmentTime)
                .ToListAsync();

            return allSlots
                .Where(slot => !bookedSlots.Contains(slot))
                .ToList();
        }

        private async Task<(DateTime Date, string Slot)?> FindEarliestAvailableSlotAsync(
            DoctorProfile doctorProfile,
            DateTime startDate,
            string mode)
        {
            // Search up to 30 days forward and return the first available slot found.
            for (int i = 0; i < 30; i++)
            {
                var date = startDate.AddDays(i);

                if (!IsDoctorAvailableOnDate(doctorProfile, date))
                {
                    continue;
                }

                var freeSlots = await GetAvailableSlotsForDate(doctorProfile, date, mode);
                if (freeSlots.Any())
                {
                    return (date, freeSlots.First());
                }
            }

            return null;
        }

        private bool IsDoctorAvailableOnDate(DoctorProfile doctorProfile, DateTime date)
        {
            // Check whether the requested date is one of the doctor's configured working days.
            if (string.IsNullOrWhiteSpace(doctorProfile.AvailableDays))
            {
                return true;
            }

            var allowedDays = doctorProfile.AvailableDays
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(d => d.ToLowerInvariant())
                .ToList();

            return allowedDays.Contains(date.DayOfWeek.ToString().ToLowerInvariant());
        }

        private List<string> GenerateSlotsForDate(DoctorProfile doctorProfile, string mode)
        {
            // Use the doctor's configured time range and slot capacity for the selected consultation mode.
            var timeRange = mode == "Online"
                ? doctorProfile.OnlineConsultationTime
                : doctorProfile.PhysicalConsultationTime;

            if (string.IsNullOrWhiteSpace(timeRange))
            {
                return new List<string>();
            }

            var maxSlots = mode == "Online"
                ? doctorProfile.OnlineSlotsPerDay
                : doctorProfile.PhysicalSlotsPerDay;

            if (doctorProfile.SlotDurationMinutes <= 0 || maxSlots <= 0)
            {
                return new List<string>();
            }

            var parts = timeRange.Split('-', StringSplitOptions.TrimEntries);
            if (parts.Length != 2)
            {
                return new List<string>();
            }

            if (!DateTime.TryParse(parts[0], CultureInfo.InvariantCulture, DateTimeStyles.None, out var startTime))
            {
                return new List<string>();
            }

            if (!DateTime.TryParse(parts[1], CultureInfo.InvariantCulture, DateTimeStyles.None, out var endTime))
            {
                return new List<string>();
            }

            // Generate continuous slot blocks using the configured duration until the limit is reached.
            var slots = new List<string>();
            var current = startTime;
            var duration = TimeSpan.FromMinutes(doctorProfile.SlotDurationMinutes);

            while (current.Add(duration) <= endTime && slots.Count < maxSlots)
            {
                var slotEnd = current.Add(duration);
                slots.Add($"{current:hh:mm tt} - {slotEnd:hh:mm tt}");
                current = slotEnd;
            }

            return slots;
        }

        private string BuildOnlineMeetingLink(int doctorProfileId, DateTime appointmentDate, string slotLabel)
        {
            // Create a predictable meeting link format for online appointments.
            var slug = slotLabel
                .Replace(" ", "")
                .Replace(":", "")
                .Replace("-", "")
                .ToLowerInvariant();

            return $"https://meet.clinaura.com/d{doctorProfileId}-{appointmentDate:yyyyMMdd}-{slug}";
        }

        private string SaveBase64Receipt(string base64Content, string? originalFileName, string folderName)
        {
            // Save uploaded transfer receipts into the backend uploads folder and return the relative file path.
            var uploadsFolder = Path.Combine(_environment.ContentRootPath, "Uploads", folderName);

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var extension = ".png";

            if (!string.IsNullOrWhiteSpace(originalFileName))
            {
                extension = Path.GetExtension(originalFileName);
                if (string.IsNullOrWhiteSpace(extension))
                {
                    extension = ".png";
                }
            }

            var fileName = $"{Guid.NewGuid()}{extension}";
            var fullPath = Path.Combine(uploadsFolder, fileName);

            var bytes = Convert.FromBase64String(base64Content);
            System.IO.File.WriteAllBytes(fullPath, bytes);

            return Path.Combine("Uploads", folderName, fileName).Replace("\\", "/");
        }
    }
}