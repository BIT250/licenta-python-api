import os
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder


class DiabetesAI:
    def __init__(self, model_path="ai_models/resources/diabetes_model.joblib", scaler_path="ai_models/resources/diabetes_scaler.joblib"):
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.model = None
        self.scaler = None
        self.label_encoder = LabelEncoder()

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
            "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
            "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
        ]

        # Convert input dictionary to a pandas DataFrame with the same feature names
        input_df = pd.DataFrame([input_data], columns=feature_order)

        # Scale the input
        input_scaled = self.scaler.transform(input_df)

        # Convert the scaled input back to DataFrame with feature names
        input_scaled_df = pd.DataFrame(input_scaled, columns=feature_order)

        # Predict using the trained model
        prediction = self.model.predict(input_scaled_df)[0]
        return True if prediction == 1 else False
