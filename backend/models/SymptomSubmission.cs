namespace SystemBackend.Models
{
    public class SymptomSubmission
    {
        public int Id { get; set; }

        // Link each symptom submission to the patient profile that created it.
        public int PatientProfileId { get; set; }
        public PatientProfile? PatientProfile { get; set; }

        // Store the original symptom checker inputs so the exact submitted context is preserved.
        public string ConcernArea { get; set; } = string.Empty;

        public string SymptomList { get; set; } = string.Empty;

        public string? SeverityLevel { get; set; }

        public string? Duration { get; set; }

        public string Smoking { get; set; } = "no";

        public string PhysicalActivity { get; set; } = "moderate";

        public string SleepQuality { get; set; } = "good";

        public string KnownCondition { get; set; } = "none";

        // Store the prediction summary returned by the AI symptom checker.
        public string PredictedCategory { get; set; } = string.Empty;

        public double ProbabilityScore { get; set; }

        public string RiskLevel { get; set; } = string.Empty;

        public string UrgencyLevel { get; set; } = string.Empty;

        public string AdvisoryNote { get; set; } = string.Empty;

        // Record whether urgent warning signs were detected during the prediction flow.
        public bool RedFlagDetected { get; set; } = false;

        // Save the submission time so the system can support history views, comparisons, and doctor review.
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    }
}