from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from backend.models import db, User, Worker, Doctor, Hospital, MedicalRecord, Document, SharingPermission, Notification
from backend.utils.security import log_audit
from werkzeug.utils import secure_filename
from datetime import datetime
import os

records_bp = Blueprint('records', __name__)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@records_bp.route('', methods=['GET'])
@jwt_required()
def get_records():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    records = []
    
    # 1. If worker, return their own records
    if user.role == 'worker':
        worker = user.worker_profile
        records = MedicalRecord.query.filter_by(worker_id=worker.id).order_by(MedicalRecord.record_date.desc()).all()
        
    # 2. If doctor, they must supply worker_id or health_id and have permissions
    elif user.role == 'doctor':
        health_id = request.args.get('health_id')
        if not health_id:
            return jsonify({'message': 'Missing health_id query parameter'}), 400
            
        worker = Worker.query.filter_by(health_id=health_id).first()
        if not worker:
            return jsonify({'message': 'Worker not found'}), 404
            
        # Check permissions
        doctor = user.doctor_profile
        perm = SharingPermission.query.filter(
            SharingPermission.worker_id == worker.id,
            SharingPermission.doctor_id == doctor.id,
            SharingPermission.expires_at > datetime.utcnow()
        ).first()
        
        if not perm:
            return jsonify({'message': 'Access denied: No active sharing permission'}), 403
            
        records = MedicalRecord.query.filter_by(worker_id=worker.id).order_by(MedicalRecord.record_date.desc()).all()
        
    # 3. If hospital, they can view records they created or records of any patient (hospitals are trusted nodes for registering/viewing patients in local clinics)
    elif user.role == 'hospital':
        health_id = request.args.get('health_id')
        if not health_id:
            # Return records created by this hospital
            hospital = user.hospital_profile
            records = MedicalRecord.query.filter_by(hospital_id=hospital.id).order_by(MedicalRecord.record_date.desc()).all()
        else:
            worker = Worker.query.filter_by(health_id=health_id).first()
            if not worker:
                return jsonify({'message': 'Worker not found'}), 404
            records = MedicalRecord.query.filter_by(worker_id=worker.id).order_by(MedicalRecord.record_date.desc()).all()
            
    # 4. Admin can see all records
    elif user.role == 'admin':
        records = MedicalRecord.query.order_by(MedicalRecord.record_date.desc()).all()
        
    return jsonify([r.to_dict() for r in records]), 200


@records_bp.route('', methods=['POST'])
@jwt_required()
def create_record():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    # Read multipart or json form
    # We support either pure JSON or form-data (for file uploads)
    is_form = request.form is not None and len(request.form) > 0
    data = request.form if is_form else (request.get_json() or {})
    
    health_id = data.get('health_id')
    record_type = data.get('record_type') # 'diagnosis', 'prescription', 'vaccination', 'lab_report', 'other'
    title = data.get('title')
    description = data.get('description', '')
    record_date_str = data.get('record_date', datetime.utcnow().strftime('%Y-%m-%d'))
    
    if not health_id or not record_type or not title:
        return jsonify({'message': 'Missing health_id, record_type, or title'}), 400
        
    worker = Worker.query.filter_by(health_id=health_id).first()
    if not worker:
        return jsonify({'message': 'Worker not found'}), 404
        
    # Authorization checks
    doctor_id = None
    hospital_id = None
    
    if user.role == 'doctor':
        doctor = user.doctor_profile
        doctor_id = doctor.id
        # Check permission
        perm = SharingPermission.query.filter(
            SharingPermission.worker_id == worker.id,
            SharingPermission.doctor_id == doctor.id,
            SharingPermission.expires_at > datetime.utcnow()
        ).first()
        if not perm:
            return jsonify({'message': 'Access denied: No active sharing permission'}), 403
            
    elif user.role == 'hospital':
        hospital = user.hospital_profile
        hospital_id = hospital.id
        
    elif user.role == 'worker':
        if worker.user_id != user.id:
            return jsonify({'message': 'Access denied: Cannot add records to another worker'}), 403
            
    try:
        record = MedicalRecord(
            worker_id=worker.id,
            doctor_id=doctor_id,
            hospital_id=hospital_id,
            record_type=record_type,
            title=title,
            description=description,
            record_date=datetime.strptime(record_date_str, '%Y-%m-%d').date()
        )
        db.session.add(record)
        db.session.flush() # Get record.id
        
        # Handle file upload if present
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename != '':
                if not allowed_file(file.filename):
                    return jsonify({'message': 'Invalid file type. Allowed: PDF, PNG, JPG, JPEG'}), 400
                    
                filename = secure_filename(file.filename)
                # Create unique filename
                unique_filename = f"{record.id}_{int(datetime.utcnow().timestamp())}_{filename}"
                
                # Make sure upload directory exists
                os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
                
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(file_path)
                
                # Save document metadata
                document = Document(
                    medical_record_id=record.id,
                    file_name=filename,
                    file_path=unique_filename, # Store only filename inside upload folder
                    file_type=filename.rsplit('.', 1)[1].lower(),
                    file_size=os.path.getsize(file_path),
                    uploaded_by_user_id=user.id
                )
                db.session.add(document)
                
        # Send Notification to Worker if record created by Doctor or Hospital
        if user.role in ['doctor', 'hospital']:
            creator_name = user.doctor_profile.name if user.role == 'doctor' else user.hospital_profile.name
            notif = Notification(
                user_id=worker.user_id,
                title=f"New {record_type.capitalize()} Added",
                message=f"{creator_name} has added a new {record_type}: '{title}' to your health profile.",
                type='info'
            )
            db.session.add(notif)
            
        db.session.commit()
        log_audit(user.id, 'RECORD_CREATE', f"Created medical record #{record.id} of type {record_type} for worker #{worker.id}")
        
        return jsonify({
            'message': 'Medical record created successfully',
            'record': record.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create record: {str(e)}'}), 500


@records_bp.route('/document/<int:doc_id>', methods=['GET'])
@jwt_required()
def download_document(doc_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({'message': 'Document not found'}), 404
        
    # Access checks
    record = doc.medical_record
    authorized = False
    
    if user.role == 'admin':
        authorized = True
    elif user.role == 'worker' and record.worker.user_id == user.id:
        authorized = True
    elif user.role == 'doctor':
        # Check permissions
        doctor = user.doctor_profile
        perm = SharingPermission.query.filter(
            SharingPermission.worker_id == record.worker_id,
            SharingPermission.doctor_id == doctor.id,
            SharingPermission.expires_at > datetime.utcnow()
        ).first()
        if perm:
            authorized = True
    elif user.role == 'hospital':
        # Hospital created the record or can view patient
        if record.hospital_id == user.hospital_profile.id or True: # Hospital allowed to see for clinic review
            authorized = True
            
    if not authorized:
        log_audit(user.id, 'UNAUTHORIZED_DOC_ACCESS', f"User attempted to access document #{doc_id} without permission")
        return jsonify({'message': 'Access unauthorized'}), 403
        
    log_audit(user.id, 'DOCUMENT_ACCESS', f"User accessed document {doc.file_name} from medical record #{record.id}")
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], doc.file_path, as_attachment=True, download_name=doc.file_name)
