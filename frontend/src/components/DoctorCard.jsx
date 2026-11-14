import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock3, MapPin } from "lucide-react";
import { initials } from "../utils/format";

export default function DoctorCard({ doctor, index = 0 }) {
  const reduceMotion = useReducedMotion();
  const rowRef = useRef(null);
  const availabilityValue = doctor.nextAvailable || doctor.availability || "";
  const availability =
    typeof availabilityValue === "string"
      ? availabilityValue
      : availabilityValue
        ? "Available this week"
        : doctor.availableToday
          ? "Available today"
          : "";
  const availabilityText = /^available\b/i.test(availability)
    ? availability
    : "Next available";
  const availabilityDetail = /^available\b/i.test(availability) ? "" : availability;
  const hospitalName = doctor.hospital?.name || "Motherson care network";
  const hospitalCity = doctor.hospital?.city || "";

  const handlePointerMove = (event) => {
    const row = rowRef.current;
    if (!row) return;

    const bounds = row.getBoundingClientRect();
    row.style.setProperty("--sheen-x", `${event.clientX - bounds.left}px`);
    row.style.setProperty("--sheen-y", `${event.clientY - bounds.top}px`);
  };

  const clearSheen = () => {
    const row = rowRef.current;
    if (!row) return;
    row.style.removeProperty("--sheen-x");
    row.style.removeProperty("--sheen-y");
  };

  return (
    <motion.article
      className="doctor-row-shell"
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.4,
        delay: reduceMotion ? 0 : (index % 8) * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link
        className="doctor-row"
        to={`/doctors/${doctor.id}`}
        aria-label={`View slots for ${doctor.name}`}
        ref={rowRef}
        onPointerMove={reduceMotion ? undefined : handlePointerMove}
        onPointerLeave={clearSheen}
      >
        <span className="doctor-row__sheen" aria-hidden="true" />
        <span className="doctor-row__accent" aria-hidden="true" />

        <span className="doctor-avatar-ring" aria-hidden="true">
          <span className="doctor-avatar">{initials(doctor.name)}</span>
          <span className="doctor-avatar__dot" />
        </span>

        <div className="doctor-row__identity">
          <h3>{doctor.name}</h3>
          <p className="doctor-row__speciality">{doctor.specialization}</p>
          {doctor.qualification && (
            <p className="doctor-row__qualification">{doctor.qualification}</p>
          )}
        </div>

        <div className="doctor-row__meta">
          {doctor.experienceYears != null && (
            <span className="doctor-row__meta-item">
              <Clock3 size={15} aria-hidden="true" />
              {doctor.experienceYears} yrs
            </span>
          )}
          <span className="doctor-row__meta-item doctor-row__meta-item--hospital">
            <MapPin size={15} aria-hidden="true" />
            <span>
              {hospitalName}
              {hospitalCity ? `, ${hospitalCity}` : ""}
            </span>
          </span>
        </div>

        <div className="doctor-row__side">
          <span className="doctor-row__availability">
            <span className="doctor-row__availability-dot" aria-hidden="true" />
            <span>{availabilityText}</span>
            {availabilityDetail && (
              <span className="doctor-row__availability-detail">{availabilityDetail}</span>
            )}
          </span>

          <span className="doctor-row__cta">
            View slots
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
