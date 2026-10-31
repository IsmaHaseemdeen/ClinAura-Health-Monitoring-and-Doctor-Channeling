from pathlib import Path
import json
import joblib
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
    f1_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, LabelEncoder

# Resolve dataset and artifact paths relative to the current script folder.
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
ARTIFACTS_DIR = BASE_DIR / "artifacts"

DATASET_PATH = DATA_DIR / "symptoms_dataset.csv"
MODEL_PATH = ARTIFACTS_DIR / "logistic_regression_model.joblib"
LABEL_ENCODER_PATH = ARTIFACTS_DIR / "label_encoder.joblib"
METRICS_PATH = ARTIFACTS_DIR / "metrics.json"
CONFUSION_MATRIX_PATH = ARTIFACTS_DIR / "confusion_matrix.png"
CLASS_DISTRIBUTION_PATH = ARTIFACTS_DIR / "class_distribution.png"

# These are the columns required for training the symptom classification model.
REQUIRED_COLUMNS = [
    "symptoms",
    "severity_level",
    "duration",
    "smoking",
    "physical_activity",
    "sleep_quality",
    "known_condition",
    "target_category",
]


def ensure_directories() -> None:
    # Create the artifact folder if it does not already exist.
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)


def load_dataset() -> pd.DataFrame:
    # Load the symptom dataset and confirm the required training columns are present.
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found at: {DATASET_PATH}\n"
            "Place your dataset in ML/data/symptoms_dataset.csv"
        )

    df = pd.read_csv(DATASET_PATH)

    missing_columns = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Dataset is missing required columns: {missing_columns}")

    return df


def basic_cleaning(df: pd.DataFrame) -> pd.DataFrame:
    # Clean the dataset so text and categorical values are standardized before training.
    cleaned = df.copy()

    # Remove rows that do not contain a target label.
    cleaned = cleaned.dropna(subset=["target_category"])

    # Normalize the free-text symptom column.
    cleaned["symptoms"] = (
        cleaned["symptoms"]
        .fillna("")
        .astype(str)
        .str.lower()
        .str.strip()
    )

    # Normalize all structured categorical columns.
    for col in [
        "severity_level",
        "duration",
        "smoking",
        "physical_activity",
        "sleep_quality",
        "known_condition",
        "target_category",
    ]:
        cleaned[col] = (
            cleaned[col]
            .fillna("unknown")
            .astype(str)
            .str.strip()
            .str.lower()
        )

    # Remove duplicate rows to reduce repeated samples during learning.
    cleaned = cleaned.drop_duplicates()

    return cleaned


def plot_class_distribution(df: pd.DataFrame) -> None:
    # Save a chart showing how many samples belong to each target category.
    counts = df["target_category"].value_counts().sort_values(ascending=False)

    plt.figure(figsize=(10, 6))
    counts.plot(kind="bar")
    plt.title("Target Category Distribution")
    plt.xlabel("Category")
    plt.ylabel("Count")
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    plt.savefig(CLASS_DISTRIBUTION_PATH)
    plt.close()


def print_class_summary(df: pd.DataFrame) -> None:
    # Print the class distribution in the console for quick review during training.
    print("\nClass distribution:")
    print(df["target_category"].value_counts())
    print()


def build_pipeline() -> Pipeline:
    # The symptoms column is treated as a text feature.
    text_features = "symptoms"

    # These columns are treated as categorical context features.
    categorical_features = [
        "severity_level",
        "duration",
        "smoking",
        "physical_activity",
        "sleep_quality",
        "known_condition",
    ]

    # Build a preprocessing pipeline that combines TF-IDF text features and encoded categorical features.
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "symptoms_text",
                TfidfVectorizer(ngram_range=(1, 2), min_df=1),
                text_features,
            ),
            (
                "categorical_context",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("encoder", OneHotEncoder(handle_unknown="ignore"))
                    ]
                ),
                categorical_features,
            ),
        ]
    )

    # Use Logistic Regression as the final multiclass classifier.
    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "classifier",
                LogisticRegression(
                    max_iter=3000,
                    class_weight="balanced",
                    random_state=42,
                    C=1.0,
                ),
            ),
        ]
    )

    return pipeline


