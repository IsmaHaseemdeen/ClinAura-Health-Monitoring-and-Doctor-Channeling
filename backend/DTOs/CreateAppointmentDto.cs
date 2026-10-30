namespace SystemBackend.DTOs
{
    public class CreateAppointmentDto
    {
        // Store the doctor selected by the patient.
        public int DoctorProfileId { get; set; }

        // Store the patient's preferred starting date for search.
        public DateTime AppointmentDate { get; set; }

        // Store the appointment time if manual assignment is allowed.
        // In the current booking flow this is not used because auto-assignment is enforced.
        public string? AppointmentTime { get; set; }

        // Store whether the appointment is online or physical.
        public string Mode { get; set; } = string.Empty;

        // Store whether the system should automatically assign the earliest available slot.
        public bool AutoAssign { get; set; } = true;

        // Store optional patient notes for the booking.
        public string? Notes { get; set; }

        // Store the advance payment method used during booking.
        public string AdvancePaymentMethod { get; set; } = "Card";

        // Store the advance payment amount paid during booking.
        public decimal AdvancePaymentAmount { get; set; }

        // Store card holder details for card-based advance payment.
        public string? CardHolderName { get; set; }
        public string? CardNumber { get; set; }
        public string? CardExpiryMonth { get; set; }
        public string? CardExpiryYear { get; set; }
        public string? CardCvv { get; set; }

        // Store online transfer details when the patient pays by bank transfer.
        public string? TransferBankName { get; set; }
        public string? TransferReferenceNumber { get; set; }
        public string? TransferReceiptBase64 { get; set; }
        public string? TransferReceiptFileName { get; set; }
    }
}