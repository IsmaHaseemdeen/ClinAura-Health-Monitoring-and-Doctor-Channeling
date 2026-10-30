namespace SystemBackend.DTOs
{
    public class DoctorProfileUpdateDto
    {
        public string? AvailableDays { get; set; }

        public int DailyCapacity { get; set; }

        public int OnlineSlotsPerDay { get; set; }

        public int PhysicalSlotsPerDay { get; set; }

        public string? OnlineConsultationTime { get; set; }

        public string? PhysicalConsultationTime { get; set; }

        public string? Location { get; set; }

        public int SlotDurationMinutes { get; set; }
    }
}