def evaluate_and_save_reports(y_true_encoded, y_pred_encoded, label_encoder: LabelEncoder) -> dict:
    # Calculate core evaluation metrics after prediction on the test set.
    accuracy = accuracy_score(y_true_encoded, y_pred_encoded)
    macro_f1 = f1_score(y_true_encoded, y_pred_encoded, average="macro")

    all_labels = list(range(len(label_encoder.classes_)))
    target_names = label_encoder.classes_.tolist()

    # Generate a detailed classification report for all categories.
    report = classification_report(
        y_true_encoded,
        y_pred_encoded,
        labels=all_labels,
        target_names=target_names,
        output_dict=True,
        zero_division=0,
    )

    # Build and save the confusion matrix for performance analysis.
    cm = confusion_matrix(y_true_encoded, y_pred_encoded, labels=all_labels)
    disp = ConfusionMatrixDisplay(
        confusion_matrix=cm,
        display_labels=target_names
    )

    fig, ax = plt.subplots(figsize=(10, 8))
    disp.plot(ax=ax, xticks_rotation=45, colorbar=False)
    plt.title("Confusion Matrix")
    plt.tight_layout()
    plt.savefig(CONFUSION_MATRIX_PATH)
    plt.close()

    # Store the evaluation summary in JSON format for later inspection.
    metrics = {
        "accuracy": round(float(accuracy), 4),
        "macro_f1": round(float(macro_f1), 4),
        "classification_report": report,
        "classes": target_names,
        "dataset_size": int(len(y_true_encoded) + len(y_pred_encoded) - len(y_pred_encoded)),
        "model_type": "Logistic Regression with TF-IDF and categorical context features"
    }

    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    return metrics


def split_data_safely(X, y_encoded, df: pd.DataFrame):
    # Check whether every class has enough rows to support stratified splitting.
    class_counts = df["target_category"].value_counts()
    min_class_count = class_counts.min()

    if min_class_count >= 2:
        print("Using stratified train/test split.")
        return train_test_split(
            X,
            y_encoded,
            test_size=0.2,
            random_state=42,
            stratify=y_encoded,
        )

    # Fall back to a normal split when at least one class is too small for stratification.
    print(
        "Warning: Some classes have fewer than 2 rows. "
        "Falling back to non-stratified split."
    )

    return train_test_split(
        X,
        y_encoded,
        test_size=0.2,
        random_state=42,
        stratify=None,
    )


def main() -> None:
    # Make sure the artifact directory exists before any files are saved.
    ensure_directories()

    print("Loading dataset...")
    df = load_dataset()

    print("Cleaning dataset...")
    df = basic_cleaning(df)

    print_class_summary(df)

    print("Saving class distribution chart...")
    plot_class_distribution(df)

    # Select the feature columns used for model training.
    X = df[
        [
            "symptoms",
            "severity_level",
            "duration",
            "smoking",
            "physical_activity",
            "sleep_quality",
            "known_condition",
        ]
    ].copy()

    # Select the target column that the model will learn to predict.
    y = df["target_category"].copy()

    # Encode text class labels into numeric form for model training.
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    print("Splitting dataset...")
    X_train, X_test, y_train, y_test = split_data_safely(X, y_encoded, df)

    print("Building model pipeline...")
    pipeline = build_pipeline()

    print("Training model...")
    pipeline.fit(X_train, y_train)

    print("Evaluating model...")
    y_pred = pipeline.predict(X_test)
    metrics = evaluate_and_save_reports(y_test, y_pred, label_encoder)

    print("Saving model artifacts...")
    joblib.dump(pipeline, MODEL_PATH)
    joblib.dump(label_encoder, LABEL_ENCODER_PATH)

    print("\nTraining complete.")
    print(f"Accuracy: {metrics['accuracy']}")
    print(f"Macro F1: {metrics['macro_f1']}")
    print(f"Model saved to: {MODEL_PATH}")
    print(f"Label encoder saved to: {LABEL_ENCODER_PATH}")
    print(f"Metrics saved to: {METRICS_PATH}")
    print(f"Confusion matrix saved to: {CONFUSION_MATRIX_PATH}")
    print(f"Class distribution chart saved to: {CLASS_DISTRIBUTION_PATH}")


if __name__ == "__main__":
    main()