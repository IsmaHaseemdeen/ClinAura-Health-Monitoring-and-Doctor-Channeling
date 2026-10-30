namespace SystemBackend.DTOs
{
    public class RegisterDoctorDto
    {
        /* =========================================================
           ADMIN DOCTOR REGISTRATION DTO
           Used when an admin creates a doctor account and its
           linked doctor profile.
        ========================================================= */
        public string FullName { get; set; } = string.Empty;

        public string Specialization { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Experience { get; set; }

        public string? Qualifications { get; set; }

        public string? AvailableDays { get; set; }

        public int SlotsPerDay { get; set; }

        public string? OnlineTime { get; set; }

        public string? PhysicalTime { get; set; }

        public string? PhysicalLocation { get; set; }

        public string Password { get; set; } = string.Empty;
    }
}