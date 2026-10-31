from pathlib import Path
import joblib
import pandas as pd

# Resolve the current folder and artifact locations so the saved model files can be loaded reliably.
BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"

MODEL_PATH = ARTIFACTS_DIR / "logistic_regression_model.joblib"
LABEL_ENCODER_PATH = ARTIFACTS_DIR / "label_encoder.joblib"


def safe_lower(value):
    # Normalize text input safely by handling null values, trimming spaces, and converting to lowercase.
    return (value or "").strip().lower()


# This disclaimer is returned to the frontend so the user understands that the symptom checker is for guidance only.
DISCLAIMER_TEXT = (
    "This symptom check is for information and guidance only. "
    "It does not give a medical diagnosis, treatment plan, or prescription. "
    "Please seek medical advice from a qualified healthcare professional if "
    "your symptoms are severe, getting worse, lasting longer than expected, "
    "or causing concern."
)

# This urgent notice is used whenever dangerous warning signs are detected.
URGENT_NOTICE_TEXT = (
    "If you have severe breathing trouble, strong chest pain, fainting, confusion, "
    "heavy bleeding, or any quickly worsening symptoms, seek urgent medical care immediately."
)

# Map the frontend concern area selection to the trained target categories used by the ML model.
CONCERN_AREA_TO_CATEGORY = {
    "breathing_throat": "respiratory_ent",
    "stomach_digestion": "gastrointestinal",
    "body_pain": "musculoskeletal",
    "head_balance": "neurological_headache",
    "general_unwell": "general_constitutional",
    "skin": "skin_allergy",
    "urinary": "urinary_reproductive",
    "stress_sleep": "mental_sleep_stress",
}

