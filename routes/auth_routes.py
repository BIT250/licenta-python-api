from flask import Blueprint, request, jsonify
from extensions import get_db
from werkzeug.security import generate_password_hash, check_password_hash

auth_routes = Blueprint("auth", __name__)


@auth_routes.route("/auth/register", methods=["POST"])
def register():
    db = get_db()
    data = request.get_json()
    pw_hash = generate_password_hash(data["password"])
    try:
        cursor = db.execute(
            "INSERT INTO userS (email, password) VALUES (?, ?)",
            (data["email"], pw_hash)
        )
        user_id = cursor.lastrowid
        # Create entry in personal_data table with the provided name
        db.execute(
            "INSERT INTO personal_data (user_id, name) VALUES (?, ?)",
            (user_id, data["name"])
        )
        db.commit()
    except db.IntegrityError:
        return jsonify({"error": "Email already used"}), 400
    return jsonify({"msg": "ok"}), 201


@auth_routes.route("/auth/login", methods=["POST"])
def login():
    db = get_db()
    data = request.get_json()
    user = db.execute(
        "SELECT id, password FROM userS WHERE email = ?",
        (data["email"],)
    ).fetchone()
    if user and check_password_hash(user["password"], data["password"]):
        # create a simple session token
        import uuid
        token = uuid.uuid4().hex
        db.execute("UPDATE userS SET session = ? WHERE id = ?", (token, user["id"]))
        db.commit()
        return jsonify({"token": token})
    return jsonify({"error": "invalid credentials"}), 401


@auth_routes.route("/auth/session", methods=["GET"])
def validate_session():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Session token missing"}), 401

    db = get_db()
    user = db.execute("SELECT id FROM userS WHERE session = ?", (token,)).fetchone()
    if user:
        return jsonify({"userId": user["id"]}), 200
    return jsonify({"error": "Invalid session"}), 401