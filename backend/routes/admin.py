from flask import Blueprint, jsonify, request, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, User, Worker, Doctor, Hospital, MedicalRecord, AuditLog, Notification
from backend.utils.security import log_audit
from datetime import datetime, timedelta
import io
import os

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'admin':
        return jsonify({'message': 'Access unauthorized'}), 403
        
    # Stats
    total_workers = Worker.query.count()
    total_doctors = Doctor.query.count()
    total_hospitals = Hospital.query.count()
    total_records = MedicalRecord.query.count()
    
    # 1. User growth trends (registrations in the last 7 days)
    today = datetime.utcnow().date()
    growth_chart = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_str = day.strftime('%Y-%m-%d')
        # Filter users created on this day
        count = User.query.filter(db.func.date(User.created_at) == day).count()
        growth_chart.append({'date': day.strftime('%a'), 'registrations': count})
        
    # 2. Upload trends (medical records added in the last 7 days)
    upload_chart = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = MedicalRecord.query.filter(db.func.date(MedicalRecord.created_at) == day).count()
        upload_chart.append({'date': day.strftime('%a'), 'uploads': count})
        
    # 3. Healthcare access stats by record type
    types = db.session.query(
        MedicalRecord.record_type, 
        db.func.count(MedicalRecord.id)
    ).group_by(MedicalRecord.record_type).all()
    
    access_stats = [{'category': t[0].capitalize(), 'value': t[1]} for t in types]
    
    # Fill in categories if empty
    categories = ['Diagnosis', 'Prescription', 'Vaccination', 'Lab_report', 'Other']
    existing_cats = [a['category'].lower() for a in access_stats]
    for cat in categories:
        if cat.lower() not in existing_cats:
            access_stats.append({'category': cat, 'value': 0})
            
    # System metrics mock
    system_metrics = {
        'cpu_usage': 12.4, # Mock percentages
        'memory_usage': 44.8,
        'disk_status': 'Healthy (88GB free)',
        'db_status': 'Connected'
    }
    
    return jsonify({
        'stats': {
            'workers': total_workers,
            'doctors': total_doctors,
            'hospitals': total_hospitals,
            'records': total_records
        },
        'growth_chart': growth_chart,
        'upload_chart': upload_chart,
        'access_stats': access_stats,
        'system_metrics': system_metrics
    }), 200


@admin_bp.route('/verifications', methods=['GET'])
@jwt_required()
def get_verifications():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'admin':
        return jsonify({'message': 'Access unauthorized'}), 403
        
    pending_doctors = Doctor.query.filter_by(is_verified=False).all()
    pending_hospitals = Hospital.query.filter_by(is_verified=False).all()
    
    return jsonify({
        'doctors': [d.to_dict() for d in pending_doctors],
        'hospitals': [h.to_dict() for h in pending_hospitals]
    }), 200


@admin_bp.route('/verify/<string:role>/<int:profile_id>', methods=['POST'])
@jwt_required()
def verify_profile(role, profile_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'admin':
        return jsonify({'message': 'Access unauthorized'}), 403
        
    data = request.get_json() or {}
    action = data.get('action') # 'approve' or 'reject'
    
    if action not in ['approve', 'reject']:
        return jsonify({'message': 'Invalid action'}), 400
        
    target_user = None
    
    try:
        if role == 'doctor':
            doctor = Doctor.query.get(profile_id)
            if not doctor:
                return jsonify({'message': 'Doctor not found'}), 404
            target_user = doctor.user
            
            if action == 'approve':
                doctor.is_verified = True
                target_user.is_verified = True
                msg = f"Doctor profile for Dr. {doctor.name} approved."
                notif_msg = "Your doctor profile verification has been approved by the admin. You can now log in."
            else:
                db.session.delete(doctor)
                db.session.delete(target_user)
                msg = "Doctor profile rejected and user deleted."
                
        elif role == 'hospital':
            hospital = Hospital.query.get(profile_id)
            if not hospital:
                return jsonify({'message': 'Hospital not found'}), 404
            target_user = hospital.user
            
            if action == 'approve':
                hospital.is_verified = True
                target_user.is_verified = True
                msg = f"Hospital profile for {hospital.name} approved."
                notif_msg = "Your hospital profile verification has been approved by the admin. You can now log in."
            else:
                db.session.delete(hospital)
                db.session.delete(target_user)
                msg = "Hospital profile rejected and user deleted."
        else:
            return jsonify({'message': 'Invalid role type'}), 400
            
        if action == 'approve' and target_user:
            notif = Notification(
                user_id=target_user.id,
                title="Account Verified",
                message=notif_msg,
                type='info'
            )
            db.session.add(notif)
            
        db.session.commit()
        log_audit(user_id, 'USER_VERIFICATION', f"Admin {action}d {role} (Profile ID: {profile_id})")
        return jsonify({'message': msg}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Verification update failed: {str(e)}'}), 500


@admin_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
def get_audit_logs():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'admin':
        return jsonify({'message': 'Access unauthorized'}), 403
        
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(100).all()
    return jsonify([log.to_dict() for log in logs]), 200


@admin_bp.route('/backup', methods=['POST'])
@jwt_required()
def trigger_backup():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'admin':
        return jsonify({'message': 'Access unauthorized'}), 403
        
    try:
        # Generate a text SQL dump programmatically.
        # This is elegant, standard-independent, and works for SQLite and MySQL.
        buffer = io.BytesIO()
        
        # Meta info
        dump_header = f"-- Digital Health Record System Backup\n-- Date: {datetime.utcnow().isoformat()}\n-- Admin ID: {user_id}\n\n"
        buffer.write(dump_header.encode('utf-8'))
        
        # We will dump database records dynamically.
        # Get all SQLAlchemy models
        meta = db.metadata
        for table_name in meta.tables:
            table = meta.tables[table_name]
            buffer.write(f"-- Dumping table: {table_name}\n".encode('utf-8'))
            
            # Fetch all rows
            result = db.session.execute(table.select()).fetchall()
            for row in result:
                columns = [c.name for c in table.columns]
                vals = []
                for val in row:
                    if val is None:
                        vals.append("NULL")
                    elif isinstance(val, (int, float)):
                        vals.append(str(val))
                    elif isinstance(val, bool):
                        vals.append("1" if val else "0")
                    else:
                        # Escape quotes
                        escaped = str(val).replace("'", "''")
                        vals.append(f"'{escaped}'")
                        
                insert_stmt = f"INSERT INTO `{table_name}` ({', '.join([f'`{c}`' for c in columns])}) VALUES ({', '.join(vals)});\n"
                buffer.write(insert_stmt.encode('utf-8'))
            buffer.write(b"\n")
            
        buffer.seek(0)
        log_audit(user_id, 'SYSTEM_BACKUP', "Database SQL backup generated.")
        
        filename = f"health_system_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
        return send_file(
            buffer,
            as_attachment=True,
            download_name=filename,
            mimetype='text/plain'
        )
        
    except Exception as e:
        return jsonify({'message': f'Backup failed: {str(e)}'}), 500
