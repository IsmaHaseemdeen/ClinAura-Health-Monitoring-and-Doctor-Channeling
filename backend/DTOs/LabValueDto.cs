namespace SystemBackend.DTOs
{
    public class LabValueDto
    {
        public string TestName { get; set; } = string.Empty;
        public double Value { get; set; }
        public string Unit { get; set; } = string.Empty;
        public DateTime TestDate { get; set; }
    }
}