# Store user-friendly metadata for each category so the frontend can display readable results and advice.
CATEGORY_METADATA = {
    "respiratory_ent": {
        "display_name": "Breathing, cold, or throat-related issues",
        "short_description": "Symptoms affecting breathing, the nose, or the throat.",
        "common_conditions": [
            "Common cold",
            "Flu",
            "Sinus infection",
            "Sore throat",
            "Bronchitis",
            "Allergies",
            "Mild asthma"
        ],
        "advice_low": "Rest, drink enough fluids, and monitor how you feel.",
        "advice_moderate": "Monitor symptoms closely and consider speaking with a healthcare professional if symptoms continue.",
        "advice_high": "Please arrange medical review soon, especially if breathing becomes harder."
    },
    "gastrointestinal": {
        "display_name": "Stomach or digestion-related issues",
        "short_description": "Symptoms affecting the stomach, bowels, or digestion.",
        "common_conditions": [
            "Indigestion",
            "Food poisoning",
            "Acid reflux",
            "Stomach irritation",
            "Viral stomach infection"
        ],
        "advice_low": "Drink fluids, eat light meals, and monitor symptoms.",
        "advice_moderate": "If symptoms continue, worsen, or affect eating and drinking, seek medical advice.",
        "advice_high": "Please seek medical attention soon, especially if symptoms are severe or you cannot keep fluids down."
    },
    "musculoskeletal": {
        "display_name": "Body pain, muscle, or joint-related issues",
        "short_description": "Symptoms affecting muscles, joints, movement, or body comfort.",
        "common_conditions": [
            "Muscle strain",
            "Joint irritation",
            "Back strain",
            "Body stiffness",
            "Shoulder strain"
        ],
        "advice_low": "Rest the area, avoid overuse, and monitor symptoms.",
        "advice_moderate": "If pain is affecting movement or daily activities, consider medical advice.",
        "advice_high": "Please seek medical care soon if pain is severe, spreading, or limiting normal movement."
    },
    "neurological_headache": {
        "display_name": "Headache, dizziness, or balance-related issues",
        "short_description": "Symptoms affecting the head, balance, or how clearly you feel.",
        "common_conditions": [
            "Migraine",
            "Tension headache",
            "Poor sleep-related headache",
            "Stress-related headache",
            "Dizziness-related discomfort"
        ],
        "advice_low": "Rest, stay hydrated, and monitor symptoms.",
        "advice_moderate": "If symptoms continue or return often, seek medical advice.",
        "advice_high": "Please seek medical care soon, especially if symptoms are severe or affect normal daily activity."
    },
    "general_constitutional": {
        "display_name": "General weakness, fever, or low-energy issues",
        "short_description": "Symptoms causing tiredness, fever, weakness, or a general unwell feeling.",
        "common_conditions": [
            "Viral infection",
            "Fever-related illness",
            "Fatigue-related illness",
            "Mild body infection"
        ],
        "advice_low": "Rest, stay hydrated, and monitor your symptoms.",
        "advice_moderate": "If symptoms continue or you feel weaker, seek medical advice.",
        "advice_high": "Please seek medical review soon, especially if weakness or fever is getting worse."
    },
    "skin_allergy": {
        "display_name": "Skin irritation or allergy-related issues",
        "short_description": "Symptoms affecting the skin, such as rash, itching, or swelling.",
        "common_conditions": [
            "Skin allergy",
            "Mild skin irritation",
            "Rash",
            "Hives",
            "Dry skin flare"
        ],
        "advice_low": "Avoid known triggers if possible and monitor your skin symptoms.",
        "advice_moderate": "If the rash spreads or becomes more uncomfortable, seek medical advice.",
        "advice_high": "Please seek medical care soon, especially if swelling is increasing or symptoms are severe."
    },
    "urinary_reproductive": {
        "display_name": "Urinary or lower abdominal issues",
        "short_description": "Symptoms affecting urination, pelvic comfort, or the lower abdomen.",
        "common_conditions": [
            "Urinary infection",
            "Bladder irritation",
            "Lower abdominal discomfort",
            "Urinary tract symptoms"
        ],
        "advice_low": "Drink fluids and monitor symptoms carefully.",
        "advice_moderate": "If symptoms continue or become more uncomfortable, seek medical advice.",
        "advice_high": "Please seek medical care soon, especially if pain, fever, or discomfort is severe."
    },
    "mental_sleep_stress": {
        "display_name": "Stress, sleep, or emotional well-being issues",
        "short_description": "Symptoms related to sleep, stress, tension, or emotional strain.",
        "common_conditions": [
            "Stress-related tiredness",
            "Poor sleep pattern",
            "Tension-related symptoms",
            "Low mood",
            "Anxiety-related discomfort"
        ],
        "advice_low": "Try rest, regular sleep, and simple stress-reducing activities.",
        "advice_moderate": "If symptoms continue or begin to affect daily life, seek professional support.",
        "advice_high": "Please seek support soon if symptoms feel overwhelming or are affecting your daily life strongly."
    },
    "cardiovascular_warning": {
        "display_name": "Possible heart or circulation warning signs",
        "short_description": "Symptoms that may need urgent medical attention, especially if severe.",
        "common_conditions": [
            "Chest-related warning symptoms",
            "Heart rhythm-related symptoms",
            "Circulation-related discomfort"
        ],
        "advice_low": "Monitor symptoms carefully and seek medical advice if they return.",
        "advice_moderate": "Please arrange medical review soon.",
        "advice_high": "Please seek urgent medical attention."
    },
}


def load_artifacts():
    # Load the saved trained model and label encoder used during live prediction.
    model = joblib.load(MODEL_PATH)
    label_encoder = joblib.load(LABEL_ENCODER_PATH)
    return model, label_encoder


def normalize_list(values):
    # Normalize each value in a list and remove blank entries so comparisons remain consistent.
    return [safe_lower(v) for v in (values or []) if safe_lower(v)]


def map_symptom_to_dataset_text(symptom):
    # Convert frontend symptom wording into the wording used in the training dataset.
    # This keeps live prediction aligned with the data the model learned from.
    value = safe_lower(symptom)

    mapping = {
        "stomach pain": "abdominal pain",
        "burning when passing urine": "burning urination",
        "lower stomach pain": "lower abdominal pain",
        "urgency to pass urine": "frequent urge",
        "urinary discomfort": "urinary discomfort",
        "poor sleep": "insomnia",
        "low mood": "stress",
        "panic feelings": "anxiety",
        "body stiffness": "stiffness",
        "trouble moving": "limited movement",
        "skin rash": "skin rash",
        "shortness of breath": "shortness of breath",
        "chest pain": "chest pain",
        "severe dehydration": "severe dehydration",
    }

    return mapping.get(value, value)


