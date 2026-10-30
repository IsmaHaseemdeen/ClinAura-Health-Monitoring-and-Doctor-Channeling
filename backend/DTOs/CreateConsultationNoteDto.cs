namespace SystemBackend.DTOs
{
    public class CreateConsultationNoteDto
    {
        // Appointment linked to this consultation note
        public int AppointmentId { get; set; }

        // Main consultation notes entered by the doctor
        public string Notes { get; set; } = string.Empty;

        // Optional follow-up recommendations
        public string? Recommendations { get; set; }
    }
}