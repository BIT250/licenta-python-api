# routes/auth_routes.py

from flask import Blueprint, request, jsonify
from extensions import get_db
from werkzeug.security import generate_password_hash, check_password_hash

auth_routes = Blueprint("auth", __name__)


@auth_routes.route("/auth/register", methods=["POST"])
def register():
    """
    Înregistrează un utilizator nou.
    ---
    tags:
      - Auth
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
            - name
          properties:
            email:
              type: string
              description: Email-ul utilizatorului
            password:
              type: string
              description: Parola utilizatorului
            name:
              type: string
              description: Numele complet al utilizatorului
    responses:
      201:
        description: Utilizator creat cu succes
      400:
        description: Email deja folosit
    """
    db = get_db()
    data = request.get_json()
    pw_hash = generate_password_hash(data["password"])
    try:
        cursor = db.execute(
            "INSERT INTO userS (email, password) VALUES (?, ?)",
            (data["email"], pw_hash)
        )
        user_id = cursor.lastrowid
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
    """
    Autentificare utilizator.
    ---
    tags:
      - Auth
    consumes:
      - application/json
    parameters:
      - in: body
        name: credentials
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              description: Email-ul utilizatorului înregistrat
            password:
              type: string
              description: Parola utilizatorului
    responses:
      200:
        description: Autentificare reușită cu token de sesiune
        schema:
          type: object
          properties:
            token:
              type: string
              description: Token de sesiune
      401:
        description: Credențiale invalide
    """
    db = get_db()
    data = request.get_json()
    user = db.execute(
        "SELECT id, password FROM userS WHERE email = ?",
        (data["email"],)
    ).fetchone()
    if user and check_password_hash(user["password"], data["password"]):
        import uuid
        token = uuid.uuid4().hex
        db.execute("UPDATE userS SET session = ? WHERE id = ?", (token, user["id"]))
        db.commit()
        return jsonify({"token": token})
    return jsonify({"error": "invalid credentials"}), 401


@auth_routes.route("/auth/session", methods=["GET"])
def validate_session():
    """
    Validare sesiune utilizator.
    ---
    tags:
      - Auth
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: Token de sesiune
    responses:
      200:
        description: Sesiune validă
        schema:
          type: object
          properties:
            userId:
              type: integer
              description: ID-ul utilizatorului autentificat
      401:
        description: Token de sesiune lipsă sau invalid
    """
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Session token missing"}), 401

    db = get_db()
    user = db.execute("SELECT id FROM userS WHERE session = ?", (token,)).fetchone()
    if user:
        return jsonify({"userId": user["id"]}), 200
    return jsonify({"error": "Invalid session"}), 401