from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from backend.models import db, User, Worker, Doctor, Hospital, Notification
from backend.utils.security import log_audit, generate_health_id
from datetime import datetime, timedelta
import random

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role') # 'worker', 'doctor', 'hospital'
    
    if not username or not email or not password or not role:
        return jsonify({'message': 'Missing required fields'}), 400
        
    if role not in ['worker', 'doctor', 'hospital']:
        return jsonify({'message': 'Invalid role specified'}), 400
        
    # Check if user already exists
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'message': 'Username or Email already registered'}), 409
        
    try:
        # Create base user
        user = User(
            username=username,
            email=email,
            role=role,
            is_verified=(role == 'worker') # Workers auto-verified to register, doctors/hospitals need admin approval
        )
        user.set_password(password)
        db.session.add(user)
        db.session.flush() # Populate user.id
        
        # Role specific data creation
        if role == 'worker':
            # Generate Health ID
            health_id = generate_health_id()
            while Worker.query.filter_by(health_id=health_id).first():
                health_id = generate_health_id()
                
            worker = Worker(
                user_id=user.id,
                health_id=health_id,
                name=data.get('name', username),
                phone=data.get('phone', '0000000000'),
                dob=datetime.strptime(data.get('dob', '2000-01-01'), '%Y-%m-%d').date(),
                gender=data.get('gender', 'Other'),
                blood_group=data.get('blood_group', 'O+'),
                state_of_origin=data.get('state_of_origin', 'Other'),
                language_preference=data.get('language_preference', 'en'),
                emergency_contact_name=data.get('emergency_contact_name', 'Emergency Contact'),
                emergency_contact_phone=data.get('emergency_contact_phone', '0000000000'),
                emergency_contact_relation=data.get('emergency_contact_relation', 'Unknown'),
                allergies=data.get('allergies', ''),
                existing_diseases=data.get('existing_diseases', ''),
                status='active'
            )
            db.session.add(worker)
            
        elif role == 'doctor':
            doctor = Doctor(
                user_id=user.id,
                name=data.get('name'),
                specialization=data.get('specialization'),
                license_number=data.get('license_number'),
                hospital_name=data.get('hospital_name'),
                phone=data.get('phone'),
                is_verified=False # Requires Admin verification
            )
            db.session.add(doctor)
            
        elif role == 'hospital':
            hospital = Hospital(
                user_id=user.id,
                name=data.get('name'),
                registration_number=data.get('registration_number'),
                address=data.get('address'),
                phone=data.get('phone'),
                is_verified=False # Requires Admin verification
            )
            db.session.add(hospital)
            
        db.session.commit()
        log_audit(user.id, 'USER_REGISTER', f"Successfully registered user {username} with role {role}")
        
        return jsonify({
            'message': 'Registration successful. Approval pending if Doctor/Hospital.',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400
        
    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        log_audit(None, 'LOGIN_FAILED', f"Failed login attempt for username: {username}")
        return jsonify({'message': 'Invalid credentials'}), 401
        
    # Check verification status for Doctors and Hospitals
    if user.role == 'doctor' and not user.doctor_profile.is_verified:
        return jsonify({'message': 'Doctor account is pending verification by Administrator.'}), 403
    if user.role == 'hospital' and not user.hospital_profile.is_verified:
        return jsonify({'message': 'Hospital account is pending verification by Administrator.'}), 403
        
    # Check 2FA preference (we simulate that 2FA is required for everyone as a premium feature)
    # The frontend will hit a mock 2FA verification endpoint if two_factor_required is returned
    otp_code = str(random.randint(100000, 999999))
    user.two_factor_secret = otp_code # Save temporary code
    db.session.commit()
    
    # In a real environment, we'd send an email/SMS here.
    # We will log the OTP in audit log so developers/assessors can retrieve it if needed,
    # and also send it back in response for demonstration purposes!
    log_audit(user.id, '2FA_OTP_SENT', f"2FA OTP generated for user: {username} - OTP is {otp_code}")
    
    return jsonify({
        'two_factor_required': True,
        'temp_token': otp_code, # Sent for easy frontend mock testing
        'message': 'Two-factor authentication code sent to registered contact.'
    }), 200


@auth_bp.route('/verify-2fa', methods=['POST'])
def verify_2fa():
    data = request.get_json() or {}
    username = data.get('username')
    code = data.get('code')
    
    if not username or not code:
        return jsonify({'message': 'Missing fields'}), 400
        
    user = User.query.filter_by(username=username).first()
    if not user or user.two_factor_secret != code:
        log_audit(user.id if user else None, '2FA_FAILED', "Failed 2FA code verification.")
        return jsonify({'message': 'Invalid verification code'}), 401
        
    # Clear OTP
    user.two_factor_secret = None
    db.session.commit()
    
    # Generate actual access token
    # Embed role inside claims for RBAC on frontend/backend
    additional_claims = {'role': user.role}
    access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
    
    log_audit(user.id, 'USER_LOGIN', f"User {username} logged in successfully via 2FA.")
    
    # Get profile sub-info for dashboard quick config
    profile_info = {}
    if user.role == 'worker':
        profile_info = {'name': user.worker_profile.name, 'health_id': user.worker_profile.health_id}
    elif user.role == 'doctor':
        profile_info = {'name': user.doctor_profile.name, 'specialization': user.doctor_profile.specialization}
    elif user.role == 'hospital':
        profile_info = {'name': user.hospital_profile.name}
    elif user.role == 'admin':
        profile_info = {'name': 'Administrator'}
        
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'profile': profile_info
        }
    }), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email')
    
    if not email:
        return jsonify({'message': 'Email is required'}), 400
        
    user = User.query.filter_by(email=email).first()
    if user:
        log_audit(user.id, 'FORGOT_PASSWORD_REQUEST', f"Password reset request generated for email: {email}")
        return jsonify({
            'message': 'Password reset instructions have been sent to your email address.',
            'reset_token': f"mock-reset-token-{user.id}" # Return a mock token for frontend demo
        }), 200
        
    return jsonify({'message': 'If this email exists in our system, reset instructions have been sent.'}), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    email = data.get('email')
    token = data.get('token')
    new_password = data.get('password')
    
    if not email or not token or not new_password:
        return jsonify({'message': 'Missing required fields'}), 400
        
    # Check if mock token matches email
    user = User.query.filter_by(email=email).first()
    if not user or f"mock-reset-token-{user.id}" != token:
        return jsonify({'message': 'Invalid or expired reset token'}), 400
        
    try:
        user.set_password(new_password)
        db.session.commit()
        log_audit(user.id, 'PASSWORD_RESET_SUCCESS', f"Password reset successfully for user: {user.username}")
        return jsonify({'message': 'Password has been reset successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to reset password: {str(e)}'}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    profile_info = {}
    if user.role == 'worker':
        profile_info = user.worker_profile.to_dict()
    elif user.role == 'doctor':
        profile_info = user.doctor_profile.to_dict()
    elif user.role == 'hospital':
        profile_info = user.hospital_profile.to_dict()
    elif user.role == 'admin':
        profile_info = {'name': 'System Administrator'}
        
    user_data = user.to_dict()
    user_data['profile'] = profile_info
    return jsonify({
        'user': user_data
    }), 200


@auth_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    notifications = Notification.query.filter_by(user_id=user.id).order_by(Notification.created_at.desc()).limit(15).all()
    return jsonify([n.to_dict() for n in notifications]), 200


@auth_bp.route('/notifications/<int:nid>/read', methods=['POST'])
@jwt_required()
def mark_notification_read(nid):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    n = Notification.query.filter_by(id=nid, user_id=user.id).first()
    if not n:
        return jsonify({'message': 'Notification not found'}), 404
        
    n.is_read = True
    db.session.commit()
    return jsonify({'message': 'Notification marked as read'}), 200

