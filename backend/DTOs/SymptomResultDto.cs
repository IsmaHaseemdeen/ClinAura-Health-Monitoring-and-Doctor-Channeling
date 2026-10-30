namespace SystemBackend.DTOs
{
    public class SymptomResultDto
    {
        // Store the raw top category key returned by the prediction layer.
        public string TopCategoryKey { get; set; } = string.Empty;

        // Store the user-friendly top category name displayed in the frontend.
        public string TopCategoryDisplayName { get; set; } = string.Empty;

        // Store the calculated overall risk level.
        public string RiskLevel { get; set; } = string.Empty;

        // Store the urgency level derived from prediction and red-flag checks.
        public string UrgencyLevel { get; set; } = string.Empty;

        // Store the recommended next action so the frontend can guide the patient.
        public string RecommendedAction { get; set; } = string.Empty;

        // Store the main advice note shown to the patient after prediction.
        public string AdvisoryNote { get; set; } = string.Empty;

        // Store the symptom summary exactly as returned from the Python layer.
        public string EnteredSymptoms { get; set; } = string.Empty;

        // Store whether any urgent warning signs were detected.
        public bool RedFlagDetected { get; set; }

        // Store the reasons for red-flag escalation in patient-friendly text.
        public List<string> RedFlagReasons { get; set; } = new();

        // Store the top three predicted health areas with their details.
        public List<PredictionOptionDto> Top3Predictions { get; set; } = new();

        // Store explanation points describing why the result was suggested.
        public List<string> ExplanationPoints { get; set; } = new();

        // Store the advisory disclaimer shown in the frontend.
        public string Disclaimer { get; set; } = string.Empty;
    }
}