using SystemBackend.DTOs;

namespace SystemBackend.Services
{
    public class PredictionService
    {
        // This service acts as a fallback predictor inside the backend.
        // The main symptom prediction flow now uses PythonPredictionService.
        // This backup service still allows the system to return a structured result
        // using simple keyword-based logic if the Python model is unavailable.

        public SymptomResultDto Predict(List<string> symptoms, string severity, string duration)
        {
            // Normalize the incoming symptom list so keyword checks work consistently.
            var normalizedSymptoms = symptoms
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s => s.Trim().ToLower())
                .ToList();

            // Set a default category in case no stronger symptom pattern is matched.
            string topCategoryKey = "general_constitutional";
            string topCategoryDisplayName = "General weakness, fever, or low-energy issues";
            double probability = 65;

            // Use simple rule-based keyword checks to identify the most likely health category.
            if (normalizedSymptoms.Any(s => s.Contains("cough") || s.Contains("shortness of breath") || s.Contains("wheezing")))
            {
                topCategoryKey = "respiratory_ent";
                topCategoryDisplayName = "Breathing, cold, or throat-related issues";
                probability = 82;
            }
            else if (normalizedSymptoms.Any(s => s.Contains("chest pain")))
            {
                topCategoryKey = "cardiovascular_warning";
                topCategoryDisplayName = "Possible heart or circulation warning signs";
                probability = 85;
            }
            else if (normalizedSymptoms.Any(s => s.Contains("stomach") || s.Contains("nausea") || s.Contains("vomiting") || s.Contains("diarrhea")))
            {
                topCategoryKey = "gastrointestinal";
                topCategoryDisplayName = "Stomach or digestion-related issues";
                probability = 78;
            }
            else if (normalizedSymptoms.Any(s => s.Contains("headache") || s.Contains("dizziness") || s.Contains("fainting")))
            {
                topCategoryKey = "neurological_headache";
                topCategoryDisplayName = "Headache, dizziness, or balance-related issues";
                probability = 76;
            }
            else if (normalizedSymptoms.Any(s => s.Contains("rash") || s.Contains("itching") || s.Contains("skin")))
            {
                topCategoryKey = "skin_allergy";
                topCategoryDisplayName = "Skin irritation or allergy-related issues";
                probability = 74;
            }

            // Detect urgent warning signs directly from the symptom list.
            bool redFlagDetected = normalizedSymptoms.Any(s =>
                s.Contains("chest pain") ||
                s.Contains("shortness of breath") ||
                s.Contains("fainting") ||
                s.Contains("confusion"));

            // Derive risk and urgency values based on symptom severity, duration, and warning signs.
            string riskLevel = DetermineRiskLevel(severity, duration, redFlagDetected);
            string urgencyLevel = redFlagDetected ? "Urgent" : riskLevel;
            string recommendedAction = redFlagDetected
                ? "urgent_review"
                : riskLevel == "High"
                    ? "book_appointment"
                    : riskLevel == "Moderate"
                        ? "monitor"
                        : "self_care";

            // Build a patient-friendly advisory message based on the calculated risk level.
            string advisoryNote = redFlagDetected
                ? "Your answers include warning signs that need urgent medical attention."
                : riskLevel == "High"
                    ? "Your symptoms suggest a higher level of concern. Please arrange medical review."
                    : riskLevel == "Moderate"
                        ? "Please monitor your symptoms and seek medical advice if they continue or worsen."
                        : "Try simple self-care, rest, and monitor how you feel.";

            // Return the result using the current SymptomResultDto structure expected by the frontend.
            return new SymptomResultDto
            {
                TopCategoryKey = topCategoryKey,
                TopCategoryDisplayName = topCategoryDisplayName,
                RiskLevel = riskLevel,
                UrgencyLevel = urgencyLevel,
                RecommendedAction = recommendedAction,
                AdvisoryNote = advisoryNote,
                EnteredSymptoms = string.Join(", ", symptoms),
                RedFlagDetected = redFlagDetected,
                RedFlagReasons = redFlagDetected
                    ? new List<string> { "One or more warning signs were found in your answers." }
                    : new List<string>(),
                Top3Predictions = new List<PredictionOptionDto>
                {
                    new PredictionOptionDto
                    {
                        CategoryKey = topCategoryKey,
                        DisplayName = topCategoryDisplayName,
                        Probability = probability,
                        ShortDescription = "This health area best matches the symptoms you entered.",
                        CommonConditions = GetCommonConditions(topCategoryKey)
                    }
                },
                ExplanationPoints = new List<string>
                {
                    $"The result was based on the symptoms you entered: {string.Join(", ", symptoms)}.",
                    $"You described the symptoms as {severity?.ToLower() ?? "not specified"}.",
                    $"You said the symptoms have been present for {duration ?? "an unknown period"}."
                },
                Disclaimer = "This symptom check is for information and guidance only. It does not give a medical diagnosis, treatment plan, or prescription. Please seek medical advice from a qualified healthcare professional if your symptoms are severe, getting worse, lasting longer than expected, or causing concern."
            };
        }

        private string DetermineRiskLevel(string severity, string duration, bool redFlagDetected)
        {
            // Give high risk immediately if warning signs are present.
            if (redFlagDetected)
            {
                return "High";
            }

            var normalizedSeverity = (severity ?? "").Trim().ToLower();
            var normalizedDuration = (duration ?? "").Trim().ToLower();

            int score = 0;

            // Convert severity into a simple score.
            if (normalizedSeverity == "mild") score += 1;
            if (normalizedSeverity == "moderate") score += 2;
            if (normalizedSeverity == "severe") score += 3;

            // Convert duration into a simple score.
            if (normalizedDuration == "1-3 days") score += 1;
            if (normalizedDuration == "3-7 days") score += 2;
            if (normalizedDuration == "7+ days") score += 3;

            // Map the total score into a risk category.
            if (score <= 3) return "Low";
            if (score <= 5) return "Moderate";
            return "High";
        }

        private List<string> GetCommonConditions(string categoryKey)
        {
            // Return example common conditions for the matched category.
            return categoryKey switch
            {
                "respiratory_ent" => new List<string>
                {
                    "Common cold",
                    "Flu",
                    "Sore throat",
                    "Mild asthma"
                },
                "cardiovascular_warning" => new List<string>
                {
                    "Chest-related warning symptoms",
                    "Heart rhythm-related symptoms"
                },
                "gastrointestinal" => new List<string>
                {
                    "Indigestion",
                    "Food poisoning",
                    "Stomach irritation"
                },
                "neurological_headache" => new List<string>
                {
                    "Migraine",
                    "Tension headache",
                    "Sleep-related headache"
                },
                "skin_allergy" => new List<string>
                {
                    "Skin allergy",
                    "Rash",
                    "Dry skin flare"
                },
                _ => new List<string>
                {
                    "General infection",
                    "Mild illness"
                }
            };
        }
    }
}