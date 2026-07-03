from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, User, Doctor, Worker, SharingPermission, MedicalRecord, Notification
from backend.utils.security import log_audit
from datetime import datetime, timedelta

doctor_bp = Blueprint('doctor', __name__)

@doctor_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'doctor':
        return jsonify({'message': 'Access unauthorized'}), 403
        
    doctor = user.doctor_profile
    if not doctor or not doctor.is_verified:
        return jsonify({'message': 'Doctor profile not verified or not found'}), 403
        
    # Get active patients shared with this doctor
    active_permissions = SharingPermission.query.filter(
        SharingPermission.doctor_id == doctor.id,
        SharingPermission.expires_at > datetime.utcnow()
    ).all()
    
    recent_patients = []
    for perm in active_permissions:
        worker = perm.worker
        # Find latest diagnosis for this worker
        latest_record = MedicalRecord.query.filter_by(
            worker_id=worker.id,
            record_type='diagnosis'
        ).order_by(MedicalRecord.record_date.desc()).first()
        
        recent_patients.append({
            'id': worker.id,
            'name': worker.name,
            'health_id': worker.health_id,
            'phone': worker.phone,
            'blood_group': worker.blood_group,
            'state_of_origin': worker.state_of_origin,
            'expires_at': perm.expires_at.isoformat(),
            'last_diagnosis': latest_record.title if latest_record else 'No diagnosis recorded'
        })
        
    # Stats
    total_patients_shared = len(active_permissions)
    records_written_by_doctor = MedicalRecord.query.filter_by(doctor_id=doctor.id).count()
    
    return jsonify({
        'stats': {
            'total_patients': total_patients_shared,
            'records_written': records_written_by_doctor,
            'verified_status': doctor.is_verified
        },
        'recent_patients': recent_patients[:10] # Limit to 10
    }), 200


@doctor_bp.route('/search', methods=['GET'])
@jwt_required()
def search_worker():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'doctor':
        return jsonify({'message': 'Access unauthorized'}), 403
        
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify([]), 200
        
    # Search by Health ID, Name, or Mobile Number
    workers = Worker.query.filter(
        (Worker.health_id.like(f"%{query}%")) |
        (Worker.name.like(f"%{query}%")) |
        (Worker.phone.like(f"%{query}%"))
    ).all()
    
    doctor = user.doctor_profile
    results = []
    
    for w in workers:
        # Check if doctor has active sharing permissions
        perm = SharingPermission.query.filter(
            SharingPermission.worker_id == w.id,
            SharingPermission.doctor_id == doctor.id,
            SharingPermission.expires_at > datetime.utcnow()
        ).first()
        
        results.append({
            'id': w.id,
            'health_id': w.health_id,
            'name': w.name,
            'gender': w.gender,
            'dob': w.dob.isoformat(),
            'phone': w.phone,
            'blood_group': w.blood_group,
            'state_of_origin': w.state_of_origin,
            'has_access': perm is not None,
            'access_expires': perm.expires_at.isoformat() if perm else None
        })
        
    return jsonify(results), 200


@doctor_bp.route('/worker/<health_id>', methods=['GET'])
@jwt_required()
def get_worker_records(health_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'doctor':
        return jsonify({'message': 'Access unauthorized'}), 403
        
    doctor = user.doctor_profile
    worker = Worker.query.filter_by(health_id=health_id).first()
    if not worker:
        return jsonify({'message': 'Migrant worker not found'}), 404
        
    # Check sharing permissions
    perm = SharingPermission.query.filter(
        SharingPermission.worker_id == worker.id,
        SharingPermission.doctor_id == doctor.id,
        SharingPermission.expires_at > datetime.utcnow()
    ).first()
    
    if not perm:
        log_audit(user_id, 'UNAUTHORIZED_ACCESS_ATTEMPT', f"Doctor attempted to access records of {worker.health_id} without active consent.")
        return jsonify({'message': 'You do not have authorized consent to view this patient\'s records.'}), 403
        
    # Log authorized access
    log_audit(user_id, 'RECORD_ACCESS', f"Doctor accessed medical records of worker {worker.name} (Health ID: {health_id})")
    
    # Retrieve medical records sorted by date descending
    records = MedicalRecord.query.filter_by(worker_id=worker.id).order_by(MedicalRecord.record_date.desc()).all()
    
    worker_data = worker.to_dict()
    worker_data['medical_history'] = [r.to_dict() for r in records]
    
    return jsonify(worker_data), 200


@doctor_bp.route('/share-via-qr', methods=['POST'])
@jwt_required()
def share_via_qr():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'doctor':
        return jsonify({'message': 'Access unauthorized'}), 403
        
    doctor = user.doctor_profile
    if not doctor or not doctor.is_verified:
        return jsonify({'message': 'Doctor not verified or profile pending approval'}), 403
        
    data = request.get_json() or {}
    health_id = data.get('health_id')
    
    if not health_id:
        return jsonify({'message': 'Missing Health ID'}), 400
        
    worker = Worker.query.filter_by(health_id=health_id).first()
    if not worker:
        return jsonify({'message': 'Worker not found'}), 404
        
    # Grant access for 1 day (24 hours)
    expires_at = datetime.utcnow() + timedelta(days=1)
    
    # Check if permission already exists
    perm = SharingPermission.query.filter_by(worker_id=worker.id, doctor_id=doctor.id).first()
    
    try:
        if perm:
            perm.expires_at = expires_at
        else:
            perm = SharingPermission(
                worker_id=worker.id,
                doctor_id=doctor.id,
                expires_at=expires_at
            )
            db.session.add(perm)
            
        # Add notification to worker
        notif = Notification(
            user_id=worker.user_id,
            title="Access Granted via QR",
            message=f"Dr. {doctor.name} has gained temporary access to your health record by scanning your QR code.",
            type='info'
        )
        db.session.add(notif)
        
        db.session.commit()
        log_audit(user_id, 'SHARE_VIA_QR', f"Doctor scanned QR and was granted access to worker {worker.name} (Health ID: {health_id})")
        
        return jsonify({
            'message': 'Access granted successfully',
            'health_id': health_id
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to link QR access: {str(e)}'}), 500