def detect_red_flags(symptoms, red_flag_answers, severity_level):
    # Combine the selected symptoms and dedicated red flag answers into one set for emergency checks.
    combined = set(normalize_list(symptoms)) | set(normalize_list(red_flag_answers))
    reasons = []

    # These keywords represent serious warning signs that should raise priority even if the ML model predicts otherwise.
    severe_keywords = {
        "shortness of breath": "Severe breathing difficulty needs urgent medical attention.",
        "chest pain": "Strong chest pain can be a serious warning sign.",
        "confusion": "Confusion can be a warning sign that needs urgent medical review.",
        "fainting": "Fainting can be a warning sign and should be checked urgently.",
        "heavy bleeding": "Heavy bleeding needs urgent medical attention.",
        "severe dehydration": "Severe dehydration can become dangerous without treatment."
    }

    for key, reason in severe_keywords.items():
        if key in combined:
            reasons.append(reason)

    # Escalate breathing difficulty further when the patient also reports severe intensity.
    if safe_lower(severity_level) == "severe" and "shortness of breath" in combined:
        reasons.append("Severe symptoms with breathing difficulty need urgent care.")

    deduped = list(dict.fromkeys(reasons))
    return deduped


def determine_risk_level(severity_level, duration, probability, red_flag_detected):
    # Calculate a simple rule-based risk score using symptom severity, duration, model confidence, and red flags.
    severity = safe_lower(severity_level)
    duration_value = safe_lower(duration)

    if red_flag_detected:
        return "High"

    score = 0

    if severity == "mild":
        score += 1
    elif severity == "moderate":
        score += 2
    elif severity == "severe":
        score += 3

    if duration_value == "1-3 days":
        score += 1
    elif duration_value == "3-7 days":
        score += 2
    elif duration_value == "7+ days":
        score += 3

    if probability >= 75:
        score += 2
    elif probability >= 50:
        score += 1

    if score <= 3:
        return "Low"
    if score <= 6:
        return "Moderate"
    return "High"


def determine_urgency_level(risk_level, red_flag_detected):
    # Translate risk into a user-facing urgency level.
    if red_flag_detected:
        return "Urgent"
    if risk_level == "High":
        return "High"
    if risk_level == "Moderate":
        return "Moderate"
    return "Low"


def determine_recommended_action(risk_level, red_flag_detected):
    # Return a simplified next-step action that the frontend can use for guidance or workflow decisions.
    if red_flag_detected:
        return "urgent_review"
    if risk_level == "High":
        return "book_appointment"
    if risk_level == "Moderate":
        return "monitor"
    return "self_care"


def get_advice_for_risk(category_key, risk_level, red_flag_detected):
    # Select advice text based on the predicted category and calculated risk level.
    if red_flag_detected:
        return URGENT_NOTICE_TEXT

    metadata = CATEGORY_METADATA.get(category_key, {})

    if risk_level == "Low":
        return metadata.get("advice_low", "Monitor your symptoms and take simple self-care steps.")
    if risk_level == "Moderate":
        return metadata.get("advice_moderate", "Monitor your symptoms and seek advice if needed.")
    return metadata.get("advice_high", "Please seek medical advice soon.")


def build_explanation_points(symptoms, severity_level, duration, top_display_name, red_flag_detected, concern_area):
    # Build patient-friendly explanation points so the frontend can show why the system suggested the result.
    symptom_count = len(symptoms or [])
    points = [
        f"Your answers were most similar to {top_display_name.lower()}.",
        f"You reported {symptom_count} symptom{'s' if symptom_count != 1 else ''}.",
        f"You described the symptoms as {safe_lower(severity_level) or 'not specified'}.",
        f"You said the symptoms have been present for {duration or 'an unknown length of time'}."
    ]

    if concern_area:
        points.append("Your selected main concern area was also used to guide the result.")

    if red_flag_detected:
        points.append("One or more urgent warning signs were detected in your answers.")

    return points


def apply_concern_area_bias(ranked_predictions, concern_area):
    # Apply a small probability bonus to the category that matches the selected concern area.
    # This helps the final ranking reflect the patient's chosen context without replacing the ML output completely.
    mapped_category = CONCERN_AREA_TO_CATEGORY.get(safe_lower(concern_area))

    if not mapped_category:
        return ranked_predictions

    adjusted = []
    for category_key, probability in ranked_predictions:
        bonus = 0.08 if category_key == mapped_category else 0.0
        adjusted.append((category_key, probability + bonus))

    adjusted = sorted(adjusted, key=lambda x: x[1], reverse=True)

    total = sum(prob for _, prob in adjusted)
    if total > 0:
        adjusted = [(category, prob / total) for category, prob in adjusted]

    return adjusted


