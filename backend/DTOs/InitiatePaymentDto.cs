namespace SystemBackend.DTOs
{
    public class InitiatePaymentDto
    {
        public string CardHolderName { get; set; } = string.Empty;

        public string CardNumber { get; set; } = string.Empty;

        public string ExpiryMonth { get; set; } = string.Empty;

        public string ExpiryYear { get; set; } = string.Empty;

        public string Cvv { get; set; } = string.Empty;
    }
}