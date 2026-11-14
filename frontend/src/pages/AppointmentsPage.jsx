import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CalendarDays,
  CalendarX2,
  Clock3,
  MapPin,
  Plus,
  Stethoscope,
  X,
} from "lucide-react";
import { appointmentsApi } from "../api/appointmentsApi";
import { getApiMessage } from "../api/client";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { AppointmentSkeleton } from "../components/Skeleton";
import { formatDate, formatDateTime, formatTime, initials } from "../utils/format";

const tabs = [
  { label: "All", value: "" },
  { label: "Booked", value: "BOOKED" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function AppointmentsPage() {
  const location = useLocation();
  const [status, setStatus] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [notice, setNotice] = useState(
    location.state?.booked
      ? `Your appointment with ${location.state.doctorName} is booked for ${formatDate(
          location.state.date,
        )} at ${formatTime(location.state.time)}.`
      : "",
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    appointmentsApi
      .getMyAppointments(status || undefined)
      .then((data) => {
        if (!cancelled) setAppointments(data);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setAppointments([]);
          setError(getApiMessage(requestError, "We couldn’t load your appointments."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, reloadKey]);

  const openCancel = (appointment) => {
    setCancelTarget(appointment);
    setCancelError("");
  };

  const closeCancel = () => {
    if (cancelling) return;
    setCancelTarget(null);
    setCancelError("");
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;

    setCancelling(true);
    setCancelError("");
    try {
      await appointmentsApi.cancelAppointment(cancelTarget.id);
      setCancelTarget(null);
      setNotice("Your appointment has been cancelled. The slot is now open for other employees.");
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setCancelError(getApiMessage(requestError, "We couldn’t cancel this appointment."));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="page">
      <section className="employee-hero employee-hero--compact">
        <span className="employee-hero__orb" aria-hidden="true" />
        <div className="container employee-hero__inner">
          <div className="employee-hero__copy">
            <span className="eyebrow">Your care space</span>
            <h1>Appointments that stay in one place.</h1>
            <p>Track upcoming visits, revisit completed care, and make changes without a phone call.</p>
          </div>
          <Link className="button button--primary" to="/doctors">
            <Plus size={17} aria-hidden="true" />
            Book new appointment
          </Link>
        </div>
      </section>

      <div className="container page__body">
        {notice && (
          <div className="notice">
            <Alert tone="success">{notice}</Alert>
            <button className="icon-button" type="button" onClick={() => setNotice("")} aria-label="Dismiss message">
              <X size={17} />
            </button>
          </div>
        )}

        <div className="appointments-head">
          <div>
            <span className="eyebrow">Appointment history</span>
            <h2>Your visits</h2>
          </div>
          <div className="tab-list" role="group" aria-label="Filter appointments by status">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                className={`tab${status === tab.value ? " is-active" : ""}`}
                type="button"
                aria-pressed={status === tab.value}
                onClick={() => setStatus(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <ErrorState
            title="Appointments are out of view"
            message={error}
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        ) : loading ? (
          <div className="appointment-list" role="status" aria-label="Loading appointments">
            {Array.from({ length: 3 }).map((_, index) => (
              <AppointmentSkeleton key={index} />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={CalendarX2}
            title={status ? `No ${status.toLowerCase()} appointments` : "No appointments yet"}
            description={
              status
                ? "Try another filter or book a new visit when you’re ready."
                : "When you book a doctor, all the details will appear here."
            }
            action={
              <Link className="button button--primary button--small" to="/doctors">
                <Stethoscope size={15} aria-hidden="true" />
                Find a doctor
              </Link>
            }
          />
        ) : (
          <div className="appointment-list">
            {appointments.map((appointment) => {
              const canCancel = ["BOOKED", "CONFIRMED"].includes(appointment.status);

              return (
                <article className="appointment-card" key={appointment.id}>
                  <div className="appointment-card__date">
                    <span>{formatDate(appointment.slot?.date).split(" ").slice(0, 2).join(" ")}</span>
                    <strong>{formatDate(appointment.slot?.date).split(" ").slice(2, 3).join(" ")}</strong>
                    <small>{formatTime(appointment.slot?.startTime)}</small>
                  </div>

                  <div className="appointment-card__main">
                    <div className="appointment-card__head">
                      <div>
                        <h3>{appointment.doctor?.name}</h3>
                        <p>
                          {appointment.doctor?.specialization} · {appointment.doctor?.department?.name}
                        </p>
                      </div>
                      <StatusBadge status={appointment.status} />
                    </div>

                    <div className="appointment-card__details">
                      <span>
                        <CalendarDays size={15} aria-hidden="true" />
                        {formatDate(appointment.slot?.date, true)}
                      </span>
                      <span>
                        <Clock3 size={15} aria-hidden="true" />
                        {formatTime(appointment.slot?.startTime)} – {formatTime(appointment.slot?.endTime)}
                      </span>
                      <span>
                        <MapPin size={15} aria-hidden="true" />
                        {appointment.hospital?.name} · {appointment.hospital?.city}
                      </span>
                    </div>

                    {appointment.reason && (
                      <p className="appointment-card__reason">
                        <strong>Reason:</strong> {appointment.reason}
                      </p>
                    )}

                    <div className="appointment-card__foot">
                      <span>Booked {formatDateTime(appointment.bookedAt)}</span>
                      <div className="inline">
                        <Link className="text-button" to={`/doctors/${appointment.doctor?.id}`}>
                          View doctor
                        </Link>
                        {canCancel && (
                          <button
                            className="text-button text-button--danger"
                            type="button"
                            onClick={() => openCancel(appointment)}
                          >
                            Cancel appointment
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={Boolean(cancelTarget)}
        onClose={closeCancel}
        title="Cancel this appointment?"
        description="This will release your slot for another employee."
        size="sm"
        footer={
          <>
            <button className="button button--ghost" type="button" onClick={closeCancel} disabled={cancelling}>
              Keep appointment
            </button>
            <button className="button button--danger" type="button" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? "Cancelling…" : "Yes, cancel"}
            </button>
          </>
        }
      >
        {cancelError && <Alert tone="error">{cancelError}</Alert>}
        <div className="cancel-summary">
          <span className="cancel-summary__icon">
            <CalendarX2 size={22} aria-hidden="true" />
          </span>
          <div>
            <strong>{cancelTarget?.doctor?.name}</strong>
            <span>
              {formatDate(cancelTarget?.slot?.date)} at {formatTime(cancelTarget?.slot?.startTime)}
            </span>
            <small>{cancelTarget?.hospital?.name}</small>
          </div>
        </div>
      </Modal>
    </div>
  );
}
