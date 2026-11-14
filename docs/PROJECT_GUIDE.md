# Medi-Slot – Project Guide (for presenting to a team new to the stack)

## 1. The one-minute pitch
**Problem:** Motherson employees have to phone or visit partner hospitals to find a doctor and an appointment time.
**Solution:** Medi-Slot is a web app where an employee logs in, finds a partner hospital, picks a doctor, picks a date and time, and books – and can see or cancel it later.
Hospitals manage their own doctors and availability; Motherson's head office manages which hospitals are on the platform.

## 2. The big picture – a restaurant analogy
| Restaurant | Medi-Slot | Technology |
|---|---|---|
| Dining room + menu (what the guest sees) | The website | **React + Vite** (frontend) |
| Waiter carrying orders | The messages between website and server | **REST API / JSON over HTTP** |
| Kitchen (rules, cooking) | Business logic: "is this slot free? is this user allowed?" | **Spring Boot (Java)** (backend) |
| Pantry / record books | Employees, hospitals, doctors, slots, appointments | **PostgreSQL** (database) |
| Staff badge | Proof you are logged in and what you may do | **JWT token** |

```
 Browser (React)  --HTTP/JSON-->  Spring Boot API  --SQL-->  PostgreSQL
 localhost:5173   <--JSON------   localhost:8081/api <------  medislot_db
```
The frontend never touches the database. It only asks the backend, and the backend decides.

## 3. Glossary (plain English)
- **Frontend** – the part that runs in the browser: pages, buttons, forms.
- **React** – a library for building pages from reusable pieces called *components*.
- **Vite** – the tool that runs/builds the React app (`npm run dev`).
- **Backend** – the server program that holds the rules and talks to the database.
- **Spring Boot** – a Java framework that gives us a web server, security and database access ready-made.
- **Maven** – Java's build tool; `pom.xml` lists the libraries we use.
- **REST API** – a set of URLs such as `GET /api/hospitals`; the frontend calls them and gets **JSON** (text data) back.
- **PostgreSQL** – the database: tables of rows and columns.
- **JPA / Hibernate** – lets Java classes ("entities") map to database tables, so we rarely write SQL by hand.
- **JWT** – a signed "ticket" the server gives you at login; the browser sends it with every request.
- **BCrypt** – one-way password scrambling: we store a hash, never the real password.
- **Proxy** – in development Vite forwards `/api/...` calls to the backend so the browser sees one address.

## 4. Who uses it – three portals, one login page
| Role | Can do | Cannot do |
|---|---|---|
| **Employee** | Search hospitals, view doctors, book / cancel / see own appointments, edit own profile | See other people's appointments, any admin page |
| **Hospital admin** (one per hospital) | See *their* hospital's appointments, confirm/cancel/complete, add doctors, edit doctor availability, reports, settings, hospital profile | See other hospitals' data |
| **Super admin** (Motherson head office) | Add / edit / archive hospitals, create and suspend hospital-admin logins | Book appointments |

The login screen is the same for everyone. The server looks at the ID/email and password and replies with the role; the frontend then opens the correct portal.

## 5. The database – the heart of the system
Tables and how they connect:

```
 hospitals ──< doctors >── departments
     │           │
     │           ├──< doctor_schedules   (weekly pattern: Mon–Sat 9–5, 30-min slots)
     │           └──< slots              (real bookable windows: 12 Nov, 10:00–10:30)
     │                    │
 hospital_admins          └──< appointments >── employees
 super_admins
```
**The most important idea – schedule → slots → appointment:**
1. An admin saves a doctor's *weekly schedule* (e.g. Mon–Sat, 09:00–17:00, 30 minutes).
2. The system automatically creates concrete **slots** for the next 14 days.
3. An employee books one slot → an **appointment** row is created and the slot is marked *booked*.
4. Cancelling frees the slot again.

Other tables: `employees` (login + profile), `hospital_admins`, `super_admins`, `departments`.
Passwords are stored as BCrypt hashes. "Delete" for hospitals means *archive* (a flag), so history is never lost.

## 6. Backend – how the Java code is organised
Think of four layers, each with one job:
```
 controller  → receives the HTTP request, checks input, returns JSON
 service     → business rules ("is slot free?", "is it your appointment?")
 repository  → database queries (Spring writes most of them for us)
 domain      → entity classes = tables (Employee, Doctor, Slot, Appointment …)
```
Supporting folders: `dto` (the exact JSON shapes we send out), `security` (JWT + login filter), `config` (settings, demo-data seeder), `exception` (turns errors into clean `{message}` replies).

