import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import CareNetwork from "./CareNetwork";
import Logo from "./Logo";

const copy = {
  employee: {
    titleLead: "Your care, fitted around your ",
    titleAccent: "workday",
    titleTail: ".",
    subtitle: "Find trusted doctors and live hospital schedules in one secure employee portal.",
  },
  admin: {
    titleLead: "Your hospital ",
    titleAccent: "network",
    titleTail: "",
    subtitle: "Keep appointments, schedules, and care moving in one focused workspace.",
  },
};

export default function AuthShell({
  children,
  variant = "employee",
  eyebrow,
  title,
  subtitle,
  belowCard,
}) {
  const isAdmin = variant === "admin";
  const panel = copy[isAdmin ? "admin" : "employee"];
  const reduceMotion = useReducedMotion();

  return (
    <div className={`auth-shell${isAdmin ? " auth-shell--admin" : ""}`}>
      <a className="skip-link" href="#auth-form">
        Skip to form
      </a>

      <aside className="auth-aside">
        <span className="auth-aside__blob auth-aside__blob--one" aria-hidden="true" />
        <span className="auth-aside__blob auth-aside__blob--two" aria-hidden="true" />
        <span className="auth-aside__blob auth-aside__blob--three" aria-hidden="true" />

        <div className="auth-aside__inner">
          <div className="auth-aside__logo">
            <Logo light />
          </div>

          <div className="auth-aside__content">
            <div className="auth-aside__intro">
              {isAdmin && (
                <span className="auth-aside__badge">
                  <ShieldCheck size={15} aria-hidden="true" />
                  Hospital Admin Portal
                </span>
              )}
              <h1>
                {panel.titleLead}
                <span className="auth-aside__accent">{panel.titleAccent}</span>
                {panel.titleTail}
              </h1>
              <p>{panel.subtitle}</p>
            </div>

            <div className="auth-aside__visual">
              <CareNetwork />
            </div>
          </div>
        </div>

        <div className="auth-aside__ecg" aria-hidden="true">
          <svg viewBox="0 0 640 120" preserveAspectRatio="none">
            <path d="M0 64 H110 l14 -18 12 34 18 -58 18 76 14 -40 h42 l14 -22 12 44 16 -58 16 72 14 -30 H640" />
          </svg>
        </div>
      </aside>

      <main className="auth-main" id="auth-form">
        <Link className="auth-main__home" to="/" aria-label="Back to home">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to home
        </Link>

        <div className="auth-main__stage">
          <motion.div
            className="auth-card"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            {eyebrow && <span className="auth-card__eyebrow">{eyebrow}</span>}
            <h2>{title}</h2>
            {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
            {children}
            <p className="auth-card__legal">
              By continuing you agree to responsible use of employee healthcare services.
            </p>
          </motion.div>

          {belowCard}
        </div>
      </main>
    </div>
  );
}
