CREATE TABLE IF NOT EXISTS hrm_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'doctor', 'nurse') NOT NULL DEFAULT 'nurse',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hrm_rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(20) NOT NULL UNIQUE,
  room_type ENUM('General', 'ICU', 'Isolation', 'Emergency') NOT NULL DEFAULT 'General',
  status ENUM('Available', 'Occupied', 'Cleaning', 'Maintenance') NOT NULL DEFAULT 'Available',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hrm_patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  date_of_birth DATE,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  contact_number VARCHAR(30),
  condition_notes TEXT,
  infection_status ENUM('None', 'Suspected', 'Confirmed') NOT NULL DEFAULT 'None',
  isolation_required BOOLEAN NOT NULL DEFAULT FALSE,
  isolation_priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Low',
  room_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES hrm_rooms(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS hrm_isolation_assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  symptoms_severity ENUM('Low', 'Medium', 'High') NOT NULL,
  infectious_disease_suspected BOOLEAN NOT NULL DEFAULT FALSE,
  immune_risk ENUM('Low', 'Medium', 'High') NOT NULL,
  breathing_difficulty BOOLEAN NOT NULL DEFAULT FALSE,
  priority_score INT NOT NULL,
  priority_level ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
  isolation_required BOOLEAN NOT NULL DEFAULT FALSE,
  assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES hrm_patients(id) ON DELETE CASCADE
);