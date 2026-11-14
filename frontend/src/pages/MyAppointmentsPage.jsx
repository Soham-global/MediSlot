import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import {
  cancelAppointment,
  fetchMyAppointments,
} from '../api/appointmentsApi';
import { getErrorMessage } from '../utils/errors';
import { formatDate, formatTime } from '../utils/format';

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
];

const CANCELLABLE = ['BOOKED', 'CONFIRMED'];

function whenLabel(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (new Date(`${date}T00:00:00`) - today) / 86400000
  );
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff > 1) return `In ${diff} days`;
  return '';
}

function AppointmentCard({ appointment, isNext, canCancel, onCancel, index }) {
  const { slot, doctor, hospital } = appointment;
  const date = new Date(`${slot.date}T00:00:00`);

  return (
    <article
      className={`card appt-card${isNext ? ' is-next' : ''}`}
      style={{ '--i': Math.min(index, 8) }}
    >
      <div className="appt-date" aria-hidden="true">
        <span>{date.toLocaleDateString('en-IN', { month: 'short' })}</span>
        <strong>{date.getDate()}</strong>
        <span>{date.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
      </div>

      <div className="appt-body">
        {isNext && (
          <p className="appt-eyebrow">
            Next visit{whenLabel(slot.date) && ` · ${whenLabel(slot.date)}`}
          </p>
        )}
        <div className="appt-top">
          <Avatar name={doctor.name} size="sm" />
          <h2 className="doctor-name">{doctor.name}</h2>
          <StatusBadge status={appointment.status} />
        </div>
        <p className="muted appt-spec">{doctor.specialization}</p>

        <p className="appt-line">
          {formatDate(slot.date)} · {formatTime(slot.startTime)} –{' '}
          {formatTime(slot.endTime)}
        </p>
        <p className="muted">
          {hospital.name}, {hospital.city}
        </p>

        {appointment.reason && (
          <p className="appt-reason">“{appointment.reason}”</p>
        )}

        {appointment.status === 'CANCELLED' && appointment.cancelledBy && (
          <p className="muted">
            Cancelled by{' '}
            {appointment.cancelledBy === 'EMPLOYEE' ? 'you' : 'the hospital'}
          </p>
        )}
      </div>

      {canCancel && (
        <div className="appt-actions">
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={() => onCancel(appointment)}
          >
            Cancel
          </button>
        </div>
      )}
    </article>
  );
}

export default function MyAppointmentsPage() {
  const [tab, setTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [reloadKey, setReloadKey] = useState(0);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    fetchMyAppointments(tab)
      .then((data) => {
        if (cancelled) return;
        setAppointments(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [tab, reloadKey]);

  function openCancel(appointment) {
    setCancelError('');
    setCancelTarget(appointment);
  }

  function closeCancel() {
    if (!cancelling) setCancelTarget(null);
  }

  async function confirmCancel() {
    setCancelling(true);
    setCancelError('');

    try {
      await cancelAppointment(cancelTarget.id);
      setCancelTarget(null);
      setNotice('Your appointment has been cancelled.');
      setReloadKey((key) => key + 1);
    } catch (error) {
      setCancelError(getErrorMessage(error));
    } finally {
      setCancelling(false);
    }
  }

  function switchTab(key) {
    setNotice('');
    setTab(key);
  }

  // Soonest first for upcoming, most recent first for past
  const startOf = (item) => new Date(`${item.slot.date}T${item.slot.startTime}`);
  const sorted = [...appointments].sort((a, b) =>
    tab === 'upcoming' ? startOf(a) - startOf(b) : startOf(b) - startOf(a)
  );

  return (
    <section className="page">
      <header className="page-head">
        <p className="eyebrow">Your visits</p>
        <h1>My appointments</h1>
        <p className="page-sub">Keep track of your visits in one place.</p>
      </header>

      <div className="tabs" role="tablist" aria-label="Appointment type">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`tab${tab === key ? ' is-active' : ''}`}
            onClick={() => switchTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {notice && (
        <div className="notice-success" role="status">
          {notice}
        </div>
      )}

      {status === 'loading' ? (
        <div className="appt-list" aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card skeleton appt-skeleton" />
          ))}
        </div>
      ) : status === 'error' ? (
        <div className="state-box" role="alert">
          <p>We couldn't load your appointments.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </button>
        </div>
      ) : appointments.length === 0 ? (
        <div className="state-box">
          {tab === 'upcoming' ? (
            <>
              <p>You have no upcoming appointments.</p>
              <Link to="/doctors" className="btn btn-primary">
                Find a doctor
              </Link>
            </>
          ) : (
            <p>No past appointments yet.</p>
          )}
        </div>
      ) : (
        <div className="appt-list stagger">
          {sorted.map((appointment, index) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              index={index}
              isNext={tab === 'upcoming' && index === 0}
              canCancel={
                tab === 'upcoming' && CANCELLABLE.includes(appointment.status)
              }
              onCancel={openCancel}
            />
          ))}
        </div>
      )}

      {cancelTarget && (
        <ConfirmDialog
          title="Cancel this appointment?"
          confirmLabel="Yes, cancel it"
          danger
          busy={cancelling}
          error={cancelError}
          onConfirm={confirmCancel}
          onCancel={closeCancel}
        >
          <p>
            <strong>{cancelTarget.doctor.name}</strong>
            <br />
            {formatDate(cancelTarget.slot.date)} at{' '}
            {formatTime(cancelTarget.slot.startTime)}
          </p>
          <p className="muted">The time will become available to others.</p>
        </ConfirmDialog>
      )}
    </section>
  );
}
