# Configuration settings for Flask Backend
import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Flask application settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-12345!@#')
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() in ['true', '1', 't']
    
    # Database configuration
    # Supports MySQL or fallback to local SQLite for easy execution
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', 'password')
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = os.environ.get('DB_PORT', '3306')
    DB_NAME = os.environ.get('DB_NAME', 'digital_health_system')
    
    # If DATABASE_URL is provided, use it directly. Otherwise, check if we can form a mysql connection, 
    # else fallback to local SQLite file
    DEFAULT_SQLITE_PATH = os.path.join(BASE_DIR, 'health_system.db')
    
    if os.environ.get('DATABASE_URL'):
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    elif os.environ.get('USE_SQLITE', 'True').lower() in ['true', '1', 't']:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{DEFAULT_SQLITE_PATH}"
    else:
        # Build MySQL URI
        SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-67890!@#')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)
    
    # File upload settings
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB limit
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
