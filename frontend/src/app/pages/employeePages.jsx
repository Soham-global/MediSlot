import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Search,
  ArrowRight,
  Building2,
  HeartPulse,
  ShieldCheck,
  Clock3,
  Star,
  ChevronLeft,
  Check,
  X,
  UserRound,
  LayoutDashboard,
  Hospital,
  Stethoscope,
  ClipboardList,
  Bell,
  Settings,
  FileText,
  Menu,
  Lock,
  Eye,
  EyeOff,
  Download,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { api, saveSession } from "../../api";
import { mapHospital, mapDoctor } from "../data/mockData";
import { Logo, Avatar, Btn } from "../components/ui";
import { EmployeeLayout, AdminLayout, Top } from "../components/navigation";
import { AuthShell } from "../components/auth";
import {
  Stat,
  Chart,
  Department,
  Today,
  Available,
  DoctorTable,
  FormGroup,
} from "../components/adminWidgets";
const STEPS = [
  ["Pick a hospital", "Browse the partner hospitals near your plant and see what each one offers."],
  ["Choose a specialist", "Filter by department, check who is available on your day and read their profile."],
  ["Book a slot", "Select a time that fits your shift and get an instant confirmation."],
];
const SYMPTOMS = [
  { label: "Chest discomfort", dept: "Cardiology", note: "Heart and blood-pressure concerns." },
  { label: "Fever or cough", dept: "General Medicine", note: "Everyday illness and first checks." },
  { label: "Joint or back pain", dept: "Orthopedics", note: "Bones, joints, muscles and injuries." },
  { label: "Rash or itching", dept: "Dermatology", note: "Skin, hair and nail conditions." },
  { label: "Headache or dizziness", dept: "Neurology", note: "Headaches, nerves and balance." },
  { label: "Child unwell", dept: "Pediatrics", note: "Care for infants and children." },
  { label: "Ear, nose or throat", dept: "ENT", note: "Sinus, hearing and throat problems." },
];
export function Home({ setPage, isAuthenticated = false }) {
  const [symptom, setSymptom] = useState(null);
  const start = () => setPage(isAuthenticated ? "hospitals" : "login");
  return (
    <>
      <Top page="home" setPage={setPage} />
      <main className="home">
        <div className="wrap">
          <section className="hero">
            <div>
              <span className="eyebrow">Motherson Employee Care Network</span>
              <h1>
                Care, without
                <em>the wait.</em>
              </h1>
              <p className="hero-lead">
                Find the right doctor, see live hospital availability, and book from one employee portal.
              </p>
              <div className="hero-actions">
                <Btn onClick={start}>
                  Find a doctor <ArrowRight size={17} />
                </Btn>
                <Btn kind="outline" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                  See how it works
                </Btn>
              </div>
              <div className="hero-assure">
                <span><Check /> Live availability</span>
                <span><Check /> Verified specialists</span>
                <span><Check /> Employee-only access</span>
              </div>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <div className="appt-card">
                <header>
                  <div>
                    <span className="kicker">Next appointment</span>
                    <h3>Cardiology consult</h3>
                  </div>
                  <span className="pill green"><Check size={12} /> Confirmed</span>
                </header>
                <div className="appt-doc">
                  <div className="avatar">AR</div>
                  <div>
                    <b>Dr. Ananya Rao</b>
                    <small>Senior Cardiologist · 12 years</small>
                  </div>
                  <ShieldCheck size={18} />
                </div>
                <div className="appt-when">
                  <div><CalendarDays size={18} /><span><small>Date</small><b>Thu, 12 Nov</b></span></div>
                  <div><Clock3 size={18} /><span><small>Time</small><b>10:30 AM</b></span></div>
                </div>
                <p className="appt-where"><MapPin size={14} /> Motherson Hospital · Pune</p>
                <div className="appt-bars"><i className="on" /><i className="on" /><i className="on" /><i /><i /></div>
              </div>
            </div>
          </section>

          <section className="benefits" aria-label="Why MediSlot">
            {[
              [ShieldCheck, "Trusted partner hospitals", "Network hospitals chosen for Motherson employees."],
              [Stethoscope, "Wide range of specialties", "From general medicine to cardiology and more."],
              [CalendarDays, "Easy appointment booking", "Pick a day and slot in a few taps."],
              [HeartPulse, "Better employee wellbeing", "Care that fits around your shift."],
            ].map(([I, t, d]) => (
              <div key={t}>
                <span><I size={20} /></span>
                <b>{t}</b>
                <p>{d}</p>
              </div>
            ))}
          </section>
        </div>

        <section className="section" id="how-it-works">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">How it works</span>
              <h2>From “not feeling well” to booked in three steps</h2>
              <p>Everything happens in one place, so you can get back to your day.</p>
            </div>
            <div className="steps">
              {STEPS.map(([t, d], i) => (
                <article className="step" key={t}>
                  <div className="step-num">{i + 1}</div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section alt" id="check-symptoms">
          <div className="wrap symptom-box">
            <div>
              <div className="section-head" style={{ marginBottom: 28 }}>
                <span className="eyebrow">Check symptoms</span>
                <h2>Not sure who to see?</h2>
                <p>Pick what you are experiencing and we will point you to the right department.</p>
              </div>
              <div className="chips">
                {SYMPTOMS.map((x) => (
                  <button key={x.label} type="button" className={"chip" + (symptom?.label === x.label ? " on" : "")} onClick={() => setSymptom(x)}>
                    {x.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="symptom-result" aria-live="polite">
              {symptom ? (
                <>
                  <span className="kicker">Suggested department</span>
                  <h3>{symptom.dept}</h3>
                  <p>{symptom.note}</p>
                  <Btn onClick={start}>Find a {symptom.dept} doctor <ArrowRight size={16} /></Btn>
                </>
              ) : (
                <>
                  <span className="kicker">Suggested department</span>
                  <h3>Select a symptom</h3>
                  <p>Your suggestion will appear here.</p>
                </>
              )}
              <small>This is a guide to choosing a department, not a diagnosis. For severe or sudden symptoms, call your local emergency number.</small>
            </div>
          </div>
        </section>

        <div className="wrap" style={{ paddingTop: 80 }}>
          <div className="cta-band">
            <h2>Care that fits around your workday.</h2>
            <Btn onClick={start}>{isAuthenticated ? "Explore partner hospitals" : "Log in to MediSlot"} <ArrowRight size={17} /></Btn>
          </div>
          <footer className="site-foot">
            <span>© {new Date().getFullYear()} MediSlot · Motherson Employee Care Network</span>
            <span>Pune · Noida · Chennai</span>
          </footer>
        </div>
      </main>
    </>
  );
}
export function Login({ setPage }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const response = await api.login(id, password);
      saveSession(response);
      setPage(response.role === "SUPER_ADMIN" ? "superAdmin" : response.role === "ADMIN" ? "admin" : "hospitals");
    } catch (apiError) {
      const offline = apiError instanceof TypeError || apiError.message === "Failed to fetch";
      setError(offline ? "The login service is unavailable. Please start the backend and try again." : apiError.message);
    } finally {
      setLoading(false);
    }
  };
  // Enter / Return in either field logs in, even if the browser skips the form's own submit.
  const handleEnter = (e) => {
    if (e.key === "Enter") submit(e);
  };
  return (
    <AuthShell setPage={setPage}>
      <form className="login-card" onSubmit={submit}>
        <span className="kicker">Employee log in</span>
        <h2>Welcome back</h2>
        <p>Log in to manage appointments and find care.</p>
        <label className="field">
          Employee code
          <span className="field-box">
            <UserRound />
            <input value={id} onChange={(e) => setId(e.target.value)} onKeyDown={handleEnter} placeholder="e.g. EMP1024" autoComplete="username" required autoFocus />
          </span>
          <span className="field-hint">Hospital admins log in with their official email.</span>
        </label>
        <label className="field">
          Password
          <span className="field-box">
            <Lock />
            <input value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleEnter} type={show ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" required />
            <button type="button" className="eye" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        {error && <p className="login-error" role="alert">{error}</p>}
        <Btn className="wide" disabled={loading}>
          {loading ? "Logging in…" : <>Log in <ArrowRight size={17} /></>}
        </Btn>
        <p className="login-help">
          New to MediSlot? <a onClick={() => setPage("signup")}>Sign up</a>
        </p>
        <p className="login-legal">By continuing you agree to responsible use of employee healthcare services.</p>
      </form>
    </AuthShell>
  );
}
export function Signup({ setPage }) {
  return (
    <AuthShell setPage={setPage}>
      <div className="login-card">
        <span className="kicker">New to MediSlot</span>
        <h2>Get access</h2>
        <p>MediSlot accounts are created by your HR team from your Motherson employee record.</p>
        <ul className="access-list">
          <li><UserRound size={18} /><span><b>Employees:</b> ask HR to set up your account with your employee code.</span></li>
          <li><Building2 size={18} /><span><b>Hospital admins:</b> your account is created by the Motherson network admin.</span></li>
        </ul>
        <Btn className="wide" onClick={() => setPage("login")}>Back to log in <ArrowRight size={17} /></Btn>
        <p className="login-legal">By continuing you agree to responsible use of employee healthcare services.</p>
      </div>
    </AuthShell>
  );
}
export function Hospitals({ setPage }) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [noLocation, setNoLocation] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setLoading(true);
    api.hospitals({ name: query, city: location })
      .then((data) => { setCatalog(Array.isArray(data) ? data.map(mapHospital) : []); setError(""); })
      .catch((e) => { setCatalog([]); setError(e.message); })
      .finally(() => setLoading(false));
  }, [query, location]);
  const locations = ["Noida","Pune","Gurugram","Chennai","Bengaluru","Mumbai","Hyderabad","Manesar","Delhi","Kolkata"];
  const featured = catalog;
  const chooseHospital = (hospital, page) => {
    sessionStorage.setItem("medi-slot-hospital-id", hospital.id);
    sessionStorage.setItem("medi-slot-hospital-name", hospital.name);
    setPage(page);
  };
  return (
    <EmployeeLayout page="hospitals" setPage={setPage}>
      <div className="page-title">
        <h2>Partner Hospitals</h2>
        <p>
          Choose a hospital to explore facilities, specialists and available
          appointments.
        </p>
      </div>
      <div className="filter-row hospital-search-row"><div className="searchbar location-search"><MapPin size={16}/><input list="partner-locations" value={location} onChange={e=>{setLocation(e.target.value);setNoLocation(false)}} onKeyDown={e=>{if(e.key==="Enter"&&!featured.length)setNoLocation(true)}} placeholder="Search location..."/><datalist id="partner-locations">{locations.map(x=><option key={x} value={x}/>)}</datalist></div><div className="searchbar">
        <Search size={17} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search hospital name or location..."
        />
      </div></div>
      <div className="featured-label">
        <span>FEATURED PARTNERS</span>
        <b>{featured.length} hospitals available</b>
      </div>
      <div className="hospital-list">
        {featured.map((h, i) => (
          <article
            className="hospital-card reveal"
            style={{ animationDelay: `${i * 0.06}s` }}
            key={h.id || h.name}
          >
            <div className={"hospital-photo " + h.photo + (h.image ? " has-image" : "")}>
              {h.image ? <img className="photo-fill" src={h.image} alt={h.name} /> : (<><Building2 size={32} /><span>+</span></>)}
            </div>
            <div>
              <h3>{h.name}</h3>
              <p>
                <MapPin size={13} />
                {h.location}
              </p>
              <p>{h.desc}</p>
              {h.doctors && (
                <p>
                  <UserRound size={13} />
                  {h.doctors} Doctors
                </p>
              )}
            </div>
            <div className="hospital-actions">
              <Btn kind="outline" onClick={() => chooseHospital(h, "hospitalExplore")}>
                Explore Hospital
              </Btn>
              <Btn onClick={() => chooseHospital(h, "doctors")}>View Doctors</Btn>
            </div>
          </article>
        ))}
      </div>
      {loading && <p className="muted">Loading partner hospitals…</p>}
      {!loading && !featured.length && <div className="empty-state"><Hospital size={34}/><h3>No hospitals to book an appointment</h3><p>There are no partner hospitals listed for this location yet.</p></div>}
      {error && <p className="login-error">{error}</p>}
      {noLocation && <div className="modal-layer"><div className="modal"><button className="close" onClick={()=>setNoLocation(false)}><X/></button><h2>No hospital available</h2><p>No hospital is attached to your company at this location yet.</p><Btn onClick={()=>setNoLocation(false)}>Okay</Btn></div></div>}
    </EmployeeLayout>
  );
}
export function Doctors({ setPage }) {
  const [department, setDepartment] = useState("All Departments");
  const [query, setQuery] = useState("");
  const localToday = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const [doctorDate, setDoctorDate] = useState(localToday);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const hospitalId = sessionStorage.getItem("medi-slot-hospital-id");
  useEffect(() => {
    setLoading(true);
    api.doctors({ hospitalId: hospitalId || undefined, name: query, date: doctorDate })
      .then((data) => setCatalog(Array.isArray(data) ? data.map(mapDoctor) : []))
      .catch(() => setCatalog([]))
      .finally(() => setLoading(false));
  }, [hospitalId, query, doctorDate]);
  const departments = [
    "All Departments",
    ...Array.from(
      new Set(catalog.map((d) => d.department || d.specialty).filter(Boolean)),
    ),
  ];
  const visible = catalog.filter(
    (d) =>
      (department === "All Departments" ||
        d.department === department ||
        d.specialty === department) &&
      d.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <EmployeeLayout page="doctors" setPage={setPage}>
      <button className="back" onClick={() => setPage("hospitals")}>
        <ChevronLeft size={16} />
        Back to Hospitals
      </button>
      <div className="page-title compact">
        <h2>{sessionStorage.getItem("medi-slot-hospital-name") || "Partner Hospital"} Doctors</h2>
        <p>
          <MapPin size={13} /> Select a specialist and find an available slot
        </p>
      </div>
      <div className="filter-row">
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          {departments.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <label className="doctor-date"><CalendarDays size={15}/><input type="date" value={doctorDate} min={localToday} max={new Date(Date.now()+13*86400000).toISOString().slice(0,10)} onChange={e=>setDoctorDate(e.target.value)}/></label>
        <div className="searchbar">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doctor name..."
          />
        </div>
      </div>
      <p className="result-count">
        Showing <b>{visible.length}</b> specialists{" "}
        {department !== "All Departments" && `in ${department}`}
      </p>
      <div className="doctor-list">
        {visible.map((d, i) => (
          <article
            className="doctor-card reveal"
            style={{ animationDelay: `${i * 0.05}s` }}
            key={d.id || d.name}
          >
            <Avatar doctor={d} />
            <div className="doctor-info">
              <h3>{d.name}</h3>
              <p>{d.specialty}</p>
              <p>
                <Clock3 size={13} />
                {d.experience}
              </p>
              <p>
                <MapPin size={13} />
                {d.hospital}
              </p>
              {d.availableOnDate === false && (
                <p className="next-available">
                  {d.nextAvailableDate
                    ? `No slots on this date · next available ${new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "2-digit", month: "short" }).format(new Date(`${d.nextAvailableDate}T12:00:00`))}`
                    : "No upcoming slots published yet"}
                </p>
              )}
            </div>
            <div className="rating">
              <Star size={15} fill="currentColor" /> {d.rating}
            </div>
            <Btn onClick={() => { sessionStorage.setItem("medi-slot-doctor-id", d.id); sessionStorage.setItem("medi-slot-doctor-name", d.name); sessionStorage.setItem("medi-slot-slot-date", d.availableOnDate === false && d.nextAvailableDate ? d.nextAvailableDate : doctorDate); setPage("doctor"); }}>View Slots</Btn>
          </article>
        ))}
      </div>
      {loading && <p className="muted">Loading available doctors…</p>}
      {!visible.length && (
        <div className="empty-state">
          <Stethoscope />
          <h3>No specialists found</h3>
          <p>Try selecting another department or searching a different name.</p>
        </div>
      )}
    </EmployeeLayout>
  );
}
export function HospitalExplore({ setPage }) {
  const hospitalId = sessionStorage.getItem("medi-slot-hospital-id");
  const [hospital, setHospital] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!hospitalId) { setPage("hospitals"); return; }
    api.hospital(hospitalId).then(setHospital).catch((e) => setError(e.message));
  }, [hospitalId, setPage]);
  if (!hospital && !error) return <EmployeeLayout page="hospitalExplore" setPage={setPage}><p className="muted">Loading hospital details…</p></EmployeeLayout>;
  if (error) return <EmployeeLayout page="hospitalExplore" setPage={setPage}><div className="empty-state"><Hospital/><h3>Hospital unavailable</h3><p>{error}</p><Btn onClick={()=>setPage("hospitals")}>Back to hospitals</Btn></div></EmployeeLayout>;
  return (
    <EmployeeLayout page="hospitalExplore" setPage={setPage}>
      <button className="back" onClick={() => setPage("hospitals")}>
        <ChevronLeft size={16} />
        Back to Hospitals
      </button>
      <section className="hospital-explore">
        <div className={"explore-image" + (hospital.imageUrl ? " has-image" : "")}>
          {hospital.imageUrl ? <img className="photo-fill" src={hospital.imageUrl} alt={hospital.name} /> : (<><Building2 size={66} /><span>+</span></>)}
        </div>
        <div>
          <span className="eyebrow">MOTHERSON PARTNER</span>
          <h1>{hospital.name}</h1>
          <p>
            <MapPin size={15} />
            {hospital.address}, {hospital.city}
          </p>
          <p className="explore-copy">
            A trusted care destination bringing together experienced
            specialists, modern diagnostics and patient-first service for every
            Motherson employee.
          </p>
          <div className="explore-stats">
            <span>
              <b>{hospital.departments?.length || 0}</b>Specialties
            </span>
            <span>
              <b>24/7</b>Emergency
            </span>
            <span>
              <b>{hospital.openingTime?.slice(0, 5) || "—"}</b>Opens
            </span>
          </div>
          <Btn onClick={() => setPage("doctors")}>
            Browse Doctors <ArrowRight size={16} />
          </Btn>
        </div>
      </section>
      <section className="facility-panel">
        <h2>Care that’s ready when you need it</h2>
        <div>
          {[
            ["Heart care", "Cardiology & cardiac diagnostics"],
            ["Advanced diagnostics", "MRI, CT scan and pathology"],
            ["Emergency support", "Round-the-clock medical response"],
          ].map(([a, b]) => (
            <article key={a}>
              <span>
                <HeartPulse />
              </span>
              <h3>{a}</h3>
              <p>{b}</p>
            </article>
          ))}
        </div>
      </section>
    </EmployeeLayout>
  );
}
export function Slots({ setPage }) {
  const doctorId = sessionStorage.getItem("medi-slot-doctor-id") || 1;
  const doctorName = sessionStorage.getItem("medi-slot-doctor-name") || "Doctor";
  const localToday = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const dateOptions = Array.from({length:14},(_,i)=>{const d=new Date(`${localToday}T12:00:00`);d.setDate(d.getDate()+i);return new Intl.DateTimeFormat("en-CA").format(d)});
  const preferredDate = sessionStorage.getItem("medi-slot-slot-date");
  const [date, setDate] = useState(dateOptions.includes(preferredDate) ? preferredDate : localToday), [slots, setSlots] = useState([]), [slot, setSlot] = useState(null), [error,setError] = useState("");
  useEffect(()=>{setError("");api.slots(doctorId,date).then(data=>{const permitted=data.filter(s=>s.startTime >= "10:00:00" && s.startTime < "16:00:00" && ["00","30"].includes(s.startTime.slice(3,5)));setSlots(permitted);setSlot(permitted[0]?.id||null)}).catch(e=>setError(e.message));},[doctorId,date]);
  const book = async () => { if(!slot)return; try { const appointment=await api.bookAppointment(slot); sessionStorage.setItem("medi-slot-last-appointment",JSON.stringify(appointment));setPage("confirmation"); } catch(e){setError(e.message);} };
  return (
    <EmployeeLayout page="slots" setPage={setPage}>
      <button className="back" onClick={() => setPage("doctor")}>
        <ChevronLeft size={16} />
        Back
      </button>
      <div className="slot-box">
        <h2>Select Appointment Slot</h2>
        <p>{doctorName}</p>
        <div className="dates">{dateOptions.map(d=><button key={d} className={date===d?"chosen":""} onClick={()=>setDate(d)}><span>{new Intl.DateTimeFormat("en-IN",{weekday:"short"}).format(new Date(`${d}T12:00:00`))}</span><span>{new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short"}).format(new Date(`${d}T12:00:00`))}</span></button>)}</div>
        <h4>Available Slots · 10:00 AM – 4:00 PM</h4>
        <div className="time-grid">
          {slots.map(s => <button onClick={()=>setSlot(s.id)} className={slot===s.id?"chosen":""} key={s.id}>{new Date(`1970-01-01T${s.startTime}`).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</button>)}
        </div>
        {!slots.length && !error && <p className="empty-slots">No slots are available for this date. Choose another day.</p>}
        {error && <p className="login-error">{error}</p>}
        <Btn className="wide" onClick={book}>
          Book Appointment
        </Btn>
      </div>
    </EmployeeLayout>
  );
}
export function Confirmation({ setPage }) {
  const appointment = JSON.parse(sessionStorage.getItem("medi-slot-last-appointment") || "null");
  return (
    <EmployeeLayout page="appointments" setPage={setPage}>
      <div className="confirm-card">
        <div className="success">
          <Check />
        </div>
        <h2>
          Appointment Booked
          <br />
          Successfully!
        </h2>
        <p>
          Your appointment has been booked. You will also receive a confirmation
          email.
        </p>
        <div className="receipt">
          <p>
            <span>Appointment ID</span> #{appointment?.id || "—"}
          </p>
          <p>
            <span>Doctor</span> {appointment?.doctor?.name || "—"}
            <br />
            <small>{appointment?.doctor?.specialization}</small>
          </p>
          <p>
            <span>Hospital</span> {appointment?.hospital?.name || "—"}
          </p>
          <p>
            <span>Date</span> {appointment?.slot?.date || "—"}
          </p>
          <p>
            <span>Time</span> {appointment?.slot?.startTime} – {appointment?.slot?.endTime}
          </p>
          <p>
            <span>Status</span> <b className="pill blue">Booked</b>
          </p>
        </div>
        <Btn onClick={() => setPage("appointments")}>View My Appointments</Btn>
        <Btn kind="outline" onClick={() => {}}>
          <Download size={15} />
          Download Slip
        </Btn>
      </div>
    </EmployeeLayout>
  );
}
export function Appointments({ setPage }) {
  const [cancel, setCancel] = useState(null), [tab, setTab] = useState("upcoming"), [items, setItems] = useState([]), [expanded, setExpanded] = useState(null), [error, setError] = useState("");
  const load = () => api.myAppointments(tab).then(setItems).catch(e => setError(e.message));
  useEffect(() => { load(); }, [tab]);
  return (
    <EmployeeLayout page="appointments" setPage={setPage}>
      <div className="page-title">
        <h2>My Appointments</h2>
      </div>
      <div className="tabs appointment-tabs">
        <button className={tab === "upcoming" ? "selected" : ""} onClick={() => setTab("upcoming")}>Upcoming</button>
        <button className={tab === "past" ? "selected" : ""} onClick={() => setTab("past")}>Past</button>
      </div>
      <div className="appt-list">
        {items.map((appointment) => {
          const d = {name:appointment.doctor.name,specialty:appointment.doctor.specialization,hospital:appointment.hospital.name,initial:appointment.doctor.name.split(" ").slice(-2).map(x=>x[0]).join(""),color:"#e5f2ff"};
          return <article className="appt" key={appointment.id}>
            <Avatar doctor={d} />
            <div>
              <h3>
                {d.name}{" "}
                <span className={"pill " + (appointment.status === "CONFIRMED" ? "green" : appointment.status === "CANCELLED" ? "red" : "blue")}>{appointment.status}</span>
              </h3>
              <p>{d.specialty}</p>
              <p>
                <Hospital size={13} />
                {d.hospital}
              </p>
              <p>
                <CalendarDays size={13} />
                {appointment.slot.date} · {appointment.slot.startTime} – {appointment.slot.endTime}
              </p>
              {expanded === appointment.id && <div className="appointment-details"><p><b>Appointment ID:</b> #{appointment.id}</p><p><b>Department:</b> {appointment.doctor.department?.name}</p><p><b>Reason:</b> {appointment.reason || "Not specified"}</p></div>}
            </div>
            <div>
              <Btn kind="outline" onClick={() => setExpanded(expanded === appointment.id ? null : appointment.id)}>{expanded === appointment.id ? "Hide Details" : "View Details"}</Btn>
              {tab === "upcoming" && ["BOOKED","CONFIRMED"].includes(appointment.status) && <Btn kind="danger-outline" onClick={() => setCancel(appointment)}>
                Cancel
              </Btn>}
            </div>
          </article>
        })}
      </div>
      {!items.length && !error && <div className="empty-state"><CalendarDays/><h3>No {tab} appointments</h3><p>Your appointment history will appear here.</p></div>}
      {error && <p className="login-error">{error}</p>}
      {cancel && <CancelModal appointment={cancel} close={() => setCancel(null)} done={load} />}
    </EmployeeLayout>
  );
}
export function CancelModal({ appointment, close, done }) {
  const [error, setError] = useState("");
  const cancelAppointment = async () => { try { await api.cancelAppointment(appointment.id); close(); done(); } catch (e) { setError(e.message); } };
  return (
    <div className="modal-layer">
      <div className="modal">
        <button className="close" onClick={close}>
          <X />
        </button>
        <h2>Cancel Appointment</h2>
        <p>Are you sure you want to cancel this appointment?</p>
        <div className="mini-doc">
          <Avatar doctor={{initial: appointment.doctor.name.split(" ").slice(-2).map(x=>x[0]).join("")}} />
          <b>
            {appointment.doctor.name}
            <br />
            <small>{appointment.slot.date} · {appointment.slot.startTime} – {appointment.slot.endTime}</small>
          </b>
        </div>
        <label>
          Please select a reason (optional)
          <select>
            <option>Select reason</option>
            <option>Schedule conflict</option>
          </select>
        </label>
        <div>
          <Btn kind="outline" onClick={close}>
            No, Keep Appointment
          </Btn>
          <Btn kind="danger" onClick={cancelAppointment}>
            Yes, Cancel Appointment
          </Btn>
        </div>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}
export function Profile({ setPage }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  useEffect(() => { api.employeeMe().then(setProfile).catch((e) => setError(e.message)); }, []);
  const save = async (event) => { event.preventDefault(); try { const updated = await api.updateEmployeeMe({ name: profile.name, phone: profile.phone || "", plantLocation: profile.plantLocation || "" }); setProfile(updated); setSaved("Profile updated."); } catch (e) { setError(e.message); } };
  if (!profile) return <EmployeeLayout page="profile" setPage={setPage}><p className="muted">Loading profile…</p>{error && <p className="login-error">{error}</p>}</EmployeeLayout>;
  return (
    <EmployeeLayout page="profile" setPage={setPage}>
      <div className="page-title">
        <h2>My Profile</h2>
        <p>View and update your personal information.</p>
      </div>
      <form className="profile-form" onSubmit={save}>
        <label>
          Full Name
          <input required value={profile.name} onChange={(e)=>setProfile({...profile,name:e.target.value})}/>
        </label>
        <label>
          Employee ID
          <input value={profile.employeeCode} readOnly />
        </label>
        <label>
          Email Address
          <input value={profile.email} readOnly />
        </label>
        <label>
          Phone Number
          <input value={profile.phone || ""} onChange={(e)=>setProfile({...profile,phone:e.target.value})}/>
        </label>
        <label>Plant Location<input value={profile.plantLocation || ""} onChange={(e)=>setProfile({...profile,plantLocation:e.target.value})}/></label>
        <Btn className="form-save">Update Profile</Btn>
        {saved && <p className="saved-note">{saved}</p>}{error && <p className="login-error">{error}</p>}
      </form>
    </EmployeeLayout>
  );
}
