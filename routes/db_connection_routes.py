from flask import Blueprint, jsonify, request, make_response

from extensions import get_db
from helpers import risk_to_numeric

main_db_routes = Blueprint('main_db_routes', __name__)


@main_db_routes.route("/db/personal_data", methods=["GET"])
def get_personal_data():
    """
    Obține datele personale ale utilizatorului (email și profil).
    ---
    tags:
      - Database
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: Token de sesiune de la autentificare
    responses:
      200:
        description: Datele personale au fost recuperate cu succes
        schema:
          type: object
          properties:
            email:
              type: string
              description: Adresa de email a utilizatorului
            name:
              type: string
              description: Numele complet al utilizatorului
            birth_date:
              type: string
              format: date
              description: Data nașterii utilizatorului
            sex:
              type: string
              description: Genul utilizatorului
            height:
              type: number
              description: Înălțimea utilizatorului în cm
            weight:
              type: number
              description: Greutatea utilizatorului în kg
            phone:
              type: string
              description: Număr de telefon al utilizatorului
      401:
        description: Token de sesiune lipsă sau invalid
        schema:
          type: object
          properties:
            error:
              type: string
              description: Mesaj de eroare
    """
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Session token missing"}), 401

    db = get_db()
    user = db.execute("SELECT id, email FROM users WHERE session = ?", (token,)).fetchone()
    if not user:
        return jsonify({"error": "Invalid session token"}), 401

    personal_data = db.execute(
        "SELECT name, birth_date, sex, height, weight, phone FROM personal_data WHERE user_id = ?",
        (user["id"],)
    ).fetchone()

    result = {"email": user["email"]}
    if personal_data:
        result.update(dict(personal_data))
    response = make_response(jsonify(result), 200)
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"

    return jsonify(result), 200


@main_db_routes.route("/db/personal_data", methods=["PUT"])
def update_personal_data():
    """
    Actualizează informațiile de profil ale utilizatorului.
    ---
    tags:
      - Database
    consumes:
      - application/json
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: Token de sesiune de la autentificare
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
              description: Numele complet al utilizatorului
            birth_date:
              type: string
              format: date
              description: Data nașterii utilizatorului
            sex:
              type: string
              description: Genul utilizatorului
            height:
              type: number
              description: Înălțimea utilizatorului în cm
            weight:
              type: number
              description: Greutatea utilizatorului în kg
            phone:
              type: string
              description: Număr de telefon al utilizatorului
    responses:
      200:
        description: Informațiile personale au fost actualizate cu succes
        schema:
          type: object
          properties:
            msg:
              type: string
              description: Mesaj de succes
      400:
        description: Nu au fost furnizate date
        schema:
          type: object
          properties:
            error:
              type: string
              description: Mesaj de eroare
      401:
        description: Token de sesiune lipsă sau invalid
        schema:
          type: object
          properties:
            error:
              type: string
              description: Mesaj de eroare
    """
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Session token missing"}), 401

    db = get_db()
    user = db.execute("SELECT id FROM users WHERE session = ?", (token,)).fetchone()
    if not user:
        return jsonify({"error": "Invalid session token"}), 401

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Check if personal data exists
    personal = db.execute(
        "SELECT * FROM personal_data WHERE user_id = ?",
        (user["id"],)
    ).fetchone()

    if personal:
        db.execute(
            "UPDATE personal_data SET name = ?, birth_date = ?, sex = ?, weight = ?, height = ?, phone = ? WHERE user_id = ?",
            (data.get("name"), data.get("birth_date"), data.get("sex"), data.get("weight"), data.get("height"), data.get("phone"), user["id"])
        )
    else:
        db.execute(
            "INSERT INTO personal_data (user_id, name, birth_date, sex, weight, height, phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user["id"], data.get("name"), data.get("birth_date"), data.get("sex"), data.get("weight"), data.get("height"), data.get("phone"))
        )
    db.commit()
    return jsonify({"msg": "Updated successfully"}), 200


