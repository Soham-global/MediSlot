# MediSlot — Hospital Appointment Booking System

A full-stack web application that allows Motherson employees to discover doctors across partner hospitals and book appointments online. Hospital administrators get a dedicated portal to manage doctors, schedules, slots, and appointments.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Features](#features)
- [Database Design](#database-design)
- [API Overview](#api-overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Database Setup](#database-setup)
  - [Running the Backend](#running-the-backend)
  - [Running the Frontend](#running-the-frontend)
- [Environment Variables](#environment-variables)
- [Seed Data & Demo Logins](#seed-data--demo-logins)

---

## Overview

MediSlot is an internal hospital appointment booking system built for Motherson employees. Employees can search for doctors by hospital, department, or name, view available time slots up to 14 days ahead, and book or cancel appointments. Hospital administrators manage their hospital's doctors, weekly schedules, slot availability, and the full appointment lifecycle from booking through completion.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite 5, React Router v6, Axios |
| Backend | Java 17, Spring Boot 3.3, Spring Security, Spring Data JPA |
| Database | PostgreSQL |
| Auth | Stateless JWT (jjwt 0.12.6), BCrypt password hashing |
| API Docs | SpringDoc OpenAPI 2.6 (Swagger UI) |
| Build | Maven (Maven Wrapper included) |

---

## Architecture

MediSlot is a **monolithic** application with a clear separation between the React frontend and the Spring Boot backend. Both communicate exclusively over a REST API using JSON.

```
┌─────────────────────────┐        HTTP/JSON        ┌──────────────────────────┐
│   React SPA (Vite)      │  ──────────────────────▶ │  Spring Boot REST API    │
│   localhost:5173        │  ◀──────────────────────  │  localhost:8080          │
└─────────────────────────┘    Bearer JWT in header  └────────────┬─────────────┘
                                                                   │ JPA / Hibernate
                                                                   ▼
                                                      ┌──────────────────────────┐
                                                      │  PostgreSQL              │
                                                      │  hospital_db : 5432      │
                                                      └──────────────────────────┘
```

The backend is organized by domain. Each domain owns its entity, repository, service, controller, and DTOs:

| Package | Responsibility |
| --- | --- |
| `com.hospital.auth` | Employees, admins, JWT security, login/logout |
| `com.hospital.hospital` | Hospitals and departments |
| `com.hospital.doctor` | Doctors and weekly schedule rules |
| `com.hospital.slot` | Bookable time slots, slot generation, slot management |
| `com.hospital.appointment` | Appointment booking and lifecycle |
| `com.hospital.symptom` | Keyword-based symptom-to-department suggestion engine |
| `com.hospital.config` | Base entity, BCrypt bean, seed data, partial index initializer |
| `com.hospital.common` | Global exception handler, CORS, error response, OpenAPI config |

---

## Project Structure

```
medislot/
├── backend/                  # Spring Boot application
│   ├── src/main/java/com/hospital/
│   │   ├── HospitalAppointmentApplication.java
│   │   ├── auth/             # Auth entities, security, JWT, controllers, services
│   │   ├── hospital/         # Hospital & department entities, controllers, services
│   │   ├── doctor/           # Doctor & schedule entities, controllers, services
│   │   ├── slot/             # Slot entity, generation service, scheduled top-up job
│   │   ├── appointment/      # Appointment entity, booking & cancellation logic
│   │   ├── symptom/          # SymptomKeyword entity, rule-based suggestion service
│   │   ├── config/           # BaseEntity, DataSeeder, PasswordConfig, SchedulingConfig
│   │   └── common/           # GlobalExceptionHandler, CorsConfig, custom exceptions
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
└── frontend/                 # React SPA
    ├── src/
    │   ├── api/              # Axios client + one file per API domain
    │   ├── context/          # AuthContext (JWT state), ProtectedRoute
    │   ├── pages/            # One component per screen
    │   ├── components/       # Reusable UI components and layout shells
    │   └── utils/            # Error helpers, date/time formatters, debounce hook
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Features

### Employee Portal
- Search and filter doctors by hospital, department, and name
- View a doctor's available slots across a 14-day window
- Book an appointment with an optional reason for visit
- View upcoming and past appointments
- Cancel a booked or confirmed appointment
- Symptom-based department suggestion with emergency keyword detection

### Hospital Admin Portal
- Dashboard with live stats: today's appointments, pending confirmations, completed visits, active doctors
- 7-day appointment bar chart and today's status breakdown
- Manage doctors: create, edit, activate, deactivate, delete
- Replace a doctor's weekly schedule and automatically regenerate slots
- Block or unblock slots across a date range
- View all appointments with filters by doctor, date, and status (paginated)
- Confirm, complete, mark no-show, or cancel individual appointments

---

## Database Design

### Tables

| Table | Purpose |
| --- | --- |
| `employees` | Motherson employees who can book appointments |
| `hospitals` | Partner hospitals in the booking system |
| `departments` | Medical departments (e.g. Cardiology, Pediatrics) |
| `doctors` | Doctors linked to a hospital and department |
| `doctor_schedules` | Weekly availability rules per doctor (day, time window, slot duration) |
| `slots` | Concrete bookable time slots generated from doctor schedules |
| `appointments` | Employee appointments linked to a doctor, hospital, and slot |
| `admins` | One hospital administrator per hospital |
| `symptom_keywords` | Symptom keyword to department mappings, with emergency flag |

### Relationships

```
hospitals    ──< admins
hospitals    ──< doctors
departments  ──< doctors
doctors      ──< doctor_schedules
doctors      ──< slots
employees    ──< appointments
doctors      ──< appointments
hospitals    ──< appointments
slots        ──< appointments   (at most one active appointment per slot)
departments  ──< symptom_keywords
```

### Key Constraints

- `employees.employee_code` and `employees.email` are unique.
- `departments.name` is unique.
- `admins.email` is unique.
- `doctor_schedules` is unique on `(doctor_id, day_of_week, start_time)`.
- `slots` is unique on `(doctor_id, slot_date, start_time)`.
- A partial unique index prevents double-booking at the database level:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_appointments_active_slot
ON appointments (slot_id)
WHERE status <> 'CANCELLED';
```

All tables include `created_at`. The `appointments` table also includes `booked_at` and `updated_at`. All enums are stored as strings. All relationships are lazy-loaded by default. The application runs in the `Asia/Kolkata` time zone.

---

## API Overview

The full interactive API documentation is available at `http://localhost:8080/swagger-ui.html` once the backend is running.

### Public Endpoints
| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Employee login |
| `POST` | `/api/admin/auth/login` | Admin login |

### Employee Endpoints (JWT required)
| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/auth/me` | Get current employee profile |
| `PUT` | `/api/employees/me` | Update employee profile |
| `GET` | `/api/hospitals` | List active hospitals |
| `GET` | `/api/hospitals/{id}` | Hospital detail with departments |
| `GET` | `/api/departments` | List all departments |
| `GET` | `/api/doctors` | List doctors (filter by hospital, department, name, date) |
| `GET` | `/api/doctors/{id}` | Doctor detail with weekly schedule |
| `GET` | `/api/doctors/{id}/slots` | Available slots for a doctor on a date |
| `POST` | `/api/appointments` | Book an appointment |
| `GET` | `/api/appointments/my` | My appointments (`?status=upcoming` or `past`) |
| `PUT` | `/api/appointments/{id}/cancel` | Cancel an appointment |
| `POST` | `/api/symptoms/suggest` | Symptom-to-department suggestion |

### Admin Endpoints (Admin JWT required)
| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/admin/dashboard` | Dashboard statistics |
| `GET` | `/api/admin/hospital` | Get own hospital details |
| `PUT` | `/api/admin/hospital` | Update hospital details |
| `GET` | `/api/admin/doctors` | List doctors with filters |
| `POST` | `/api/admin/doctors` | Add a new doctor |
| `PUT` | `/api/admin/doctors/{id}` | Update doctor details |
| `PUT` | `/api/admin/doctors/{id}/status` | Activate or deactivate a doctor |
| `DELETE` | `/api/admin/doctors/{id}` | Delete a doctor |
| `PUT` | `/api/admin/doctors/{id}/schedule` | Replace doctor schedule and regenerate slots |
| `GET` | `/api/admin/doctors/{id}/slots` | View all slots for a doctor on a date |
| `POST` | `/api/admin/doctors/{id}/slots/block` | Block slots across a date range |
| `PUT` | `/api/admin/slots/{id}/unblock` | Unblock a slot |
| `GET` | `/api/admin/appointments` | Paginated appointments with filters |
| `PUT` | `/api/admin/appointments/{id}/confirm` | Confirm an appointment |
| `PUT` | `/api/admin/appointments/{id}/cancel` | Cancel an appointment |
| `PUT` | `/api/admin/appointments/{id}/complete` | Mark appointment as completed |
| `PUT` | `/api/admin/appointments/{id}/no-show` | Mark appointment as no-show |

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+ and npm
- PostgreSQL 14+

### Database Setup

1. Install PostgreSQL and note the password for the `postgres` user.
2. Open `psql` or pgAdmin and create the database:

```sql
CREATE DATABASE hospital_db;
```

3. Verify it was created:

```sql
\l
```

The application connects to `jdbc:postgresql://localhost:5432/hospital_db` with username `postgres` by default. Override these with environment variables if your setup differs (see [Environment Variables](#environment-variables)).

### Running the Backend

From the repository root:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

On first startup:
- Hibernate creates all tables automatically (`ddl-auto=update`)
- The partial unique index `uq_appointments_active_slot` is created
- Seed data is inserted — 3 hospitals, 8 departments, 12 doctors, schedules, slots, 5 sample appointments, and 25 symptom keywords

Restarting the application does not duplicate seed data. Slots are generated for a rolling 14-day window and topped up nightly at 00:30 IST.

### Running the Frontend

From the repository root:

```powershell
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

To point the frontend at a different backend URL, create a `.env` file in the `frontend/` directory:

```
VITE_API_URL=http://localhost:8080
```

---

## Environment Variables

### Backend

| Variable | Default | Description |
| --- | --- | --- |
| `DB_USERNAME` | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | `postgres` | PostgreSQL password |
| `JWT_SECRET` | *(dev default in application.properties)* | HMAC-SHA secret for signing JWTs — **must be changed in production** |
| `JWT_EXPIRY_MINUTES` | `480` | JWT validity period in minutes (8 hours) |

Set variables before starting the application:

**PowerShell:**
```powershell
$env:DB_PASSWORD = "your_password"
$env:JWT_SECRET  = "your-strong-secret"
```

**Command Prompt:**
```bat
set DB_PASSWORD=your_password
set JWT_SECRET=your-strong-secret
```

### Frontend

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8080` | Base URL of the Spring Boot backend |

---

## Seed Data & Demo Logins

All seeded accounts use the password `password123`.

### Hospital Administrators

| Email | Hospital |
| --- | --- |
| `admin.pune@medislot.com` | Motherson Health Center, Pune |
| `admin.noida@medislot.com` | Motherson Care Hospital, Noida |
| `admin.chennai@medislot.com` | Motherson Medical Center, Chennai |

### Employees

| Email | Employee Code |
| --- | --- |
| `aarav.sharma@motherson.com` | EMP001 |
| `diya.patel@motherson.com` | EMP002 |
| `aditya.singh@motherson.com` | EMP003 |
| `ishita.nair@motherson.com` | EMP004 |
| `kabir.joshi@motherson.com` | EMP005 |
| `ananya.rao@motherson.com` | EMP006 |
| `vivaan.gupta@motherson.com` | EMP007 |
| `saanvi.iyer@motherson.com` | EMP008 |

Employees log in with their **employee code** (e.g. `EMP001`), not their email address.
