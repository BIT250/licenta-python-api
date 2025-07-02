from flask import Blueprint, jsonify


main_db_routes = Blueprint('main_db_routes', __name__)


@main_db_routes.route('/db/get_users', methods=['GET'])
def get_users():
    # Query all users from the database

    # Convert user objects to a list of dictionaries
    users_list = []


    # Return the list as JSON
    return jsonify(users_list)
