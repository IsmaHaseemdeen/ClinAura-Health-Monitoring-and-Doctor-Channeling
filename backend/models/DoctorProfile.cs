namespace SystemBackend.Models
{
    public class DoctorProfile
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public string Specialization { get; set; } = "General Physician";

        public string? LicenseNumber { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Location { get; set; }

        public string? Qualification { get; set; }

        public string? Bio { get; set; }

        /* =========================================================
           AVAILABILITY AND SLOT CONFIGURATION
           - These fields support booking UI, queue allocation,
             and doctor availability management
        ========================================================= */
        public string? AvailableDays { get; set; }

        public int SlotDurationMinutes { get; set; } = 30;

        public int DailyCapacity { get; set; } = 10;

        public int OnlineSlotsPerDay { get; set; } = 5;

        public int PhysicalSlotsPerDay { get; set; } = 5;

        public string? OnlineConsultationTime { get; set; }

        public string? PhysicalConsultationTime { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}