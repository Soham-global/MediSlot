-- Medi-Slot: demo data. Run ONCE, after 01_schema.sql, on an empty database:
--   psql -d medislot_db -f 02_seed_demo_data.sql
-- Every demo password is:  password123   (BCrypt-hashed below with pgcrypto)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- departments ----------
INSERT INTO departments (name) VALUES
 ('Cardiology'), ('General Medicine'), ('Orthopedics'), ('Dermatology'), ('Pediatrics'), ('Neurology'),
 ('Gynecology'), ('ENT'), ('Ophthalmology'), ('Dentistry'), ('Psychiatry'), ('Urology')
ON CONFLICT (name) DO NOTHING;

-- ---------- Motherson super admin ----------
INSERT INTO super_admins (name, email, password_hash)
VALUES ('Motherson Super Admin', 'superadmin@motherson.com', crypt('password123', gen_salt('bf', 10)))
ON CONFLICT (email) DO NOTHING;

-- ---------- hospitals ----------
INSERT INTO hospitals (name, address, city, phone, email) VALUES
 ('City Care Hospital',      'Sector 62',        'Noida',     '0120-4001000', 'info@citycare.example'),
 ('MedLife Hospital',        'Sector 18',        'Noida',     '0120-4002000', 'info@medlife.example'),
 ('HealthPlus Hospital',     'Sector 135',       'Noida',     '0120-4003000', 'info@healthplus.example'),
 ('Aarogya Super Specialty', 'Sector 50',        'Gurugram',  '0124-4004000', 'info@aarogya.example'),
 ('Sunrise Medical Centre',  'Golf Course Road', 'Gurugram',  '0124-4005000', 'info@sunrise.example'),
 ('WellSpring Hospital',     'Electronic City',  'Bengaluru', '080-4006000',  'info@wellspring.example');

-- ---------- one admin login per hospital ----------
INSERT INTO hospital_admins (hospital_id, name, email, password_hash)
SELECT h.id, v.admin_name, v.email, crypt('password123', gen_salt('bf', 10))
FROM (VALUES
  ('City Care Hospital',      'City Care Admin',   'admin.noida@medislot.com'),
  ('MedLife Hospital',        'MedLife Admin',     'admin.medlife@medislot.com'),
  ('HealthPlus Hospital',     'HealthPlus Admin',  'admin.healthplus@medislot.com'),
  ('Aarogya Super Specialty', 'Aarogya Admin',     'admin.aarogya@medislot.com'),
  ('Sunrise Medical Centre',  'Sunrise Admin',     'admin.sunrise@medislot.com'),
  ('WellSpring Hospital',     'WellSpring Admin',  'admin.wellspring@medislot.com')
) AS v(hospital_name, admin_name, email)
JOIN hospitals h ON h.name = v.hospital_name
ON CONFLICT (email) DO NOTHING;

-- ---------- doctors ----------
INSERT INTO doctors (hospital_id, department_id, name, specialization, qualification, experience_years, about)
SELECT h.id, d.id, v.doctor_name, v.specialization, v.qualification, v.years,
       v.doctor_name || ' is an experienced ' || lower(v.specialization) || ' at ' || h.name || '.'
FROM (VALUES
  ('City Care Hospital',      'Cardiology',       'Dr. Rohan Mehta',    'Cardiologist',       'MBBS, MD (Cardiology)',               10),
  ('City Care Hospital',      'Orthopedics',      'Dr. Amit Verma',     'Orthopedic Surgeon', 'MBBS, MS (Orthopedics)',              12),
  ('City Care Hospital',      'Pediatrics',       'Dr. Kavita Iyer',    'Pediatrician',       'MBBS, MD (Pediatrics)',               11),
  ('City Care Hospital',      'ENT',              'Dr. Arjun Malhotra', 'ENT Specialist',     'MBBS, MS (ENT)',                      10),
  ('MedLife Hospital',        'General Medicine', 'Dr. Priya Sharma',   'General Physician',  'MBBS, MD (Medicine)',                  8),
  ('MedLife Hospital',        'Neurology',        'Dr. Sandeep Rao',    'Neurologist',        'MBBS, DM (Neurology)',                15),
  ('HealthPlus Hospital',     'Dermatology',      'Dr. Neha Gupta',     'Dermatologist',      'MBBS, MD (Dermatology)',               9),
  ('HealthPlus Hospital',     'Gynecology',       'Dr. Farah Khan',     'Gynecologist',       'MBBS, MS (Obstetrics & Gynaecology)', 13),
  ('Aarogya Super Specialty', 'General Medicine', 'Dr. Vikram Singh',   'General Physician',  'MBBS, MD (Medicine)',                 14),
  ('Aarogya Super Specialty', 'Cardiology',       'Dr. Anjali Desai',   'Cardiologist',       'MBBS, DM (Cardiology)',               16),
  ('Sunrise Medical Centre',  'Orthopedics',      'Dr. Rahul Kapoor',   'Orthopedic Surgeon', 'MBBS, MS (Orthopedics)',              11),
  ('Sunrise Medical Centre',  'Dermatology',      'Dr. Meera Nair',     'Dermatologist',      'MBBS, MD (Dermatology)',               7),
  ('WellSpring Hospital',     'General Medicine', 'Dr. Suresh Reddy',   'General Physician',  'MBBS, MD (Medicine)',                 12),
  ('WellSpring Hospital',     'Pediatrics',       'Dr. Lakshmi Iyer',   'Pediatrician',       'MBBS, DCH',                            9)
) AS v(hospital_name, dept_name, doctor_name, specialization, qualification, years)
JOIN hospitals   h ON h.name = v.hospital_name
JOIN departments d ON d.name = v.dept_name;

-- ---------- weekly schedule: Monday-Saturday, 09:00-17:00, 30-minute slots ----------
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes)
SELECT d.id, day, TIME '09:00', TIME '17:00', 30
FROM doctors d CROSS JOIN generate_series(1, 6) AS day;

-- ---------- bookable slots for the next 14 days (IST) ----------
-- (the running backend extends this window every night and on start-up)
INSERT INTO slots (doctor_id, slot_date, start_time, end_time, booked)
SELECT s.doctor_id,
       dt::date,
       t::time,
       (t + make_interval(mins => s.slot_duration_minutes))::time,
       FALSE
FROM doctor_schedules s
CROSS JOIN LATERAL generate_series(
        (now() AT TIME ZONE 'Asia/Kolkata')::date,
        (now() AT TIME ZONE 'Asia/Kolkata')::date + 13,
        interval '1 day') AS dt
CROSS JOIN LATERAL generate_series(
        timestamp '2000-01-01' + s.start_time,
        timestamp '2000-01-01' + s.end_time - make_interval(mins => s.slot_duration_minutes),
        make_interval(mins => s.slot_duration_minutes)) AS t
WHERE extract(isodow FROM dt) = s.day_of_week
ON CONFLICT (doctor_id, slot_date, start_time) DO NOTHING;

-- ---------- employees ----------
INSERT INTO employees (employee_code, name, email, phone, plant_location, password_hash) VALUES
 ('EMP001', 'Rahul Sharma',  'rahul.sharma@motherson.com',  '9876543210', 'Noida',     crypt('password123', gen_salt('bf', 10))),
 ('EMP002', 'Anita Verma',   'anita.verma@motherson.com',   '9876543211', 'Gurugram',  crypt('password123', gen_salt('bf', 10))),
 ('EMP003', 'Karthik Rajan', 'karthik.rajan@motherson.com', '9876543212', 'Bengaluru', crypt('password123', gen_salt('bf', 10)))
ON CONFLICT (employee_code) DO NOTHING;
