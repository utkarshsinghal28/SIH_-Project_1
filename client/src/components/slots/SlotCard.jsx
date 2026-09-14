import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { SLOT_STATUS } from '../../utils/constants.js';
import { formatTimeRange } from '../../utils/format.js';

export default function SlotCard({ slot, onBook, booking = false }) {
  const available = Math.max(0, slot.maxBookings - slot.bookedCount);
  const bookable = slot.status === SLOT_STATUS.ACTIVE && available > 0;
  const filledPercent = Math.min(100, Math.round((slot.bookedCount / slot.maxBookings) * 100));

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold text-slate-900">
          {formatTimeRange(slot.startTime, slot.endTime)}
        </p>
        <StatusBadge status={slot.status} size="sm" />
      </div>

      <p className="mt-2 text-sm text-slate-700">
        Available:{' '}
        <span className="font-semibold text-slate-900">
          {available} / {slot.maxBookings}
        </span>
      </p>

      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200"
        role="img"
        aria-label={`${filledPercent}% of this slot is booked`}
      >
        <div
          className={`h-full ${filledPercent >= 90 ? 'bg-amber-500' : 'bg-brand-600'}`}
          style={{ width: `${filledPercent}%` }}
        />
      </div>

      <div className="mt-4">
        {bookable ? (
          <Button block size="sm" onClick={() => onBook(slot)} loading={booking}>
            Book slot
          </Button>
        ) : (
          <Button block size="sm" variant="secondary" disabled>
            {slot.status === SLOT_STATUS.CLOSED ? 'Closed' : 'Slot full'}
          </Button>
        )}
      </div>
    </article>
  );
}
