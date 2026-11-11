import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BarChart from '../components/BarChart';
import DashboardArt from '../components/DashboardArt';
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  PulseIcon,
  UsersIcon,
} from '../components/Icons';
import StatusBadge from '../components/StatusBadge';
import {
  fetchAdminAppointments,
  fetchAdminDoctors,
  fetchDashboard,
  updateAdminAppointment,
} from '../api/adminApi';
import { getErrorMessage } from '../utils/errors';
import {
  formatDate,
  formatTime,
  toISODate,
  upcomingDates,
} from '../utils/format';

const STATUS_META = [
  ['BOOKED', 'Booked', '#2f64b0'],
  ['CONFIRMED', 'Confirmed', '#2a8a50'],
  ['COMPLETED', 'Completed', '#111111'],
  ['NO_SHOW', 'No-show', '#d19a2a'],
  ['CANCELLED', 'Cancelled', '#c8493b'],
];

const live = (list) => list.filter((item) => item.status !== 'CANCELLED');
const startsAt = (slot) => new Date(`${slot.date}T${slot.startTime}`);

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Same name always gets the same soft colour, so people are easy to spot
function Avatar({ name }) {
  let hue = 0;
  for (const char of name) hue = (hue * 31 + char.charCodeAt(0)) % 360;
  const letters = name
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span
      className="avatar avatar-sm"
      aria-hidden="true"
      style={{
        background: `hsl(${hue} 38% 91%)`,
        color: `hsl(${hue} 45% 26%)`,
      }}
    >
      {letters}
    </span>
  );
}

function StatCard({ to, icon, label, value, hint, attention = false }) {
  return (
    <Link
      to={to}
      className={`card stat-card${attention ? ' is-attention' : ''}`}
    >
      <span className="stat-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon">{icon}</span>
      </span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-hint">{hint}</span>
    </Link>
  );
}

