import json
import sys
from predict_utils import predict_top_3


def main():
    # Read the full JSON payload sent by the ASP.NET backend through standard input.
    raw_input = sys.stdin.read()

    # Stop early if nothing was provided, because prediction cannot continue without input data.
    if not raw_input.strip():
        print(json.dumps({"error": "No input provided"}))
        return

    # Parse the incoming JSON safely and return a readable error if the input format is invalid.
    try:
        data = json.loads(raw_input)
    except Exception as e:
        print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
        return

    # Pass the request values into the prediction utility function.
    # Default fallback values are used to keep the prediction flow stable even if optional fields are missing.
    result = predict_top_3(
        concern_area=data.get("concernArea", ""),
        symptoms=data.get("symptoms", []),
        severity_level=data.get("severityLevel", ""),
        duration=data.get("duration", ""),
        smoking=data.get("smoking", "no"),
        physical_activity=data.get("physicalActivity", "moderate"),
        sleep_quality=data.get("sleepQuality", "good"),
        known_condition=data.get("knownCondition", "none"),
        red_flag_answers=data.get("redFlagAnswers", []),
    )

    # Return the prediction result to the backend as JSON.
    print(json.dumps(result))


if __name__ == "__main__":
    main()