const LABELS = {
  BOOKED: 'Booked',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  NO_SHOW: 'No-show',
};

export default function StatusBadge({ status }) {
  const key = status.toLowerCase().replace('_', '-');
  return <span className={`badge badge-${key}`}>{LABELS[status] ?? status}</span>;
}