function Unavailable({ onRetry }) {
  return (
    <div className="dash-empty" role="alert">
      <p>This couldn’t be loaded.</p>
      <button type="button" className="btn btn-sm" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

export default function AdminDashboardPage() {
  const today = toISODate(new Date());

  const [stats, setStats] = useState(null);
  const [statsStatus, setStatsStatus] = useState('loading'); // loading | ready | error
  const [statsKey, setStatsKey] = useState(0);

  const [overview, setOverview] = useState(null);
  const [overviewError, setOverviewError] = useState(false);
  const [overviewKey, setOverviewKey] = useState(0);

  const [confirmingId, setConfirmingId] = useState(null);
  const [notice, setNotice] = useState({ kind: '', text: '' });

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
    setOverviewError(false);

    const dates = upcomingDates(7);

    Promise.all([
      fetchAdminAppointments({ date: dates[0], page: 0, size: 100 }),
      Promise.all(
        dates
          .slice(1)
          .map((date) => fetchAdminAppointments({ date, page: 0, size: 100 }))
      ),
      fetchAdminAppointments({ status: 'BOOKED', page: 0, size: 50 }),
      fetchAdminDoctors({ isActive: 'true' }),
    ])
      .then(([todayPage, weekPages, pendingPage, doctors]) => {
        if (cancelled) return;

        const week = dates.map((date, index) => {
          const list =
            index === 0 ? todayPage.content : weekPages[index - 1].content;
          const parsed = new Date(`${date}T00:00:00`);
          return {
            label: parsed.toLocaleDateString('en-IN', { weekday: 'short' }),
            sub: parsed.toLocaleDateString('en-IN', { day: 'numeric' }),
            value: live(list).length,
            isToday: index === 0,
          };
        });

        const now = new Date();
        const pending = pendingPage.content
          .filter((item) => startsAt(item.slot) > now)
          .sort((a, b) => startsAt(a.slot) - startsAt(b.slot))
          .slice(0, 5);

        setOverview({ today: todayPage.content, week, pending, doctors });
      })
      .catch(() => {
        if (!cancelled) setOverviewError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [overviewKey]);

  async function confirmOne(appointment) {
    setConfirmingId(appointment.id);
    setNotice({ kind: '', text: '' });

    try {
      await updateAdminAppointment(appointment.id, 'confirm');
      setNotice({
        kind: 'success',
        text: `${appointment.employee.name}’s appointment is confirmed.`,
      });
      setStatsKey((key) => key + 1);
      setOverviewKey((key) => key + 1);
    } catch (error) {
      setNotice({ kind: 'error', text: getErrorMessage(error) });
    } finally {
      setConfirmingId(null);
    }
  }

  const retryOverview = () => {
    setOverview(null);
    setOverviewKey((key) => key + 1);
  };

  // ----- Derived numbers for today -----
  const todays = overview ? overview.today : [];
  const todaysLive = live(todays).sort((a, b) =>
    a.slot.startTime.localeCompare(b.slot.startTime)
  );

  const statusCounts = STATUS_META.map(([key, label, color]) => ({
    key,
    label,
    color,
    count: todays.filter((item) => item.status === key).length,
  }));
  const statusTotal = statusCounts.reduce((sum, item) => sum + item.count, 0);

  const doctorLoad = overview
    ? overview.doctors
        .map((doctor) => ({
          doctor,
          count: todaysLive.filter((item) => item.doctor.id === doctor.id)
            .length,
        }))
        .sort((a, b) => b.count - a.count || a.doctor.name.localeCompare(b.doctor.name))
        .slice(0, 6)
    : [];
  const maxLoad = Math.max(...doctorLoad.map((item) => item.count), 1);

  const summary =
    statsStatus === 'ready'
      ? `You have ${stats.todayAppointments} appointment${
          stats.todayAppointments === 1 ? '' : 's'
        } today and ${stats.pendingAppointments} waiting for confirmation.`
      : 'Here’s what is happening at your hospital today.';

  return (
    <section className="page dash">
      {/* ---------- Banner ---------- */}
      <div className="dash-hero">
        <div className="dash-hero-copy">
          <p className="dash-eyebrow">
            {stats?.hospitalName ? `${stats.hospitalName} · ` : ''}
            {formatDate(today)}
          </p>
          <h1>{greeting()}.</h1>
          <p className="dash-summary">{summary}</p>
          <div className="dash-hero-actions">
            <Link to="/admin/appointments" className="btn btn-light">
              Review appointments
            </Link>
            <Link to="/admin/doctors" className="btn btn-ghost-light">
              Manage doctors
            </Link>
          </div>
        </div>
        <DashboardArt />
      </div>

      {notice.text && (
        <div
          className={notice.kind === 'error' ? 'alert-error' : 'notice-success'}
          role={notice.kind === 'error' ? 'alert' : 'status'}
          style={{ marginTop: 24 }}
        >
          {notice.text}
        </div>
      )}

      {/* ---------- Key numbers ---------- */}
      {statsStatus === 'error' ? (
        <div className="state-box dash-block" role="alert">
          <p>We couldn’t load the dashboard numbers.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setStatsKey((key) => key + 1)}
          >
            Try again
          </button>
        </div>
      ) : statsStatus === 'loading' ? (
        <div className="stat-grid dash-block" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="card skeleton stat-skeleton" />
          ))}
        </div>
      ) : (
        <div className="stat-grid dash-block">
          <StatCard
            to="/admin/appointments"
            icon={<CalendarIcon />}
            label="Today"
            value={stats.todayAppointments}
            hint="Scheduled appointments"
          />
          <StatCard
            to="/admin/appointments"
            icon={<ClockIcon />}
            label="Awaiting"
            value={stats.pendingAppointments}
            hint="Booked, not yet confirmed"
            attention={stats.pendingAppointments > 0}
          />
          <StatCard
            to="/admin/appointments"
            icon={<CheckIcon />}
            label="Completed"
            value={stats.completedToday}
            hint="Visits finished today"
          />
          <StatCard
            to="/admin/doctors"
            icon={<UsersIcon />}
            label="Doctors"
            value={stats.totalDoctors}
            hint="At this hospital"
          />
          <StatCard
            to="/admin/doctors"
            icon={<PulseIcon />}
            label="On duty"
            value={stats.doctorsAvailableToday}
            hint="Available today"
          />
        </div>
      )}

      {/* ---------- Chart and status ---------- */}
      <div className="dash-grid dash-grid-wide">
        <div className="card dash-card">
          <div className="dash-card-head">
            <h2>Next 7 days</h2>
            <span className="muted">Bookings per day</span>
          </div>
          {overviewError ? (
            <Unavailable onRetry={retryOverview} />
          ) : !overview ? (
            <div className="skeleton dash-skeleton" aria-hidden="true" />
          ) : (
            <BarChart data={overview.week} />
          )}
        </div>

        <div className="card dash-card">
          <div className="dash-card-head">
            <h2>Today by status</h2>
            <span className="muted">{statusTotal} total</span>
          </div>
          {overviewError ? (
            <Unavailable onRetry={retryOverview} />
          ) : !overview ? (
            <div className="skeleton dash-skeleton" aria-hidden="true" />
          ) : statusTotal === 0 ? (
            <div className="dash-empty">
              <p>No appointments today.</p>
            </div>
          ) : (
            <>
              <div className="status-bar" role="img" aria-label="Today’s appointments by status">
                {statusCounts
                  .filter((item) => item.count > 0)
                  .map((item) => (
                    <span
                      key={item.key}
                      title={`${item.label}: ${item.count}`}
                      style={{
                        width: `${(item.count / statusTotal) * 100}%`,
                        background: item.color,
                      }}
                    />
                  ))}
              </div>
              <ul className="status-legend">
                {statusCounts.map((item) => (
                  <li key={item.key}>
                    <span className="status-dot" style={{ background: item.color }} />
                    <span>{item.label}</span>
                    <strong>{item.count}</strong>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* ---------- Queue and doctors ---------- */}
      <div className="dash-grid dash-grid-even">
        <div className="card dash-card">
          <div className="dash-card-head">
            <h2>Needs your confirmation</h2>
            <Link to="/admin/appointments" className="btn-link">
              View all
            </Link>
          </div>
          {overviewError ? (
            <Unavailable onRetry={retryOverview} />
          ) : !overview ? (
            <div className="skeleton dash-skeleton" aria-hidden="true" />
          ) : overview.pending.length === 0 ? (
            <div className="dash-empty">
              <p>You’re all caught up. Nothing is waiting.</p>
            </div>
          ) : (
            <ul className="dash-list">
              {overview.pending.map((item) => (
                <li key={item.id} className="dash-row">
                  <Avatar name={item.employee.name} />
                  <span className="dash-row-main">
                    <strong>{item.employee.name}</strong>
                    <span className="muted">
                      {item.doctor.name} · {formatDate(item.slot.date)},{' '}
                      {formatTime(item.slot.startTime)}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    disabled={confirmingId === item.id}
                    onClick={() => confirmOne(item)}
                  >
                    {confirmingId === item.id ? 'Confirming…' : 'Confirm'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card dash-card">
          <div className="dash-card-head">
            <h2>Doctors today</h2>
            <Link to="/admin/doctors" className="btn-link">
              Manage
            </Link>
          </div>
          {overviewError ? (
            <Unavailable onRetry={retryOverview} />
          ) : !overview ? (
            <div className="skeleton dash-skeleton" aria-hidden="true" />
          ) : doctorLoad.length === 0 ? (
            <div className="dash-empty">
              <p>No active doctors yet.</p>
            </div>
          ) : (
            <ul className="dash-list">
              {doctorLoad.map(({ doctor, count }) => (
                <li key={doctor.id} className="dash-row">
                  <Avatar name={doctor.name} />
                  <span className="dash-row-main">
                    <strong>{doctor.name}</strong>
                    <span className="muted">{doctor.specialization}</span>
                  </span>
                  <span className="load">
                    <span className="load-track">
                      <span
                        className="load-fill"
                        style={{ width: `${(count / maxLoad) * 100}%` }}
                      />
                    </span>
                    <strong>{count}</strong>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ---------- Today's schedule ---------- */}
      <div className="section-head">
        <h2 className="section-title">Today’s schedule</h2>
        <Link to="/admin/appointments" className="btn-link">
          View all appointments
        </Link>
      </div>

      {overviewError ? (
        <div className="state-box" role="alert">
          <p>We couldn’t load today’s schedule.</p>
          <button type="button" className="btn btn-primary" onClick={retryOverview}>
            Try again
          </button>
        </div>
      ) : !overview ? (
        <div className="card skeleton schedule-skeleton" aria-hidden="true" />
      ) : todaysLive.length === 0 ? (
        <div className="state-box">
          <p>No appointments scheduled for today.</p>
        </div>
      ) : (
        <>
          <ul className="card schedule-list">
            {todaysLive.slice(0, 8).map((item) => (
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
          {todaysLive.length > 8 && (
            <p className="muted schedule-more">
              And {todaysLive.length - 8} more today.
            </p>
          )}
        </>
      )}
    </section>
  );
}