@main_db_routes.route("/db/prediction_history", methods=["GET"])
def get_prediction_history():
    """
    Obține istoricul predicțiilor de diabet și boli de inimă pentru utilizator.
    ---
    tags:
      - Database
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: Token de sesiune de la autentificare
    responses:
      200:
        description: Istoricul predicțiilor a fost recuperat cu succes
        schema:
          type: array
          items:
            type: object
            properties:
              date_of_prediction:
                type: string
                format: date
                description: Data predicției
              type:
                type: string
                enum: ["Diabet", "Afecțiuni cardiace"]
                description: Tipul predicției
              risk:
                type: string
                enum: ["low", "medium", "high"]
                description: Nivelul de risc
              tabpfn_response:
                type: integer
                enum: [0, 1]
                description: Rezultat model TabPFN
              xgb_response:
                type: integer
                enum: [0, 1]
                description: Rezultat model XGBoost
              lgbm_response:
                type: integer
                enum: [0, 1]
                description: Rezultat model LightGBM
      401:
        description: Token de sesiune lipsă sau invalid
        schema:
          type: object
          properties:
            error:
              type: string
              description: Mesaj de eroare
    """
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Session token missing"}), 401

    db = get_db()
    user = db.execute("SELECT id FROM users WHERE session = ?", (token,)).fetchone()
    if not user:
        return jsonify({"error": "Invalid session token"}), 401

    user_id = user["id"]

    # Fetch diabetes predictions
    diabetes_predictions = db.execute("""
        SELECT date_of_prediction, 'Diabetes' AS type, risk, 
               tabpfn_response, xgb_response, lgbm_response
        FROM diabetes_predictions
        WHERE user_id = ?
    """, (user_id,)).fetchall()

    # Fetch cardiology predictions
    cardiology_predictions = db.execute("""
        SELECT date_of_prediction, 'Heart Disease' AS type, risk, 
               tabpfn_response, xgb_response, lgbm_response
        FROM cardiology_predictions
        WHERE user_id = ?
    """, (user_id,)).fetchall()

    # Combine and format results
    predictions = [
        {
            "date_of_prediction": row["date_of_prediction"],
            "type": "Diabet" if row["type"]=="Diabetes" else "Afecțiuni cardiace",
            "risk": row["risk"],
            "tabpfn_response": row["tabpfn_response"],
            "xgb_response": row["xgb_response"],
            "lgbm_response": row["lgbm_response"]
        }
        for row in diabetes_predictions + cardiology_predictions
    ]

    return jsonify(predictions), 200


