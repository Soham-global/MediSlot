# Medi-Slot – Motherson partner-hospital appointment booking

```
medi-slot/
├── backend/    Spring Boot 3.5 · Java 17+ · PostgreSQL · JWT      (port 8081, context path /api)
└── frontend/   your original React + Vite UI (markup/CSS unchanged, data wiring only)
```

## 1. Run it

**Database** – create an empty PostgreSQL database:

```sql
CREATE DATABASE medislot_db;
```

**Backend** (JDK 17 or 21 + Maven):

```bash
cd backend
export DB_URL=jdbc:postgresql://localhost:5432/medislot_db
export DB_USERNAME=postgres
export DB_PASSWORD=your_password
export JWT_SECRET='a-long-random-string-of-at-least-32-characters'
mvn spring-boot:run
```

Tables are created automatically on first start (`ddl-auto=update`).

**Frontend**:

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173 – Vite proxies /api to localhost:8081
```

## 2. Demo logins (created on an empty database; password for all: `password123`)

| Portal | Identifier | Lands on |
|---|---|---|
| Employee | `EMP001` or `rahul.sharma@motherson.com` | Hospitals |
| Hospital admin (City Care, Noida) | `admin.noida@medislot.com` | Admin dashboard |
| Motherson super admin | `superadmin@motherson.com` | Super-admin dashboard |

Other demo admins: `admin.medlife@…`, `admin.healthplus@…`, `admin.aarogya@…`, `admin.sunrise@…`, `admin.wellspring@…` (all `@medislot.com`).
Set `SEED_DEMO_DATA=false` for production (the super admin and the department list are still created;
change `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` before first start).

## 3. How the flows work

**Employee** – `POST /auth/login` with Employee ID *or* e-mail → search hospitals (name/address/city search bar + city filter)
→ hospital → doctors (only doctors with a free slot on the chosen date) → pick date/time → book.
* *My Appointments → Upcoming*: live bookings whose time has not passed; **Cancel** frees the slot again.
* *Past*: completed / cancelled / no-show, and anything whose time has passed. A background job (every 5 min)
  marks finished bookings `COMPLETED`.
* Double booking is prevented by a row lock on the slot plus a partial unique index (`schema.sql`).
  An employee also cannot hold two overlapping appointments.

**Hospital admin** – one admin account per hospital, always scoped to that hospital. Dashboard counters, appointment list
(filter by date / doctor / status; Confirm / Cancel / Complete / No-show), add doctors with weekly working days + hours +
slot length, activate/deactivate doctors, edit weekly availability. Saving a schedule rebuilds the unbooked future slots,
so employees see the change immediately; slots that already have an appointment are kept.

**Super admin** – add / edit / archive hospitals, create hospital-admin credentials, suspend / reactivate them, reset passwords.
Archiving hides the hospital from employees and blocks its admins (nothing is deleted).

**Slots** are generated from each doctor's weekly schedule for the next 14 days (`app.slot-horizon-days`),
extended nightly at 00:05 IST. All dates/times use `app.timezone` (Asia/Kolkata).

## 4. API summary (all under `/api`)

| Role | Endpoints |
|---|---|
| public | `POST /auth/login` |
| EMPLOYEE | `GET /hospitals?name&city` · `GET /hospitals/{id}` · `GET /departments` · `GET /doctors?hospitalId&departmentId&name&date&onlyAvailable` · `GET /doctors/{id}` · `GET /doctors/{id}/slots?date` · `POST /appointments {slotId, reason}` · `GET /appointments/my?status=upcoming\|past` · `GET /appointments/{id}` · `PUT /appointments/{id}/cancel` · `GET/PUT /employees/me` |
| ADMIN | `GET /admin/dashboard` · `GET /admin/reports?from&to` · `GET /admin/settings` · `PUT /admin/settings/profile` · `PUT /admin/settings/password` · `GET/PUT /admin/hospital` · `GET /admin/departments` · `GET/POST /admin/doctors` · `GET/PUT /admin/doctors/{id}` · `PUT /admin/doctors/{id}/status` · `PUT /admin/doctors/{id}/schedule` · `GET /admin/appointments?date&doctorId&status&page&size` · `PUT /admin/appointments/{id}/{confirm\|cancel\|complete\|no-show}` |
| SUPER_ADMIN | `GET /super-admin/hospitals/dashboard` · `GET/POST /super-admin/hospitals` · `PUT/DELETE /super-admin/hospitals/{id}` · `PUT /super-admin/hospitals/{id}/restore` · `GET/POST /super-admin/admins` · `PUT /super-admin/admins/{id}` |

Errors are always `{ "status", "error", "message" }` – the UI shows `message`.

## 5. Loading your real employee data

The `employees` table is `employee_code, name, email, phone, plant_location, password_hash, active`.
Passwords must be **BCrypt** hashes. If your HR data has initial passwords, load it into a staging table and let PostgreSQL hash it
(Spring accepts the `$2a$` hashes pgcrypto produces):

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO employees (employee_code, name, email, phone, plant_location, password_hash, active)
SELECT emp_id, full_name, lower(email), phone, plant, crypt(initial_password, gen_salt('bf', 10)), true
FROM   staging_employees
ON CONFLICT (employee_code) DO NOTHING;
```

