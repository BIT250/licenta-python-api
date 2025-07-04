from flask import Blueprint, jsonify, request, make_response

from extensions import get_db

main_db_routes = Blueprint('main_db_routes', __name__)


@main_db_routes.route("/db/personal_data", methods=["GET"])
def get_personal_data():
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

	# Helper function to convert risk to numeric value
	def risk_to_numeric(risk):
		return {"low": 1, "medium": 2, "high": 3}.get(risk, 0)

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