from flask import Blueprint, jsonify
from models.user import User

main_db_routes = Blueprint('main_db_routes', __name__)


@main_db_routes.route('/db/get_users', methods=['GET'])
def get_users():
    # Query all users from the database
    users = User.query.all()

    # Convert user objects to a list of dictionaries
    users_list = []
    for user in users:
        users_list.append({
            "id": user.id,
            "email": user.email,
            "password": user.password,
            "role": user.role
        })

    # Return the list as JSON
    return jsonify(users_list)
