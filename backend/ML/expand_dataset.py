import pandas as pd
import random

# Define the source dataset, target row count, and random seed for reproducibility.
BASE_PATH = "data/symptoms_dataset.csv"
TARGET_SIZE = 600
RANDOM_SEED = 42

random.seed(RANDOM_SEED)

# Load the original symptom dataset.
df = pd.read_csv(BASE_PATH)

# These synonym options help create realistic wording variation in symptom descriptions.
symptom_synonyms = {
    "dry cough": ["cough", "dry cough"],
    "runny nose": ["runny nose", "blocked nose"],
    "sore throat": ["sore throat", "throat pain"],
    "shortness of breath": ["shortness of breath", "breathing difficulty"],
    "wheezing": ["wheezing"],
    "stomach pain": ["stomach pain", "abdominal pain"],
    "vomiting": ["vomiting"],
    "nausea": ["nausea"],
    "diarrhea": ["diarrhea"],
    "heartburn": ["heartburn"],
    "bloating": ["bloating"],
    "constipation": ["constipation"],
    "back pain": ["back pain"],
    "neck pain": ["neck pain"],
    "shoulder pain": ["shoulder pain"],
    "muscle cramps": ["muscle cramps"],
    "joint pain": ["joint pain"],
    "stiffness": ["stiffness", "body stiffness"],
    "headache": ["headache"],
    "dizziness": ["dizziness"],
    "blurred vision": ["blurred vision"],
    "light sensitivity": ["light sensitivity"],
    "fainting": ["fainting"],
    "confusion": ["confusion"],
    "fatigue": ["fatigue", "tiredness", "low energy"],
    "weakness": ["weakness"],
    "body aches": ["body aches"],
    "chills": ["chills"],
    "fever": ["fever", "high fever"],
    "sweating": ["sweating"],
    "skin rash": ["skin rash", "rash"],
    "itching": ["itching"],
    "redness": ["redness"],
    "hives": ["hives"],
    "swelling": ["swelling"],
    "dry skin": ["dry skin"],
    "burning urination": ["burning urination", "burning when passing urine"],
    "frequent urination": ["frequent urination"],
    "frequent urge": ["frequent urge", "urgency to pass urine"],
    "urinary discomfort": ["urinary discomfort"],
    "lower abdominal pain": ["lower abdominal pain", "lower stomach pain"],
    "pelvic discomfort": ["pelvic discomfort"],
    "stress": ["stress"],
    "anxiety": ["anxiety", "panic feelings"],
    "poor sleep": ["poor sleep", "insomnia"],
    "low mood": ["low mood"],
    "restlessness": ["restlessness"],
}

# These combined symptom examples create more realistic and ambiguous cases for training.
ambiguous_symptom_pool = [
    "fatigue headache poor sleep",
    "body aches weakness fever",
    "nausea dizziness headache",
    "stress chest tightness insomnia",
    "back pain fatigue weakness",
    "abdominal discomfort nausea fatigue",
    "dizziness weakness poor sleep",
    "fever headache body aches",
]

# These mappings introduce controlled overlap between categories to reduce over-simplified training patterns.
overlap_targets = {
    "respiratory_ent": ["general_constitutional", "mental_sleep_stress"],
    "gastrointestinal": ["general_constitutional", "neurological_headache"],
    "musculoskeletal": ["general_constitutional"],
    "neurological_headache": ["general_constitutional", "mental_sleep_stress"],
    "general_constitutional": ["neurological_headache", "mental_sleep_stress", "gastrointestinal"],
    "skin_allergy": ["general_constitutional"],
    "urinary_reproductive": ["general_constitutional", "gastrointestinal"],
    "mental_sleep_stress": ["neurological_headache", "general_constitutional"],
}


def vary_symptom_text(symptom_text: str) -> str:
    # Replace symptom phrases with synonym variations so the model learns from different wording styles.
    tokens = symptom_text.strip().split()
    original = symptom_text.strip().lower()

    for base, options in symptom_synonyms.items():
        if base in original:
            original = original.replace(base, random.choice(options))

    return " ".join(original.split())


rows = []

# Generate new rows until the target dataset size is reached.
while len(rows) < TARGET_SIZE:
    for _, row in df.iterrows():
        new_row = row.copy()

        # Randomize supporting categorical context features so the model sees broader combinations.
        new_row["severity_level"] = random.choice(["mild", "moderate", "severe"])
        new_row["duration"] = random.choice(["1-3 days", "3-7 days", "7+ days"])
        new_row["smoking"] = random.choice(["yes", "no"])
        new_row["physical_activity"] = random.choice(["low", "moderate", "active"])
        new_row["sleep_quality"] = random.choice(["poor", "average", "good"])
        new_row["known_condition"] = random.choice(
            ["none", "asthma", "diabetes", "hypertension", "allergy"]
        )

        # Create alternate wording for the symptom text.
        new_row["symptoms"] = vary_symptom_text(str(new_row["symptoms"]))

        # Add ambiguous symptom patterns occasionally to simulate more realistic classification challenges.
        if random.random() < 0.10:
            new_row["symptoms"] = random.choice(ambiguous_symptom_pool)

            current = new_row["target_category"]
            if random.random() < 0.30 and current in overlap_targets:
                new_row["target_category"] = random.choice(overlap_targets[current])

        # Add a small amount of label noise so the model does not overfit too rigidly to the original data.
        elif random.random() < 0.02:
            current = new_row["target_category"]
            possible = [c for c in df["target_category"].unique() if c != current]
            new_row["target_category"] = random.choice(possible)

        rows.append(new_row)

        if len(rows) >= TARGET_SIZE:
            break

# Shuffle the generated rows and overwrite the dataset file with the expanded version.
expanded_df = pd.DataFrame(rows).sample(frac=1, random_state=RANDOM_SEED).reset_index(drop=True)
expanded_df.to_csv(BASE_PATH, index=False)

print(f"Dataset regenerated with {len(expanded_df)} rows.")