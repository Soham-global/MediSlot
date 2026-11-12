import { useEffect, useState } from 'react';
import Avatar, { coverBackground } from '../components/Avatar';
import BookingModal from '../components/BookingModal';
import { ArrowIcon, PinIcon, SearchIcon } from '../components/Icons';
import {
  fetchDepartments,
  fetchDoctors,
  fetchHospitals,
} from '../api/doctorsApi';
import useDebounced from '../utils/useDebounced';

function DoctorCard({ doctor, index, onBook }) {
  return (
    <article className="card doctor-card" style={{ '--i': Math.min(index, 8) }}>
      <div
        className="doctor-cover"
        style={{ background: coverBackground(doctor.name) }}
      />
      <div className="doctor-body">
        <Avatar name={doctor.name} size="lg" />

        <div>
          <span className="tag">{doctor.specialization}</span>
          <h2 className="doctor-name">{doctor.name}</h2>
          <p className="doctor-place">
            <PinIcon size={15} />
            {doctor.hospital.name}, {doctor.hospital.city}
          </p>
        </div>

        <dl className="doctor-facts">
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
          className="btn btn-primary btn-arrow"
          onClick={() => onBook(doctor)}
        >
          View available times
          <ArrowIcon size={16} />
        </button>
      </div>
    </article>
  );
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

  useEffect(() => {
    Promise.all([fetchHospitals(), fetchDepartments()])
      .then(([h, d]) => {
        setHospitals(h);
        setDepartments(d);
      })
      .catch(() => {});
  }, []);

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
      cancelled = true;
    };
  }, [filters.hospitalId, filters.departmentId, debouncedName, reloadKey]);

  const hasFilters = Object.values(filters).some(Boolean);

  function setFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="page">
      <header className="page-head">
        <p className="eyebrow">Find care</p>
        <h1>Find a doctor</h1>
        <p className="page-sub">
          Search by name, choose a specialty, and pick a time that suits you.
        </p>
      </header>

      <div className="search-row">
        <div className="search-field">
          <SearchIcon size={18} />
          <input
            type="search"
            className="input"
            placeholder="Search by doctor name"
            aria-label="Search by doctor name"
            value={filters.name}
            onChange={(event) => setFilter('name', event.target.value)}
          />
        </div>
        <select
          className="input"
          aria-label="Hospital"
          value={filters.hospitalId}
          onChange={(event) => setFilter('hospitalId', event.target.value)}
        >
          <option value="">All hospitals</option>
          {hospitals.map((hospital) => (
            <option key={hospital.id} value={hospital.id}>
              {hospital.name}
            </option>
          ))}
        </select>
      </div>

      <div className="chips" role="group" aria-label="Specialty">
        <button
          type="button"
          className={`chip${filters.departmentId === '' ? ' is-active' : ''}`}
          aria-pressed={filters.departmentId === ''}
          onClick={() => setFilter('departmentId', '')}
        >
          All specialties
        </button>
        {departments.map((department) => {
          const active = filters.departmentId === String(department.id);
          return (
            <button
              key={department.id}
              type="button"
              className={`chip${active ? ' is-active' : ''}`}
              aria-pressed={active}
              onClick={() => setFilter('departmentId', String(department.id))}
            >
              {department.name}
            </button>
          );
        })}
      </div>

      {status === 'error' ? (
        <div className="state-box result-gap" role="alert">
          <p>We couldn’t load doctors right now.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </button>
        </div>
      ) : status === 'loading' ? (
        <div className="doctor-grid result-gap" aria-hidden="true">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card skeleton doctor-skeleton" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="state-box result-gap">
          <p>No doctors match your search.</p>
          {hasFilters && (
            <button
              type="button"
              className="btn"
              onClick={() =>
                setFilters({ hospitalId: '', departmentId: '', name: '' })
              }
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="muted result-count">
            {doctors.length} doctor{doctors.length === 1 ? '' : 's'} available
          </p>
          <div className="doctor-grid stagger">
            {doctors.map((doctor, index) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                index={index}
                onBook={setBookingDoctor}
              />
            ))}
          </div>
        </>
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
