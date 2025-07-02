import os
import joblib
import pandas as pd
import warnings

# suprimăm warning-ul XGBoost la încărcarea modelului
warnings.filterwarnings(
    "ignore",
    message=r".*If you are loading a serialized model \(like pickle in Python.*"
)
warnings.filterwarnings(
    "ignore",
    message="Could not find the number of physical cores for the following reason"
)
paths = {
    "tabpfn_model": "ai_models/resources/heart_disease_tabpfn_model.joblib",
    "tabpfn_scaler": "ai_models/resources/heart_disease_tabpfn_scaler.joblib",
    "xgb_model":     "ai_models/resources/heart_disease_xgb_model.joblib",
    "xgb_scaler":    "ai_models/resources/heart_disease_xgb_scaler.joblib",
    "lgb_model":     "ai_models/resources/heart_disease_lgb_model.joblib",
    "lgb_scaler":    "ai_models/resources/heart_disease_lgb_scaler.joblib"
}


class HeartDiseaseAI:
    def __init__(self):
        # așteptăm un dict cu calea la model și scaler pentru fiecare abordare
        self.tabpfn_model_path = paths["tabpfn_model"]
        self.tabpfn_scaler_path = paths["tabpfn_scaler"]
        self.xgb_model_path = paths["xgb_model"]
        self.xgb_scaler_path = paths["xgb_scaler"]
        self.lgb_model_path = paths["lgb_model"]
        self.lgb_scaler_path = paths["lgb_scaler"]

        # locurile unde vom păstra instanțele încărcate
        self.tabpfn_model = None
        self.tabpfn_scaler = None
        self.xgb_model = None
        self.xgb_scaler = None
        self.lgb_model = None
        self.lgb_scaler = None

        # ordinea coloanelor așa cum a fost folosită la antrenament
        self.feature_order = [
            "age", "sex", "cp", "trestbps", "chol", "fbs",
            "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"
        ]

    def load_model(self):
        # verificăm existența fișierelor și încărcăm
        for attr in [
            ("tabpfn_model", self.tabpfn_model_path),
            ("tabpfn_scaler", self.tabpfn_scaler_path),
            ("xgb_model", self.xgb_model_path),
            ("xgb_scaler", self.xgb_scaler_path),
            ("lgb_model", self.lgb_model_path),
            ("lgb_scaler", self.lgb_scaler_path),
        ]:
            name, path = attr
            if not os.path.exists(path):
                raise FileNotFoundError(f"{name} file not found at {path}")

        self.tabpfn_model = joblib.load(self.tabpfn_model_path)
        self.tabpfn_scaler = joblib.load(self.tabpfn_scaler_path)
        self.xgb_model = joblib.load(self.xgb_model_path)
        self.xgb_scaler = joblib.load(self.xgb_scaler_path)
        self.lgb_model = joblib.load(self.lgb_model_path)
        self.lgb_scaler = joblib.load(self.lgb_scaler_path)

    def predict_outcome(self, input_data: dict) -> dict:
        # transformăm dict-ul în DataFrame cu ordinea corectă
        input_df = pd.DataFrame([input_data], columns=self.feature_order)
        # pregătim un dicționar cu predicțiile pentru fiecare model
        preds = {
            "tabpfn": self._predict_for_model(input_df, "tabpfn"),
            "xgb": self._predict_for_model(input_df, "xgb"),
            "lgb": self._predict_for_model(input_df, "lgb"),
        }
        # returnăm doar int, nu numpy types
        return {k: int(v) for k, v in preds.items()}

    def _predict_for_model(self, df: pd.DataFrame, model_type: str):
        # alegem modelul și scalerul corespunzător
        if model_type == "tabpfn":
            scaler = self.tabpfn_scaler
            model = self.tabpfn_model
        elif model_type == "xgb":
            scaler = self.xgb_scaler
            model = self.xgb_model
        else:
            scaler = self.lgb_scaler
            model = self.lgb_model

        # scalare + predict
        scaled = scaler.transform(df)
        scaled_df = pd.DataFrame(scaled, columns=self.feature_order)
        return int(model.predict(scaled_df)[0])
