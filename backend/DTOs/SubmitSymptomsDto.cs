namespace SystemBackend.DTOs
{
    public class SubmitSymptomsDto
    {
        // Store the main symptom area selected by the patient in the frontend flow.
        public string ConcernArea { get; set; } = string.Empty;

        // Store the list of symptoms selected by the patient.
        public List<string> Symptoms { get; set; } = new();

        // Store the symptom intensity selected by the patient.
        public string SeverityLevel { get; set; } = string.Empty;

        // Store how long the patient has been experiencing the symptoms.
        public string Duration { get; set; } = string.Empty;

        // Store whether the patient reports smoking as a lifestyle factor.
        public string Smoking { get; set; } = "no";

        // Store the patient's usual activity level as additional prediction context.
        public string PhysicalActivity { get; set; } = "moderate";

        // Store recent sleep quality because it is part of the model input.
        public string SleepQuality { get; set; } = "good";

        // Store any known long-term condition selected by the patient.
        public string KnownCondition { get; set; } = "none";

        // Store any serious red-flag symptoms selected during the symptom check.
        public List<string> RedFlagAnswers { get; set; } = new();
    }
}