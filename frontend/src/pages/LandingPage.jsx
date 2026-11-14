<<<<<<< HEAD
﻿import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Check,
  Clock3,
  HeartPulse,
  MapPin,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { homePathForRole, useAuth } from "../context/AuthContext";
import SymptomShowcase from "../components/SymptomShowcase";
=======
import { Link } from 'react-router-dom';
import {
  ArrowIcon,
  CalendarIcon,
  CheckIcon,
  SearchIcon,
} from '../components/Icons';
>>>>>>> origin/main

const steps = [
  {
<<<<<<< HEAD
    icon: Search,
    title: "Search",
    text: "Find a doctor by speciality, name, or hospital.",
  },
  {
    icon: CalendarCheck,
    title: "Choose a slot",
    text: "Pick from live hospital availability.",
  },
  {
    icon: ShieldCheck,
    title: "Get confirmed",
    text: "Book once and track the visit in your portal.",
=======
    icon: <SearchIcon size={26} />,
    title: 'Find the right doctor',
    text: 'Search by name, hospital or specialty across Motherson’s partner hospitals.',
  },
  {
    icon: <CalendarIcon size={26} />,
    title: 'Pick a time that suits you',
    text: 'See real open slots up to two weeks ahead and book in a few taps.',
  },
  {
    icon: <CheckIcon size={26} />,
    title: 'Stay in control',
    text: 'Review upcoming visits and cancel in one step if your plans change.',
>>>>>>> origin/main
  },
];

const stats = [
  {
    value: 3,
    suffix: "",
    label: "hospital campuses",
    description: "Connected across the Motherson care network.",
    icon: Building2,
  },
  {
    value: 40,
    suffix: "+",
    label: "specialists listed",
    description: "Verified doctors across every speciality.",
    icon: Stethoscope,
  },
  {
    value: 12,
    suffix: "",
    label: "care departments",
    description: "From cardiology to everyday primary care.",
    icon: HeartPulse,
  },
];

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

const proofContainer = {
  hidden: {},
  visible: (reduceMotion) => ({
    transition: { staggerChildren: reduceMotion ? 0 : 0.06 },
  }),
};

