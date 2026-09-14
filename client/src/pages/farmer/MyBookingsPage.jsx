import { useCallback, useMemo, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Select from '../../components/ui/Select.jsx';
import BookingCard from '../../components/bookings/BookingCard.jsx';
import DataState from '../../components/common/DataState.jsx';
import FuturePhaseNotice from '../../components/common/FuturePhaseNotice.jsx';
import useAsync from '../../hooks/useAsync.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { listMyBookings } from '../../services/bookingService.js';
import { AVAILABLE_BOOKING_STATUSES, BOOKING_STATUS_LABELS } from '../../utils/constants.js';
import paths from '../../routes/paths.js';

export default function MyBookingsPage() {
  useDocumentTitle('My bookings');

  const [statusFilter, setStatusFilter] = useState('');
  const fetcher = useCallback(() => listMyBookings(), []);
  const { data, loading, error, reload } = useAsync(fetcher, []);

  const bookings = useMemo(() => data ?? [], [data]);
  const visible = useMemo(
    () => (statusFilter ? bookings.filter((b) => b.status === statusFilter) : bookings),
    [bookings, statusFilter],
  );

  return (
    <>
      <PageHeader
        title="My bookings"
        subtitle="Every procurement slot you have booked, with its reference number."
        breadcrumbs={[{ label: 'Dashboard', to: paths.farmerDashboard }, { label: 'My bookings' }]}
        actions={<Button to={paths.farmerCentres}>Book a new slot</Button>}
      />

      <Card className="mb-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Select
            label="Filter by status"
            name="status"
            placeholder="All bookings"
            options={AVAILABLE_BOOKING_STATUSES.map((status) => ({
              value: status,
              label: BOOKING_STATUS_LABELS[status],
            }))}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          />
          <div className="sm:col-span-2 sm:self-end">
            <p className="text-sm text-slate-600" aria-live="polite">
              {loading
                ? 'Loading…'
                : `${visible.length} ${visible.length === 1 ? 'booking' : 'bookings'}`}
            </p>
          </div>
        </div>
      </Card>

      <DataState
        loading={loading}
        error={error}
        onRetry={reload}
        isEmpty={visible.length === 0}
        loadingLabel="Loading your bookings…"
        errorTitle="Could not load your bookings"
        emptyIcon="🧾"
        emptyTitle={statusFilter ? 'No bookings with this status' : 'You have no bookings yet'}
        emptyMessage={
          statusFilter
            ? 'Change the filter to see your other bookings.'
            : 'Once you book a procurement slot it will appear here with its reference number.'
        }
        emptyAction={
          statusFilter ? (
            <Button variant="secondary" onClick={() => setStatusFilter('')}>
              Show all bookings
            </Button>
          ) : (
            <Button to={paths.farmerCentres}>Find a procurement centre</Button>
          )
        }
      >
        <ul className="space-y-4">
          {visible.map((booking) => (
            <li key={booking.id}>
              <BookingCard booking={booking} />
            </li>
          ))}
        </ul>
      </DataState>

      <FuturePhaseNotice
        className="mt-6"
        phase="Part 3"
        title="Booking statuses that are not reachable yet"
        items={[
          'Checked In',
          'Waiting',
          'Processing',
          'Procurement Completed',
          'Payment Pending',
          'Payment Completed',
        ]}
      >
        Only <strong>Confirmed</strong> and <strong>Cancelled</strong> are reachable today. The
        remaining statuses are already defined in the database schema, but nothing transitions a
        booking into them until the Part 3 operational layer exists.
      </FuturePhaseNotice>
    </>
  );
}
