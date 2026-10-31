import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { fetchAdminAppointments, fetchDashboard } from '../api/adminApi';
import { formatDate, formatTime, toISODate } from '../utils/format';

const SCHEDULE_LIMIT = 8;

function StatCard({ to, label, value, hint, attention = false }) {
  return (
    <Link
      to={to}
      className={`card stat-card${attention ? ' is-attention' : ''}`}
    >
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-hint">{hint}</span>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const today = toISODate(new Date());

  const [stats, setStats] = useState(null);
  const [statsStatus, setStatsStatus] = useState('loading'); // loading | ready | error
  const [statsKey, setStatsKey] = useState(0);

  const [schedule, setSchedule] = useState(null);
  const [scheduleStatus, setScheduleStatus] = useState('loading');
  const [scheduleKey, setScheduleKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatsStatus('loading');

    fetchDashboard()
      .then((data) => {
        if (cancelled) return;
        setStats(data);
        setStatsStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatsStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [statsKey]);

  useEffect(() => {
    let cancelled = false;
    setScheduleStatus('loading');

    fetchAdminAppointments({ date: today, page: 0, size: 50 })
      .then((data) => {
        if (cancelled) return;
        setSchedule(data);
        setScheduleStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setScheduleStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [today, scheduleKey]);

  // Earliest first, and cancelled ones stay out of today's plan
  const todays = (schedule?.content ?? [])
    .filter((item) => item.status !== 'CANCELLED')
    .sort((a, b) => a.slot.startTime.localeCompare(b.slot.startTime));

  return (
    <section className="page">
      <header className="page-head">
        <h1>Dashboard</h1>
        <p className="page-sub">
          {stats?.hospitalName
            ? `${stats.hospitalName} · ${formatDate(today)}`
            : formatDate(today)}
        </p>
      </header>

      {statsStatus === 'error' ? (
        <div className="state-box" role="alert">
          <p>We couldn't load the dashboard numbers.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setStatsKey((key) => key + 1)}
          >
            Try again
          </button>
        </div>
      ) : statsStatus === 'loading' ? (
        <div className="stat-grid" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="card skeleton stat-skeleton" />
          ))}
        </div>
      ) : (
        <div className="stat-grid">
          <StatCard
            to="/admin/appointments"
            label="Today's appointments"
            value={stats.todayAppointments}
            hint="Scheduled for today"
          />
          <StatCard
            to="/admin/appointments"
            label="Awaiting confirmation"
            value={stats.pendingAppointments}
            hint="Booked, not yet confirmed"
            attention={stats.pendingAppointments > 0}
          />
          <StatCard
            to="/admin/appointments"
            label="Completed today"
            value={stats.completedToday}
            hint="Visits finished"
          />
          <StatCard
            to="/admin/doctors"
            label="Doctors"
            value={stats.totalDoctors}
            hint="At this hospital"
          />
          <StatCard
            to="/admin/doctors"
            label="Available today"
            value={stats.doctorsAvailableToday}
            hint="Doctors on duty"
          />
        </div>
      )}

      <div className="section-head">
        <h2 className="section-title">Today's schedule</h2>
        <Link to="/admin/appointments" className="btn-link">
          View all appointments
        </Link>
      </div>

      {scheduleStatus === 'loading' ? (
        <div className="card skeleton schedule-skeleton" aria-hidden="true" />
      ) : scheduleStatus === 'error' ? (
        <div className="state-box" role="alert">
          <p>We couldn't load today's schedule.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setScheduleKey((key) => key + 1)}
          >
            Try again
          </button>
        </div>
      ) : todays.length === 0 ? (
        <div className="state-box">
          <p>No appointments scheduled for today.</p>
        </div>
      ) : (
        <>
          <ul className="card schedule-list">
            {todays.slice(0, SCHEDULE_LIMIT).map((item) => (
              <li key={item.id} className="schedule-row">
                <span className="schedule-time">
                  {formatTime(item.slot.startTime)}
                </span>
                <span className="schedule-who">
                  <strong>{item.employee.name}</strong>
                  <span className="muted">
                    with {item.doctor.name} · {item.doctor.specialization}
                  </span>
                </span>
                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
          {todays.length > SCHEDULE_LIMIT && (
            <p className="muted schedule-more">
              And {todays.length - SCHEDULE_LIMIT} more today.
            </p>
          )}
        </>
      )}
    </section>
  );
}
