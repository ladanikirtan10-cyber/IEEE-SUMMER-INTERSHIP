-- Seed Data for Digital Health Record Management System for Migrant Workers in Kerala
-- All passwords are encrypted with bcrypt for the password: Password@123
-- BCrypt Hash: $2b$12$b9UthUbThVzdBIDiFf4i6O60pSGmrWdTFYlNJG34GDE21nFuTTxoe (or standard equivalent)
-- Note: Password is 'Password@123'

-- 1. Insert Users (Admin, Doctors, Hospitals, Workers)
-- Password Hash below is verified bcrypt for 'Password@123'
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `is_verified`) VALUES
(1, 'admin', 'admin@health.kerala.gov.in', '$2b$12$b9UthUbThVzdBIDiFf4i6O60pSGmrWdTFYlNJG34GDE21nFuTTxoe', 'admin', 1),
(2, 'dr_rajesh', 'rajesh.kumar@health.kerala.gov.in', '$2b$12$b9UthUbThVzdBIDiFf4i6O60pSGmrWdTFYlNJG34GDE21nFuTTxoe', 'doctor', 1),
(3, 'dr_ananya', 'ananya.sen@aims.edu.in', '$2b$12$b9UthUbThVzdBIDiFf4i6O60pSGmrWdTFYlNJG34GDE21nFuTTxoe', 'doctor', 1),
(4, 'hosp_tvm_general', 'contact@tvmgeneralhospital.org', '$2b$12$b9UthUbThVzdBIDiFf4i6O60pSGmrWdTFYlNJG34GDE21nFuTTxoe', 'hospital', 1),
(5, 'hosp_ernakulam_dist', 'info@ernakulamdistricthospital.org', '$2b$12$b9UthUbThVzdBIDiFf4i6O60pSGmrWdTFYlNJG34GDE21nFuTTxoe', 'hospital', 1),
(6, 'manoj_kumar', 'manoj.kumar95@gmail.com', '$2b$12$b9UthUbThVzdBIDiFf4i6O60pSGmrWdTFYlNJG34GDE21nFuTTxoe', 'worker', 1),
(7, 'babul_sheikh', 'babul.sheikh98@yahoo.com', '$2b$12$b9UthUbThVzdBIDiFf4i6O60pSGmrWdTFYlNJG34GDE21nFuTTxoe', 'worker', 1),
(8, 'sunita_oraon', 'sunita.oraon2000@gmail.com', '$2b$12$b9UthUbThVzdBIDiFf4i6O60pSGmrWdTFYlNJG34GDE21nFuTTxoe', 'worker', 1),
(9, 'dr_vijayan', 'dr.vijay@gmail.com', '$2b$12$b9UthUbThVzdBIDiFf4i6O60pSGmrWdTFYlNJG34GDE21nFuTTxoe', 'doctor', 0); -- Pending Verification

-- 2. Insert Workers
INSERT INTO `workers` (`id`, `user_id`, `health_id`, `name`, `phone`, `dob`, `gender`, `blood_group`, `state_of_origin`, `language_preference`, `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relation`, `allergies`, `existing_diseases`, `status`) VALUES
(1, 6, 'KL-MIGR-2026-0001', 'Manoj Kumar', '9876543210', '1995-05-15', 'Male', 'O+', 'Bihar', 'hi', 'Suman Devi', '9876543211', 'Mother', 'Penicillin, Dust', 'None', 'active'),
(2, 7, 'KL-MIGR-2026-0002', 'Babul Sheikh', '8765432109', '1998-08-20', 'Male', 'A+', 'West Bengal', 'bn', 'Amina Bibi', '8765432108', 'Wife', 'None', 'Asthma', 'active'),
(3, 8, 'KL-MIGR-2026-0003', 'Sunita Oraon', '7654321098', '2000-03-10', 'Female', 'B-', 'Jharkhand', 'hi', 'Birsa Oraon', '7654321097', 'Father', 'Sulfa drugs', 'Type 1 Diabetes', 'active');

-- 3. Insert Doctors
INSERT INTO `doctors` (`id`, `user_id`, `name`, `specialization`, `license_number`, `hospital_name`, `phone`, `is_verified`) VALUES
(1, 2, 'Dr. Rajesh Kumar', 'General Medicine', 'MC-KL-2015-879', 'Trivandrum General Hospital', '9447102030', 1),
(2, 3, 'Dr. Ananya Sen', 'Pulmonology', 'MC-KL-2018-452', 'Ernakulam Medical College', '9846506070', 1),
(3, 9, 'Dr. Vijayan K.', 'Cardiology', 'MC-KL-1998-112', 'Kozhikode Co-operative Hospital', '9495010203', 0);

