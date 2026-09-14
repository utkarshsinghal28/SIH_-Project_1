import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { formatDate, formatTimeRange } from '../../utils/format.js';
import paths from '../../routes/paths.js';

export default function BookingCard({ booking, compact = false }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Booking reference
          </p>
          <p className="font-mono text-base font-bold text-slate-900">{booking.reference}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <dl className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Centre</dt>
          <dd className="truncate text-sm text-slate-800" title={booking.centreName}>
            {booking.centreName}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date</dt>
          <dd className="text-sm text-slate-800">{formatDate(booking.date)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Slot</dt>
          <dd className="text-sm text-slate-800">
            {formatTimeRange(booking.startTime, booking.endTime)}
          </dd>
        </div>
      </dl>

      {!compact && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <Button to={paths.farmerBooking(booking.id)} variant="secondary" size="sm">
            View booking details
          </Button>
        </div>
      )}
    </article>
  );
}
