from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from backend.config import Config
from backend.models import db, User, Worker, Doctor, Hospital, MedicalRecord, SharingPermission, Notification, AuditLog
from backend.routes.auth import auth_bp
from backend.routes.worker import worker_bp
from backend.routes.doctor import doctor_bp
from backend.routes.hospital import hospital_bp
from backend.routes.admin import admin_bp
from backend.routes.records import records_bp
from datetime import datetime, timedelta
import os

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Configure CORS for frontend access
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Configure JWT
    jwt = JWTManager(app)
    
    # Initialize DB
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(worker_bp, url_prefix='/api/worker')
    app.register_blueprint(doctor_bp, url_prefix='/api/doctor')
    app.register_blueprint(hospital_bp, url_prefix='/api/hospital')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(records_bp, url_prefix='/api/records')
    
    @app.route('/')
    def index():
        return jsonify({
            'status': 'Online',
            'system': 'Digital Health Record Management System for Migrant Workers in Kerala',
            'api_version': '1.0'
        }), 200

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'message': 'Invalid access token'}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'message': 'Token has expired'}), 401

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return jsonify({'message': 'Authorization header is missing'}), 401

    # Auto seed database on startup if database is empty (highly helpful for local dev setup!)
    with app.app_context():
        try:
            db.create_all()
            if not User.query.filter_by(username='admin').first():
                seed_default_data()
        except Exception as e:
            app.logger.error(f"Error initializing/seeding database: {str(e)}")
            
    return app


