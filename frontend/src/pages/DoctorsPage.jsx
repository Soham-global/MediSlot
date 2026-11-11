import { useEffect, useState } from 'react';
import BookingModal from '../components/BookingModal';
import {
  fetchDepartments,
  fetchDoctors,
  fetchHospitals,
} from '../api/doctorsApi';

function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function initials(name) {
  return name
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function DoctorCard({ doctor, onBook }) {
  return (
    <article className="card doctor-card">
      <div className="doctor-top">
        <span className="avatar" aria-hidden="true">
          {initials(doctor.name)}
        </span>
        <div>
          <h2 className="doctor-name">{doctor.name}</h2>
          <p className="muted">{doctor.specialization}</p>
        </div>
      </div>

      <dl className="doctor-meta">
        <div>
          <dt>Hospital</dt>
          <dd>
            {doctor.hospital.name}, {doctor.hospital.city}
          </dd>
        </div>
        <div>
          <dt>Experience</dt>
          <dd>{doctor.experienceYears} years</dd>
        </div>
        <div>
          <dt>Qualification</dt>
          <dd>{doctor.qualification}</dd>
        </div>
      </dl>

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => onBook(doctor)}
      >
        View slots
      </button>
    </article>
  );
}

function SkeletonCard() {
  return <div className="card skeleton" aria-hidden="true" />;
}

export default function DoctorsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    hospitalId: '',
    departmentId: '',
    name: '',
  });
  const debouncedName = useDebounced(filters.name);

  const [doctors, setDoctors] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [reloadKey, setReloadKey] = useState(0);
  const [bookingDoctor, setBookingDoctor] = useState(null);

  // Dropdown options: load once
  useEffect(() => {
    Promise.all([fetchHospitals(), fetchDepartments()])
      .then(([h, d]) => {
        setHospitals(h);
        setDepartments(d);
      })
      .catch(() => {});
  }, []);

  // Doctors: reload whenever a filter changes
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    fetchDoctors({
      hospitalId: filters.hospitalId,
      departmentId: filters.departmentId,
      name: debouncedName.trim(),
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
      cancelled = true; // ignore stale responses
    };
  }, [filters.hospitalId, filters.departmentId, debouncedName, reloadKey]);

  function updateFilter(key) {
    return (event) =>
      setFilters((current) => ({ ...current, [key]: event.target.value }));
  }

  return (
    <section className="page">
      <header className="page-head">
        <h1>Find a doctor</h1>
        <p className="page-sub">
          Choose a hospital or department, then pick a time that suits you.
        </p>
      </header>

      <div className="filters">
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
          aria-label="Hospital"
          value={filters.hospitalId}
          onChange={updateFilter('hospitalId')}
        >
          <option value="">All hospitals</option>
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
        <select
          className="input"
          aria-label="Department"
          value={filters.departmentId}
          onChange={updateFilter('departmentId')}
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {status === 'error' ? (
        <div className="state-box" role="alert">
          <p>We couldn't load doctors right now.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            Try again
          </button>
        </div>
      ) : status === 'loading' ? (
        <div className="doctor-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="state-box">
          <p>No doctors match these filters.</p>
        </div>
      ) : (
        <div className="doctor-grid">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onBook={setBookingDoctor}
            />
          ))}
        </div>
      )}

      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
        />
      )}
    </section>
  );
}
