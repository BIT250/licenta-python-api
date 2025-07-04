from datetime import date


def calculate_age_from_cnp(cnp, reference_date=None):
	"""
	Calculates the age (in years) based on a given CNP.

	:param cnp: A string representing the 13-digit Romanian CNP.
	:param reference_date: A datetime.date object to calculate age at.
						   If None, uses today's date.
	:return: Integer age in years, or raises ValueError if invalid.
	"""
	# Basic validation: length should be 13
	if len(cnp) != 13 or not cnp.isdigit():
		raise ValueError("CNP must be a 13-digit numeric string.")

	s = int(cnp[0])  # Sex + century
	aa = int(cnp[1:3])  # Year (last two digits)
	ll = int(cnp[3:5])  # Month
	zz = int(cnp[5:7])  # Day

	# Determine the century based on 's'
	# 1/2 -> 1900-1999, 3/4 -> 1800-1899, 5/6 -> 2000-2099
	# 7/8/9 -> special cases (not handled in detail here)
	if s in [1, 2]:
		century = 1900
	elif s in [3, 4]:
		century = 1800
	elif s in [5, 6]:
		century = 2000
	else:
		# For 7, 8, 9, you might need special logic
		# For simplicity, let's assume they're post-2000
		# Or you can raise an error if not supported:
		# raise ValueError("CNP starts with 7/8/9: special case not implemented.")
		century = 2000

	birth_year = century + aa

	# Create date object for the birth date
	try:
		birth_date = date(birth_year, ll, zz)
	except ValueError:
		raise ValueError("Invalid date components in CNP.")

	if reference_date is None:
		reference_date = date.today()

	# Calculate age
	age = reference_date.year - birth_date.year

	# If the person hasn't had their birthday yet this year, subtract 1
	# i.e., if reference_date is before their birthday in the current year
	if (reference_date.month, reference_date.day) < (birth_date.month, birth_date.day):
		age -= 1

	return age


def calculate_pedigree_function(family_history):
	"""
	Calculates the Diabetes Pedigree Function based on family history.
	Family history is severiyt of diabetes in family from 1 to 5, where 1 is no history and 5 is severe history.
	Needs to be converted from 0.00 to 1.5 min and max
	:param family_history:
	:return:
	"""
	if not isinstance(family_history, (int, float)):
		raise ValueError("Family history must be a numeric value.")

	if family_history < 1 or family_history > 5:
		raise ValueError("Family history must be between 1 and 5.")

	pedigree_function = (family_history - 1) * (1.5 / 4)
	return round(pedigree_function, 2)