If you already have an employee table with another layout, tell me its columns and I will map the entity to it.

## 6. Things to know

* **Not compiled in my environment** – the sandbox I built this in cannot reach Maven Central, so I verified Java *syntax* with `javac`
  and built/verified the frontend with Vite, but I could not run Maven or start the server. If `mvn spring-boot:run` reports anything, send me the log.
* Use JDK 17 or 21. There is deliberately no Lombok.
* Frontend UI is untouched; changes are data wiring: doctor profile page now loads the real doctor, the “Cardiologist” label on the
  confirmation page, admin dashboard date/greeting, hospital doctor counts, a role-based route guard in `App.jsx`, auto-logout on an
  expired token, and a fix for a crash in *Admin → Doctors* (`experience` was a number but the table calls `.replace()` on it).
* The doctor-card rating (“4.6 (120)”) is still a static placeholder (there is no ratings data yet).
* Admin **Reports** (date-range summary, per-doctor table, per-day bars, CSV export), **Settings** (profile name + change password)
  and **Hospital Profile** (address, phone, email, working hours) are now real pages. Hospital name/city stay under Motherson control.
* The employee doctor list shows **every active doctor** of the hospital. If a doctor has no free slot on the chosen date the card says
  "next available <date>" and *View Slots* opens that date. (Strict mode: `GET /doctors?...&onlyAvailable=true`.)
* The slot picker only shows 10:00–16:00 on :00/:30 (an existing UI rule in `Slots`); doctors can be scheduled outside that, but those slots won't be shown until that rule is relaxed.
* Not included yet: e-mail/SMS confirmations, login rate-limiting, password reset, Flyway migrations, automated tests.
* Archiving a hospital does not cancel appointments already booked there.

## 7. Setting up the database with plain SQL (instead of letting the backend create it)

```bash
createdb medislot_db
psql -d medislot_db -f backend/database/01_schema.sql         # tables + indexes
psql -d medislot_db -f backend/database/02_seed_demo_data.sql # demo hospitals, doctors, logins, 14 days of slots
```
In pgAdmin: right-click `medislot_db` -> Query Tool -> open each file (folder icon) -> run (F5).
Then start the backend with `SEED_DEMO_DATA=false` (the data already exists). Slots are extended automatically by the backend.
See `docs/PROJECT_GUIDE.md` for a plain-English explanation of the whole project.

## 8. Photos with Cloudinary (hospital photo + doctor photo)

Cloudinary only hosts the pictures; PostgreSQL stores just each picture's URL (`hospitals.image_url`, `doctors.profile_image_url`).

1. Create a free account at https://cloudinary.com -> Dashboard -> *API Keys*: note **Cloud name**, **API Key**, **API Secret**.
2. Give them to the backend as environment variables (never commit them):
   ```bash
   export CLOUDINARY_CLOUD_NAME=your_cloud_name
   export CLOUDINARY_API_KEY=your_api_key
   export CLOUDINARY_API_SECRET=your_api_secret
   ```
   Windows PowerShell: `$env:CLOUDINARY_CLOUD_NAME="..."`. IntelliJ: Run -> Edit Configurations -> *Environment variables*.
3. Restart the backend. Without these keys the app still works; uploads just answer "not configured".

How it works: the browser sends the chosen file to `POST /api/super-admin/uploads/hospital-image` (super admin) or
`POST /api/admin/uploads/doctor-image` (hospital admin). The backend checks the real file type (JPG/PNG/WEBP, max 5 MB),
uploads it to Cloudinary (folders `medislot/hospitals`, `medislot/doctors`, resized to max 1200 px) and returns the https URL,
which the form then saves together with the hospital / doctor.

Existing databases: the new column is added automatically by the backend (`ddl-auto=update`). If you created the tables with the SQL scripts, run
`ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);` (it is also at the end of `01_schema.sql`).

### Adding / changing photos of EXISTING (seeded) hospitals and doctors

| Who | Where | What |
|---|---|---|
| Hospital admin | *Hospital Profile* page | **Hospital Photo** picker (saved immediately; Remove clears it) |
| Hospital admin | *Doctors* list, camera icon on each row | add / change that doctor's photo (saved immediately) |
| Hospital admin | *Add Doctor* form | **Doctor Photo** picker for a new doctor |
| Super admin | *Partner Hospitals* list, **Add photo / Change photo** button | photo of any hospital |
| Super admin | *Add Partner Hospital* form | **Hospital Photo** picker for a new hospital |

Endpoints: `PUT /api/admin/hospital/image`, `PUT /api/admin/doctors/{id}/image`, `PUT /api/super-admin/hospitals/{id}/image`
(body `{"imageUrl": "https://..."}`, empty string removes the photo), and the uploads
`POST /api/admin/uploads/hospital-image`, `POST /api/admin/uploads/doctor-image`, `POST /api/super-admin/uploads/hospital-image`.
Admins can only change their own hospital and its doctors.
