import { Link } from 'react-router-dom';

const FEATURES = [
  {
    title: 'Find the right doctor',
    text: 'Search by name, hospital or department across Motherson’s partner hospitals.',
  },
  {
    title: 'Pick a time that suits you',
    text: 'See real open slots up to two weeks ahead and book in a few taps.',
  },
  {
    title: 'Stay in control',
    text: 'Review upcoming visits and cancel in one step if your plans change.',
  },
];

const SAMPLE_SLOTS = ['9:00 am', '9:30 am', '10:00 am', '10:30 am', '11:00 am', '11:30 am'];

export default function LandingPage() {
  return (
    <div className="landing">
      <main className="landing-main">
        <section className="landing-hero">
          <div>
            <p className="landing-eyebrow">Hospital appointments · Motherson</p>
            <h1>
              Care, <em>when you need it.</em>
            </h1>
            <p className="landing-lead">
              Find available doctors at Motherson’s partner hospitals and book
              an appointment in minutes.
            </p>
            <div className="landing-actions">
              <Link to="/doctors" className="btn btn-primary btn-lg">
                Find a doctor
              </Link>
              <Link to="/login" className="btn btn-lg">
                Employee sign in
              </Link>
            </div>
          </div>

          <div className="preview" aria-hidden="true">
            <div className="preview-top">
              <span className="avatar">Dr</span>
              <div>
                <div className="doctor-name">Book a visit</div>
                <div className="muted">Choose a time that works for you</div>
              </div>
            </div>
            <p className="preview-label">Available times</p>
            <div className="preview-slots">
              {SAMPLE_SLOTS.map((slot, index) => (
                <div
                  key={slot}
                  className={`preview-slot${index === 1 ? ' is-active' : ''}`}
                >
                  {slot}
                </div>
              ))}
            </div>
            <div className="preview-confirm">Confirm 9:30 am</div>
          </div>
        </section>

        <section className="landing-features" aria-label="How it works">
          {FEATURES.map((feature, index) => (
            <div key={feature.title} className="feature">
              <p className="feature-num">0{index + 1}</p>
              <h2>{feature.title}</h2>
              <p>{feature.text}</p>
            </div>
          ))}
        </section>
      </main>

      <section className="landing-band">
        <div className="landing-band-inner">
          <h2>Your next appointment is a few clicks away.</h2>
          <Link to="/doctors" className="btn btn-lg">
            Find a doctor
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        MediSlot · Appointments for Motherson employees
      </footer>
    </div>
  );
}
