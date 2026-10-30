namespace SystemBackend.DTOs
{
    public class PredictionOptionDto
    {
        // Store the raw category key returned by the prediction layer.
        public string CategoryKey { get; set; } = string.Empty;

        // Store the user-friendly name shown in the frontend.
        public string DisplayName { get; set; } = string.Empty;

        // Store the probability score for this predicted category.
        public double Probability { get; set; }

        // Store a short readable explanation of the category.
        public string ShortDescription { get; set; } = string.Empty;

        // Store example conditions linked with this predicted health area.
        public List<string> CommonConditions { get; set; } = new();
    }
}