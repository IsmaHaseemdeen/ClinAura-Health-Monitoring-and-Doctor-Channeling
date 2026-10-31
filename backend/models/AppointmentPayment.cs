namespace SystemBackend.Models
{
    public class AppointmentPayment
    {
        public int Id { get; set; }

        public int AppointmentId { get; set; }
        public Appointment? Appointment { get; set; }

        public decimal Amount { get; set; }

        public string PaymentMethod { get; set; } = "Card";

        public string Status { get; set; } = "Pending";

        public string? PaymentStage { get; set; } = "Consultation";

        public string? ReferenceNumber { get; set; }

        public string? ReceiptFileName { get; set; }

        public string? ReceiptPath { get; set; }

        public string? OtpCode { get; set; }

        public DateTime? OtpExpiresAt { get; set; }

        public bool IsOtpVerified { get; set; } = false;

        public DateTime? PaidAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}