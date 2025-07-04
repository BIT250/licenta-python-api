class Config:
    DEBUG = True
    PORT = 5000

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
        "specs_route": "/",
        "swagger_ui_config": {
            "lang": "ro"  # Set Swagger UI language to Romanian
        }
    }

    SWAGGER_TEMPLATE = {
        "info": {
            "title": "Documentație API",  # API name in Romanian
            "description": "Rute API pentru predicții de Diabet și Afecțiuni Caediace",  # Description in Romanian
            "version": "1.0.0",
        },

        "schemes": ["http", "https"]

    }