import { useEffect, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import DoctorFormModal from '../components/DoctorFormModal';
import {
  deleteAdminDoctor,
  fetchAdminDepartments,
  fetchAdminDoctors,
  setAdminDoctorActive,
} from '../api/adminApi';
import { getErrorMessage } from '../utils/errors';
import useDebounced from '../utils/useDebounced';

export default function AdminDoctorsPage() {
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    departmentId: '',
    isActive: '',
  });
  const debouncedName = useDebounced(filters.name);

  const [doctors, setDoctors] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [reloadKey, setReloadKey] = useState(0);

  const [form, setForm] = useState(null); // null | { doctor: null | doctor }
  const [pending, setPending] = useState(null); // { type: 'deactivate' | 'delete', doctor }
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null); // doctor being activated
  const [notice, setNotice] = useState({ kind: '', text: '' });

  useEffect(() => {
    fetchAdminDepartments()
      .then(setDepartments)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    fetchAdminDoctors({
      name: debouncedName.trim(),
      departmentId: filters.departmentId,
      isActive: filters.isActive,
    })
      .then((data) => {
        if (cancelled) return;
        setDoctors(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedName, filters.departmentId, filters.isActive, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);
  const hasFilters = Object.values(filters).some(Boolean);

  function updateFilter(key) {
    return (event) => {
      setNotice({ kind: '', text: '' });
      setFilters((current) => ({ ...current, [key]: event.target.value }));
    };
  }

  function clearFilters() {
    setFilters({ name: '', departmentId: '', isActive: '' });
  }

  function handleSaved(saved, mode) {
    setForm(null);
    setNotice({ kind: 'success', text: `${saved.name} was ${mode}.` });
    reload();
  }

  async function activate(doctor) {
    setBusyId(doctor.id);
    setNotice({ kind: '', text: '' });
    try {
      await setAdminDoctorActive(doctor.id, true);
      setNotice({
        kind: 'success',
        text: `${doctor.name} is active again and can be booked.`,
      });
      reload();
    } catch (error) {
      setNotice({ kind: 'error', text: getErrorMessage(error) });
    } finally {
      setBusyId(null);
    }
  }

  function openPending(type, doctor) {
    setActionError('');
    setPending({ type, doctor });
  }

  function closePending() {
    if (!working) setPending(null);
  }

  async function confirmPending() {
    const { type, doctor } = pending;
    setWorking(true);
    setActionError('');

    try {
      if (type === 'deactivate') {
        const result = await setAdminDoctorActive(doctor.id, false);
        const count = result.upcomingAppointments;
        setNotice({
          kind: 'success',
          text:
            count > 0
              ? `${doctor.name} is now inactive. ${count} upcoming appointment${
                  count === 1 ? ' is' : 's are'
                } still scheduled, so please review them under Appointments.`
              : `${doctor.name} is now inactive.`,
        });
      } else {
        await deleteAdminDoctor(doctor.id);
        setNotice({ kind: 'success', text: `${doctor.name} was deleted.` });
      }
      setPending(null);
      reload();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="page">
      <header className="page-head page-head-row">
        <div>
          <h1>Doctors</h1>
          <p className="page-sub">
            Manage who patients can book at your hospital.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setForm({ doctor: null })}
        >
          + Add doctor
        </button>
      </header>

      <div className="filters filters-4">
        <input
          type="search"
          className="input"
          placeholder="Search by doctor name"
          aria-label="Search by doctor name"
          value={filters.name}
          onChange={updateFilter('name')}
        />
        <select
          className="input"
          aria-label="Department"
          value={filters.departmentId}
          onChange={updateFilter('departmentId')}
        >
          <option value="">All departments</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
        <select
          className="input"
          aria-label="Status"
          value={filters.isActive}
          onChange={updateFilter('isActive')}
        >
          <option value="">All doctors</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
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

      {notice.text && (
        <div
          className={notice.kind === 'error' ? 'alert-error' : 'notice-success'}
          role={notice.kind === 'error' ? 'alert' : 'status'}
        >
          {notice.text}
        </div>
      )}

      {status === 'loading' && doctors.length === 0 ? (
        <div className="card skeleton table-skeleton" aria-hidden="true" />
      ) : status === 'error' ? (
        <div className="state-box" role="alert">
          <p>We couldn't load doctors right now.</p>
          <button type="button" className="btn btn-primary" onClick={reload}>
            Try again
          </button>
        </div>
      ) : doctors.length === 0 ? (
        <div className="state-box">
          <p>
            {hasFilters
              ? 'No doctors match these filters.'
              : 'No doctors yet. Add the first one.'}
          </p>
          {hasFilters ? (
            <button type="button" className="btn" onClick={clearFilters}>
              Clear filters
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setForm({ doctor: null })}
            >
              + Add doctor
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="muted table-count">
            {doctors.length} doctor{doctors.length === 1 ? '' : 's'}
          </p>
          <div
            className={`table-wrap${status === 'loading' ? ' is-loading' : ''}`}
          >
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>
                      <div className="cell-title">{doctor.name}</div>
                      <div className="muted">{doctor.qualification}</div>
                    </td>
                    <td>
                      <div className="cell-title">{doctor.department.name}</div>
                      <div className="muted">{doctor.specialization}</div>
                    </td>
                    <td>{doctor.experienceYears} years</td>
                    <td>
                      <span
                        className={`badge ${
                          doctor.isActive ? 'badge-active' : 'badge-inactive'
                        }`}
                      >
                        {doctor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="cell-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => setForm({ doctor })}
                        >
                          Edit
                        </button>
                        {doctor.isActive ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={() => openPending('deactivate', doctor)}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            disabled={busyId === doctor.id}
                            onClick={() => activate(doctor)}
                          >
                            {busyId === doctor.id ? 'Activating…' : 'Activate'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => openPending('delete', doctor)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {form && (
        <DoctorFormModal
          doctor={form.doctor}
          departments={departments}
          onClose={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}

      {pending && pending.type === 'deactivate' && (
        <ConfirmDialog
          title={`Deactivate ${pending.doctor.name}?`}
          confirmLabel="Deactivate"
          cancelLabel="Keep active"
          danger
          busy={working}
          error={actionError}
          onConfirm={confirmPending}
          onCancel={closePending}
        >
          <p>Patients will no longer be able to book this doctor.</p>
          <p className="muted">
            Appointments that are already booked are not cancelled. You can
            activate the doctor again at any time.
          </p>
        </ConfirmDialog>
      )}

      {pending && pending.type === 'delete' && (
        <ConfirmDialog
          title={`Delete ${pending.doctor.name}?`}
          confirmLabel="Delete permanently"
          cancelLabel="Keep doctor"
          danger
          busy={working}
          error={actionError}
          onConfirm={confirmPending}
          onCancel={closePending}
        >
          <p>This removes the doctor and their schedule for good.</p>
          <p className="muted">
            Doctors who have had appointments can't be deleted. Deactivate them
            instead.
          </p>
        </ConfirmDialog>
      )}
    </section>
  );
}
