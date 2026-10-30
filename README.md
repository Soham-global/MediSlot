# Medislot

Hospital Appointment Booking System for Motherson employees. This repository currently contains the database layer: JPA entities, enums, Spring Data repositories, schema initialization, and startup seed data. Controllers, services, and DTOs are intentionally not included yet.

## Stack

- Java 17
- Spring Boot 3
- Spring Data JPA
- PostgreSQL
- Maven
- Spring Security Crypto (BCrypt)
- Lombok

## Project structure

The backend application is in `backend/` and uses these packages:

- `com.hospital.auth` - employees, admins, and auth enums
- `com.hospital.hospital` - hospitals and departments
- `com.hospital.doctor` - doctors and weekly doctor schedules
- `com.hospital.slot` - appointment slots and slot status
- `com.hospital.appointment` - appointments and appointment statuses
- `com.hospital.symptom` - symptom keywords mapped to departments
- `com.hospital.config` - shared entity base class, BCrypt configuration, partial index creation, and seed data

## Database tables

| Table | Purpose |
| --- | --- |
| `employees` | Motherson employees who can book appointments |
| `hospitals` | Hospitals participating in the booking system |
| `departments` | Medical departments such as Cardiology and Pediatrics |
| `doctors` | Doctors linked to a hospital and department |
| `doctor_schedules` | Weekly availability rules for each doctor |
| `slots` | Concrete bookable time slots generated from doctor schedules |
| `appointments` | Employee appointments linked to doctors, hospitals, and slots |
| `admins` | One hospital administrator per hospital |
| `symptom_keywords` | Symptom-to-department mapping, including emergency keywords |

### Key constraints

- `employees.employee_code` and `employees.email` are unique.
- `departments.name` is unique.
- `admins.email` is unique.
- `doctor_schedules` is unique on `(doctor_id, day_of_week, start_time)`.
- `slots` is unique on `(doctor_id, slot_date, start_time)`.
- A PostgreSQL partial unique index named `uq_appointments_active_slot` prevents an appointment slot from being used by more than one non-cancelled appointment:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_appointments_active_slot
ON appointments (slot_id)
WHERE status <> 'CANCELLED';
```

All tables include `created_at`. `appointments` also includes `booked_at` and `updated_at`. Enums are stored as strings. Relationships are lazy by default. The application uses the `Asia/Kolkata` time zone.

## Local PostgreSQL setup

1. Install PostgreSQL locally from the official PostgreSQL installer.
2. During installation, set and remember the password for the `postgres` user.
3. Open SQL Shell (`psql`) or pgAdmin and create the database:

```sql
CREATE DATABASE hospital_db;
```

4. Confirm the database exists:

```sql
\l
```

5. The application connects with these defaults:

- URL: `jdbc:postgresql://localhost:5432/hospital_db`
- Username: `postgres`
- Password: `postgres`

The username and password are read from `DB_USERNAME` and `DB_PASSWORD`. If your local password is not `postgres`, set `DB_PASSWORD` before starting the application.

PowerShell:

```powershell
$env:DB_PASSWORD = "your_postgres_password"
```

Command Prompt:

```bat
set DB_PASSWORD=your_postgres_password
```

If your PostgreSQL username is different from `postgres`, also set `DB_USERNAME`.

## Run the application

From the repository root:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

On the first startup, Hibernate creates or updates the tables, the partial unique index is created, and dummy data is seeded only when all tables are empty. Restarting the application does not duplicate the seed data.

Slots are generated for the 14-day window starting from the current date. Non-working days are skipped.

## Dummy logins

Every seeded employee and administrator uses the password `password123`.

Administrator emails:

- `admin.pune@medislot.com`
- `admin.noida@medislot.com`
- `admin.chennai@medislot.com`

Employee emails:

- `aarav.sharma@motherson.com`
- `diya.patel@motherson.com`
- `aditya.singh@motherson.com`
- `ishita.nair@motherson.com`
- `kabir.joshi@motherson.com`
- `ananya.rao@motherson.com`
- `vivaan.gupta@motherson.com`
- `saanvi.iyer@motherson.com`
