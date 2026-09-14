import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Select from '../../components/ui/Select.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Modal from '../../components/ui/Modal.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import SlotCard from '../../components/slots/SlotCard.jsx';
import DataState from '../../components/common/DataState.jsx';
import useAsync from '../../hooks/useAsync.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getCentre } from '../../services/centreService.js';
import { listSlots } from '../../services/slotService.js';
import { createBooking } from '../../services/bookingService.js';
import { formatDate, formatTimeRange } from '../../utils/format.js';
import paths from '../../routes/paths.js';

export default function CentreSlotsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [dateFilter, setDateFilter] = useState('');
  const [pendingSlot, setPendingSlot] = useState(null);
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const centreFetcher = useCallback(() => getCentre(id), [id]);
  const { data: centre } = useAsync(centreFetcher, [id]);

  const slotFetcher = useCallback(() => listSlots(id), [id]);
  const { data, loading, error, reload } = useAsync(slotFetcher, [id]);

  useDocumentTitle(centre ? `Slots · ${centre.name}` : 'Available slots');

  const slots = useMemo(() => data ?? [], [data]);
  const dates = useMemo(() => [...new Set(slots.map((slot) => slot.date))].sort(), [slots]);
  const visible = useMemo(
    () => (dateFilter ? slots.filter((slot) => slot.date === dateFilter) : slots),
    [slots, dateFilter],
  );

  const grouped = useMemo(() => {
    const map = new Map();
    visible.forEach((slot) => {
      if (!map.has(slot.date)) map.set(slot.date, []);
      map.get(slot.date).push(slot);
    });
    return [...map.entries()];
  }, [visible]);

  /**
   * Calls bookingService.createBooking, which in Part 2 becomes POST /api/bookings.
   * Slot capacity is enforced by the backend then; here the mock layer performs
   * the same checks so the UI states can be exercised.
   */
  const confirmBooking = async () => {
    if (!pendingSlot) return;
    setBooking(true);
    setBookingError(null);
    try {
      const result = await createBooking({ centreId: id, slotId: pendingSlot.id });
      setPendingSlot(null);
      setConfirmation(result);
      toast.success(`Booking confirmed · ${result.reference}`);
      reload();
    } catch (caught) {
      setBookingError(caught.message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Available booking slots"
        subtitle={centre ? `${centre.name} · ${centre.district}, ${centre.state}` : 'Choose a time that suits you'}
        breadcrumbs={[
          { label: 'Dashboard', to: paths.farmerDashboard },
          { label: 'Centres', to: paths.farmerCentres },
          { label: centre?.name ?? 'Centre', to: paths.farmerCentre(id) },
          { label: 'Slots' },
        ]}
        actions={
          <Button variant="secondary" to={paths.farmerCentre(id)}>
            Centre details
          </Button>
        }
      />

      <Card className="mb-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Select
            label="Filter by date"
            name="date"
            placeholder="All available dates"
            options={dates.map((date) => ({ value: date, label: formatDate(date) }))}
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          />
          <div className="sm:col-span-2 sm:self-end">
            <p className="text-sm text-slate-600" aria-live="polite">
              {loading
                ? 'Loading slots…'
                : `${visible.length} ${visible.length === 1 ? 'slot' : 'slots'} shown`}
            </p>
          </div>
        </div>
      </Card>

      <DataState
        loading={loading}
        error={error}
        onRetry={reload}
        isEmpty={visible.length === 0}
        loadingLabel="Loading available slots…"
        errorTitle="Could not load slots"
        emptyIcon="🗓️"
        emptyTitle="No slots published for this selection"
        emptyMessage="The centre has not opened slots for this date yet. Try another date or check again later."
        emptyAction={
          dateFilter && (
            <Button variant="secondary" onClick={() => setDateFilter('')}>
              Show all dates
            </Button>
          )
        }
      >
        <div className="space-y-6">
          {grouped.map(([date, daySlots]) => (
            <section key={date}>
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
                {formatDate(date)}
                <span className="text-xs font-normal text-slate-500">
                  ({daySlots.length} {daySlots.length === 1 ? 'slot' : 'slots'})
                </span>
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {daySlots.map((slot) => (
                  <li key={slot.id}>
                    <SlotCard slot={slot} onBook={setPendingSlot} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DataState>

      {/* ---------------------------------------------------- confirm modal */}
      <Modal
        open={Boolean(pendingSlot)}
        onClose={booking ? undefined : () => setPendingSlot(null)}
        title="Confirm your slot booking"
        description="Please check these details before confirming."
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingSlot(null)} disabled={booking}>
              Go back
            </Button>
            <Button onClick={confirmBooking} loading={booking}>
              Confirm booking
            </Button>
          </>
        }
      >
        {bookingError && (
          <Alert tone="error" className="mb-4">
            {bookingError}
          </Alert>
        )}
        {pendingSlot && (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Centre</dt>
              <dd className="text-right font-medium text-slate-900">{centre?.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Date</dt>
              <dd className="font-medium text-slate-900">{formatDate(pendingSlot.date)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Time</dt>
              <dd className="font-medium text-slate-900">
                {formatTimeRange(pendingSlot.startTime, pendingSlot.endTime)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Places left</dt>
              <dd className="font-medium text-slate-900">
                {pendingSlot.maxBookings - pendingSlot.bookedCount} of {pendingSlot.maxBookings}
              </dd>
            </div>
          </dl>
        )}
      </Modal>

      {/* ----------------------------------------------- confirmation modal */}
      <Modal
        open={Boolean(confirmation)}
        onClose={() => setConfirmation(null)}
        title="Booking confirmed"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmation(null)}>
              Book another slot
            </Button>
            <Button onClick={() => navigate(paths.farmerBooking(confirmation.id))}>
              View booking
            </Button>
          </>
        }
      >
        {confirmation && (
          <div className="space-y-4">
            <div className="rounded-md border border-brand-300 bg-brand-50 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-800">
                Booking reference
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-brand-900">
                {confirmation.reference}
              </p>
              <p className="mt-1 text-xs text-brand-800">
                Please note this number. You will need it at the centre.
              </p>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Centre</dt>
                <dd className="text-right font-medium text-slate-900">{confirmation.centreName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Date</dt>
                <dd className="font-medium text-slate-900">{formatDate(confirmation.date)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Time</dt>
                <dd className="font-medium text-slate-900">
                  {formatTimeRange(confirmation.startTime, confirmation.endTime)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-600">Status</dt>
                <dd>
                  <StatusBadge status={confirmation.status} size="sm" />
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>
    </>
  );
}
