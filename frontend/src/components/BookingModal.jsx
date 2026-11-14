import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import Modal from './Modal';
import { fetchDoctorSlots } from '../api/doctorsApi';
import { bookAppointment } from '../api/appointmentsApi';
import { getErrorMessage } from '../utils/errors';
import { formatDate, formatTime, upcomingDates } from '../utils/format';

const MAX_REASON = 500;

function DayPill({ iso, active, onSelect }) {
  const date = new Date(`${iso}T00:00:00`);
  const weekday = date.toLocaleDateString('en-IN', { weekday: 'short' });
  const rest = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <button
      type="button"
      className={`day-pill${active ? ' is-active' : ''}`}
      aria-pressed={active}
      onClick={() => onSelect(iso)}
    >
      <span>{weekday}</span>
      <strong>{rest}</strong>
    </button>
  );
}

export default function BookingModal({ doctor, onClose }) {
  const dates = useMemo(() => upcomingDates(14), []);
  const [date, setDate] = useState(dates[0]);

  const [slots, setSlots] = useState([]);
  const [slotStatus, setSlotStatus] = useState('loading'); // loading | ready | error
  const [slotError, setSlotError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookError, setBookError] = useState('');
  const [booked, setBooked] = useState(null);

  // Load the slots whenever the date changes (or after a conflict)
  useEffect(() => {
    let cancelled = false;
    setSlotStatus('loading');
    setSelectedSlot(null);

    fetchDoctorSlots(doctor.id, date)
      .then((data) => {
        if (cancelled) return;
        setSlots(data);
        setSlotStatus('ready');
      })
      .catch((error) => {
        if (cancelled) return;
        setSlotError(getErrorMessage(error));
        setSlotStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [doctor.id, date, reloadKey]);

  async function handleConfirm() {
    if (!selectedSlot || submitting) return;

    setSubmitting(true);
    setBookError('');

    try {
      await bookAppointment({ slotId: selectedSlot.id, reason });
      setBooked(selectedSlot);
    } catch (error) {
      setBookError(getErrorMessage(error));
      // 409 = someone else took the slot, so refresh the list
      if (error.response?.status === 409) {
        setReloadKey((key) => key + 1);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ----- Success screen -----
  if (booked) {
    return (
      <Modal title="Appointment booked" onClose={onClose}>
        <div className="booked-box">
          <span className="booked-check" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path className="check-path" pathLength="1" d="m5 12.5 4.5 4.5L19 7" />
            </svg>
          </span>
          <p className="booked-line">
            <strong>{doctor.name}</strong>
            <br />
            {formatDate(booked.date)} at {formatTime(booked.startTime)}
          </p>
          <p className="muted">
            {doctor.hospital.name}, {doctor.hospital.city}
          </p>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
          <Link to="/my-appointments" className="btn btn-primary">
            View my appointments
          </Link>
        </div>
      </Modal>
    );
  }

  // ----- Booking form -----
  return (
    <Modal title="Book an appointment" onClose={onClose}>
      <div className="booking-doctor">
        <Avatar name={doctor.name} size="md" />
        <div>
          <strong>{doctor.name}</strong>
          <p className="muted">
            {doctor.specialization} · {doctor.hospital.name}
          </p>
        </div>
      </div>

      <h3 className="modal-label">
        <span className="step">1</span> Choose a day
      </h3>
      <div className="date-strip">
        {dates.map((iso) => (
          <DayPill
            key={iso}
            iso={iso}
            active={iso === date}
            onSelect={setDate}
          />
        ))}
      </div>

      <h3 className="modal-label">
        <span className="step">2</span> Choose a time
      </h3>
      {slotStatus === 'loading' ? (
        <div className="slot-grid" aria-hidden="true">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="slot-skeleton skeleton" />
          ))}
        </div>
      ) : slotStatus === 'error' ? (
        <div className="alert-error" role="alert">
          {slotError}{' '}
          <button
            type="button"
            className="btn-link"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </button>
        </div>
      ) : slots.length === 0 ? (
        <p className="muted slot-empty">
          No free slots on this day. Try another date.
        </p>
      ) : (
        <div className="slot-grid">
          {slots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              className={`slot-pill${
                selectedSlot?.id === slot.id ? ' is-active' : ''
              }`}
              aria-pressed={selectedSlot?.id === slot.id}
              onClick={() => setSelectedSlot(slot)}
            >
              {formatTime(slot.startTime)}
            </button>
          ))}
        </div>
      )}

      <label className="modal-label" htmlFor="booking-reason">
        <span className="step">3</span> Reason for visit{' '}
        <span className="optional">(optional)</span>
      </label>
      <textarea
        id="booking-reason"
        className="input textarea"
        rows={3}
        maxLength={MAX_REASON}
        placeholder="e.g. Recurring headache for the past week"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      <p className="char-count muted">
        {reason.length}/{MAX_REASON}
      </p>

      {selectedSlot && (
        <p className="booking-summary">
          {formatDate(date)} · {formatTime(selectedSlot.startTime)}
        </p>
      )}

      {bookError && (
        <div className="alert-error" role="alert">
          {bookError}
        </div>
      )}

      <div className="modal-actions">
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!selectedSlot || submitting}
          onClick={handleConfirm}
        >
          {submitting
            ? 'Booking…'
            : selectedSlot
              ? `Confirm ${formatTime(selectedSlot.startTime)}`
              : 'Choose a time'}
        </button>
      </div>
    </Modal>
  );
}
