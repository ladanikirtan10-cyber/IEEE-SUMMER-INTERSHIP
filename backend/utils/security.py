import random
import string
from datetime import datetime
from backend.models import db, AuditLog

def log_audit(user_id, action, details, ip_address=None):
    """
    Log a system activity to the audit_logs table.
    """
    try:
        log = AuditLog(
            user_id=user_id,
            action=action,
            details=details,
            ip_address=ip_address or '127.0.0.1'
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"Error logging audit event: {str(e)}")
        db.session.rollback()

def generate_health_id():
    """
    Generates a unique Digital Health ID in the format: KL-MIGR-YYYY-XXXX
    where YYYY is the current year and XXXX is a unique 4-character alphanumeric string.
    """
    current_year = datetime.now().year
    # Generate random uppercase characters & numbers
    chars = string.ascii_uppercase + string.digits
    random_part = ''.join(random.choices(chars, k=4))
    
    # We should also append a random 4-digit number to make it more unique
    number_part = ''.join(random.choices(string.digits, k=4))
    
    return f"KL-MIGR-{current_year}-{random_part}-{number_part}"
