using Microsoft.EntityFrameworkCore;
using SystemBackend.Helpers;
using SystemBackend.Models;

namespace SystemBackend.Data
{
    public static class DbSeeder
    {
        public static void Seed(ApplicationDbContext db)
        {
            db.Database.Migrate();

            if (db.Users.Any())
            {
                return;
            }

            var now = DateTime.UtcNow;
            var today = now.Date;

            /* =========================================================
               USERS
               Passwords are intentionally simple for testing only.
            ========================================================= */
            var adminUser = new User
            {
                FullName = "admin101",
                Email = "admin101@clinaura.com",
                PasswordHash = PasswordHelper.HashPassword("Admin123!"),
                Role = "Admin",
                IsActive = true,
                CreatedAt = now
            };

            var doctorUser1 = new User
            {
                FullName = "Dr. Sarah Fernando",
                Email = "sarah.fernando@clinaura.com",
                PasswordHash = PasswordHelper.HashPassword("Doctor123!"),
                Role = "Doctor",
                IsActive = true,
                CreatedAt = now
            };

            var doctorUser2 = new User
            {
                FullName = "Dr. Nimal Perera",
                Email = "nimal.perera@clinaura.com",
                PasswordHash = PasswordHelper.HashPassword("Doctor123!"),
                Role = "Doctor",
                IsActive = true,
                CreatedAt = now
            };

            var patientUser1 = new User
            {
                FullName = "Ayesha Silva",
                Email = "ayesha.silva@clinaura.com",
                PasswordHash = PasswordHelper.HashPassword("Patient123!"),
                Role = "Patient",
                IsActive = true,
                CreatedAt = now
            };

            var patientUser2 = new User
            {
                FullName = "Kamal Jayasuriya",
                Email = "kamal.jayasuriya@clinaura.com",
                PasswordHash = PasswordHelper.HashPassword("Patient123!"),
                Role = "Patient",
                IsActive = true,
                CreatedAt = now
            };

            var patientUser3 = new User
            {
                FullName = "Nethmi Wickramasinghe",
                Email = "nethmi.wickramasinghe@clinaura.com",
                PasswordHash = PasswordHelper.HashPassword("Patient123!"),
                Role = "Patient",
                IsActive = true,
                CreatedAt = now
            };

            db.Users.AddRange(
                adminUser,
                doctorUser1,
                doctorUser2,
                patientUser1,
                patientUser2,
                patientUser3
            );
            db.SaveChanges();

            /* =========================================================
               DOCTOR PROFILES
            ========================================================= */
            var doctorProfile1 = new DoctorProfile
            {
                UserId = doctorUser1.Id,
                Specialization = "General Physician",
                LicenseNumber = "SLMC-20451",
                PhoneNumber = "0771234567",
                Location = "Colombo Medical Centre",
                Qualification = "MBBS, MD",
                Bio = "General physician experienced in outpatient primary care and follow-up management.",
                AvailableDays = "Monday,Tuesday,Wednesday,Thursday,Friday",
                SlotDurationMinutes = 30,
                DailyCapacity = 10,
                OnlineSlotsPerDay = 5,
                PhysicalSlotsPerDay = 5,
                OnlineConsultationTime = "09:00 AM - 12:00 PM",
                PhysicalConsultationTime = "02:00 PM - 05:00 PM",
                CreatedAt = now
            };

            var doctorProfile2 = new DoctorProfile
            {
                UserId = doctorUser2.Id,
                Specialization = "General Physician",
                LicenseNumber = "SLMC-20872",
                PhoneNumber = "0719876543",
                Location = "Kandy Family Clinic",
                Qualification = "MBBS",
                Bio = "Primary care doctor supporting general consultations and recurring patient follow-ups.",
                AvailableDays = "Monday,Wednesday,Friday,Saturday",
                SlotDurationMinutes = 30,
                DailyCapacity = 8,
                OnlineSlotsPerDay = 4,
                PhysicalSlotsPerDay = 4,
                OnlineConsultationTime = "10:00 AM - 12:00 PM",
                PhysicalConsultationTime = "03:00 PM - 06:00 PM",
                CreatedAt = now
            };

            db.DoctorProfiles.AddRange(doctorProfile1, doctorProfile2);
            db.SaveChanges();

            /* =========================================================
               PATIENT PROFILES
            ========================================================= */
            var patientProfile1 = new PatientProfile
            {
                UserId = patientUser1.Id,
                DateOfBirth = new DateTime(2002, 5, 14),
                Gender = "Female",
                HeightCm = 160,
                WeightKg = 55,
                MedicalHistory = "Seasonal allergy",
                LifestyleNotes = "University student with moderate daily activity",
                ConsentAccepted = true,
                CreatedAt = now
            };

            var patientProfile2 = new PatientProfile
            {
                UserId = patientUser2.Id,
                DateOfBirth = new DateTime(1999, 11, 2),
                Gender = "Male",
                HeightCm = 172,
                WeightKg = 68,
                MedicalHistory = "No major long-term illness",
                LifestyleNotes = "Office worker with low activity",
                ConsentAccepted = true,
                CreatedAt = now
            };

            var patientProfile3 = new PatientProfile
            {
                UserId = patientUser3.Id,
                DateOfBirth = new DateTime(2001, 8, 25),
                Gender = "Female",
                HeightCm = 158,
                WeightKg = 52,
                MedicalHistory = "Asthma",
                LifestyleNotes = "Part-time worker and student",
                ConsentAccepted = true,
                CreatedAt = now
            };

            db.PatientProfiles.AddRange(patientProfile1, patientProfile2, patientProfile3);
            db.SaveChanges();

            /* =========================================================
               HEALTH DOCUMENTS
            ========================================================= */
            db.HealthDocuments.AddRange(
                new HealthDocument
                {
                    PatientProfileId = patientProfile1.Id,
                    FileName = "cbc_report_sample.pdf",
                    FilePath = @"Uploads\sample\cbc_report_sample.pdf",
                    ContentType = "application/pdf",
                    DocumentCategory = "Lab Report",
                    DocumentDate = today.AddDays(-10),
                    Notes = "Sample CBC report",
                    UploadedAt = now.AddDays(-9)
                },
                new HealthDocument
                {
                    PatientProfileId = patientProfile2.Id,
                    FileName = "xray_report_sample.pdf",
                    FilePath = @"Uploads\sample\xray_report_sample.pdf",
                    ContentType = "application/pdf",
                    DocumentCategory = "Radiology",
                    DocumentDate = today.AddDays(-7),
                    Notes = "Sample X-ray report",
                    UploadedAt = now.AddDays(-6)
                }
            );
            db.SaveChanges();

            /* =========================================================
               APPOINTMENTS
               Seeded specifically to test:
               - active slot holder
               - waiting list
               - completed appointment
               - pending payment
               - successful payment
               - cancellation + promotion flow
            ========================================================= */

            // Same slot: one active, two in queue
            var queuePrimary = new Appointment
            {
                PatientProfileId = patientProfile1.Id,
                DoctorProfileId = doctorProfile1.Id,
                AppointmentDate = today.AddDays(1),
                AppointmentTime = "09:00 AM",
                Mode = "Online",
                Status = "Pending Consultation",
                PaymentStatus = "Not Due",
                PaymentAmount = null,
                Notes = "Primary slot holder for queue testing",
                QueuePosition = 1,
                IsWaitingList = false,
                IsActive = true,
                RequestedAt = now.AddHours(-2)
            };

            var queueWaiting1 = new Appointment
            {
                PatientProfileId = patientProfile2.Id,
                DoctorProfileId = doctorProfile1.Id,
                AppointmentDate = today.AddDays(1),
                AppointmentTime = "09:00 AM",
                Mode = "Online",
                Status = "Pending Consultation",
                PaymentStatus = "Not Due",
                PaymentAmount = null,
                Notes = "First waiting list patient for same slot",
                QueuePosition = 2,
                IsWaitingList = true,
                IsActive = true,
                RequestedAt = now.AddHours(-1)
            };

            var queueWaiting2 = new Appointment
            {
                PatientProfileId = patientProfile3.Id,
                DoctorProfileId = doctorProfile1.Id,
                AppointmentDate = today.AddDays(1),
                AppointmentTime = "09:00 AM",
                Mode = "Online",
                Status = "Pending Consultation",
                PaymentStatus = "Not Due",
                PaymentAmount = null,
                Notes = "Second waiting list patient for same slot",
                QueuePosition = 3,
                IsWaitingList = true,
                IsActive = true,
                RequestedAt = now.AddMinutes(-20)
            };

            // Completed and already paid
            var completedPaidAppointment = new Appointment
            {
                PatientProfileId = patientProfile2.Id,
                DoctorProfileId = doctorProfile2.Id,
                AppointmentDate = today.AddDays(-2),
                AppointmentTime = "03:00 PM",
                Mode = "Physical",
                Status = "Completed",
                PaymentStatus = "Successful",
                PaymentAmount = 2500.00m,
                Notes = "Completed consultation with successful payment",
                PhysicalLocation = "Kandy Family Clinic - Room 2",
                QueuePosition = 1,
                IsWaitingList = false,
                IsActive = false,
                RequestedAt = now.AddDays(-4),
                UpdatedAt = now.AddDays(-2)
            };

            // Completed and payment pending
            var completedPendingPaymentAppointment = new Appointment
            {
                PatientProfileId = patientProfile1.Id,
                DoctorProfileId = doctorProfile2.Id,
                AppointmentDate = today.AddDays(-1),
                AppointmentTime = "10:30 AM",
                Mode = "Online",
                Status = "Completed",
                PaymentStatus = "Pending",
                PaymentAmount = 1800.00m,
                Notes = "Completed consultation awaiting in-system payment",
                OnlineMeetingLink = "https://meet.example.com/followup-room",
                QueuePosition = 1,
                IsWaitingList = false,
                IsActive = false,
                RequestedAt = now.AddDays(-3),
                UpdatedAt = now.AddDays(-1)
            };

            // Cancelled example
            var cancelledAppointment = new Appointment
            {
                PatientProfileId = patientProfile3.Id,
                DoctorProfileId = doctorProfile2.Id,
                AppointmentDate = today,
                AppointmentTime = "11:00 AM",
                Mode = "Physical",
                Status = "Cancelled",
                PaymentStatus = "Not Due",
                PaymentAmount = null,
                Notes = "Previously cancelled appointment example",
                QueuePosition = 1,
                IsWaitingList = false,
                IsActive = false,
                RequestedAt = now.AddDays(-1),
                UpdatedAt = now.AddHours(-10)
            };

            db.Appointments.AddRange(
                queuePrimary,
                queueWaiting1,
                queueWaiting2,
                completedPaidAppointment,
                completedPendingPaymentAppointment,
                cancelledAppointment
            );
            db.SaveChanges();

            /* =========================================================
               APPOINTMENT PAYMENTS
               Separate payment records for testing payment table.
            ========================================================= */
            db.AppointmentPayments.AddRange(
                new AppointmentPayment
                {
                    AppointmentId = completedPaidAppointment.Id,
                    Amount = 2500.00m,
                    PaymentMethod = "Card",
                    Status = "Successful",
                    OtpCode = null,
                    OtpExpiresAt = null,
                    IsOtpVerified = true,
                    PaidAt = now.AddDays(-2),
                    CreatedAt = now.AddDays(-2)
                },
                new AppointmentPayment
                {
                    AppointmentId = completedPendingPaymentAppointment.Id,
                    Amount = 1800.00m,
                    PaymentMethod = "Card",
                    Status = "Pending",
                    OtpCode = null,
                    OtpExpiresAt = null,
                    IsOtpVerified = false,
                    PaidAt = null,
                    CreatedAt = now.AddDays(-1)
                }
            );
            db.SaveChanges();

            /* =========================================================
               CONSULTATION NOTES
            ========================================================= */
            db.ConsultationNotes.AddRange(
                new ConsultationNote
                {
                    AppointmentId = completedPaidAppointment.Id,
                    DoctorProfileId = doctorProfile2.Id,
                    PatientProfileId = patientProfile2.Id,
                    Notes = "Patient reviewed. Symptoms improved. No alarming findings.",
                    Recommendations = "Continue rest, hydration, and review if symptoms recur.",
                    CreatedAt = now.AddDays(-2)
                },
                new ConsultationNote
                {
                    AppointmentId = completedPendingPaymentAppointment.Id,
                    DoctorProfileId = doctorProfile2.Id,
                    PatientProfileId = patientProfile1.Id,
                    Notes = "Consultation completed and fee assigned.",
                    Recommendations = "Monitor symptoms for 3 days and return if worsening.",
                    CreatedAt = now.AddDays(-1)
                }
            );
            db.SaveChanges();

            /* =========================================================
               SYMPTOM SUBMISSIONS
            ========================================================= */
            db.SymptomSubmissions.AddRange(
                new SymptomSubmission
                {
                    PatientProfileId = patientProfile1.Id,
                    ConcernArea = "head_balance",
                    SymptomList = "Headache, Dizziness, Light sensitivity",
                    SeverityLevel = "moderate",
                    Duration = "3-7 days",
                    Smoking = "no",
                    PhysicalActivity = "moderate",
                    SleepQuality = "poor",
                    KnownCondition = "none",
                    PredictedCategory = "Headache, dizziness, or balance-related issues",
                    ProbabilityScore = 78.50,
                    RiskLevel = "Moderate",
                    UrgencyLevel = "Moderate",
                    AdvisoryNote = "Monitor symptoms closely and consider medical review if they continue.",
                    RedFlagDetected = false,
                    SubmittedAt = now.AddDays(-2)
                },
                new SymptomSubmission
                {
                    PatientProfileId = patientProfile2.Id,
                    ConcernArea = "breathing_throat",
                    SymptomList = "Chest pain, Shortness of breath",
                    SeverityLevel = "severe",
                    Duration = "1-3 days",
                    Smoking = "yes",
                    PhysicalActivity = "low",
                    SleepQuality = "poor",
                    KnownCondition = "none",
                    PredictedCategory = "Possible heart or circulation warning signs",
                    ProbabilityScore = 96.00,
                    RiskLevel = "High",
                    UrgencyLevel = "Urgent",
                    AdvisoryNote = "Please seek urgent medical attention.",
                    RedFlagDetected = true,
                    SubmittedAt = now.AddDays(-1)
                },
                new SymptomSubmission
                {
                    PatientProfileId = patientProfile3.Id,
                    ConcernArea = "stress_sleep",
                    SymptomList = "Stress, Poor sleep, Fatigue",
                    SeverityLevel = "moderate",
                    Duration = "7+ days",
                    Smoking = "no",
                    PhysicalActivity = "low",
                    SleepQuality = "poor",
                    KnownCondition = "asthma",
                    PredictedCategory = "Stress, sleep, or emotional well-being issues",
                    ProbabilityScore = 74.30,
                    RiskLevel = "Moderate",
                    UrgencyLevel = "Moderate",
                    AdvisoryNote = "If symptoms continue to affect daily life, seek professional support.",
                    RedFlagDetected = false,
                    SubmittedAt = now.AddHours(-12)
                }
            );
            db.SaveChanges();

            /* =========================================================
   NOTIFICATIONS
   Cleaned to match slot-based booking logic
========================================================= */
            db.Notifications.AddRange(
                new Notification
                {
                    UserId = patientUser1.Id,
                    Title = "Appointment Booked",
                    Message = "Your appointment with Dr. Sarah Fernando has been booked successfully for tomorrow at 09:00 AM - 09:30 AM.",
                    IsRead = false,
                    CreatedAt = now.AddHours(-2)
                },
                new Notification
                {
                    UserId = patientUser2.Id,
                    Title = "Payment Successful",
                    Message = "Your payment for the completed appointment with Dr. Nimal Perera was completed successfully.",
                    IsRead = true,
                    CreatedAt = now.AddDays(-2)
                },
                new Notification
                {
                    UserId = patientUser1.Id,
                    Title = "Consultation Completed",
                    Message = "Your consultation has been completed. Payment is now pending for your appointment.",
                    IsRead = false,
                    CreatedAt = now.AddDays(-1)
                },
                new Notification
                {
                    UserId = patientUser3.Id,
                    Title = "Appointment Cancelled",
                    Message = "Your appointment was cancelled successfully. You can make a new booking from the appointment page.",
                    IsRead = false,
                    CreatedAt = now.AddHours(-10)
                },
                new Notification
                {
                    UserId = doctorUser1.Id,
                    Title = "New Appointment Booked",
                    Message = "Ayesha Silva booked a new online appointment for tomorrow at 09:00 AM - 09:30 AM.",
                    IsRead = false,
                    CreatedAt = now.AddHours(-2)
                },
                new Notification
                {
                    UserId = doctorUser2.Id,
                    Title = "Consultation Payment Completed",
                    Message = "Payment has been completed for Kamal Jayasuriya's finished consultation.",
                    IsRead = true,
                    CreatedAt = now.AddDays(-2)
                },
                new Notification
                {
                    UserId = doctorUser2.Id,
                    Title = "Appointment Cancelled",
                    Message = "A patient cancelled an appointment in your schedule.",
                    IsRead = false,
                    CreatedAt = now.AddHours(-10)
                }
            );
            db.SaveChanges();

            /* =========================================================
               INQUIRIES
            ========================================================= */
            db.Inquiries.AddRange(
                new Inquiry
                {
                    UserId = patientUser1.Id,
                    Subject = "Accepted upload formats",
                    Message = "Which report file formats can I upload?",
                    Reply = "PDF and common image formats are accepted.",
                    Status = "Replied",
                    CreatedAt = now.AddDays(-5),
                    RepliedAt = now.AddDays(-4)
                },
                new Inquiry
                {
                    UserId = patientUser2.Id,
                    Subject = "Cancellation window",
                    Message = "Can I cancel my appointment after 12 hours?",
                    Reply = null,
                    Status = "Pending",
                    CreatedAt = now.AddDays(-1),
                    RepliedAt = null
                }
            );
            db.SaveChanges();

            /* =========================================================
               AUDIT LOGS
            ========================================================= */
            db.AuditLogs.Add(
                new AuditLog
                {
                    UserId = adminUser.Id,
                    Action = "SeedData",
                    Details = "Initial realistic test data was seeded for system workflow testing.",
                    CreatedAt = now
                }
            );
            db.SaveChanges();
        }
    }
}