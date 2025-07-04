from flask import Flask, render_template
from flask_cors import CORS

from config import Config
from extensions import close_db, init_db
from routes.auth_routes import auth_routes
from routes.db_connection_routes import main_db_routes
from flasgger import Swagger
from routes.ai_routes import ai_routes

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config.from_object(Config)

app.register_blueprint(main_db_routes)
app.register_blueprint(ai_routes)
app.register_blueprint(auth_routes)
Swagger(app,
        config=app.config['SWAGGER_CONFIG'],
        template=app.config['SWAGGER_TEMPLATE'],
        merge=True)

app.teardown_appcontext(close_db)

# On first startup, make sure tables exist:
with app.app_context():
    init_db()

@app.route('/')
def landing_page():
    return render_template('landing.html')


if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'], port=app.config['PORT'])
