import { BOOKING_STATUS_LABELS } from '../../utils/constants.js';

const TONES = {
  green: 'bg-brand-100 text-brand-900 border-brand-300',
  red: 'bg-red-100 text-red-900 border-red-300',
  amber: 'bg-amber-100 text-amber-900 border-amber-300',
  blue: 'bg-sky-100 text-sky-900 border-sky-300',
  slate: 'bg-slate-100 text-slate-700 border-slate-300',
};

const STATUS_TONES = {
  ACTIVE: 'green',
  INACTIVE: 'slate',
  FULL: 'amber',
  CLOSED: 'slate',
  CONFIRMED: 'green',
  CANCELLED: 'red',
  CHECKED_IN: 'blue',
  WAITING: 'amber',
  PROCESSING: 'blue',
  PROCUREMENT_COMPLETED: 'green',
  PAYMENT_PENDING: 'amber',
  PAYMENT_COMPLETED: 'green',
};

const DEFAULT_LABELS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  FULL: 'Full',
  CLOSED: 'Closed',
  ...BOOKING_STATUS_LABELS,
};

export default function StatusBadge({ status, label, tone, size = 'md' }) {
  const resolvedTone = tone ?? STATUS_TONES[status] ?? 'slate';
  const resolvedLabel = label ?? DEFAULT_LABELS[status] ?? status;
  const sizing = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${sizing} ${
        TONES[resolvedTone] ?? TONES.slate
      }`}
    >
      {resolvedLabel}
    </span>
  );
}
