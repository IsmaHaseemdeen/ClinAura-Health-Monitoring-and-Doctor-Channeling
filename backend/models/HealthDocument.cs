namespace SystemBackend.Models
{
    public class HealthDocument
    {
        public int Id { get; set; }

        public int PatientProfileId { get; set; }
        public PatientProfile? PatientProfile { get; set; }

        public string FileName { get; set; } = string.Empty;

        public string FilePath { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;

        public string DocumentCategory { get; set; } = string.Empty;

        public DateTime DocumentDate { get; set; }

        public string? Notes { get; set; }

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}