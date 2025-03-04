from flask import Flask
from config import Config
from extensions import db
from routes.db_connection_routes import main_db_routes
from routes.ai_routes import ai_routes

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

app.register_blueprint(main_db_routes)
app.register_blueprint(ai_routes)

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'], port=app.config['PORT'])