-- 4. Insert Hospitals
INSERT INTO `hospitals` (`id`, `user_id`, `name`, `registration_number`, `address`, `phone`, `is_verified`) VALUES
(1, 4, 'Trivandrum General Hospital', 'HOSP-TVM-01', 'General Hospital Junction, Palayam, Thiruvananthapuram, Kerala 695035', '04712307874', 1),
(2, 5, 'Ernakulam District Hospital', 'HOSP-ER-02', 'Banerji Rd, Kacheripady, Ernakulam, Kerala 682018', '04842360015', 1);

-- 5. Insert Medical Records
INSERT INTO `medical_records` (`id`, `worker_id`, `doctor_id`, `hospital_id`, `record_type`, `title`, `description`, `record_date`) VALUES
-- Records for Manoj Kumar
(1, 1, 1, 1, 'diagnosis', 'Acute Bronchitis', 'Patient presented with productive cough, mild fever, and wheezing. Lung sounds clear but congested. Advised warm fluids and rest.', '2026-05-10'),
(2, 1, 1, 1, 'prescription', 'Bronchitis Treatment Medication', '1. Amoxicillin 500mg - 3 times daily for 5 days\n2. Paracetamol 650mg - as needed for fever (max 3 times/day)\n3. Cough Syrup (Guaifenesin) - 10ml thrice daily', '2026-05-10'),
(3, 1, NULL, 1, 'vaccination', 'Covid-19 Booster Dose', 'Covishield booster dose administered successfully. No immediate adverse reaction observed during the 30-minute post-observation period.', '2026-05-12'),

-- Records for Babul Sheikh
(4, 2, 2, 2, 'diagnosis', 'Asthma Exacerbation', 'Patient reported shortness of breath and wheezing, triggered by dust at construction site. Oxygen saturation at 95% on room air. Administered nebulization.', '2026-06-01'),
(5, 2, 2, 2, 'prescription', 'Inhaler & Controller Medication', '1. Levolin Inhaler (Levosalbutamol 50mcg) - 2 puffs as needed for sudden breathlessness\n2. Budecort Inhaler (Budesonide 200mcg) - 1 puff twice daily (morning & night)\n3. Montair 10mg (Montelukast) - 1 tablet at night for 14 days', '2026-06-01'),
(6, 2, NULL, 2, 'lab_report', 'Pulmonary Function Test (PFT)', 'FVC: 3.8L (82% predicted), FEV1: 2.7L (71% predicted). FEV1/FVC ratio 71%. Indicates mild obstructive airway defect, reversible with bronchodilator.', '2026-06-02'),

-- Records for Sunita Oraon
(7, 3, 1, 1, 'diagnosis', 'Routine Diabetes Checkup', 'HbA1c levels evaluated at 7.4%. Patient maintains reasonable control. Noted minor tingling in toes, advised nerve check next visit.', '2026-06-05'),
(8, 3, 1, 1, 'prescription', 'Diabetes Maintenance', '1. Metformin 500mg - Twice daily with meals\n2. Glimepiride 1mg - Once daily before breakfast\n3. B-Complex vitamins - Once daily', '2026-06-05');

-- 6. Insert Sharing Permissions (Manoj and Sunita sharing with Dr. Rajesh, Babul sharing with Dr. Ananya)
INSERT INTO `sharing_permissions` (`worker_id`, `doctor_id`, `expires_at`) VALUES
(1, 1, '2027-06-11 00:00:00'),
(2, 2, '2027-06-11 00:00:00'),
(3, 1, '2027-06-11 00:00:00');

-- 7. Insert Notifications
INSERT INTO `notifications` (`user_id`, `title`, `message`, `is_read`, `type`) VALUES
(6, 'New Diagnosis Added', 'Dr. Rajesh Kumar has added a new diagnosis: Acute Bronchitis.', 0, 'info'),
(6, 'New Prescription Uploaded', 'Dr. Rajesh Kumar has uploaded a new prescription for Bronchitis.', 1, 'info'),
(7, 'Appointment Reminder', 'Your follow-up checkup with Dr. Ananya Sen is scheduled for tomorrow at 10:00 AM.', 0, 'reminder'),
(8, 'New Diagnosis Added', 'Dr. Rajesh Kumar has uploaded details for your Routine Diabetes Checkup.', 0, 'info');

-- 8. Insert Audit Logs
INSERT INTO `audit_logs` (`user_id`, `action`, `details`, `ip_address`) VALUES
(1, 'USER_LOGIN', 'Administrator logged in successfully.', '192.168.1.10'),
(6, 'USER_LOGIN', 'Migrant worker Manoj Kumar logged in.', '192.168.1.55'),
(2, 'RECORD_ACCESS', 'Dr. Rajesh Kumar accessed medical records for Manoj Kumar.', '192.168.1.21'),
(2, 'RECORD_CREATE', 'Dr. Rajesh Kumar created diagnosis record #1 for worker #1.', '192.168.1.21'),
(3, 'RECORD_ACCESS', 'Dr. Ananya Sen accessed records for Babul Sheikh.', '192.168.1.34');
