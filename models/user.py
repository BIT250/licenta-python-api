from extensions import db


class User(db.Model):
	__tablename__ = 'User'

	id = db.Column(db.Integer, primary_key=True)  # Primary key column
	email = db.Column(db.String(120), unique=True, nullable=False)
	password = db.Column(db.String(120), nullable=False)
	role = db.Column(db.String(50), nullable=False)

	def __repr__(self):
		return f"<User {self.email}>"
