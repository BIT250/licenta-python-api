import joblib
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings(
    "ignore",
    message=r".*If you are loading a serialized model \(like pickle in Python.*"
)

paths = {
    "tabpfn_model": "ai_models/resources/diabetes_tabpfn_model.joblib",
    "tabpfn_scaler": "ai_models/resources/diabetes_tabpfn_scaler.joblib",
    "xgb_scaler": "ai_models/resources/diabetes_xgb_scaler.joblib",
    "xgb_model": "ai_models/resources/diabetes_xgb_model.joblib",
    "lgb_model": "ai_models/resources/diabetes_lgb_model.joblib",
    "lgb_scaler": "ai_models/resources/diabetes_lgb_scaler.joblib"
}


class DiabetesAI:
    def __init__(self):
        self.tabpfn_model_path = paths["tabpfn_model"]
        self.tabpfn_scaler_path = paths["tabpfn_scaler"]
        self.xgb_model_path = paths["xgb_model"]
        self.xgb_scaler_path = paths["xgb_scaler"]
        self.lgb_scaler_path = paths["lgb_scaler"]
        self.lgb_model_path = paths["lgb_model"]

        self.tabpfn_model = None
        self.tabpfn_scaler = None
        self.xgb_model = None
        self.xgb_scaler = None
        self.lgb_model = None
        self.lgb_scaler = None

        self.label_encoder = LabelEncoder()
        self.feature_order = [
            "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
            "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
        ]

    def load_model(self):
        self.tabpfn_model = joblib.load(self.tabpfn_model_path)
        self.tabpfn_scaler = joblib.load(self.tabpfn_scaler_path)
        self.xgb_model = joblib.load(self.xgb_model_path)
        self.xgb_scaler = joblib.load(self.xgb_scaler_path)
        self.lgb_model = joblib.load(self.lgb_model_path)
        self.lgb_scaler = joblib.load(self.lgb_scaler_path)

    def predict_outcome(self, input_data: dict):
        # Convert input dictionary to a pandas DataFrame with the same feature names
        input_df = pd.DataFrame([input_data], columns=self.feature_order)
        prediction = {
            "tabpfn": self._predict_for_model(input_df, "tabpfn"),
            "xgb": self._predict_for_model(input_df, "xgb"),
            "lgb": self._predict_for_model(input_df, "lgb")
        }

        return prediction

    def _predict_for_model(self, input_df, model_type):
        if model_type == "tabpfn":
            scaler = self.tabpfn_scaler
            model = self.tabpfn_model
        elif model_type == "xgb":
            scaler = self.xgb_scaler
            model = self.xgb_model
        else:
            scaler = self.lgb_scaler
            model = self.lgb_model

        # Scale the input
        input_scaled = scaler.transform(input_df)

        # Convert the scaled input back to DataFrame with feature names
        input_scaled_df = pd.DataFrame(input_scaled, columns=self.feature_order)

        # Predict using the trained model
        prediction = model.predict(input_scaled_df)[0]
        return int(prediction)
