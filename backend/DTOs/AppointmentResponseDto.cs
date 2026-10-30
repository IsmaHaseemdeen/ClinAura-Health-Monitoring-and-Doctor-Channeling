namespace SystemBackend.DTOs
{
    public class AppointmentResponseDto
    {
        // Store the unique appointment record identifier.
        public int Id { get; set; }

        // Store the doctor profile linked to this appointment.
        public int DoctorProfileId { get; set; }

        // Store the doctor's display name for frontend use.
        public string DoctorName { get; set; } = string.Empty;

        // Store the patient profile linked to this appointment.
        public int PatientProfileId { get; set; }

        // Store the patient's display name for frontend use.
        public string PatientName { get; set; } = string.Empty;

        // Store the assigned appointment date.
        public DateTime AppointmentDate { get; set; }

        // Store the assigned appointment time slot.
        public string AppointmentTime { get; set; } = string.Empty;

        // Store whether the appointment is online or physical.
        public string Mode { get; set; } = string.Empty;

        // Store the current appointment status in the workflow.
        public string Status { get; set; } = string.Empty;

        // Store the current payment state for this appointment.
        public string PaymentStatus { get; set; } = string.Empty;

        // Store the final consultation payment amount when assigned by the doctor.
        public decimal? PaymentAmount { get; set; }

        // Store the generated meeting link for online appointments.
        public string? OnlineMeetingLink { get; set; }

        // Store the doctor's physical location for in-person appointments.
        public string? PhysicalLocation { get; set; }

        // Store patient notes or booking notes.
        public string? Notes { get; set; }

        // Store the real queue position for this doctor, date, and mode.
        public int QueuePosition { get; set; }

        // Store whether the appointment belongs to a waiting list.
        // This remains false in the current version because waiting-list logic is not used.
        public bool IsWaitingList { get; set; }

        // Store whether the patient is still allowed to cancel.
        public bool CanCancel { get; set; }

        // Store the original booking request time.
        public DateTime RequestedAt { get; set; }

        // Store the cancellation cutoff time.
        public DateTime CancellationDeadlineUtc { get; set; }

        // Store consultation notes entered by the doctor after consultation.
        public string? ConsultationNotes { get; set; }

        // Store doctor recommendations for the patient.
        public string? Recommendations { get; set; }

        // Store extended patient information when needed for doctor-side review.
        public AppointmentPatientInfoDto? Patient { get; set; }
    }

    public class AppointmentPatientInfoDto
    {
        // Store the patient profile identifier.
        public int Id { get; set; }

        // Store the patient's date of birth.
        public DateTime? DateOfBirth { get; set; }

        // Store the patient's gender.
        public string? Gender { get; set; }

        // Store the patient's height in centimeters.
        public double? HeightCm { get; set; }

        // Store the patient's weight in kilograms.
        public double? WeightKg { get; set; }

        // Store the patient's medical history summary.
        public string? MedicalHistory { get; set; }

        // Store the patient's lifestyle notes for doctor review.
        public string? LifestyleNotes { get; set; }
    }
}