import React, { useEffect, useState, useRef } from "react";
import {
  CalendarDays,
  UserRound,
  LayoutDashboard,
  Hospital,
  Stethoscope,
  ClipboardList,
  Settings,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "./ui";
import { clearSession } from "../../api";

function UserMenu({ admin, setPage }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  // Click outside / Escape closes the menu (hover and click both open it).
  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false); };
    const closeEscape = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => { document.removeEventListener("mousedown", closeOutside); document.removeEventListener("keydown", closeEscape); };
  }, [open]);
  let user = {};
  try {
    user = JSON.parse(sessionStorage.getItem("medi-slot-user") || "{}");
  } catch {
    user = {};
  }
  const name = user.name || (admin ? "Hospital Admin" : "Motherson Employee");
  const email = user.email || "employee@motherson.com";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  const logout = () => {
    clearSession();
    setOpen(false);
    setPage("home");
  };

  return (
    <div className="user-menu" ref={menuRef} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="avatar user user-menu-trigger" onClick={() => setOpen(true)} aria-label="Open profile menu" aria-expanded={open}>
        {initials || "MS"}
      </button>
      {open && (
        <div className="profile-dropdown-wrap">
          <div className="profile-dropdown">
            <div className="profile-dropdown-user">
              <b>{name}</b>
              <span>{email}</span>
            </div>
            <button className="profile-logout" onClick={logout}>Log out</button>
          </div>
        </div>
      )}
    </div>
  );
}

const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

/**
 * Header used on the landing page and every employee screen.
 * `variant` picks the right-hand navigation: "public" (landing), "employee" (signed in) or admin.
 */
export function Top({ page, setPage, admin = false, standalone = false, onMenu, variant }) {
  const signedIn = Boolean(sessionStorage.getItem("medi-slot-token"));
  const mode = admin ? "admin" : variant || (signedIn ? "employee" : "public");
  const [open, setOpen] = useState(false);
  const go = (target) => { setOpen(false); setPage(target); };
  const jump = (id) => {
    setOpen(false);
    if (page !== "home") { setPage("home"); setTimeout(() => scrollToId(id), 60); } else scrollToId(id);
  };
  return (
    <header className={"top" + (admin ? " admin-top" : "") + (standalone ? " standalone" : "")}>
      <div className="top-inner">
        {admin && onMenu ? (
          <button className="mobile-menu" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button>
        ) : null}
        <Logo admin={admin} onHome={() => setPage("home")} />
        <div className="top-spacer" />
        {mode === "public" && (
          <nav className="pill-nav public" aria-label="Main">
            <button onClick={() => jump("how-it-works")}>How it works</button>
            <button onClick={() => jump("check-symptoms")}>Check symptoms</button>
          </nav>
        )}
        {mode === "employee" && (
          <nav className={"pill-nav collapsible" + (open ? " open" : "")} aria-label="Main">
            <button className={page === "home" ? "active" : ""} onClick={() => go("home")}>Home</button>
            <button className={["hospitals", "hospitalExplore", "doctors", "doctor", "slots"].includes(page) ? "active" : ""} onClick={() => go("hospitals")}>Hospitals</button>
            <button className={["appointments", "confirmation"].includes(page) ? "active" : ""} onClick={() => go("appointments")}>My appointments</button>
            <button className={page === "profile" ? "active" : ""} onClick={() => go("profile")}>Profile</button>
          </nav>
        )}
        <div className="top-actions">
          {mode === "public" && (
            <>
              <button className="btn outline" onClick={() => setPage("login")}>Log in</button>
              <button className="btn" onClick={() => setPage("signup")}>Sign up</button>
            </>
          )}
          {mode === "employee" && (
            <>
              <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X size={20} /> : <Menu size={20} />}</button>
              <UserMenu setPage={setPage} />
            </>
          )}
          {mode === "admin" && <UserMenu admin setPage={setPage} />}
        </div>
      </div>
    </header>
  );
}
export function SideItem({ icon: I, text, active, onClick }) {
  return (
    <button className={"side-item " + (active ? "active" : "")} onClick={onClick}>
      <I size={18} />
      {text}
    </button>
  );
}
export function EmployeeLayout({ page, setPage, children }) {
  return (
    <>
      <Top page={page} setPage={setPage} variant="employee" />
      <main className="portal-main">{children}</main>
    </>
  );
}
export function AdminLayout({ page, setPage, children }) {
  const [open, setOpen] = useState(false);
  const go = (p) => { setOpen(false); setPage(p); };
  return (
    <div className="admin-layout">
      <aside className={"admin-side " + (open ? "open" : "")}>
        <Logo admin onHome={() => go("admin")} />
        {[
          ["admin", LayoutDashboard, "Dashboard"],
          ["adminAppointments", CalendarDays, "Appointments"],
          ["adminDoctors", Stethoscope, "Doctors"],
          ["schedule", ClipboardList, "Schedules"],
          ["hospitalProfile", Hospital, "Hospital profile"],
          ["reports", FileText, "Reports"],
          ["settings", Settings, "Settings"],
        ].map(([p, I, t]) => (
          <SideItem key={p} icon={I} text={t} active={page === p || (p === "adminDoctors" && page === "addDoctor")} onClick={() => go(p)} />
        ))}
        <div className="side-foot">
          <b>Motherson Employee Care Network</b>
          Appointment changes update employee booking availability immediately.
        </div>
      </aside>
      <div className="admin-content">
        <Top admin page={page} setPage={setPage} onMenu={() => setOpen(!open)} />
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
