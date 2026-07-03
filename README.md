# Digital Health Record Management System for Migrant Workers in Kerala

A production-ready, scalable, and secure full-stack web application designed to provide a centralized digital health registry. Migrant workers in Kerala can securely store, review, and share health summaries via unique Digital Health IDs and QR codes, while verified medical professionals and clinics manage diagnoses, prescriptions, and lab records.

This application features a curated **Kerala Emerald & Mint green design system**, supporting full dark/light modes and **six-language UI translations** (English, Malayalam, Hindi, Bengali, Gujarati, Tamil) to assist workers from diverse states of origin.

---

## Technical Stack

* **Frontend:** React.js (Vite), Tailwind CSS, Lucide Icons, Recharts (Dynamic Analytics SVG Charts), jsPDF (Health summaries PDF exporter), Axios
* **Backend:** Python Flask, Flask-SQLAlchemy, Flask-JWT-Extended (Role-based JWT claims), bcrypt (Password hashing), Gunicorn
* **Database:** MySQL 8 (Production) / SQLite (Development Auto-Fallback)
* **Deployment & Containers:** Docker, Docker Compose, Environment Variables Config

---

## User Roles & Verified Test Credentials

For demonstration and validation, all database seeds use the password: **`Password@123`**

| Role | Username | Password | Key Action Features |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `Password@123` | Control Panel, Pending Doctor/Hospital registrations approvals, Telemetry stats, Audit log reviews, Programmatic database backups |
| **Medical Doctor** | `dr_rajesh` | `Password@123` | Patient lookup, consent-restricted record viewing, writing clinical diagnoses/prescriptions, uploading medical documents |
| **Hospital Staff** | `hosp_tvm_general` | `Password@123` | Registering migrant workers on their behalf (generates credentials), uploading laboratory test sheets |
| **Migrant Worker** | `manoj_kumar` | `Password@123` | Profile & emergency updates, Digital Health ID QR display, medical records timeline, sharing consent controls, PDF summary download |

*Note: There is a pending doctor account `dr_vijayan` (password: `Password@123`) which can be used to test the Administrator's approval/rejection panel.*

### Simulated Two-Factor Authentication (2FA)
As a premium security safeguard, all user logins trigger a 2FA OTP verification screen.
* For testing convenience, the generated 6-digit verification code is **printed directly in a banner** on the login screen, allowing quick bypass.
* The code is also recorded in the **Admin Security Audit Logs** for verification.

---

## Getting Started: How to Run the App

The project is structured to run instantly with zero manual database configuration. It supports two run modes:

### Option A: Running with Docker (Recommended)
This launches a complete production environment including a MySQL container database, the Flask backend, and the Nginx React frontend.

1. Ensure **Docker Desktop** is running.
2. In the project root folder, execute:
   ```bash
   docker-compose up --build
   ```
3. Once running:
   * **React Web App:** Open `http://localhost` (or `http://localhost:80`)
   * **Flask Backend API:** Exposed at `http://localhost:5000`

---

### Option B: Running Manually (Development SQLite Fallback)
If you do not have Docker installed, the application automatically scaffolds an SQLite database file `health_system.db` inside the `/backend` folder.

#### 1. Setup Backend
1. Navigate to the `backend` folder and install packages:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. Start the Flask server:
   ```bash
   python app.py
   ```
   *The server runs at `http://localhost:5000`. On first start, it will auto-seed the SQLite database with test entries.*

#### 2. Setup Frontend
1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Run the Vite React developer server:
   ```bash
   npm run dev
   ```
   *The web app runs at `http://localhost:5173`. Select language preferences and log in with any credential above.*

---

## Core Security Implementations

* **JWT RBAC Middleware:** JWT tokens embed role claims (`worker`, `doctor`, `hospital`, `admin`) to authorize route execution.
* **Consent Registry Check:** Doctors cannot query patient history timelines unless they hold an active, non-expired sharing token in the `sharing_permissions` table granted by the worker.
* **SQL Injection Prevention:** Utilizes SQLAlchemy ORM parameterized statements for all database operations.
* **Password Hashing:** Uses secure bcrypt hashing (work factor 10).
* **System Auditing:** Key actions (logins, unauthorized access logs, record modifications, backups) are audited inside `audit_logs` table.
