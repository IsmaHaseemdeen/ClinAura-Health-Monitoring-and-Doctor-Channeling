namespace SystemBackend.Models
{
    public class Appointment
    {
        // Store the unique appointment identifier.
        public int Id { get; set; }

        // Link the appointment to the patient profile.
        public int PatientProfileId { get; set; }
        public PatientProfile? PatientProfile { get; set; }

        // Link the appointment to the doctor profile.
        public int DoctorProfileId { get; set; }
        public DoctorProfile? DoctorProfile { get; set; }

        // Store the final assigned appointment date.
        public DateTime AppointmentDate { get; set; }

        // Store the final assigned appointment time slot.
        public string AppointmentTime { get; set; } = string.Empty;

        // Store whether the appointment is online or physical.
        public string Mode { get; set; } = string.Empty;

        // Store the appointment workflow status.
        // Pending Consultation means the booking is created and waiting for the consultation.
        // Completed means the doctor finished the consultation.
        // Cancelled means the patient cancelled within the allowed period.
        public string Status { get; set; } = "Pending Consultation";

        // Store the payment workflow state.
        // Advance Paid means the booking advance was already paid.
        // Pending means the doctor completed the consultation and the final payment is still due.
        // Successful means the final payment was completed.
        // Not Due means no payment is currently due.
        public string PaymentStatus { get; set; } = "Advance Paid";

        // Store the final consultation payment amount set by the doctor.
        public decimal? PaymentAmount { get; set; }

        // Store the advance payment amount paid during booking.
        public decimal AdvancePaymentAmount { get; set; }

        // Store the advance payment method used by the patient.
        public string AdvancePaymentMethod { get; set; } = "Card";

        // Store the transaction or reference identifier for the advance payment.
        public string? AdvancePaymentReference { get; set; }

        // Store the receipt file name for transfer-based payments.
        public string? AdvanceReceiptFileName { get; set; }

        // Store the saved receipt file path.
        public string? AdvanceReceiptPath { get; set; }

        // Store the timestamp when the advance payment was completed.
        public DateTime? AdvancePaidAt { get; set; }

        // Store optional booking notes.
        public string? Notes { get; set; }

        // Store the generated online meeting link if the booking is online.
        public string? OnlineMeetingLink { get; set; }

        // Store the saved physical consultation location if the booking is physical.
        public string? PhysicalLocation { get; set; }

        // Store the queue position for queue-style scheduling.
        public int QueuePosition { get; set; } = 1;

        // Store whether the appointment is part of a waiting list.
        public bool IsWaitingList { get; set; } = false;

        // Store whether the appointment is currently active.
        public bool IsActive { get; set; } = true;

        // Store when the booking request was first created.
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

        // Store the last updated timestamp.
        public DateTime? UpdatedAt { get; set; }
    }
}