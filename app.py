"""
Flask API for Diabetes Risk Prediction
---------------------------------------
Loads a trained RandomForest model and exposes a /predict endpoint that
returns BOTH the patient's current risk AND an "improvement" risk where
BMI and Blood Glucose are automatically reduced by 10 %.
"""

import os
import numpy as np
import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

# ── App Setup ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)  # allow the React frontend to call this API

# ── Load Model Artifacts ────────────────────────────────────────────────────
MODEL_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "kaggle_output", "clinical_model_export"
)

model        = joblib.load(os.path.join(MODEL_DIR, "model.joblib"))
feature_list = joblib.load(os.path.join(MODEL_DIR, "feature_list.joblib"))

print(f"[OK] Model loaded - expects {len(feature_list)} features:")
print(f"  {list(feature_list)}")

# Feature importance from the trained model
IMPORTANCES = dict(zip(feature_list, model.feature_importances_))

# Typical max values used to normalise patient values for contribution calc
FEATURE_MAX = {
    "age": 100, "hypertension": 1, "heart_disease": 1,
    "bmi": 60, "HbA1c_level": 15, "blood_glucose_level": 300,
    "gender_encoded": 1, "smoking_history_encoded": 4,
}

NICE_NAMES = {
    "age": "Age", "hypertension": "Hypertension", "heart_disease": "Heart Disease",
    "bmi": "BMI", "HbA1c_level": "HbA1c", "blood_glucose_level": "Glucose",
    "gender_encoded": "Gender", "smoking_history_encoded": "Smoking",
}


# ── Data-Cleaning Helper ────────────────────────────────────────────────────
def clean_input(raw: dict) -> pd.DataFrame:
    """
    Takes a flat dict of patient values, reorders columns to match the
    exact order stored in feature_list.joblib, and fills any missing
    feature with 0.
    """
    df = pd.DataFrame([raw])

    # Ensure every expected feature exists; fill missing ones with 0
    for feat in feature_list:
        if feat not in df.columns:
            df[feat] = 0

    # Reorder columns to the exact training order
    df = df[feature_list]

    # Cast to float for the model
    df = df.astype(float)
    return df


# ── Health Check ────────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Diabetes Risk API is running."})


# ── /predict Route ──────────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    """
    Expects JSON like:
    {
      "age": 55,
      "bmi": 28.5,
      "blood_glucose_level": 140,
      "HbA1c_level": 6.1,
      "hypertension": 1,
      "heart_disease": 0,
      "gender_encoded": 1,
      "smoking_history_encoded": 2
    }

    Returns:
    {
      "current_risk":     <float 0-100>,
      "improvement_risk": <float 0-100>
    }
    """
    try:
        data = request.get_json(force=True)

        # --- 1. Current Risk ---
        df_current = clean_input(data)
        current_prob = model.predict_proba(df_current)[0][1]   # P(diabetes=1)
        current_risk = round(float(current_prob * 100), 2)

        # --- 2. Improvement Risk (BMI & Glucose reduced by 10%) ---
        improved_data = data.copy()
        if "bmi" in improved_data:
            improved_data["bmi"] = float(improved_data["bmi"]) * 0.90
        if "blood_glucose_level" in improved_data:
            improved_data["blood_glucose_level"] = (
                float(improved_data["blood_glucose_level"]) * 0.90
            )

        df_improved = clean_input(improved_data)
        improved_prob = model.predict_proba(df_improved)[0][1]
        improvement_risk = round(float(improved_prob * 100), 2)

        # --- 3. Dynamic feature contributions ---
        contributions = []
        for feat in feature_list:
            val = float(df_current[feat].iloc[0])
            norm = val / FEATURE_MAX.get(feat, 1)
            score = round(norm * IMPORTANCES[feat] * 100, 2)
            contributions.append({
                "feature": NICE_NAMES.get(feat, feat),
                "key": feat,
                "value": round(val, 2),
                "score": score,
            })
        contributions.sort(key=lambda x: x["score"], reverse=True)

        # --- 4. Improved values for comparison chart ---
        improved_vals = {
            "bmi":                round(float(df_improved["bmi"].iloc[0]), 1),
            "blood_glucose_level": round(float(df_improved["blood_glucose_level"].iloc[0]), 1),
        }

        return jsonify({
            "current_risk":          current_risk,
            "improvement_risk":      improvement_risk,
            "feature_contributions":  contributions,
            "improved_values":        improved_vals,
        })

    except Exception as exc:
        return jsonify({"error": str(exc)}), 400


# ── Entry Point ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
