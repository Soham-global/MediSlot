import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Activity, Search, ShieldAlert, Sparkles } from "lucide-react";

const demos = [
  {
    symptom: "persistent headache and light sensitivity",
    department: "Neurology",
    doctors: [
      { initials: "AR", name: "Dr. Ananya Rao", specialty: "Neurology", available: "Today 4:30 PM" },
      { initials: "KM", name: "Dr. Kabir Mehta", specialty: "Neurology", available: "Tomorrow 9:00 AM" },
    ],
  },
  {
    symptom: "knee pain when climbing stairs",
    department: "Orthopedics",
    doctors: [
      { initials: "VS", name: "Dr. Vikram Shah", specialty: "Orthopedics", available: "Today 4:30 PM" },
      { initials: "NP", name: "Dr. Neha Patel", specialty: "Sports medicine", available: "Tomorrow 9:00 AM" },
    ],
  },
  {
    symptom: "skin rash and itching",
    department: "Dermatology",
    doctors: [
      { initials: "IN", name: "Dr. Isha Nair", specialty: "Dermatology", available: "Today 4:30 PM" },
      { initials: "RD", name: "Dr. Rohan Das", specialty: "Dermatology", available: "Tomorrow 9:00 AM" },
    ],
  },
];

const ease = [0.22, 1, 0.36, 1];

function DemoScene({ demo, reduceMotion }) {
  const [typed, setTyped] = useState(reduceMotion ? demo.symptom : "");
  const [showResult, setShowResult] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      setTyped(demo.symptom);
      setShowResult(true);
      return undefined;
    }

    let typeTimer;
    let resultTimer;
    let position = 0;

    setTyped("");
    setShowResult(false);

    const typeNext = () => {
      position += 1;
      setTyped(demo.symptom.slice(0, position));

      if (position < demo.symptom.length) {
        typeTimer = window.setTimeout(typeNext, 38);
      } else {
        resultTimer = window.setTimeout(() => setShowResult(true), 420);
      }
    };

    typeTimer = window.setTimeout(typeNext, 280);

    return () => {
      window.clearTimeout(typeTimer);
      window.clearTimeout(resultTimer);
    };
  }, [demo, reduceMotion]);

  return (
    <>
      <div className="symptom-demo__search">
        <Search size={18} aria-hidden="true" />
        <span className={`symptom-demo__query${typed ? "" : " is-placeholder"}`}>
          {typed || "Describe your symptoms..."}
        </span>
        {!reduceMotion && <span className="symptom-demo__caret" />}
        <span className="symptom-demo__search-mark">
          <Sparkles size={15} aria-hidden="true" />
        </span>
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            className="symptom-demo__result"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.42, ease }}
          >
            <div className="symptom-demo__department">
              <span className="symptom-demo__department-icon">
                <Activity size={18} aria-hidden="true" />
              </span>
              <span>
                <small>Suggested department</small>
                <strong>{demo.department}</strong>
              </span>
            </div>

            <div className="symptom-demo__doctors">
              {demo.doctors.map((doctor) => (
                <div className="symptom-demo__doctor" key={doctor.name}>
                  <span className="symptom-demo__avatar">{doctor.initials}</span>
                  <span className="symptom-demo__doctor-copy">
                    <strong>{doctor.name}</strong>
                    <small>{doctor.specialty}</small>
                  </span>
                  <span className="symptom-demo__availability">Next available: {doctor.available}</span>
                </div>
              ))}
            </div>

            <div className="symptom-demo__urgent">
              <ShieldAlert size={15} aria-hidden="true" />
              Urgent symptoms are flagged
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function SymptomShowcase() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setActive(0);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % demos.length);
    }, 7600);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const demo = demos[active];

  return (
    <div className="symptom-showcase__demo-wrap">
      <span className="symptom-showcase__spark" aria-hidden="true">
        <Sparkles size={20} />
      </span>

      <div className="symptom-demo" aria-hidden="true">
        <div className="symptom-demo__chrome">
          <span className="symptom-demo__label">
            <Activity size={15} aria-hidden="true" />
            Symptom matching preview
          </span>
          <span className="symptom-demo__badge">Demo</span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            className="symptom-demo__scene"
            key={active}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease }}
          >
            <DemoScene demo={demo} reduceMotion={reduceMotion} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
