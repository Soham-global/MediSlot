// "2026-11-02" -> "Mon, 2 Nov 2026"
export function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// "14:30:00" -> "2:30 pm"
export function formatTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Date -> "YYYY-MM-DD" using the LOCAL date (toISOString would use UTC
// and can show the wrong day late at night)
export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Today plus the next (count - 1) days, as "YYYY-MM-DD" strings
export function upcomingDates(count = 14) {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return toISODate(date);
  });
}
