namespace SystemBackend.DTOs
{
    public class PythonSymptomPredictionRequestDto
    {
        // Store the selected concern area before sending the request to the Python prediction layer.
        public string ConcernArea { get; set; } = string.Empty;

        // Store the symptom list exactly as provided by the patient so Python can normalize it.
        public List<string> Symptoms { get; set; } = new();

        // Store the symptom severity level used in both prediction and risk scoring.
        public string SeverityLevel { get; set; } = string.Empty;

        // Store symptom duration because it contributes to risk calculation.
        public string Duration { get; set; } = string.Empty;

        // Store smoking status as one of the categorical context features.
        public string Smoking { get; set; } = "no";

        // Store activity level as a contextual categorical feature for the model.
        public string PhysicalActivity { get; set; } = "moderate";

        // Store sleep quality as an additional contextual feature.
        public string SleepQuality { get; set; } = "good";

        // Store any known long-term condition selected by the patient.
        public string KnownCondition { get; set; } = "none";

        // Store selected red-flag answers so the Python layer can apply urgent safety logic.
        public List<string> RedFlagAnswers { get; set; } = new();
    }
}