def seed_default_data():
    """
    Programmatic seed utility to automatically load sample accounts 
    and mock histories when the app runs for the first time.
    """
    print("Database is empty. Seeding default data...")
    
    # Default password hash for 'Password@123'
    # Created with bcrypt.hashpw
    pwd_hash = '$2b$12$b9UthUbThVzdBIDiFf4i6O60pSGmrWdTFYlNJG34GDE21nFuTTxoe'
    
    admin = User(username='admin', email='admin@health.kerala.gov.in', password_hash=pwd_hash, role='admin', is_verified=True)
    db.session.add(admin)
    
    dr_rajesh_u = User(username='dr_rajesh', email='rajesh.kumar@health.kerala.gov.in', password_hash=pwd_hash, role='doctor', is_verified=True)
    dr_ananya_u = User(username='dr_ananya', email='ananya.sen@aims.edu.in', password_hash=pwd_hash, role='doctor', is_verified=True)
    hosp_tvm_u = User(username='hosp_tvm_general', email='contact@tvmgeneralhospital.org', password_hash=pwd_hash, role='hospital', is_verified=True)
    hosp_ekm_u = User(username='hosp_ernakulam_dist', email='info@ernakulamdistricthospital.org', password_hash=pwd_hash, role='hospital', is_verified=True)
    
    worker_manoj_u = User(username='manoj_kumar', email='manoj.kumar95@gmail.com', password_hash=pwd_hash, role='worker', is_verified=True)
    worker_babul_u = User(username='babul_sheikh', email='babul.sheikh98@yahoo.com', password_hash=pwd_hash, role='worker', is_verified=True)
    worker_sunita_u = User(username='sunita_oraon', email='sunita.oraon2000@gmail.com', password_hash=pwd_hash, role='worker', is_verified=True)
    
    dr_vijayan_u = User(username='dr_vijayan', email='dr.vijay@gmail.com', password_hash=pwd_hash, role='doctor', is_verified=False)
    
    db.session.add_all([dr_rajesh_u, dr_ananya_u, hosp_tvm_u, hosp_ekm_u, worker_manoj_u, worker_babul_u, worker_sunita_u, dr_vijayan_u])
    db.session.flush() # Populate IDs
    
    # 2. Profiles
    w1 = Worker(
        user_id=worker_manoj_u.id, health_id='KL-MIGR-2026-0001', name='Manoj Kumar', phone='9876543210',
        dob=datetime.strptime('1995-05-15', '%Y-%m-%d').date(), gender='Male', blood_group='O+',
        state_of_origin='Bihar', language_preference='hi', emergency_contact_name='Suman Devi',
        emergency_contact_phone='9876543211', emergency_contact_relation='Mother',
        allergies='Penicillin, Dust', existing_diseases='None', status='active'
    )
    w2 = Worker(
        user_id=worker_babul_u.id, health_id='KL-MIGR-2026-0002', name='Babul Sheikh', phone='8765432109',
        dob=datetime.strptime('1998-08-20', '%Y-%m-%d').date(), gender='Male', blood_group='A+',
        state_of_origin='West Bengal', language_preference='bn', emergency_contact_name='Amina Bibi',
        emergency_contact_phone='8765432108', emergency_contact_relation='Wife',
        allergies='None', existing_diseases='Asthma', status='active'
    )
    w3 = Worker(
        user_id=worker_sunita_u.id, health_id='KL-MIGR-2026-0003', name='Sunita Oraon', phone='7654321098',
        dob=datetime.strptime('2000-03-10', '%Y-%m-%d').date(), gender='Female', blood_group='B-',
        state_of_origin='Jharkhand', language_preference='hi', emergency_contact_name='Birsa Oraon',
        emergency_contact_phone='7654321097', emergency_contact_relation='Father',
        allergies='Sulfa drugs', existing_diseases='Type 1 Diabetes', status='active'
    )
    
    d1 = Doctor(user_id=dr_rajesh_u.id, name='Dr. Rajesh Kumar', specialization='General Medicine', license_number='MC-KL-2015-879', hospital_name='Trivandrum General Hospital', phone='9447102030', is_verified=True)
    d2 = Doctor(user_id=dr_ananya_u.id, name='Dr. Ananya Sen', specialization='Pulmonology', license_number='MC-KL-2018-452', hospital_name='Ernakulam Medical College', phone='9846506070', is_verified=True)
    d3 = Doctor(user_id=dr_vijayan_u.id, name='Dr. Vijayan K.', specialization='Cardiology', license_number='MC-KL-1998-112', hospital_name='Kozhikode Co-operative Hospital', phone='9495010203', is_verified=False)
    
    h1 = Hospital(user_id=hosp_tvm_u.id, name='Trivandrum General Hospital', registration_number='HOSP-TVM-01', address='General Hospital Junction, Palayam, Thiruvananthapuram, Kerala 695035', phone='04712307874', is_verified=True)
    h2 = Hospital(user_id=hosp_ekm_u.id, name='Ernakulam District Hospital', registration_number='HOSP-ER-02', address='Banerji Rd, Kacheripady, Ernakulam, Kerala 682018', phone='04842360015', is_verified=True)
    
    db.session.add_all([w1, w2, w3, d1, d2, d3, h1, h2])
    db.session.flush()
    
    # 3. Medical Records
    r1 = MedicalRecord(worker_id=w1.id, doctor_id=d1.id, hospital_id=h1.id, record_type='diagnosis', title='Acute Bronchitis', description='Patient presented with productive cough, mild fever, and wheezing. Lung sounds clear but congested. Advised warm fluids and rest.', record_date=datetime.strptime('2026-05-10', '%Y-%m-%d').date())
    r2 = MedicalRecord(worker_id=w1.id, doctor_id=d1.id, hospital_id=h1.id, record_type='prescription', title='Bronchitis Treatment Medication', description='1. Amoxicillin 500mg - 3 times daily for 5 days\n2. Paracetamol 650mg - as needed for fever (max 3 times/day)\n3. Cough Syrup (Guaifenesin) - 10ml thrice daily', record_date=datetime.strptime('2026-05-10', '%Y-%m-%d').date())
    r3 = MedicalRecord(worker_id=w1.id, doctor_id=None, hospital_id=h1.id, record_type='vaccination', title='Covid-19 Booster Dose', description='Covishield booster dose administered successfully. No immediate adverse reaction observed.', record_date=datetime.strptime('2026-05-12', '%Y-%m-%d').date())
    
    r4 = MedicalRecord(worker_id=w2.id, doctor_id=d2.id, hospital_id=h2.id, record_type='diagnosis', title='Asthma Exacerbation', description='Patient reported shortness of breath and wheezing, triggered by dust at construction site. Nebulization administered.', record_date=datetime.strptime('2026-06-01', '%Y-%m-%d').date())
    r5 = MedicalRecord(worker_id=w2.id, doctor_id=d2.id, hospital_id=h2.id, record_type='prescription', title='Inhaler & Controller Medication', description='1. Levolin Inhaler - 2 puffs as needed for sudden breathlessness\n2. Budecort Inhaler - 1 puff twice daily\n3. Montair 10mg - 1 tablet at night for 14 days', record_date=datetime.strptime('2026-06-01', '%Y-%m-%d').date())
    
    db.session.add_all([r1, r2, r3, r4, r5])
    
    # 4. Sharing permissions
    sp1 = SharingPermission(worker_id=w1.id, doctor_id=d1.id, expires_at=datetime.utcnow() + timedelta(days=365))
    sp2 = SharingPermission(worker_id=w2.id, doctor_id=d2.id, expires_at=datetime.utcnow() + timedelta(days=365))
    sp3 = SharingPermission(worker_id=w3.id, doctor_id=d1.id, expires_at=datetime.utcnow() + timedelta(days=365))
    db.session.add_all([sp1, sp2, sp3])
    
    # 5. Notifications
    n1 = Notification(user_id=worker_manoj_u.id, title='New Diagnosis Added', message='Dr. Rajesh Kumar has added a new diagnosis: Acute Bronchitis.', is_read=False, type='info')
    n2 = Notification(user_id=worker_babul_u.id, title='Appointment Reminder', message='Your follow-up checkup with Dr. Ananya Sen is scheduled for tomorrow at 10:00 AM.', is_read=False, type='reminder')
    db.session.add_all([n1, n2])
    
    # 6. Audit logs
    audit = AuditLog(user_id=admin.id, action='USER_LOGIN', details='Administrator logged in successfully.', ip_address='127.0.0.1')
    db.session.add(audit)
    
    db.session.commit()
    print("Database seeding completed.")

app = create_app()

if __name__ == '__main__':
    # Make sure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)