const proofItem = {
  hidden: (reduceMotion) => ({
    opacity: reduceMotion ? 1 : 0,
    y: reduceMotion ? 0 : 16,
  }),
  visible: (reduceMotion) => ({
    opacity: 1,
    y: 0,
    transition: { duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

function CountUp({ value, suffix = "" }) {
  const nodeRef = useRef(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return undefined;

    let frame;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 900;

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <strong ref={nodeRef}>
      {display}
      {suffix}
    </strong>
  );
}

export default function LandingPage() {
  const { isAuthenticated, role } = useAuth();
  const reduceMotion = useReducedMotion();
  const carePath = isAuthenticated ? homePathForRole(role) : "/login";

  return (
    <div className="landing">
      <section className="hero">
        <div className="container hero__grid">
          <motion.div
            className="hero__copy"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="hero__badge">
              <span aria-hidden="true" />
              Motherson employee care network
            </span>
            <h1>
              Care, without
              <span className="hero__accent"> the wait.</span>
            </h1>
            <p className="hero__lead">
              Find the right doctor, see live hospital availability, and book from one employee portal.
            </p>
<<<<<<< HEAD
            <div className="hero__actions">
              <Link className="button button--primary button--large" to={carePath}>
                {isAuthenticated ? "Open your dashboard" : "Find a doctor"}
                <ArrowRight size={18} aria-hidden="true" />
=======
            <div className="landing-actions">
              <Link to="/doctors" className="btn btn-primary btn-lg btn-arrow">
                Find a doctor
                <ArrowIcon size={18} />
>>>>>>> origin/main
              </Link>
              <Link className="button button--ghost button--large" to="/#how-it-works">
                See how it works
              </Link>
            </div>
            <p className="hero__trust">
              <Check size={15} aria-hidden="true" />
              Live availability <span aria-hidden="true">·</span> Verified specialists{" "}
              <span aria-hidden="true">·</span> Employee-only access
            </p>
          </motion.div>

<<<<<<< HEAD
          <motion.div
            className="hero__visual"
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="hero__ring" aria-hidden="true" />
            <span className="hero__ring hero__ring--two" aria-hidden="true" />
            <svg className="hero__ecg" viewBox="0 0 640 180" preserveAspectRatio="none" aria-hidden="true">
              <path
                className="hero__ecg-glow"
                d="M0 96 H142 l14 -22 12 48 18 -82 18 116 16 -60 h44 l16 -30 12 64 18 -86 18 118 14 -56 H640"
              />
              <path
                className="hero__ecg-line"
                d="M0 96 H142 l14 -22 12 48 18 -82 18 116 16 -60 h44 l16 -30 12 64 18 -86 18 118 14 -56 H640"
              />
            </svg>

            <div className="hero-card">
              <div className="hero-card__header">
                <div>
                  <span className="hero-card__kicker">Next appointment</span>
                  <h2>Cardiology consult</h2>
                </div>
                <span className="hero-card__status">
                  <Check size={13} aria-hidden="true" />
                  Confirmed
                </span>
              </div>

              <div className="hero-card__doctor">
                <div className="hero-card__avatar">AR</div>
                <div>
                  <strong>Dr. Ananya Rao</strong>
                  <span>Senior Cardiologist · 12 years</span>
                </div>
                <span className="hero-card__verified" title="Verified specialist">
                  <ShieldCheck size={18} aria-label="Verified specialist" />
                </span>
              </div>

              <div className="hero-card__visit">
                <div>
                  <CalendarCheck size={18} aria-hidden="true" />
                  <span>
                    <small>Date</small>
                    <strong>Thu, 12 Nov</strong>
                  </span>
                </div>
                <div>
                  <Clock3 size={18} aria-hidden="true" />
                  <span>
                    <small>Time</small>
                    <strong>10:30 AM</strong>
                  </span>
                </div>
              </div>

              <div className="hero-card__location">
                <MapPin size={17} aria-hidden="true" />
                <span>Motherson Hospital · Pune</span>
              </div>

              <div className="hero-card__timeline">
                <span className="is-done" />
                <span className="is-done" />
                <span className="is-active" />
                <span />
                <span />
              </div>
            </div>

          </motion.div>
=======
          <div className="preview-wrap" aria-hidden="true">
            <div className="preview">
              <div className="preview-top">
                <span className="avatar avatar-md preview-avatar">Dr</span>
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
            <div className="preview-toast">
              <span className="preview-toast-icon">
                <CheckIcon size={18} />
              </span>
              <div>
                <strong>Appointment booked</strong>
                <span className="muted">We’ll see you soon</span>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-features" aria-label="How it works">
          {FEATURES.map((feature, index) => (
            <div key={feature.title} className="feature">
              <span className="feature-icon">{feature.icon}</span>
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
          <Link to="/doctors" className="btn btn-lg btn-arrow">
            Find a doctor
            <ArrowIcon size={18} />
          </Link>
>>>>>>> origin/main
        </div>
      </section>

      <section className="landing-proof" aria-label="MediSlot at a glance">
        <motion.div
          className="container landing-proof__inner"
          custom={reduceMotion}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={proofContainer}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                className="landing-proof__item"
                custom={reduceMotion}
                variants={proofItem}
                whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.22, ease: "easeOut" } }}
                key={stat.label}
              >
                <span className="landing-proof__icon">
                  <Icon size={23} aria-hidden="true" />
                </span>
                <CountUp value={stat.value} suffix={stat.suffix} />
                <span className="landing-proof__label">{stat.label}</span>
                <p className="landing-proof__desc">{stat.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section className="landing-section" id="how-it-works">
        <motion.div className="container" {...reveal}>
          <div className="section-heading">
            <div>
              <span className="eyebrow">How it works</span>
              <h2>Three steps to your next appointment.</h2>
            </div>

          </div>

          <div className="steps-grid">
            {steps.map((step) => (
              <article className="step-card" key={step.title}>
                <span className="step-card__icon">
                  <step.icon size={22} aria-hidden="true" />
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="landing-section landing-section--symptom" id="symptom-checker">
        <motion.div className="container symptom-showcase" {...reveal}>
          <div className="symptom-showcase__copy">
            <span className="eyebrow">Smart symptom matching</span>
            <h2>Not sure which doctor to see?</h2>
            <p className="symptom-showcase__intro">
              Describe how you feel and MediSlot suggests the right department and available doctors.
            </p>

            <ul className="symptom-showcase__benefits">
              <li>
                <span className="symptom-showcase__tick">
                  <Check size={14} aria-hidden="true" />
                </span>
                Suggests the right department
              </li>
              <li>
                <span className="symptom-showcase__tick">
                  <Check size={14} aria-hidden="true" />
                </span>
                Shows doctors with open slots
              </li>
              <li>
                <span className="symptom-showcase__tick">
                  <Check size={14} aria-hidden="true" />
                </span>
                Flags urgent symptoms
              </li>
            </ul>

            <div className="symptom-showcase__actions">
              <Link className="button button--primary button--large" to="/login">
                Log in to try it
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link className="button button--secondary button--large" to="/signup">
                Sign up
              </Link>
            </div>

            <p className="symptom-showcase__note">Available after you log in.</p>
          </div>

          <SymptomShowcase />
        </motion.div>
      </section>

      <section className="landing-cta">
        <div className="container">
          <motion.div className="landing-cta__inner" {...reveal}>
            <div>
              <h2>Ready to book your next visit?</h2>
              <p>Find a doctor and choose a live slot in minutes.</p>
            </div>
            <Link className="button button--light button--large" to={carePath}>
              {isAuthenticated ? "Open dashboard" : "Get started"}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
