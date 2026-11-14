export function Skeleton({ width, height = "1rem", radius = "8px", className = "" }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function DoctorCardSkeleton() {
  return (
    <div className="doctor-row doctor-row--skeleton" aria-hidden="true">
      <Skeleton
        width="60px"
        height="60px"
        radius="999px"
        className="doctor-row__skeleton-avatar"
      />
      <div className="doctor-row__skeleton-stack">
        <Skeleton width="72%" height="1rem" />
        <Skeleton width="48%" height="0.875rem" />
        <Skeleton width="36%" height="0.75rem" />
      </div>
      <div className="doctor-row__skeleton-meta">
        <Skeleton width="64px" height="0.875rem" />
        <Skeleton width="140px" height="0.875rem" />
      </div>
      <div className="doctor-row__side">
        <Skeleton width="116px" height="30px" radius="999px" />
        <Skeleton width="104px" height="40px" radius="999px" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 4 }) {
  return (
    <div className="doctor-list" aria-label="Loading doctors" role="status">
      {Array.from({ length: count }).map((_, index) => (
        <DoctorCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function AppointmentSkeleton() {
  return (
    <div className="appointment-card appointment-card--skeleton" aria-hidden="true">
      <div className="stack" style={{ gap: "0.55rem" }}>
        <Skeleton width="38%" height="1.05rem" />
        <Skeleton width="58%" height="0.8rem" />
        <Skeleton width="46%" height="0.8rem" />
      </div>
      <Skeleton width="104px" height="2.4rem" radius="12px" />
    </div>
  );
}
