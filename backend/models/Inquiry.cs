namespace SystemBackend.Models
{
    public class Inquiry
    {
        public int Id { get; set; }

        // Who sent the inquiry
        public int UserId { get; set; }
        public User? User { get; set; }

        // Inquiry content
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;

        // Admin reply
        public string? Reply { get; set; }

        // Status tracking
        public string Status { get; set; } = "Pending";
        // Pending | Replied

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? RepliedAt { get; set; }
    }
}