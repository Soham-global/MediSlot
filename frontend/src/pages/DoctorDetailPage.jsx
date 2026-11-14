import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  Clock3,
  GraduationCap,
  MapPin,
  Phone,
  Stethoscope,
} from "lucide-react";
import { doctorsApi } from "../api/doctorsApi";
import { appointmentsApi } from "../api/appointmentsApi";
import { getApiMessage } from "../api/client";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Field from "../components/Field";
import Modal from "../components/Modal";
import { Skeleton } from "../components/Skeleton";
import {
  addDaysToDateInput,
  formatDate,
  formatTime,
  initials,
  todayDateInput,
} from "../utils/format";

export default function DoctorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState("");
  const [date, setDate] = useState(todayDateInput());
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [reloadDoctor, setReloadDoctor] = useState(0);
  const [reloadSlots, setReloadSlots] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setDoctorLoading(true);
    setDoctorError("");

    doctorsApi
      .getDoctor(id)
      .then((data) => {
        if (!cancelled) setDoctor(data);
      })
      .catch((error) => {
        if (!cancelled) setDoctorError(getApiMessage(error, "We couldn’t load this doctor."));
      })
      .finally(() => {
        if (!cancelled) setDoctorLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadDoctor]);

  useEffect(() => {
    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError("");

    doctorsApi
      .getSlots(id, date)
      .then((data) => {
        if (!cancelled) setSlots(data);
      })
      .catch((error) => {
        if (!cancelled) {
          setSlots([]);
          setSlotsError(getApiMessage(error, "We couldn’t load slots for this date."));
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, date, reloadSlots]);

  const openBooking = (slot) => {
    setSelectedSlot(slot);
    setReason("");
    setBookingError("");
  };

  const closeBooking = () => {
    if (booking) return;
    setSelectedSlot(null);
    setBookingError("");
  };

  const handleBook = async () => {
    if (!selectedSlot) return;

    setBooking(true);
    setBookingError("");
    try {
      await appointmentsApi.bookAppointment({
        slotId: selectedSlot.id,
        reason: reason.trim() || null,
      });
      navigate("/appointments", {
        state: {
          booked: true,
          doctorName: doctor?.name,
          date: selectedSlot.date,
          time: selectedSlot.startTime,
        },
      });
    } catch (error) {
      setBookingError(getApiMessage(error, "This slot couldn’t be booked. Please choose another."));
    } finally {
      setBooking(false);
    }
  };

  const nextDay = () => {
    setDate(addDaysToDateInput(date, 1));
    setSelectedSlot(null);
  };

  if (doctorError) {
    return (
      <div className="container page__body">
        <Link className="back-link" to="/doctors">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to doctors
        </Link>
        <ErrorState
          title="Doctor not available"
          message={doctorError}
          onRetry={() => setReloadDoctor((key) => key + 1)}
        />
      </div>
    );
  }

  if (doctorLoading) {
    return (
      <div className="container page__body">
        <div className="detail-hero detail-hero--loading" role="status" aria-label="Loading doctor profile">
          <div className="inline">
            <Skeleton width="96px" height="96px" radius="28px" />
            <div className="stack" style={{ gap: "0.5rem", flex: 1 }}>
              <Skeleton width="42%" height="1.6rem" />
              <Skeleton width="30%" height="1rem" />
              <Skeleton width="55%" height="0.9rem" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container page__body">
        <Link className="back-link" to="/doctors">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to doctors
        </Link>

        <section className="detail-hero">
          <div className="detail-hero__identity">
            <div className="detail-avatar" aria-hidden="true">
              {initials(doctor?.name)}
            </div>
            <div>
              <span className="eyebrow">Doctor profile</span>
              <h1>{doctor?.name}</h1>
              <p className="detail-hero__speciality">{doctor?.specialization}</p>
              <div className="detail-hero__tags">
                <span className="pill">
                  <Stethoscope size={14} aria-hidden="true" />
                  {doctor?.department?.name || "General care"}
                </span>
                <span className="pill">
                  <GraduationCap size={14} aria-hidden="true" />
                  {doctor?.qualification}
                </span>
                <span className="pill">
                  <Check size={14} aria-hidden="true" />
                  {doctor?.experienceYears} years experience
                </span>
              </div>
            </div>
          </div>

          <div className="detail-hero__hospital">
            <span className="detail-hero__hospital-icon">
              <Building2 size={21} aria-hidden="true" />
            </span>
            <div>
              <span>Practising at</span>
              <strong>{doctor?.hospital?.name}</strong>
              <p>
                <MapPin size={14} aria-hidden="true" />
                {doctor?.hospital?.city}
              </p>
            </div>
          </div>
        </section>

        <div className="detail-layout">
          <section className="slot-section" aria-labelledby="slots-title">
            <div className="slot-section__head">
              <div>
                <span className="eyebrow">Availability</span>
                <h2 id="slots-title">Choose a time</h2>
                <p>Slots update live from the hospital schedule.</p>
              </div>
              <Field label="Appointment date" htmlFor="slot-date">
                <div className="input-with-icon input-with-icon--compact">
                  <CalendarDays size={17} aria-hidden="true" />
                  <input
                    id="slot-date"
                    type="date"
                    min={todayDateInput()}
                    value={date}
                    onChange={(event) => {
                      setDate(event.target.value);
                      setSelectedSlot(null);
                    }}
                  />
                </div>
              </Field>
            </div>

            {slotsError ? (
              <ErrorState
                title="Slots are out of view"
                message={slotsError}
                compact
                onRetry={() => setReloadSlots((key) => key + 1)}
              />
            ) : slotsLoading ? (
              <div className="slot-grid" role="status" aria-label="Loading available slots">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} width="100%" height="3.4rem" radius="12px" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title={`No open slots on ${formatDate(date)}`}
                description="This doctor may be fully booked. Try the next day or browse another specialist."
                action={
                  <button className="button button--secondary button--small" type="button" onClick={nextDay}>
                    <CalendarDays size={15} aria-hidden="true" />
                    Check next day
                  </button>
                }
              />
            ) : (
              <>
                <div className="slot-grid">
                  {slots.map((slot) => (
                    <button
                      className={`slot-button${selectedSlot?.id === slot.id ? " is-selected" : ""}`}
                      key={slot.id}
                      type="button"
                      onClick={() => openBooking(slot)}
                      aria-pressed={selectedSlot?.id === slot.id}
                    >
                      <Clock3 size={16} aria-hidden="true" />
                      {formatTime(slot.startTime)}
                    </button>
                  ))}
                </div>
                <p className="slot-section__hint">
                  <Check size={15} aria-hidden="true" />
                  {slots.length} open {slots.length === 1 ? "slot" : "slots"} on {formatDate(date)}
                </p>
              </>
            )}
          </section>

          <aside className="detail-aside">
            <div className="aside-card">
              <h2>Weekly schedule</h2>
              {doctor?.weeklyTimings?.length ? (
                <ul className="schedule-list">
                  {doctor.weeklyTimings.map((timing) => (
                    <li key={timing.dayOfWeek}>
                      <span>{timing.dayName}</span>
                      <strong>
                        {formatTime(timing.startTime)} – {formatTime(timing.endTime)}
                      </strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted text-small">Schedule details are shared at the hospital.</p>
              )}
            </div>

            <div className="aside-card aside-card--hospital">
              <div className="aside-card__icon">
                <Building2 size={20} aria-hidden="true" />
              </div>
              <h2>{doctor?.hospital?.name}</h2>
              <p className="text-muted text-small">
                Your appointment will take place at this Motherson care location.
              </p>
              <div className="aside-card__row">
                <MapPin size={16} aria-hidden="true" />
                <span>{doctor?.hospital?.city || "Location confirmed at booking"}</span>
              </div>
              <div className="aside-card__row">
                <Phone size={16} aria-hidden="true" />
                <span>Reception details available in your appointment</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Modal
        open={Boolean(selectedSlot)}
        onClose={closeBooking}
        title="Confirm your appointment"
        description="Review the details and tell the care team what brings you in."
        footer={
          <>
            <button className="button button--ghost" type="button" onClick={closeBooking} disabled={booking}>
              Cancel
            </button>
            <button className="button button--primary" type="button" onClick={handleBook} disabled={booking}>
              {booking ? "Booking…" : "Book appointment"}
            </button>
          </>
        }
      >
        {bookingError && <Alert tone="error">{bookingError}</Alert>}
        <div className="booking-summary">
          <div className="booking-summary__doctor">
            <span className="booking-summary__avatar">{initials(doctor?.name)}</span>
            <div>
              <strong>{doctor?.name}</strong>
              <span>{doctor?.specialization}</span>
            </div>
          </div>
          <div className="booking-summary__grid">
            <div>
              <CalendarDays size={17} aria-hidden="true" />
              <span>
                <small>Date</small>
                <strong>{formatDate(selectedSlot?.date)}</strong>
              </span>
            </div>
            <div>
              <Clock3 size={17} aria-hidden="true" />
              <span>
                <small>Time</small>
                <strong>{formatTime(selectedSlot?.startTime)}</strong>
              </span>
            </div>
          </div>
          <div className="booking-summary__place">
            <MapPin size={16} aria-hidden="true" />
            {doctor?.hospital?.name} · {doctor?.hospital?.city}
          </div>
        </div>
        <Field
          label="Reason for visit"
          htmlFor="booking-reason"
          hint="Optional, but helps the doctor prepare."
          optional
        >
          <textarea
            id="booking-reason"
            rows={4}
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. recurring headaches for the past week"
          />
        </Field>
      </Modal>
    </div>
  );
}
