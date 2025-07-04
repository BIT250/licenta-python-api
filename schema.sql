PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  email    TEXT    NOT NULL UNIQUE,
  password TEXT    NOT NULL,
  session  TEXT
);

CREATE TABLE IF NOT EXISTS personal_data (
  user_id    INTEGER PRIMARY KEY,
  name       TEXT,
  birth_date TEXT,
  sex        INTEGER,
  height     REAL,
  weight     REAL,
  phone      TEXT,
  FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS diabetes_predictions (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id             INTEGER NOT NULL,
  date_of_prediction  TEXT    NOT NULL,
  pregnancies         INTEGER,
  glucose             REAL,
  blood_pressure      REAL,
  skin_thickness      REAL,
  insulin             REAL,
  bmi                 REAL,
  diabetes_pedigree   REAL,
  tabpfn_response     INTEGER,
  xgb_response        INTEGER,
  lgbm_response       INTEGER,
  risk                TEXT,
  confirmed           INTEGER DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cardiology_predictions (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id             INTEGER NOT NULL,
  date_of_prediction  TEXT    NOT NULL,
  cp                  INTEGER,
  trestbps            INTEGER,
  chol                INTEGER,
  fbs                 INTEGER,
  restecg             INTEGER,
  thalach             INTEGER,
  exang               INTEGER,
  oldpeak             REAL,
  slope               INTEGER,
  ca                  INTEGER,
  thal                INTEGER,
  tabpfn_response     INTEGER,
  xgb_response        INTEGER,
  lgbm_response       INTEGER,
  risk                TEXT,
  confirmed           INTEGER DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE
);
