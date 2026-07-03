import bcrypt
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'worker', 'doctor', 'hospital', 'admin'
    is_verified = db.Column(db.Boolean, default=False)
    two_factor_secret = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    worker_profile = db.relationship('Worker', backref='user', uselist=False, cascade="all, delete-orphan")
    doctor_profile = db.relationship('Doctor', backref='user', uselist=False, cascade="all, delete-orphan")
    hospital_profile = db.relationship('Hospital', backref='user', uselist=False, cascade="all, delete-orphan")
    notifications = db.relationship('Notification', backref='user', cascade="all, delete-orphan")
    audit_logs = db.relationship('AuditLog', backref='user')

    def set_password(self, password):
        # Hash password using bcrypt
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Worker(db.Model):
    __tablename__ = 'workers'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    health_id = db.Column(db.String(20), unique=True, nullable=False) # KL-MIGR-YYYY-XXXX
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15), unique=True, nullable=False)
    dob = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(15), nullable=False)
    blood_group = db.Column(db.String(5), nullable=False)
    state_of_origin = db.Column(db.String(100), nullable=False)
    language_preference = db.Column(db.String(15), default='en')
    emergency_contact_name = db.Column(db.String(100), nullable=False)
    emergency_contact_phone = db.Column(db.String(15), nullable=False)
    emergency_contact_relation = db.Column(db.String(50), nullable=False)
    allergies = db.Column(db.Text, nullable=True)
    existing_diseases = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='active') # 'active', 'inactive'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    medical_records = db.relationship('MedicalRecord', backref='worker', cascade="all, delete-orphan")
    permissions = db.relationship('SharingPermission', backref='worker', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'health_id': self.health_id,
            'name': self.name,
            'phone': self.phone,
            'dob': self.dob.isoformat() if self.dob else None,
            'gender': self.gender,
            'blood_group': self.blood_group,
            'state_of_origin': self.state_of_origin,
            'language_preference': self.language_preference,
            'emergency_contact_name': self.emergency_contact_name,
            'emergency_contact_phone': self.emergency_contact_phone,
            'emergency_contact_relation': self.emergency_contact_relation,
            'allergies': self.allergies,
            'existing_diseases': self.existing_diseases,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Doctor(db.Model):
    __tablename__ = 'doctors'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    specialization = db.Column(db.String(100), nullable=False)
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    hospital_name = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    medical_records = db.relationship('MedicalRecord', backref='doctor')
    permissions = db.relationship('SharingPermission', backref='doctor', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'specialization': self.specialization,
            'license_number': self.license_number,
            'hospital_name': self.hospital_name,
            'phone': self.phone,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Hospital(db.Model):
    __tablename__ = 'hospitals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    registration_number = db.Column(db.String(50), unique=True, nullable=False)
    address = db.Column(db.Text, nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    medical_records = db.relationship('MedicalRecord', backref='hospital')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'registration_number': self.registration_number,
            'address': self.address,
            'phone': self.phone,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class MedicalRecord(db.Model):
    __tablename__ = 'medical_records'
    
    id = db.Column(db.Integer, primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey('workers.id', ondelete='CASCADE'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id', ondelete='SET NULL'), nullable=True)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id', ondelete='SET NULL'), nullable=True)
    record_type = db.Column(db.String(20), nullable=False) # 'diagnosis', 'prescription', 'vaccination', 'lab_report', 'other'
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    record_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    documents = db.relationship('Document', backref='medical_record', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'worker_id': self.worker_id,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.name if self.doctor else (self.hospital.name if self.hospital else 'System'),
            'hospital_id': self.hospital_id,
            'record_type': self.record_type,
            'title': self.title,
            'description': self.description,
            'record_date': self.record_date.isoformat() if self.record_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'documents': [doc.to_dict() for doc in self.documents]
        }


class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    medical_record_id = db.Column(db.Integer, db.ForeignKey('medical_records.id', ondelete='CASCADE'), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(10), nullable=False) # 'pdf', 'png', 'jpg'
    file_size = db.Column(db.Integer, nullable=False) # in bytes
    uploaded_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'medical_record_id': self.medical_record_id,
            'file_name': self.file_name,
            'file_path': self.file_path,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'uploaded_by_user_id': self.uploaded_by_user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class SharingPermission(db.Model):
    __tablename__ = 'sharing_permissions'
    
    id = db.Column(db.Integer, primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey('workers.id', ondelete='CASCADE'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id', ondelete='CASCADE'), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('worker_id', 'doctor_id', name='uniq_worker_doctor_sp'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'worker_id': self.worker_id,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.name if self.doctor else 'Unknown Doctor',
            'specialization': self.doctor.specialization if self.doctor else '',
            'hospital_name': self.doctor.hospital_name if self.doctor else '',
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    type = db.Column(db.String(20), default='info') # 'info', 'alert', 'reminder'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'is_read': self.is_read,
            'type': self.type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False) # 'USER_LOGIN', 'RECORD_ACCESS', 'RECORD_CREATE', etc.
    details = db.Column(db.Text, nullable=False)
    ip_address = db.Column(db.String(45), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else 'System/Anonymous',
            'action': self.action,
            'details': self.details,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
