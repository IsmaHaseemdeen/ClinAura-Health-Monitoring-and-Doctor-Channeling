namespace SystemBackend.DTOs
{
    public class UpdateAppointmentDto
    {
        // Store the updated appointment status.
        public string Status { get; set; } = string.Empty;

        // Store the online meeting link if needed.
        public string? OnlineMeetingLink { get; set; }

        // Store the physical location if needed.
        public string? PhysicalLocation { get; set; }
    }
}