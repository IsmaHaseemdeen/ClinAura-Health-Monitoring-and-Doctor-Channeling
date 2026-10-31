namespace SystemBackend.Models
{
    public class PatientProfile
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string Gender { get; set; } = string.Empty;

        public double? HeightCm { get; set; }

        public double? WeightKg { get; set; }

        public string? MedicalHistory { get; set; }

        public string? LifestyleNotes { get; set; }

        public bool ConsentAccepted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public ICollection<HealthDocument> HealthDocuments { get; set; } = new List<HealthDocument>();
    }
}