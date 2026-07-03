from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, User, Hospital, Worker, MedicalRecord
from backend.utils.security import log_audit, generate_health_id
from datetime import datetime

hospital_bp = Blueprint('hospital', __name__)

@hospital_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'hospital':
        return jsonify({'message': 'Access unauthorized'}), 403
        
    hospital = user.hospital_profile
    if not hospital or not hospital.is_verified:
        return jsonify({'message': 'Hospital profile not verified or not found'}), 403
        
    # Get statistics
    total_records_created = MedicalRecord.query.filter_by(hospital_id=hospital.id).count()
    
    # Get recent patient records added by this hospital
    recent_records = MedicalRecord.query.filter_by(hospital_id=hospital.id)\
        .order_by(MedicalRecord.created_at.desc()).limit(10).all()
        
    recent_patients_list = []
    for r in recent_records:
        recent_patients_list.append({
            'record_id': r.id,
            'patient_name': r.worker.name,
            'health_id': r.worker.health_id,
            'title': r.title,
            'type': r.record_type,
            'date': r.record_date.isoformat()
        })
        
    return jsonify({
        'stats': {
            'records_created': total_records_created,
            'verified_status': hospital.is_verified
        },
        'recent_activity': recent_patients_list
    }), 200


@hospital_bp.route('/register-worker', methods=['POST'])
@jwt_required()
def register_worker():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'hospital':
        return jsonify({'message': 'Access unauthorized'}), 403
        
    hospital = user.hospital_profile
    if not hospital or not hospital.is_verified:
        return jsonify({'message': 'Hospital not verified'}), 403
        
    data = request.get_json() or {}
    
    phone = data.get('phone')
    name = data.get('name')
    dob_str = data.get('dob')
    
    if not phone or not name or not dob_str:
        return jsonify({'message': 'Missing phone, name or dob'}), 400
        
    # Check if worker already exists by phone
    existing_worker = Worker.query.filter_by(phone=phone).first()
    if existing_worker:
        return jsonify({
            'message': 'Patient already registered', 
            'worker': existing_worker.to_dict()
        }), 200
        
    # Auto generate user credentials for the worker
    # Username: name (lowercase, no spaces) + last 4 phone digits
    sanitized_name = "".join([c for c in name.lower() if c.isalnum()])
    username = f"{sanitized_name}_{phone[-4:]}"
    email = f"{username}@temporary.migranthealth.in"
    
    # Check username collision
    check_user = User.query.filter_by(username=username).first()
    if check_user:
        username = f"{username}_{datetime.now().strftime('%M%S')}"
        email = f"{username}@temporary.migranthealth.in"
        
    # Default password is their phone number
    default_password = phone
    
    try:
        new_user = User(
            username=username,
            email=email,
            role='worker',
            is_verified=True
        )
        new_user.set_password(default_password)
        db.session.add(new_user)
        db.session.flush()
        
        health_id = generate_health_id()
        while Worker.query.filter_by(health_id=health_id).first():
            health_id = generate_health_id()
            
        worker = Worker(
            user_id=new_user.id,
            health_id=health_id,
            name=name,
            phone=phone,
            dob=datetime.strptime(dob_str, '%Y-%m-%d').date(),
            gender=data.get('gender', 'Male'),
            blood_group=data.get('blood_group', 'O+'),
            state_of_origin=data.get('state_of_origin', 'Bihar'),
            language_preference=data.get('language_preference', 'en'),
            emergency_contact_name=data.get('emergency_contact_name', 'Emergency Contact'),
            emergency_contact_phone=data.get('emergency_contact_phone', phone),
            emergency_contact_relation=data.get('emergency_contact_relation', 'Family'),
            allergies=data.get('allergies', ''),
            existing_diseases=data.get('existing_diseases', ''),
            status='active'
        )
        db.session.add(worker)
        db.session.commit()
        
        log_audit(user_id, 'HOSPITAL_PATIENT_REGISTER', f"Hospital registered worker {name} (Health ID: {health_id})")
        
        return jsonify({
            'message': 'Migrant worker registered successfully.',
            'username': username,
            'default_password': default_password,
            'worker': worker.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to register patient: {str(e)}'}), 500
