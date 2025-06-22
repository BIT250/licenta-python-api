from flask import Blueprint, jsonify, request
from ai_models.diabetes_ai import DiabetesAI
from extensions import db
from helpers import calculate_age_from_cnp
from sqlalchemy import text

ai_routes = Blueprint('ai', __name__)
diabetes_ai = DiabetesAI()
diabetes_ai.load_model()


@ai_routes.route('/ai/predict_diabetes_for_user/<int:user_id>', methods=['GET'])
def predict_diabetes_for_user(user_id):
    """
    1. Fetch latest results (order_number=1) for each parameter from 'pacient_results'.
    2. Fetch CNP & pregnancies from 'Personal_Data'.
    3. Build the input dict and call the AI model.
    4. Return the prediction as JSON.
    """

    sql_params = text("""
        SELECT param_name, value
        FROM pacient_results
        WHERE user_id = :uid
          AND order_number = 1
    """)
    rows = db.session.execute(sql_params, {"uid": user_id}).fetchall()

    input_data = {}
    for row in rows:
        input_data[row.param_name] = float(row.value)

    sql_pd = text("""
        SELECT "cnp", "pregnancies"
        FROM "Personal_Data"
        WHERE "userId" = :uid
        LIMIT 1
    """)
    pd_row = db.session.execute(sql_pd, {"uid": user_id}).fetchone()
    if pd_row:
        cnp = pd_row.cnp
        pregnancies = pd_row.pregnancies
        input_data["Pregnancies"] = pregnancies if pregnancies is not None else 0
        input_data["Age"] = calculate_age_from_cnp(cnp) if cnp else 0
    else:
        # default if no personal data found
        input_data["Pregnancies"] = 0
        input_data["Age"] = 0

    # --- 3) Call the AI model ---
    prediction_result = diabetes_ai.predict_outcome(input_data)

    # --- 4) Return JSON ---
    return jsonify({
        "input_data": input_data,
        "prediction": prediction_result
    })


@ai_routes.route('/ai/predict_diabetes', methods=['POST'])
def predict_diabetes():

    body = request.get_json()

    ai_input_data = {
        "Pregnancies": body.get("pregnancies"),
        "Glucose": body.get("glucose"),
        "BloodPressure": body.get("blood_pressure"),
        "SkinThickness": body.get("skin_thickness"),
        "Insulin": body.get("insulin"),
        "BMI": body.get("bmi"),
        "DiabetesPedigreeFunction": body.get("diabetes_pedigree_function"),
        "Age": calculate_age_from_cnp(body.get("cnp"))
    }

    prediction_result = diabetes_ai.predict_outcome(ai_input_data)

    return jsonify({
        "input_data": ai_input_data,
        "prediction": prediction_result,
        "model": "diabetes_model"
    })