@main_db_routes.route("/db/analytics_data", methods=["GET"])
def get_analytics_data():
    """
    Obține date de analiză: distribuție de risc, tendințe lunare și ultimele evaluări.
    ---
    tags:
      - Database
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: Token de sesiune de la autentificare
    responses:
      200:
        description: Datele de analiză au fost recuperate cu succes
        schema:
          type: object
          properties:
            riskDistribution:
              type: array
              items:
                type: object
                properties:
                  risk:
                    type: string
                    enum: ["Low Risk", "Medium Risk", "High Risk"]
                    description: Categorie de nivel de risc
                  diabetes:
                    type: integer
                    description: Număr de predicții diabet în categorie
                  heart:
                    type: integer
                    description: Număr de predicții boli de inimă în categorie
                  fill:
                    type: string
                    description: Cod de culoare pentru grafic
            monthlyTrend:
              type: array
              items:
                type: object
                properties:
                  month:
                    type: string
                    format: date
                    description: Lună în format YYYY-MM
                  diabetes:
                    type: integer
                    nullable: true
                    description: Nivel numeric risc diabet (1=low,2=medium,3=high) sau null
                  heart:
                    type: integer
                    nullable: true
                    description: Nivel numeric risc inimă (1=low,2=medium,3=high) sau null
            latestAssessments:
              type: object
              properties:
                diabetes:
                  type: string
                  nullable: true
                  enum: ["low", "medium", "high"]
                  description: Ultima evaluare risc diabet sau null
                heart:
                  type: string
                  nullable: true
                  enum: ["low", "medium", "high"]
                  description: Ultima evaluare risc inimă sau null
      401:
        description: Token de sesiune lipsă sau invalid
        schema:
          type: object
          properties:
            error:
              type: string
              description: Mesaj de eroare
    """
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Session token missing"}), 401

    db = get_db()
    user = db.execute("SELECT id FROM users WHERE session = ?", (token,)).fetchone()
    if not user:
        return jsonify({"error": "Invalid session token"}), 401

    user_id = user["id"]

    # Risk Distribution
    risk_distribution = {
        "low": {"diabetes": 0, "heart": 0},
        "medium": {"diabetes": 0, "heart": 0},
        "high": {"diabetes": 0, "heart": 0}
    }

    diabetes_risks = db.execute("""
        SELECT risk, COUNT(*) as count
        FROM diabetes_predictions
        WHERE user_id = ?
        GROUP BY risk
    """, (user_id,)).fetchall()

    for row in diabetes_risks:
        risk_distribution[row["risk"]]["diabetes"] = row["count"]

    heart_risks = db.execute("""
        SELECT risk, COUNT(*) as count
        FROM cardiology_predictions
        WHERE user_id = ?
        GROUP BY risk
    """, (user_id,)).fetchall()

    for row in heart_risks:
        risk_distribution[row["risk"]]["heart"] = row["count"]

    # Monthly Trends - Fixed Logic
    monthly_diabetes = db.execute("""
        SELECT strftime('%Y-%m', date_of_prediction) as month, risk
        FROM diabetes_predictions
        WHERE user_id = ?
        ORDER BY date_of_prediction DESC
    """, (user_id,)).fetchall()

    monthly_heart = db.execute("""
        SELECT strftime('%Y-%m', date_of_prediction) as month, risk
        FROM cardiology_predictions
        WHERE user_id = ?
        ORDER BY date_of_prediction DESC
    """, (user_id,)).fetchall()

    trend_data = {}

    # Process diabetes data
    for row in monthly_diabetes:
        month = row["month"]
        if month not in trend_data:
            trend_data[month] = {"diabetes": None, "heart": None}
        trend_data[month]["diabetes"] = risk_to_numeric(row["risk"])

    # Process heart data
    for row in monthly_heart:
        month = row["month"]
        if month not in trend_data:
            trend_data[month] = {"diabetes": None, "heart": None}
        trend_data[month]["heart"] = risk_to_numeric(row["risk"])

    # Sort months chronologically and create monthly trend list
    monthly_trend = []
    for month in sorted(trend_data.keys()):
        monthly_trend.append({
            "month": month,
            "diabetes": trend_data[month]["diabetes"],
            "heart": trend_data[month]["heart"]
        })

    # Latest Assessments
    latest_diabetes = db.execute("""
        SELECT risk
        FROM diabetes_predictions
        WHERE user_id = ?
        ORDER BY date_of_prediction DESC
        LIMIT 1
    """, (user_id,)).fetchone()

    latest_heart = db.execute("""
        SELECT risk
        FROM cardiology_predictions
        WHERE user_id = ?
        ORDER BY date_of_prediction DESC
        LIMIT 1
    """, (user_id,)).fetchone()

    latest_assessments = {
        "diabetes": latest_diabetes["risk"] if latest_diabetes else None,
        "heart": latest_heart["risk"] if latest_heart else None
    }

    # Combine results
    analytics_data = {
        "riskDistribution": [
            {"risk": "Low Risk", "diabetes": risk_distribution["low"]["diabetes"], "heart": risk_distribution["low"]["heart"], "fill": "#22c55e"},
            {"risk": "Medium Risk", "diabetes": risk_distribution["medium"]["diabetes"], "heart": risk_distribution["medium"]["heart"], "fill": "#f59e0b"},
            {"risk": "High Risk", "diabetes": risk_distribution["high"]["diabetes"], "heart": risk_distribution["high"]["heart"], "fill": "#ef4444"}
        ],
        "monthlyTrend": monthly_trend,
        "latestAssessments": latest_assessments
    }

    return jsonify(analytics_data), 200