def predict_top_3(
    concern_area,
    symptoms,
    severity_level,
    duration,
    smoking,
    physical_activity,
    sleep_quality,
    known_condition,
    red_flag_answers,
):
    # Load the trained model and encoder each time a prediction is requested.
    model, label_encoder = load_artifacts()

    # Normalize symptom text and convert it into the same phrasing used during training.
    normalized_symptoms_list = [map_symptom_to_dataset_text(s) for s in normalize_list(symptoms)]
    normalized_symptoms = ", ".join(sorted(set(normalized_symptoms_list)))

    # Build a single-row dataframe because the scikit-learn pipeline expects tabular input.
    input_df = pd.DataFrame([{
        "symptoms": normalized_symptoms,
        "severity_level": safe_lower(severity_level),
        "duration": safe_lower(duration),
        "smoking": safe_lower(smoking),
        "physical_activity": safe_lower(physical_activity),
        "sleep_quality": safe_lower(sleep_quality),
        "known_condition": safe_lower(known_condition),
    }])

    # Predict probabilities for every class and decode the category names.
    probabilities = model.predict_proba(input_df)[0]
    class_names = label_encoder.inverse_transform(range(len(probabilities)))

    # Rank all predicted classes from highest probability to lowest.
    full_ranked = sorted(zip(class_names, probabilities), key=lambda x: x[1], reverse=True)

    # Slightly adjust the ranking using the selected concern area.
    biased_ranked = apply_concern_area_bias(full_ranked, concern_area)

    # Keep only the top three predictions for display.
    ranked = biased_ranked[:3]

    top_probability = float(ranked[0][1] * 100) if ranked else 0.0
    top_category_key = ranked[0][0] if ranked else ""

    # Check whether serious warning signs are present.
    red_flag_reasons = detect_red_flags(symptoms, red_flag_answers, severity_level)
    red_flag_detected = len(red_flag_reasons) > 0

    # Override the result for chest pain scenarios so urgent cardiovascular warning logic takes priority.
    if red_flag_detected and "chest pain" in set(normalize_list(symptoms)) | set(normalize_list(red_flag_answers)):
        top_category_key = "cardiovascular_warning"

        ranked = [
            ("cardiovascular_warning", 0.96),
            ("respiratory_ent", 0.03),
            ("general_constitutional", 0.01),
        ]

        top_probability = 96.0

    # Calculate clinical guidance values after the main category decision is finalized.
    risk_level = determine_risk_level(
        severity_level=severity_level,
        duration=duration,
        probability=top_probability,
        red_flag_detected=red_flag_detected
    )

    urgency_level = determine_urgency_level(risk_level, red_flag_detected)
    recommended_action = determine_recommended_action(risk_level, red_flag_detected)

    # Convert the ranked predictions into a frontend-friendly response format.
    formatted_predictions = []

    for category_key, probability in ranked:
        metadata = CATEGORY_METADATA.get(category_key, {})
        formatted_predictions.append({
            "categoryKey": category_key,
            "displayName": metadata.get("display_name", category_key),
            "probability": round(float(probability) * 100, 2),
            "shortDescription": metadata.get("short_description", ""),
            "commonConditions": metadata.get("common_conditions", [])
        })

    top_display_name = CATEGORY_METADATA.get(top_category_key, {}).get("display_name", top_category_key)

    # Return a complete response object with prediction results, safety flags, and patient guidance text.
    return {
        "topCategoryKey": top_category_key,
        "topCategoryDisplayName": top_display_name,
        "riskLevel": risk_level,
        "urgencyLevel": urgency_level,
        "recommendedAction": recommended_action,
        "advisoryNote": get_advice_for_risk(top_category_key, risk_level, red_flag_detected),
        "enteredSymptoms": ", ".join(symptoms),
        "redFlagDetected": red_flag_detected,
        "redFlagReasons": red_flag_reasons,
        "top3Predictions": formatted_predictions,
        "explanationPoints": build_explanation_points(
            symptoms=symptoms,
            severity_level=severity_level,
            duration=duration,
            top_display_name=top_display_name,
            red_flag_detected=red_flag_detected,
            concern_area=concern_area
        ),
        "disclaimer": DISCLAIMER_TEXT
    }