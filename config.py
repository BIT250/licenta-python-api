class Config:
    DEBUG = True
    PORT = 5000

    SQLALCHEMY_DATABASE_URI = "postgresql://root:aplicatielicenta@localhost:5432/licenta_medicala_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
