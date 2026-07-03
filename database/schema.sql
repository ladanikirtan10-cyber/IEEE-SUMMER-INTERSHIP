-- Database Schema for Digital Health Record Management System for Migrant Workers in Kerala

-- Disable foreign key checks to allow dropping tables cleanly
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `sharing_permissions`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `medical_records`;
DROP TABLE IF EXISTS `hospitals`;
DROP TABLE IF EXISTS `doctors`;
DROP TABLE IF EXISTS `workers`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table (Core Auth Entity)
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('worker', 'doctor', 'hospital', 'admin') NOT NULL,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `two_factor_secret` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (`email`),
  INDEX idx_username (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Workers Table (Migrant Worker Profiles)
CREATE TABLE `workers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `health_id` VARCHAR(20) NOT NULL UNIQUE, -- Unique public digital health ID: KL-MIGR-XXXX-XXXX
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(15) NOT NULL UNIQUE,
  `dob` DATE NOT NULL,
  `gender` VARCHAR(15) NOT NULL,
  `blood_group` VARCHAR(5) NOT NULL,
  `state_of_origin` VARCHAR(100) NOT NULL,
  `language_preference` VARCHAR(15) DEFAULT 'en',
  `emergency_contact_name` VARCHAR(100) NOT NULL,
  `emergency_contact_phone` VARCHAR(15) NOT NULL,
  `emergency_contact_relation` VARCHAR(50) NOT NULL,
  `allergies` TEXT NULL,
  `existing_diseases` TEXT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX idx_health_id (`health_id`),
  INDEX idx_phone (`phone`),
  INDEX idx_name (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Doctors Table
CREATE TABLE `doctors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `specialization` VARCHAR(100) NOT NULL,
  `license_number` VARCHAR(50) NOT NULL UNIQUE,
  `hospital_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX idx_license (`license_number`),
  INDEX idx_doctor_name (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Hospitals / Clinics Table
CREATE TABLE `hospitals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `registration_number` VARCHAR(50) NOT NULL UNIQUE,
  `address` TEXT NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX idx_reg_number (`registration_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Medical Records Table (Diagnoses, Prescriptions, Vaccinations, etc.)
CREATE TABLE `medical_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `worker_id` INT NOT NULL,
  `doctor_id` INT NULL, -- Can be NULL if entered by hospital staff/upload
  `hospital_id` INT NULL,
  `record_type` ENUM('diagnosis', 'prescription', 'vaccination', 'lab_report', 'other') NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `record_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE SET NULL,
  INDEX idx_record_type (`record_type`),
  INDEX idx_record_date (`record_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Documents Table (Uploaded PDFs/Images)
CREATE TABLE `documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `medical_record_id` INT NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL, -- Relative or secure storage path
  `file_type` VARCHAR(10) NOT NULL, -- pdf, png, jpg, etc.
  `file_size` INT NOT NULL, -- in bytes
  `uploaded_by_user_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Sharing Permissions (Consent Registry)
CREATE TABLE `sharing_permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `worker_id` INT NOT NULL,
  `doctor_id` INT NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_worker_doctor` (`worker_id`, `doctor_id`),
  FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Notifications Table
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `type` ENUM('info', 'alert', 'reminder') DEFAULT 'info',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX idx_user_read (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Audit Logs Table (Compliance & Activity Tracking)
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL, -- NULL for anonymous events (failed login logs might track username in details)
  `action` VARCHAR(100) NOT NULL, -- e.g. "USER_LOGIN", "RECORD_ACCESS", "RECORD_CREATE"
  `details` TEXT NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_action (`action`),
  INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
