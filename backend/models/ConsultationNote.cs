namespace SystemBackend.Models
{
    public class ConsultationNote
    {
        public int Id { get; set; }

        public int AppointmentId { get; set; }
        public Appointment? Appointment { get; set; }

        public int DoctorProfileId { get; set; }
        public DoctorProfile? DoctorProfile { get; set; }

        public int PatientProfileId { get; set; }
        public PatientProfile? PatientProfile { get; set; }

        public string Notes { get; set; } = string.Empty;

        public string? Recommendations { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}