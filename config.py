class Config:
    DEBUG = True
    PORT = 5000

    SQLALCHEMY_DATABASE_URI = "postgresql://root:aplicatielicenta@localhost:5432/licenta_medicala_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SWAGGER_CONFIG = {
        "headers": [],
        "specs": [
            {
                "endpoint": "no_models",
                "route": "/no_models.json",
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: False  # drop *all* models
            }
        ],
        "swagger_ui": True,
        "specs_route": "/apidocs/",
    }

    SWAGGER_TEMPLATE = {
        "info": {
            "title": "Documentatie API",  # ← your API name
            "description": "Diabetes & Heart Disease AI endpoints",
            "version": "1.0.0",
        },

        "schemes": ["http", "https"]

    }