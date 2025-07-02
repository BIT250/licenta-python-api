from flask import Blueprint, jsonify, request
from ai_models.diabetes_ai import DiabetesAI
from ai_models.heart_disease_ai import HeartDiseaseAI
from extensions import db
from helpers import calculate_age_from_cnp
from sqlalchemy import text

ai_routes = Blueprint('ai', __name__)
diabetes_ai = DiabetesAI()
diabetes_ai.load_model()
heart_ai = HeartDiseaseAI()
heart_ai.load_model()


@ai_routes.route('/ai/predict_diabetes', methods=['POST'])
def predict_diabetes():
    """
    Predict diabetes risk from patient data using multiple AI models.
    ---
    tags:
      - AI
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - pregnancies
            - glucose
            - blood_pressure
          properties:
            pregnancies:
              type: integer
              description: Numărul de sarcini anterioare
            glucose:
              type: number
              description: Concentrația plasmatică de glucoză la 2 ore
            blood_pressure:
              type: number
              description: Tensiunea arterială diastolică (mmHg)
            skin_thickness:
              type: number
              description: Grosimea pliului cutanat tricpeps (mm)
            insulin:
              type: number
              description: Nivelul insulinei serice la 2 ore (µU/ml)
            bmi:
              type: number
              description: Indicele de masă corporală (kg/m²)
            diabetes_pedigree_function:
              type: number
              description: Funcția pedigree pentru diabet (indicator genetic)
            age:
              type: number
              description: Vârsta pacientului (ani)
    responses:
      200:
        description: Predicții pentru fiecare model de clasificare
        schema:
          type: object
          properties:
            tabpfn:
              type: integer
              enum: [0, 1]
              description: Predicție TabPFN (0 = fără diabet, 1 = diabet)
            xgb:
              type: integer
              enum: [0, 1]
              description: Predicție XGBoost (0 = fără diabet, 1 = diabet)
            lgb:
              type: integer
              enum: [0, 1]
              description: Predicție LightGBM (0 = fără diabet, 1 = diabet)
    """
    body = request.get_json()

    ai_input_data = {
        "Pregnancies": body.get("pregnancies"),
        "Glucose": body.get("glucose"),
        "BloodPressure": body.get("blood_pressure"),
        "SkinThickness": body.get("skin_thickness"),
        "Insulin": body.get("insulin"),
        "BMI": body.get("bmi"),
        "DiabetesPedigreeFunction": body.get("diabetes_pedigree_function"),
        "Age": body.get("age")
    }

    prediction_result = diabetes_ai.predict_outcome(ai_input_data)

    return jsonify(prediction_result)


@ai_routes.route('/ai/predict_heart_disease', methods=['POST'])
def predict_heart_disease():
    """
    Predict heart disease risk based on clinical parameters.
    ---
    tags:
      - AI
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - age
            - sex
            - cp
            - trestbps
            - chol
            - fbs
            - restecg
            - thalach
            - exang
            - oldpeak
            - slope
            - ca
            - thal
          properties:
            age:
              type: integer
              description: Vârsta pacientului (ani)
            sex:
              type: integer
              description: Gen (1 = masculin, 0 = feminin)
            cp:
              type: integer
              description: Tipul durerii toracice (1–4)
            trestbps:
              type: integer
              description: Tensiunea arterială în repaus (mmHg)
            chol:
              type: integer
              description: Colesterol seric total (mg/dl)
            fbs:
              type: integer
              description: Glicemie pe nemâncate >120 mg/dl (1 = da, 0 = nu)
            restecg:
              type: integer
              description: Rezultate ECG în repaus (0 = normal, 1 = anomalii ST-T, 2 = hipertrofie ventriculară)
            thalach:
              type: integer
              description: Frecvența cardiacă maximă atinsă (bpm)
            exang:
              type: integer
              description: Angină indusă de efort (1 = da, 0 = nu)
            oldpeak:
              type: number
              format: float
              description: Depresie ST indusă de efort relativ la repaus (mm)
            slope:
              type: integer
              description: Panta segmentului ST în efort (1 = ascendentă, 2 = plată, 3 = descendentă)
            ca:
              type: integer
              description: Numărul de vase principale colorate prin angiografie (0–3)
            thal:
              type: integer
              description: Tipul thalassemiei (1 = normal, 2 = fix, 3 = reversibil)
    responses:
      200:
        description: Predicții pentru fiecare model de clasificare
        schema:
          type: object
          properties:
            tabpfn:
              type: integer
              enum: [0, 1]
              description: Predicție TabPFN (0 = fără boală, 1 = boală)
            xgb:
              type: integer
              enum: [0, 1]
              description: Predicție XGBoost (0 = fără boală, 1 = boală)
            lgb:
              type: integer
              enum: [0, 1]
              description: Predicție LightGBM (0 = fără boală, 1 = boală)
    """

    body = request.get_json()

    ai_input_data = {
        "age": body.get("age"),
        "sex": body.get("sex"),
        "cp": body.get("cp"),
        "trestbps": body.get("trestbps"),
        "chol": body.get("chol"),
        "fbs": body.get("fbs"),
        "restecg": body.get("restecg"),
        "thalach": body.get("thalach"),
        "exang": body.get("exang"),
        "oldpeak": body.get("oldpeak"),
        "slope": body.get("slope"),
        "ca": body.get("ca"),
        "thal": body.get("thal")
    }

    prediction_result = heart_ai.predict_outcome(ai_input_data)

    return jsonify(prediction_result)
