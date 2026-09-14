/** Small, dependency-free formatting helpers. */

/** "2026-02-14" -> "Sat, 14 Feb 2026" */
export function formatDate(isoDate) {
  if (!isoDate) return '—';
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** "2026-02-14" -> "14 Feb" (compact, for tables on mobile) */
export function formatDateShort(isoDate) {
  if (!isoDate) return '—';
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

/** "14:30" -> "2:30 PM" */
export function formatTime(time24) {
  if (!time24) return '—';
  const [hourText, minuteText] = String(time24).split(':');
  const hour = Number(hourText);
  if (Number.isNaN(hour)) return time24;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minuteText ?? '00'} ${suffix}`;
}

/** "10:00", "11:00" -> "10:00 AM – 11:00 AM" */
export function formatTimeRange(start, end) {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/** ISO timestamp -> "14 Feb 2026, 10:05 AM" */
export function formatDateTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function todayISO() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

export function pluralise(count, singular, plural) {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}
