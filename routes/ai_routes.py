import json

from flask import Blueprint, jsonify, request
from ai_models.diabetes_ai import DiabetesAI
from ai_models.heart_disease_ai import HeartDiseaseAI
from extensions import get_db
from helpers import calculate_age_from_cnp, calculate_pedigree_function
from sqlalchemy import text

ai_routes = Blueprint('ai', __name__)
diabetes_ai = DiabetesAI()
diabetes_ai.load_model()
heart_ai = HeartDiseaseAI()
heart_ai.load_model()


@ai_routes.route('/ai/predict_diabetes', methods=['POST'])
def predict_diabetes():
    """
    Predict diabetes risk for a logged-in user and record the prediction.
    ---
    tags:
      - AI
    consumes:
      - application/json
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: Session token from login
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - pregnancies
            - glucose
            - blood_pressure
            - test_date
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
              type: integer
              description: Vârsta pacientului (ani)
            test_date:
              type: string
              format: date
              description: Data la care se face predicția
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
    # 1) session check
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Session token missing'}), 401

    db = get_db()
    user = db.execute(
        "SELECT id FROM users WHERE session = ?",
        (token,)
    ).fetchone()
    if not user:
        return jsonify({'error': 'Invalid session token'}), 401
    user_id = user['id']

    # 2) parse body
    body = request.get_json() or {}
    ai_input_data = {
        "Pregnancies":                body.get("pregnancies"),
        "Glucose":                    body.get("glucose"),
        "BloodPressure":              body.get("blood_pressure"),
        "SkinThickness":              body.get("skin_thickness"),
        "Insulin":                    body.get("insulin"),
        "BMI":                        body.get("bmi"),
        "DiabetesPedigreeFunction":   calculate_pedigree_function(body.get("diabetes_pedigree_function")),
        "Age":                        body.get("age"),
        "TestDate":                   body.get("test_date")
    }

    print(ai_input_data)

    # 3) call your model
    prediction_result = diabetes_ai.predict_outcome(ai_input_data)

    # 4) (optional) persist to the diabetes_predictions table
    risk = 'high' if sum(prediction_result.values()) > 2 else 'medium' if sum(prediction_result.values()) > 0 else 'low'
    db.execute(
        """INSERT INTO diabetes_predictions
           (user_id, date_of_prediction, pregnancies, glucose, blood_pressure, skin_thickness, insulin, bmi, diabetes_pedigree, age,
            tabpfn_response, xgb_response, lgbm_response, risk)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            user_id,
            body.get("test_date"),
            body.get("pregnancies"),
            body.get("glucose"),
            body.get("blood_pressure"),
            body.get("skin_thickness"),
            body.get("insulin"),
            body.get("bmi"),
            ai_input_data.get("DiabetesPedigreeFunction"),
            body.get("age"),
            prediction_result['tabpfn'],
            prediction_result['xgb'],
            prediction_result['lgb'],
            risk
        )
    )
    db.commit()
    prediction_result.update({"risk": risk})
    return jsonify(prediction_result)


@ai_routes.route('/ai/predict_heart_disease', methods=['POST'])
def predict_heart_disease():
    """
    Predict heart disease risk for a logged-in user and record the prediction.
    ---
    tags:
      - AI
    consumes:
      - application/json
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: Session token from login
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
            - test_date
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
            test_date:
              type: string
              format: date
              description: Data la care se face predicția
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
            risk:
              type: string
              enum: [low, medium, high]
              description: Nivelul de risc agregat
    """
    # 1) check session
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Session token missing'}), 401

    db = get_db()
    user = db.execute(
        "SELECT id FROM users WHERE session = ?",
        (token,)
    ).fetchone()
    if not user:
        return jsonify({'error': 'Invalid session token'}), 401
    user_id = user['id']

    # 2) parse body
    body = request.get_json() or {}
    ai_input_data = {
        "age":      body.get("age"),
        "sex":      body.get("sex"),
        "cp":       body.get("cp"),
        "trestbps": body.get("trestbps"),
        "chol":     body.get("chol"),
        "fbs":      body.get("fbs"),
        "restecg":  body.get("restecg"),
        "thalach":  body.get("thalach"),
        "exang":    body.get("exang"),
        "oldpeak":  body.get("oldpeak"),
        "slope":    body.get("slope"),
        "ca":       body.get("ca"),
        "thal":     body.get("thal"),
    }
    print(ai_input_data)
    # 3) call the model
    prediction_result = heart_ai.predict_outcome(ai_input_data)

    # 4) persist into cardiology_predictions
    # aggregate risk: e.g. 2+ = high, 1 = medium, 0 = low
    total = (prediction_result.get('tabpfn', 0)
           + prediction_result.get('xgb', 0)
           + prediction_result.get('lgb', 0))
    risk = 'high' if total > 2 else 'medium' if total >= 1 else 'low'

    db.execute(
        """INSERT INTO cardiology_predictions
           (user_id, date_of_prediction,
            cp, trestbps, chol, fbs, restecg, thalach,
            exang, oldpeak, slope, ca, thal,
            tabpfn_response, xgb_response, lgbm_response, risk)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            user_id,
            body.get("test_date"),
            body.get("cp"),
            body.get("trestbps"),
            body.get("chol"),
            body.get("fbs"),
            body.get("restecg"),
            body.get("thalach"),
            body.get("exang"),
            body.get("oldpeak"),
            body.get("slope"),
            body.get("ca"),
            body.get("thal"),
            prediction_result['tabpfn'],
            prediction_result['xgb'],
            prediction_result['lgb'],
            risk
        )
    )
    db.commit()

    # include risk in response
    prediction_result.update({"risk": risk})
    return jsonify(prediction_result)
