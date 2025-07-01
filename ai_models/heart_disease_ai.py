import os

import joblib
import pandas as pd


class HeartDiseaseAI:
    def __init__(self,
                 model_path="ai_models/resources/heart_disease_tabpfn_model.joblib",
                 scaler_path="ai_models/resources/heart_disease_tabpfn_scaler.joblib"):
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.model = None
        self.scaler = None

    def load_model(self):
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
        else:
            raise FileNotFoundError("Model or Scaler file not found. Train the model first.")

    def predict_outcome(self, input_data: dict):
        if self.model is None or self.scaler is None:
            raise ValueError("Model and scaler are not loaded.")

        feature_order = [
            "age", "sex", "cp", "trestbps", "chol", "fbs",
            "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"
        ]

        # Create DataFrame in the same order as training
        input_df = pd.DataFrame([input_data], columns=feature_order)
        # Scale features
        input_scaled = self.scaler.transform(input_df)
        # Convert back to DataFrame for predict
        input_scaled_df = pd.DataFrame(input_scaled, columns=feature_order)

        # Predict and return boolean
        prediction = self.model.predict(input_scaled_df)[0]
        return True if prediction == 1 else False