import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarClock,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  UsersRound,
  X,
} from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/format";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/doctors", label: "Doctors", icon: UsersRound },
  { to: "/admin/doctors/1/slots", label: "Doctor slots", icon: CalendarClock },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarDays },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <aside className={`admin-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <div className="admin-sidebar__head">
          <Logo to="/admin" light />
          <button
            className="icon-button admin-sidebar__close"
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-sidebar__context">
          <span>Hospital operations</span>
          <strong>{user?.hospital?.name || "Motherson Hospital"}</strong>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav__link${isActive ? " is-active" : ""}`}
            >
              <item.icon size={19} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-profile">
            <span className="admin-profile__avatar">{initials(user?.name)}</span>
            <span>
              <strong>{user?.name || "Hospital admin"}</strong>
              <small>{user?.email || "Administrator"}</small>
            </span>
          </div>
          <button className="admin-signout" type="button" onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="admin-scrim"
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="icon-button admin-topbar__menu"
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>
          <div>
            <span className="admin-topbar__eyebrow">MediSlot admin</span>
            <strong>Hospital workspace</strong>
          </div>
          <span className="admin-topbar__badge">Admin access</span>
        </header>

        <main id="main-content" className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
