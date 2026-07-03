from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, User, Worker, Doctor, SharingPermission, Notification
from backend.utils.security import log_audit
from datetime import datetime, timedelta

worker_bp = Blueprint('worker', __name__)

@worker_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'worker':
        return jsonify({'message': 'Access unauthorized or user not found'}), 403
        
    worker = user.worker_profile
    if not worker:
        return jsonify({'message': 'Worker profile not found'}), 404
        
    return jsonify(worker.to_dict()), 200


@worker_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'worker':
        return jsonify({'message': 'Access unauthorized'}), 403
        
    worker = user.worker_profile
    if not worker:
        return jsonify({'message': 'Worker profile not found'}), 404
        
    data = request.get_json() or {}
    
    # Allowed updates
    worker.name = data.get('name', worker.name)
    worker.phone = data.get('phone', worker.phone)
    worker.blood_group = data.get('blood_group', worker.blood_group)
    worker.state_of_origin = data.get('state_of_origin', worker.state_of_origin)
    worker.language_preference = data.get('language_preference', worker.language_preference)
    worker.emergency_contact_name = data.get('emergency_contact_name', worker.emergency_contact_name)
    worker.emergency_contact_phone = data.get('emergency_contact_phone', worker.emergency_contact_phone)
    worker.emergency_contact_relation = data.get('emergency_contact_relation', worker.emergency_contact_relation)
    worker.allergies = data.get('allergies', worker.allergies)
    worker.existing_diseases = data.get('existing_diseases', worker.existing_diseases)
    
    try:
        db.session.commit()
        log_audit(user_id, 'PROFILE_UPDATE', "Worker updated profile information.")
        return jsonify({'message': 'Profile updated successfully', 'worker': worker.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Profile update failed: {str(e)}'}), 500


@worker_bp.route('/sharing', methods=['GET'])
@jwt_required()
def get_sharing():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'worker':
        return jsonify({'message': 'Access unauthorized'}), 403
        
    worker = user.worker_profile
    permissions = SharingPermission.query.filter_by(worker_id=worker.id).all()
    
    # Filter expired permissions and format
    active_permissions = []
    now = datetime.utcnow()
    for perm in permissions:
        if perm.expires_at > now:
            active_permissions.append(perm.to_dict())
        else:
            # Clean up expired permission silently
            db.session.delete(perm)
            
    if len(active_permissions) != len(permissions):
        db.session.commit()
        
    return jsonify(active_permissions), 200


@worker_bp.route('/share', methods=['POST'])
@jwt_required()
def add_sharing():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'worker':
        return jsonify({'message': 'Access unauthorized'}), 403
        
    worker = user.worker_profile
    data = request.get_json() or {}
    
    doctor_license = data.get('license_number')
    duration_days = int(data.get('duration_days', 7)) # default 7 days access
    
    if not doctor_license:
        return jsonify({'message': 'Doctor license number is required'}), 400
        
    doctor = Doctor.query.filter_by(license_number=doctor_license, is_verified=True).first()
    if not doctor:
        return jsonify({'message': 'Doctor not found or not verified'}), 404
        
    # Check if sharing already exists
    existing = SharingPermission.query.filter_by(worker_id=worker.id, doctor_id=doctor.id).first()
    expires_at = datetime.utcnow() + timedelta(days=duration_days)
    
    try:
        if existing:
            existing.expires_at = expires_at
            message = f"Sharing consent extended for Dr. {doctor.name} until {expires_at.strftime('%Y-%m-%d')}"
        else:
            perm = SharingPermission(
                worker_id=worker.id,
                doctor_id=doctor.id,
                expires_at=expires_at
            )
            db.session.add(perm)
            message = f"Health records successfully shared with Dr. {doctor.name} until {expires_at.strftime('%Y-%m-%d')}"
            
        # Notify the doctor
        notification = Notification(
            user_id=doctor.user_id,
            title="Access Granted",
            message=f"Migrant worker {worker.name} (Health ID: {worker.health_id}) has granted you access to their medical records.",
            type='info'
        )
        db.session.add(notification)
        
        db.session.commit()
        log_audit(user_id, 'RECORD_SHARE', f"Worker shared records with Doctor ID {doctor.id}")
        return jsonify({'message': message}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to share records: {str(e)}'}), 500


@worker_bp.route('/share/revoke/<int:perm_id>', methods=['DELETE'])
@jwt_required()
def revoke_sharing(perm_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'worker':
        return jsonify({'message': 'Access unauthorized'}), 403
        
    worker = user.worker_profile
    perm = SharingPermission.query.filter_by(id=perm_id, worker_id=worker.id).first()
    
    if not perm:
        return jsonify({'message': 'Consent record not found'}), 404
        
    try:
        doctor_name = perm.doctor.name
        doctor_user_id = perm.doctor.user_id
        db.session.delete(perm)
        
        # Notify Doctor
        notification = Notification(
            user_id=doctor_user_id,
            title="Access Revoked",
            message=f"Migrant worker {worker.name} has revoked your access to their health records.",
            type='alert'
        )
        db.session.add(notification)
        
        db.session.commit()
        log_audit(user_id, 'RECORD_REVOKE', f"Worker revoked record access for Doctor ID {perm.doctor_id}")
        return jsonify({'message': f"Access consent revoked for Dr. {doctor_name}"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to revoke permission: {str(e)}'}), 500
