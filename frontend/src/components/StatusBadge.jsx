const labels = {
  BOOKED: "Booked",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  NO_SHOW: "No show",
  AVAILABLE: "Available",
  BLOCKED: "Blocked",
};

export default function StatusBadge({ status }) {
  const key = status || "BOOKED";
  return (
    <span className={`status-badge status-badge--${key.toLowerCase()}`}>
      <span aria-hidden="true" />
      {labels[key] || status}
    </span>
  );
}
