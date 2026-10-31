import { useEffect, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import {
  fetchAdminAppointments,
  fetchAdminDoctors,
  updateAdminAppointment,
} from '../api/adminApi';
import { getErrorMessage } from '../utils/errors';
import { formatDate, formatTime } from '../utils/format';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  ['BOOKED', 'Booked'],
  ['CONFIRMED', 'Confirmed'],
  ['CANCELLED', 'Cancelled'],
  ['COMPLETED', 'Completed'],
  ['NO_SHOW', 'No-show'],
];

// What each button asks, and what to tell the admin when it worked
const ACTIONS = {
  confirm: {
    title: 'Confirm this appointment?',
    confirmLabel: 'Confirm appointment',
    cancelLabel: 'Go back',
    done: 'Appointment confirmed.',
    danger: false,
  },
  complete: {
    title: 'Mark as completed?',
    confirmLabel: 'Mark completed',
    cancelLabel: 'Go back',
    done: 'Appointment marked as completed.',
    danger: false,
  },
  'no-show': {
    title: 'Mark as no-show?',
    confirmLabel: 'Mark no-show',
    cancelLabel: 'Go back',
    done: 'Appointment marked as no-show.',
    danger: true,
  },
  cancel: {
    title: 'Cancel this appointment?',
    confirmLabel: 'Yes, cancel it',
    cancelLabel: 'Keep it',
    done: 'Appointment cancelled.',
    danger: true,
  },
};

function slotStart(slot) {
  return new Date(`${slot.date}T${slot.startTime}`);
}

function RowActions({ appointment, onAction }) {
  const { status, slot } = appointment;
  const started = slotStart(slot) <= new Date();

  if (status === 'BOOKED') {
    return (
      <>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          disabled={started}
          title={started ? 'The slot has already started' : undefined}
          onClick={() => onAction('confirm', appointment)}
        >
          Confirm
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onAction('cancel', appointment)}
        >
          Cancel
        </button>
      </>
    );
  }

  if (status === 'CONFIRMED') {
    const hint = started ? undefined : 'Available once the slot has started';
    return (
      <>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          disabled={!started}
          title={hint}
          onClick={() => onAction('complete', appointment)}
        >
          Complete
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          disabled={!started}
          title={hint}
          onClick={() => onAction('no-show', appointment)}
        >
          No-show
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onAction('cancel', appointment)}
        >
          Cancel
        </button>
      </>
    );
  }

  // CANCELLED, COMPLETED, NO_SHOW: nothing more can be done
  return <span className="muted">—</span>;
}

export default function AdminAppointmentsPage() {
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({
    doctorId: '',
    date: '',
    status: '',
  });
  const [page, setPage] = useState(0);

  const [data, setData] = useState(null);
  const [loadStatus, setLoadStatus] = useState('loading'); // loading | ready | error
  const [reloadKey, setReloadKey] = useState(0);

  const [pending, setPending] = useState(null); // { action, appointment }
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');

  // Doctor dropdown: load once
  useEffect(() => {
    fetchAdminDoctors()
      .then(setDoctors)
      .catch(() => {});
  }, []);

  // Appointments: reload when filters, page or reloadKey change
  useEffect(() => {
    let cancelled = false;
    setLoadStatus('loading');

    fetchAdminAppointments({ ...filters, page, size: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        // e.g. the last row of the last page just disappeared
        if (result.content.length === 0 && page > 0) {
          setPage(Math.max(result.totalPages - 1, 0));
          return;
        }
        setData(result);
        setLoadStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setLoadStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [filters, page, reloadKey]);

  function updateFilter(key) {
    return (event) => {
      setNotice('');
      setPage(0); // a new filter always starts from the first page
      setFilters((current) => ({ ...current, [key]: event.target.value }));
    };
  }

  const hasFilters = Object.values(filters).some(Boolean);

  function clearFilters() {
    setNotice('');
    setPage(0);
    setFilters({ doctorId: '', date: '', status: '' });
  }

  function openAction(action, appointment) {
    setActionError('');
    setPending({ action, appointment });
  }

  function closeAction() {
    if (!working) setPending(null);
  }

  async function confirmAction() {
    setWorking(true);
    setActionError('');

    try {
      await updateAdminAppointment(pending.appointment.id, pending.action);
      setNotice(ACTIONS[pending.action].done);
      setPending(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setWorking(false);
    }
  }

  const rows = data?.content ?? [];
  const config = pending ? ACTIONS[pending.action] : null;

  return (
    <section className="page">
      <header className="page-head">
        <h1>Appointments</h1>
        <p className="page-sub">
          Review bookings, confirm visits and record what happened.
        </p>
      </header>

      <div className="filters filters-4">
        <select
          className="input"
          aria-label="Doctor"
          value={filters.doctorId}
          onChange={updateFilter('doctorId')}
        >
          <option value="">All doctors</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} — {doctor.specialization}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="input"
          aria-label="Date"
          value={filters.date}
          onChange={updateFilter('date')}
        />
        <select
          className="input"
          aria-label="Status"
          value={filters.status}
          onChange={updateFilter('status')}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-outline"
          disabled={!hasFilters}
          onClick={clearFilters}
        >
          Clear
        </button>
      </div>

      {notice && (
        <div className="notice-success" role="status">
          {notice}
        </div>
      )}

      {loadStatus === 'loading' && !data ? (
        <div className="card skeleton table-skeleton" aria-hidden="true" />
      ) : loadStatus === 'error' ? (
        <div className="state-box" role="alert">
          <p>We couldn't load appointments right now.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="state-box">
          <p>
            {hasFilters
              ? 'No appointments match these filters.'
              : 'There are no appointments yet.'}
          </p>
          {hasFilters && (
            <button type="button" className="btn" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div
            className={`table-wrap${loadStatus === 'loading' ? ' is-loading' : ''}`}
          >
            <table className="table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>
                      <div className="cell-title">
                        {formatDate(appointment.slot.date)}
                      </div>
                      <div className="muted">
                        {formatTime(appointment.slot.startTime)} –{' '}
                        {formatTime(appointment.slot.endTime)}
                      </div>
                    </td>
                    <td>
                      <div className="cell-title">
                        {appointment.employee.name}
                      </div>
                      <div className="muted">
                        {appointment.employee.employeeCode}
                        {appointment.employee.plantLocation &&
                          ` · ${appointment.employee.plantLocation}`}
                      </div>
                      {appointment.reason && (
                        <div className="cell-reason">
                          “{appointment.reason}”
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="cell-title">{appointment.doctor.name}</div>
                      <div className="muted">
                        {appointment.doctor.specialization}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td>
                      <div className="cell-actions">
                        <RowActions
                          appointment={appointment}
                          onAction={openAction}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            label="appointments"
            onChange={setPage}
          />
        </>
      )}

      {pending && (
        <ConfirmDialog
          title={config.title}
          confirmLabel={config.confirmLabel}
          cancelLabel={config.cancelLabel}
          danger={config.danger}
          busy={working}
          error={actionError}
          onConfirm={confirmAction}
          onCancel={closeAction}
        >
          <p>
            <strong>{pending.appointment.employee.name}</strong> with{' '}
            {pending.appointment.doctor.name}
            <br />
            {formatDate(pending.appointment.slot.date)} at{' '}
            {formatTime(pending.appointment.slot.startTime)}
          </p>
          {pending.action === 'cancel' && (
            <p className="muted">
              The slot will be released and the employee will see this
              appointment as cancelled.
            </p>
          )}
        </ConfirmDialog>
      )}
    </section>
  );
}
