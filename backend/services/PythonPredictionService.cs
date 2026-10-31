using System.Diagnostics;
using System.Text.Json;
using SystemBackend.DTOs;

namespace SystemBackend.Services
{
    public class PythonPredictionService
    {
        private readonly IWebHostEnvironment _environment;

        public PythonPredictionService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<string> GetPredictionAsync(PythonSymptomPredictionRequestDto request)
        {
            // Resolve the backend root path and locate the ML folder that contains the Python prediction script.
            var backendRoot = _environment.ContentRootPath;
            var mlFolder = Path.Combine(backendRoot, "ML");
            var scriptPath = Path.Combine(mlFolder, "predict_api.py");

            // Convert the symptom request into JSON so it can be passed to the Python process.
            var payload = JsonSerializer.Serialize(new
            {
                concernArea = request.ConcernArea,
                symptoms = request.Symptoms,
                severityLevel = request.SeverityLevel,
                duration = request.Duration,
                smoking = request.Smoking,
                physicalActivity = request.PhysicalActivity,
                sleepQuality = request.SleepQuality,
                knownCondition = request.KnownCondition,
                redFlagAnswers = request.RedFlagAnswers
            });

            // Configure the Python process so the backend can send input and receive output programmatically.
            var startInfo = new ProcessStartInfo
            {
                FileName = "python",
                Arguments = $"\"{scriptPath}\"",
                WorkingDirectory = mlFolder,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = new Process { StartInfo = startInfo };
            process.Start();

            // Send the serialized request payload to the Python script through standard input.
            await process.StandardInput.WriteLineAsync(payload);
            await process.StandardInput.FlushAsync();
            process.StandardInput.Close();

            // Read the prediction result and any Python-side errors.
            var output = await process.StandardOutput.ReadToEndAsync();
            var error = await process.StandardError.ReadToEndAsync();

            await process.WaitForExitAsync();

            // Throw a clear exception when the Python script fails so the backend can report the issue properly.
            if (process.ExitCode != 0)
            {
                throw new Exception($"Python error: {error}");
            }

            // Guard against empty responses to avoid returning invalid prediction data to the controller.
            if (string.IsNullOrWhiteSpace(output))
            {
                throw new Exception("Python prediction returned an empty response.");
            }

            return output;
        }
    }
}