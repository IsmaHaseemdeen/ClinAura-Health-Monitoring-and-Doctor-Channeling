using Microsoft.AspNetCore.Http;

namespace SystemBackend.DTOs
{
    public class UploadHealthDocumentDto
    {
        // Uploaded health document file
        public IFormFile? File { get; set; }

        // Category used to organize the document
        public string DocumentCategory { get; set; } = string.Empty;

        // Date related to the medical document
        public DateTime DocumentDate { get; set; }

        // Optional note added by the patient
        public string? Notes { get; set; }
    }
}