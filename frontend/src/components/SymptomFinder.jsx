import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { symptomsApi } from "../api/symptomsApi";
import { getApiMessage } from "../api/client";
import { initials } from "../utils/format";

const examples = [
  "persistent headache and light sensitivity",
  "knee pain when climbing stairs",
  "skin rash and itching",
];

const benefits = [
  { text: "Suggests a department", icon: Stethoscope },
  { text: "Shows doctors with open slots", icon: CalendarCheck },
  { text: "Flags urgent symptoms", icon: ShieldAlert },
];

export default function SymptomFinder() {
  const reduceMotion = useReducedMotion();
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    if (focused) return undefined;

    const example = examples[placeholderIndex];

    if (reduceMotion) {
      setPlaceholder(`e.g. ${example}`);
      const timer = window.setTimeout(() => {
        setPlaceholderIndex((index) => (index + 1) % examples.length);
      }, 4200);
      return () => window.clearTimeout(timer);
    }

    let characterIndex = 0;
    let holdTimer;
    setPlaceholder("");

    const typeTimer = window.setInterval(() => {
      characterIndex += 1;
      setPlaceholder(`e.g. ${example.slice(0, characterIndex)}`);

      if (characterIndex >= example.length) {
        window.clearInterval(typeTimer);
        holdTimer = window.setTimeout(() => {
          setPlaceholderIndex((index) => (index + 1) % examples.length);
        }, 1800);
      }
    }, 42);

    return () => {
      window.clearInterval(typeTimer);
      window.clearTimeout(holdTimer);
    };
  }, [focused, placeholderIndex, reduceMotion]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!text.trim()) {
      setError("Describe your symptoms before searching.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await symptomsApi.suggestSymptoms(text.trim());
      setResult(data);
    } catch (requestError) {
      setResult(null);
      setError(getApiMessage(requestError, "We couldn’t check those symptoms right now."));
    } finally {
      setLoading(false);
    }
  };

  const chooseExample = (example) => {
    setText(example);
    setError("");
  };

  return (
    <section className="symptom-finder" aria-labelledby="symptom-finder-title">
      <span className="symptom-finder__pattern" aria-hidden="true" />

      <div className="symptom-finder__intro">
        <motion.span
          className="symptom-finder__icon"
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{
            duration: reduceMotion ? 0 : 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <Sparkles size={24} />
        </motion.span>

        <div className="symptom-finder__copy">
          <motion.h2
            id="symptom-finder-title"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: reduceMotion ? 0 : 0.45,
              delay: reduceMotion ? 0 : 0.07,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            Not sure <span>who to see?</span>
          </motion.h2>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: reduceMotion ? 0 : 0.45,
              delay: reduceMotion ? 0 : 0.14,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            Tell us what’s going on and we’ll point you to the right place.
          </motion.p>

          <ul className="symptom-finder__ticks">
            {benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <motion.li
                  key={benefit.text}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.45,
                    delay: reduceMotion ? 0 : 0.21 + index * 0.07,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <BenefitIcon size={14} aria-hidden="true" />
                  {benefit.text}
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="symptom-finder__panel">
        <form className="symptom-finder__form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="symptom-text">
            Describe your symptoms
          </label>

          <div className="symptom-finder__control">
            <Search size={18} aria-hidden="true" />
            <input
              id="symptom-text"
              type="text"
              value={text}
              maxLength={500}
              onChange={(event) => setText(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={focused ? "Type how you’re feeling…" : placeholder}
              aria-invalid={Boolean(error && !result)}
              aria-describedby={error && !result ? "symptom-text-error" : undefined}
            />
            <button
              className="button button--primary symptom-finder__submit"
              type="submit"
              disabled={loading}
              aria-busy={loading}
            >
              <span>{loading ? "Checking…" : "Find my department"}</span>
              <ArrowRight size={16} aria-hidden="true" />
              <span className="symptom-finder__shine" aria-hidden="true" />
            </button>
          </div>

          <div className="symptom-finder__examples" aria-label="Example symptoms">
            <span>Try:</span>
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                className="chip"
                onClick={() => chooseExample(example)}
              >
                {example}
              </button>
            ))}
          </div>

          <AnimatePresence initial={false}>
            {error && !result && (
              <motion.p
                className="symptom-finder__error"
                id="symptom-text-error"
                role="alert"
                initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {loading && (
          <motion.div
            className="symptom-result symptom-result--loading"
            key="symptom-loading"
            role="status"
            aria-label="Checking your symptoms"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          >
            <span className="symptom-result__loading-line" />
            <span className="symptom-result__loading-line symptom-result__loading-line--short" />
            <span className="symptom-result__loading-row" />
          </motion.div>
        )}

        {!loading && result && (
          <motion.div
            className="symptom-result"
            key={result.department?.id || "general"}
            aria-live="polite"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {result.isEmergency && (
              <motion.div
                className="symptom-emergency"
                role="alert"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="symptom-emergency__icon" aria-hidden="true">
                  <ShieldAlert size={20} />
                </span>
                <div>
                  <strong>Seek urgent care</strong>
                  <p>
                    {result.emergencyMessage ||
                      "This may be a medical emergency. Please contact emergency services or visit the nearest hospital."}
                  </p>
                </div>
              </motion.div>
            )}

            <div className="symptom-result__main">
              <span className="symptom-result__icon" aria-hidden="true">
                <Stethoscope size={22} />
              </span>
              <div>
                <span className="symptom-result__label">Suggested department</span>
                <motion.h3
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {result.department?.name || "General Medicine"}
                </motion.h3>
                <p>
                  {result.matched
                    ? "Based on the symptoms you described, this team is the best place to start."
                    : "We didn’t find a precise match, so a General Medicine doctor can help you decide next steps."}
                </p>
                {result.alternatives?.length > 0 && (
                  <div className="symptom-result__alternatives">
                    <span>Also consider:</span>
                    {result.alternatives.map((department) => (
                      <span className="pill" key={department.id}>
                        {department.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {result.doctors?.length > 0 && (
              <div className="symptom-result__doctors">
                <h4>Available doctors</h4>
                <div className="recommended-doctors">
                  {result.doctors.slice(0, 3).map((doctor, index) => (
                    <motion.div
                      key={doctor.id}
                      initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.28,
                        delay: reduceMotion ? 0 : index * 0.05,
                        ease: "easeOut",
                      }}
                    >
                      <Link className="recommended-doctor" to={`/doctors/${doctor.id}`}>
                        <span className="recommended-doctor__avatar">
                          {initials(doctor.name)}
                        </span>
                        <span>
                          <strong>{doctor.name}</strong>
                          <small>
                            {doctor.specialization} · {doctor.hospital?.name}
                          </small>
                        </span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {result.disclaimer && (
              <p className="symptom-result__disclaimer">{result.disclaimer}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
