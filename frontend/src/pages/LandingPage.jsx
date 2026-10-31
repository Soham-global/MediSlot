import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="landing-pulse" aria-hidden="true">
        <svg viewBox="0 0 1200 220" preserveAspectRatio="none">
          <path
            pathLength="1"
            d="M0 118 H392 l18 -46 24 94 22 -82 18 34 H1200"
          />
        </svg>
      </div>

      <main className="landing-main">
        <div className="landing-hero">
          <h1>Care, when you need it.</h1>
          <p className="landing-lead">
            Find available doctors at Motherson's partner hospitals and
            book an appointment in minutes.
          </p>
          <Link
            to="/doctors"
            className="btn btn-primary landing-cta"
          >
            Check available doctors and book an appointment
          </Link>
        </div>
      </main>

      <footer className="landing-footer">
        MediSlot · Appointments for Motherson employees
      </footer>
    </div>
  );
}
