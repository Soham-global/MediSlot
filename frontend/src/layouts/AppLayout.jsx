import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarDays, LogOut, Stethoscope, UserRound } from "lucide-react";
import Logo from "../components/Logo";
import { EMPLOYEE_NAV_LINKS } from "../components/navLinks";
import { useAuth } from "../context/AuthContext";

const NAV_ICONS = {
  "/doctors": Stethoscope,
  "/appointments": CalendarDays,
  "/profile": UserRound,
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const profileTriggerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const avatarInitial = (user?.name || "Employee").trim().charAt(0).toUpperCase();

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!profileOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        profileTriggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="app-header">
        <div className="container app-header__inner">
          <Logo to="/doctors" />

          <div className="app-header__right">
            <nav className="app-nav" aria-label="Employee navigation">
              {EMPLOYEE_NAV_LINKS.map((item) => {
                const Icon = NAV_ICONS[item.to];

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `app-nav__link${isActive ? " is-active" : ""}`}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            className="app-nav__pill"
                            layoutId="app-nav-pill"
                            transition={
                              reduceMotion
                                ? { duration: 0 }
                                : { type: "spring", stiffness: 430, damping: 34 }
                            }
                            aria-hidden="true"
                          />
                        )}
                        <Icon size={17} aria-hidden="true" />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="app-header__actions" ref={profileRef}>
              <button
                className="app-profile"
                type="button"
                ref={profileTriggerRef}
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-controls="app-profile-menu"
                onClick={() => setProfileOpen((open) => !open)}
              >
                <span className="app-profile__avatar" aria-hidden="true">
                  {avatarInitial}
                  <span className="app-profile__status" />
                </span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    className="app-profile-menu"
                    id="app-profile-menu"
                    role="menu"
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
                    transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
                  >
                    <div className="app-profile-menu__head">
                      <strong>{user?.name || "Employee"}</strong>
                      <small>{user?.employeeCode || "Motherson"}</small>
                    </div>
                    <Link
                      className="app-profile-menu__item"
                      to="/profile"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                    >
                      <UserRound size={17} aria-hidden="true" />
                      Profile
                    </Link>
                    <button
                      className="app-profile-menu__item app-profile-menu__item--signout"
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <LogOut size={17} aria-hidden="true" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="container app-footer__inner">
          <div className="app-footer__brand">
            <Logo to="/doctors" />
            <p>Appointments, availability, and care details in one workspace.</p>
          </div>
        </div>

        <div className="container app-footer__bottom">
          <span>© {new Date().getFullYear()} MediSlot. Employee care portal.</span>
        </div>
      </footer>

      <nav className="app-bottom-nav" aria-label="Mobile employee navigation">
        {EMPLOYEE_NAV_LINKS.map((item) => {
          const Icon = NAV_ICONS[item.to];

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `app-bottom-nav__link${isActive ? " is-active" : ""}`
              }
            >
              <Icon size={20} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
