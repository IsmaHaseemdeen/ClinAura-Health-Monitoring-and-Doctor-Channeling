namespace SystemBackend.DTOs
{
    public class UpdateAppointmentStatusDto
    {
        // Store the new status sent by the doctor.
        public string Status { get; set; } = string.Empty;

        // Store the consultation payment amount assigned after completion.
        public decimal? PaymentAmount { get; set; }

        // Store the doctor's consultation notes.
        public string? ConsultationNotes { get; set; }

        // Store the doctor's recommendations for the patient.
        public string? Recommendations { get; set; }
    }
}