### Following one request: "Book this slot"
1. Browser sends `POST /api/appointments {slotId}` with the JWT.
2. **Security filter** reads the JWT, knows "this is employee 1".
3. **Controller** receives it, **service** runs the rules:
   - lock the slot row in the database (so two people can't grab it at the same instant),
   - is the doctor/hospital active? is the time still in the future? is it still free?
   - does this employee already have something at that time?
4. Slot → booked, appointment saved with status `BOOKED`.
5. JSON reply → frontend shows the confirmation page.

## 7. Security in simple words
1. You log in with ID/email + password. The server compares with the stored BCrypt hash.
2. If correct, it returns a **JWT** containing your user id and role, signed with a secret only the server knows.
3. The browser keeps it (in `sessionStorage`) and attaches it to every call.
4. The server checks: signature valid? not expired (8 h)? role allowed for this URL?
   `/api/admin/**` → admins only, `/api/super-admin/**` → super admin only, everything else → employees.
5. Even with a valid token, an admin is limited to **their own hospital**, and an employee to **their own appointments**.
The frontend also hides pages the role shouldn't see, but the *real* protection is always on the server.

## 8. Smart behaviours worth highlighting
- **No double booking:** database row lock **plus** a unique index on live appointments per slot.
- **Slots generated automatically** from the weekly schedule; extended every night at 00:05 and on start-up.
- **Auto-complete:** a background job (every 5 min) turns finished appointments into `COMPLETED`, so they move to *Past*.
- **Upcoming vs Past** is computed from the appointment time and status, not just a flag.
- **Doctors list never "loses" a doctor:** if no slot on the chosen date it says "next available 12 Nov".
- **Schedule edits are safe:** unbooked future slots are rebuilt; slots that already have an appointment are kept.
- **Time zone:** everything uses India time (Asia/Kolkata) so "today" is the same for everyone.
- **Consistent errors:** every failure returns `{status, error, message}` and the UI shows `message`.

## 9. Frontend – how the React code is organised
```
frontend/src
├── api.js                  ONE place that talks to the backend (adds the JWT, handles errors)
├── main.jsx                starts the app
└── app/
    ├── App.jsx             decides which page to show + role-based route guard
    ├── pages/
    │   ├── employeePages.jsx   Home, Login, Hospitals, Doctors, Slots, Appointments, Profile …
    │   ├── adminPages.jsx      Dashboard, Doctors, Add Doctor, Schedule, Appointments, Reports, Settings, Hospital Profile, Super Admin
    │   └── doctorProfile.jsx
    ├── components/         reusable pieces (navigation, buttons, tables)
    └── data/mockData.js    converts backend JSON into what the screens need
```
- **No URL router:** `App.jsx` keeps a `page` value ("hospitals", "doctors", "slots" …) and shows the matching component. Changing page = changing that value.
- **Route guard:** if the role doesn't match (e.g. employee tries an admin page) the user is sent to Login.
- **State & effects:** `useState` stores data on screen; `useEffect` calls the API when a page opens.
- **Memory between pages** (selected hospital/doctor/date) is kept in `sessionStorage` and cleared on logout.

## 10. End-to-end walkthroughs
**A. Employee books** – Login → Hospitals (search by name/location or city filter) → Explore or View Doctors → pick doctor → choose date + time → Book → confirmation → *My Appointments → Upcoming* (cancel available).
**B. Hospital admin manages** – Login → Dashboard counters → Appointments (filter by date/doctor/status, Confirm/Cancel/Complete) → Doctors → Add Doctor (days, hours, slot length) → Schedule (edit availability) → Reports (CSV export) → Settings (change password).
**C. Super admin onboards a hospital** – Login → Add Hospital → Create Admin credentials → hospital instantly appears to employees; that admin can log in and add doctors.

## 11. Suggested demo script (≈10 minutes)
All passwords: `password123`
1. Show the architecture slide (section 2) and database diagram (section 5).
2. **Super admin** `superadmin@motherson.com` – add a hospital + admin `admin.demo@medislot.com`.
3. **Hospital admin** `admin.noida@medislot.com` – add a doctor, show schedule/availability.
4. **Employee** `EMP001` – search the hospital, open the doctor, book a slot.
5. Back as **admin** – see the new appointment, confirm it, show Reports.
6. As **employee** – cancel one; show it under Past. Try pressing Enter on login; log out.
7. Open pgAdmin – show the new row in `appointments` and `slots.booked = true`.

## 12. Running it (for the team)
```bash
createdb medislot_db                      # 1. empty database
cd backend && mvn spring-boot:run         # 2. creates tables + demo data automatically
cd frontend && npm install && npm run dev # 3. open http://localhost:5173
```
Prefer SQL? `backend/database/01_schema.sql` then `02_seed_demo_data.sql` (see README).

## 13. Current limits & next steps (be upfront)
- No email/SMS confirmation yet; "Forgot password" is a placeholder.
- Doctor ratings on cards are static sample values.
- Real employee data must be imported with BCrypt-hashed passwords (SQL in README).
- No automated tests yet; schema is auto-managed (use Flyway for production).
- Archiving a hospital does not cancel its already-booked appointments.

## 14. Questions you may be asked
- **Why a separate backend?** Security and rules must live on a server we control; the browser can't be trusted.
- **Where are passwords?** Only as BCrypt hashes; the real password can't be recovered.
- **What if two people click the same slot?** The first gets it; the second sees "just booked, choose another".
- **Can one hospital see another's data?** No – the admin's hospital comes from the server-side account, never from the request.
- **How would we scale?** Stateless backend (JWT) can run in several copies behind a load balancer; PostgreSQL is the single source of truth.
