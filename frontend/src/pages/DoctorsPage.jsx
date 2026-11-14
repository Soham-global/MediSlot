import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUp,
  Baby,
  Bone,
  Brain,
  Building2,
  CalendarDays,
  ChevronDown,
  Ear,
  Eye,
  Filter,
  HeartPulse,
  LayoutGrid,
  Moon,
  RotateCcw,
  Search,
  SmilePlus,
  Sparkles,
  Stethoscope,
  Sun,
  X,
} from "lucide-react";
import { doctorsApi } from "../api/doctorsApi";
import { getApiMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import DoctorCard from "../components/DoctorCard";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { ListSkeleton } from "../components/Skeleton";
import SymptomFinder from "../components/SymptomFinder";
import { formatDate, greeting, todayDateInput } from "../utils/format";

const emptyFilters = { name: "", departmentId: "", hospitalId: "", date: "" };
const SEARCH_DEBOUNCE_MS = 400;

const DEPARTMENT_ICONS = {
  Cardiology: HeartPulse,
  Orthopedics: Bone,
  Dermatology: Sparkles,
  "General Medicine": Stethoscope,
  Neurology: Brain,
  Pediatrics: Baby,
  ENT: Ear,
  Dental: SmilePlus,
  Ophthalmology: Eye,
};

const ECG_POINTS = [
  [0, 92],
  [170, 92],
  [208, 90],
  [238, 92],
  [286, 92],
  [312, 44],
  [334, 140],
  [356, 92],
  [420, 92],
  [458, 76],
  [494, 92],
  [720, 92],
  [752, 68],
  [778, 116],
  [804, 92],
  [940, 92],
  [976, 78],
  [1010, 92],
  [1200, 92],
];

function CountUp({ value }) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);
  const previous = useRef(0);

  useEffect(() => {
    if (reduceMotion) {
      previous.current = value;
      setDisplay(value);
      return undefined;
    }

    const controls = animate(previous.current, value, {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    previous.current = value;

    return () => controls.stop();
  }, [value, reduceMotion]);

  return <span>{display}</span>;
}

function EcgTrace({ reduceMotion }) {
  const points = ECG_POINTS.map((point) => point.join(",")).join(" ");

  return (
    <svg
      className="employee-hero__ecg"
      viewBox="0 0 1200 180"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline className="ecg-trace__base" points={points} />
      <motion.polyline
        className="ecg-trace__line"
        points={points}
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0.4 }}
        animate={reduceMotion ? undefined : { pathLength: 1, opacity: 1 }}
        transition={
          reduceMotion
            ? undefined
            : {
                duration: 4.2,
                repeat: Infinity,
                repeatDelay: 0.8,
                ease: "easeInOut",
              }
        }
      />
    </svg>
  );
}

