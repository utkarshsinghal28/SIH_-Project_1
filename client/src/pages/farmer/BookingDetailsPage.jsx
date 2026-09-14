import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Alert from '../../components/ui/Alert.jsx';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog.jsx';
import DataState from '../../components/common/DataState.jsx';
import FuturePhaseNotice from '../../components/common/FuturePhaseNotice.jsx';
import useAsync from '../../hooks/useAsync.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { useToast } from '../../context/ToastContext.jsx';
import { cancelBooking, getBooking } from '../../services/bookingService.js';
import { BOOKING_STATUS, FUTURE_BOOKING_STATUSES, BOOKING_STATUS_LABELS } from '../../utils/constants.js';
import { formatDate, formatDateTime, formatTimeRange } from '../../utils/format.js';
import paths from '../../routes/paths.js';

function Row({ label, children }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0 sm:flex sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:w-48 sm:shrink-0">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-slate-800 sm:mt-0">{children}</dd>
    </div>
  );
}

export default function BookingDetailsPage() {
  const { id } = useParams();
  const toast = useToast();

  const fetcher = useCallback(() => getBooking(id), [id]);
  const { data: booking, loading, error, reload, setData } = useAsync(fetcher, [id]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  useDocumentTitle(booking ? `Booking ${booking.reference}` : 'Booking details');

  const onCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      const updated = await cancelBooking(id);
      setData(updated);
      setConfirmOpen(false);
      toast.success('Booking cancelled.');
    } catch (caught) {
      setCancelError(caught.message);
    } finally {
      setCancelling(false);
    }
  };

  const isConfirmed = booking?.status === BOOKING_STATUS.CONFIRMED;

  return (
    <>
      <PageHeader
        title="Booking details"
        subtitle={booking ? `Reference ${booking.reference}` : 'Loading…'}
        breadcrumbs={[
          { label: 'Dashboard', to: paths.farmerDashboard },
          { label: 'My bookings', to: paths.farmerBookings },
          { label: booking?.reference ?? 'Booking' },
        ]}
        actions={
          isConfirmed && (
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              Cancel booking
            </Button>
          )
        }
      />

      <DataState
        loading={loading}
        error={error}
        onRetry={reload}
        isEmpty={!loading && !error && !booking}
        loadingLabel="Loading booking…"
        errorTitle="Could not load this booking"
        emptyTitle="Booking not found"
        emptyMessage="This booking reference does not exist or is not linked to your account."
        emptyAction={<Button to={paths.farmerBookings}>Back to my bookings</Button>}
      >
        {booking && (
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              {cancelError && <Alert tone="error">{cancelError}</Alert>}

              {booking.status === BOOKING_STATUS.CANCELLED && (
                <Alert tone="warning" title="This booking is cancelled">
                  The place has been released. You can book another slot at any time.
                </Alert>
              )}

              <Card title="Booking" actions={<StatusBadge status={booking.status} />}>
                <dl>
                  <Row label="Booking reference">
                    <span className="font-mono text-base font-bold text-slate-900">
                      {booking.reference}
                    </span>
                  </Row>
                  <Row label="Procurement centre">
                    <span className="font-medium text-slate-900">{booking.centreName}</span>
                    <br />
                    <span className="text-slate-600">{booking.centreAddress}</span>
                  </Row>
                  <Row label="District / State">
                    {booking.centreDistrict}, {booking.centreState}
                  </Row>
                  <Row label="Date">{formatDate(booking.date)}</Row>
                  <Row label="Slot time">
                    {formatTimeRange(booking.startTime, booking.endTime)}
                  </Row>
                  <Row label="Booked on">{formatDateTime(booking.createdAt)}</Row>
                  <Row label="Farmer">
                    {booking.farmerName}
                    {booking.farmerPhone ? ` · ${booking.farmerPhone}` : ''}
                  </Row>
                </dl>
              </Card>

              <Card title="What to bring">
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
                  <li>Your booking reference ({booking.reference})</li>
                  <li>A photo identity document</li>
                  <li>Your produce, ready for weighing</li>
                </ul>
                <p className="mt-3 text-xs text-slate-500">
                  Requirements can vary by state; confirm with your centre before travelling.
                </p>
              </Card>
            </div>

            <div className="space-y-5">
              <Card title="Progress">
                <ol className="space-y-3">
                  {[
                    { label: 'Slot booked', done: true },
                    { label: 'Confirmed', done: booking.status !== BOOKING_STATUS.CANCELLED },
                  ].map((step) => (
                    <li key={step.label} className="flex items-center gap-3 text-sm">
                      <span
                        aria-hidden="true"
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          step.done ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        ✓
                      </span>
                      <span className={step.done ? 'font-medium text-slate-900' : 'text-slate-500'}>
                        {step.label}
                      </span>
                    </li>
                  ))}
                  {FUTURE_BOOKING_STATUSES.map((status) => (
                    <li key={status} className="flex items-center gap-3 text-sm">
                      <span
                        aria-hidden="true"
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-slate-300 text-xs text-slate-400"
                      >
                        ○
                      </span>
                      <span className="text-slate-400">
                        {BOOKING_STATUS_LABELS[status]}
                        <span className="ml-1 text-[10px] uppercase tracking-wide">
                          (Part 3)
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </Card>

              <Card title="Centre">
                <Button block variant="secondary" to={paths.farmerCentre(booking.centreId)}>
                  View centre details
                </Button>
              </Card>
            </div>
          </div>
        )}
      </DataState>

      <FuturePhaseNotice
        className="mt-6"
        phase="Part 3"
        title="Queue and payment tracking for this booking"
        items={[
          'Check in on arrival',
          'Live position in the physical queue',
          'Estimated waiting time',
          'Procurement completion record',
          'Payment status',
        ]}
      />

      <ConfirmationDialog
        open={confirmOpen}
        title="Cancel this booking?"
        message="Your place will be released and given to another farmer. You can book a different slot afterwards."
        confirmLabel="Yes, cancel booking"
        cancelLabel="Keep my booking"
        tone="danger"
        loading={cancelling}
        onConfirm={onCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