export default function DoctorsPage() {
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();
  const [filters, setFilters] = useState(emptyFilters);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 560);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLookups() {
      setLookupsLoading(true);
      setLookupError("");
      try {
        const [departmentData, hospitalData] = await Promise.all([
          doctorsApi.getDepartments(),
          doctorsApi.getHospitals(),
        ]);
        if (!cancelled) {
          setDepartments(departmentData);
          setHospitals(hospitalData);
        }
      } catch (requestError) {
        if (!cancelled) {
          setLookupError(
            getApiMessage(requestError, "Some filters are unavailable right now."),
          );
        }
      } finally {
        if (!cancelled) setLookupsLoading(false);
      }
    }

    loadLookups();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const data = await doctorsApi.getDoctors({
          name: filters.name.trim() || undefined,
          departmentId: filters.departmentId || undefined,
          hospitalId: filters.hospitalId || undefined,
          date: filters.date || undefined,
        });
        if (!cancelled) setDoctors(data);
      } catch (requestError) {
        if (!cancelled) {
          setDoctors([]);
          setError(getApiMessage(requestError, "We couldn’t load doctors right now."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [filters, reloadKey]);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => String(value).trim()).length,
    [filters],
  );

  const activeFilters = useMemo(() => {
    const chips = [];
    const name = filters.name.trim();

    if (name) {
      chips.push({ key: "name", label: "Search", value: name });
    }
    if (filters.departmentId) {
      const department = departments.find(
        (item) => String(item.id) === String(filters.departmentId),
      );
      chips.push({
        key: "departmentId",
        label: "Department",
        value: department?.name || "Selected",
      });
    }
    if (filters.hospitalId) {
      const hospital = hospitals.find((item) => String(item.id) === String(filters.hospitalId));
      chips.push({
        key: "hospitalId",
        label: "Hospital",
        value: hospital?.name || "Selected",
      });
    }
    if (filters.date) {
      chips.push({ key: "date", label: "Available", value: formatDate(filters.date) });
    }

    return chips;
  }, [filters, departments, hospitals]);

  const departmentOptions = useMemo(
    () => [
      { id: "", name: "All", icon: LayoutGrid },
      ...departments.map((department) => ({
        ...department,
        icon: DEPARTMENT_ICONS[department.name] || Stethoscope,
      })),
    ],
    [departments],
  );

  const updateFilter = (key) => (event) => {
    setFilters((current) => ({ ...current, [key]: event.target.value }));
  };

  const removeFilter = (key) => () => {
    setFilters((current) => ({ ...current, [key]: "" }));
  };

  const selectDepartment = (departmentId) => {
    setFilters((current) => ({ ...current, departmentId: String(departmentId) }));
  };

  const retry = () => {
    setReloadKey((key) => key + 1);
  };

  const firstName = user?.name?.split(" ")[0];
  const currentHour = new Date().getHours();
  const GreetingIcon = currentHour < 6 || currentHour >= 18 ? Moon : Sun;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <div className="page">
      <section className="employee-hero employee-hero--doctors">
        <span className="employee-hero__blob employee-hero__blob--one" aria-hidden="true" />
        <span className="employee-hero__blob employee-hero__blob--two" aria-hidden="true" />
        <span className="employee-hero__blob employee-hero__blob--three" aria-hidden="true" />
        <EcgTrace reduceMotion={reduceMotion} />

        <div className="container employee-hero__inner">
          <div className="employee-hero__copy">
            <motion.span
              className="employee-hero__greeting"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="employee-hero__greeting-icon" aria-hidden="true">
                <GreetingIcon size={14} />
              </span>
              {greeting()}
              {firstName ? `, ${firstName}` : ""}
            </motion.span>
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              Care that fits your <span className="employee-hero__title-accent">workday</span>
            </motion.h1>
            <motion.p
              className="employee-hero__subline"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              Find the right specialist, compare hospital availability, and book a time that
              fits your day.
            </motion.p>
          </div>

        </div>
      </section>

      <div className="container doctor-main">
        <div className="filter-wrap">
          <motion.section
            className="filter-panel"
            aria-labelledby="filter-title"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 id="filter-title" className="sr-only">
              Find doctors
            </h2>

            <div className="filter-row">
              <div className="filter-field filter-field--search">
                <label htmlFor="doctor-search">Search</label>
                <div className={`filter-control${filters.name.trim() ? " is-filled" : ""}`}>
                  <Search size={17} aria-hidden="true" />
                  <input
                    id="doctor-search"
                    type="search"
                    value={filters.name}
                    onChange={updateFilter("name")}
                    placeholder="Doctor or speciality"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="filter-field">
                <label htmlFor="department-filter">Department</label>
                <div
                  className={`filter-control${filters.departmentId ? " is-filled" : ""}`}
                >
                  <Filter size={16} aria-hidden="true" />
                  <select
                    id="department-filter"
                    value={filters.departmentId}
                    onChange={updateFilter("departmentId")}
                    disabled={lookupsLoading}
                  >
                    <option value="">All departments</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="filter-control__chevron"
                    size={16}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="filter-field">
                <label htmlFor="hospital-filter">Hospital</label>
                <div className={`filter-control${filters.hospitalId ? " is-filled" : ""}`}>
                  <Building2 size={16} aria-hidden="true" />
                  <select
                    id="hospital-filter"
                    value={filters.hospitalId}
                    onChange={updateFilter("hospitalId")}
                    disabled={lookupsLoading}
                  >
                    <option value="">All hospitals</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name} · {hospital.city}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="filter-control__chevron"
                    size={16}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="filter-field">
                <label htmlFor="date-filter">Available on</label>
                <div className={`filter-control${filters.date ? " is-filled" : ""}`}>
                  <CalendarDays size={16} aria-hidden="true" />
                  <input
                    id="date-filter"
                    type="date"
                    min={todayDateInput()}
                    value={filters.date}
                    onChange={updateFilter("date")}
                  />
                </div>
              </div>

              <button
                className="filter-clear"
                type="button"
                onClick={() => setFilters(emptyFilters)}
                disabled={activeFilterCount === 0}
                aria-label="Clear all filters"
              >
                <RotateCcw size={16} aria-hidden="true" />
                Clear
              </button>
            </div>

            <div className="filter-summary">
              {activeFilters.length > 0 && (
                <div className="filter-chips" role="group" aria-label="Active filters">
                  <AnimatePresence initial={false}>
                    {activeFilters.map((filter) => (
                      <motion.button
                        className="filter-chip"
                        type="button"
                        layout
                        key={filter.key}
                        onClick={removeFilter(filter.key)}
                        aria-label={`Remove ${filter.label} filter`}
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={
                          reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -4 }
                        }
                        transition={{
                          duration: reduceMotion ? 0 : 0.2,
                          ease: "easeOut",
                        }}
                      >
                        <span>{filter.label}</span>
                        {filter.value}
                        <X size={14} aria-hidden="true" />
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <p className="filter-count" aria-hidden="true">
                <strong>
                  <CountUp value={doctors.length} />
                </strong>
                <span>{doctors.length === 1 ? "doctor" : "doctors"}</span>
              </p>
            </div>

            {lookupError && (
              <p className="filter-panel__note" role="status">
                Some filters are unavailable. {lookupError}
              </p>
            )}
          </motion.section>
        </div>

        <section className="department-picker-wrap" aria-label="Quick department filter">
          <div className="department-picker">
            {departmentOptions.map((department) => {
              const DepartmentIcon = department.icon;
              const isActive = String(filters.departmentId) === String(department.id);

              return (
                <button
                  className={`department-picker__chip${isActive ? " is-active" : ""}`}
                  type="button"
                  key={department.id || "all"}
                  aria-pressed={isActive}
                  onClick={() => selectDepartment(department.id)}
                >
                  {isActive && (
                    <motion.span
                      className="department-picker__highlight"
                      layoutId="department-picker-highlight"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 34 }
                      }
                      aria-hidden="true"
                    />
                  )}
                  <DepartmentIcon size={16} aria-hidden="true" />
                  <span>{department.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="symptom-section" aria-label="Symptom finder">
          <SymptomFinder />
        </section>

        <section className="doctor-directory" aria-label="Doctors" aria-busy={loading}>
          <motion.div
            className="doctor-toolbar"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2>Available doctors</h2>
            <span className="sr-only" aria-live="polite">
              {loading
                ? "Searching for doctors"
                : `${doctors.length} ${doctors.length === 1 ? "doctor" : "doctors"} available`}
            </span>
          </motion.div>

          <AnimatePresence mode="wait" initial={false}>
            {error ? (
              <motion.div
                className="directory__state"
                key="error"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              >
                <ErrorState
                  title="Doctors are out of view"
                  message={error}
                  onRetry={retry}
                />
              </motion.div>
            ) : loading ? (
              <motion.div
                className="directory__state"
                key="loading"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
              >
                <ListSkeleton count={6} />
              </motion.div>
            ) : doctors.length === 0 ? (
              <motion.div
                className="directory__state"
                key="empty"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              >
                <EmptyState
                  icon={Stethoscope}
                  title="No doctors match that search"
                  description="Try a broader speciality, another hospital, or clear the date to see more options."
                  action={
                    <button
                      className="button button--secondary button--small"
                      type="button"
                      onClick={() => setFilters(emptyFilters)}
                    >
                      <RotateCcw size={15} aria-hidden="true" />
                      Clear filters
                    </button>
                  }
                />
              </motion.div>
            ) : (
              <motion.div
                className="doctor-list"
                key={`list-${activeFilters.map((filter) => `${filter.key}:${filter.value}`).join("|")}`}
                layout
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
              >
                {doctors.map((doctor, index) => (
                  <DoctorCard doctor={doctor} index={index} key={doctor.id} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            className="back-to-top"
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.82, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.82, y: 12 }}
            whileHover={reduceMotion ? undefined : { y: -4 }}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <ArrowUp size={19} aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
