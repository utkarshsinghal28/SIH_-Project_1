import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Card, { StatCard } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Select from '../../components/ui/Select.jsx';
import Input from '../../components/ui/Input.jsx';
import BookingsTable from '../../components/bookings/BookingsTable.jsx';
import DataState from '../../components/common/DataState.jsx';
import useAsync from '../../hooks/useAsync.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { getCentre } from '../../services/centreService.js';
import { listCentreBookings } from '../../services/bookingService.js';
import { AVAILABLE_BOOKING_STATUSES, BOOKING_STATUS, BOOKING_STATUS_LABELS } from '../../utils/constants.js';
import paths from '../../routes/paths.js';

const EMPTY = { status: '', date: '' };

export default function AdminCentreBookingsPage() {
  const { id } = useParams();
  const [filters, setFilters] = useState(EMPTY);

  const centreFetcher = useCallback(() => getCentre(id), [id]);
  const { data: centre } = useAsync(centreFetcher, [id]);

  const fetcher = useCallback(() => listCentreBookings(id), [id]);
  const { data, loading, error, reload } = useAsync(fetcher, [id]);

  useDocumentTitle(centre ? `Bookings · ${centre.name}` : 'Centre bookings');

  const bookings = useMemo(() => data ?? [], [data]);
  const visible = useMemo(
    () =>
      bookings.filter((booking) => {
        if (filters.status && booking.status !== filters.status) return false;
        if (filters.date && booking.date !== filters.date) return false;
        return true;
      }),
    [bookings, filters],
  );

  const set = (key) => (event) =>
    setFilters((current) => ({ ...current, [key]: event.target.value }));

  return (
    <>
      <PageHeader
        title="Centre bookings"
        subtitle={centre ? `${centre.name} · ${centre.district}, ${centre.state}` : 'Loading…'}
        breadcrumbs={[
          { label: 'Dashboard', to: paths.adminDashboard },
          { label: 'Centres', to: paths.adminCentres },
          { label: centre?.name ?? 'Centre' },
          { label: 'Bookings' },
        ]}
        actions={
          <>
            <Button variant="secondary" to={paths.adminCentreSlots(id)}>
              Manage slots
            </Button>
            <Button variant="secondary" to={paths.adminBookings}>
              All bookings
            </Button>
          </>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total bookings" value={loading ? '—' : bookings.length} tone="neutral" />
        <StatCard
          label="Confirmed"
          value={loading ? '—' : bookings.filter((b) => b.status === BOOKING_STATUS.CONFIRMED).length}
          tone="positive"
        />
        <StatCard
          label="Cancelled"
          value={loading ? '—' : bookings.filter((b) => b.status === BOOKING_STATUS.CANCELLED).length}
          tone="warning"
        />
      </div>

      <Card className="mb-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Select
            label="Status"
            name="status"
            placeholder="All statuses"
            options={AVAILABLE_BOOKING_STATUSES.map((status) => ({
              value: status,
              label: BOOKING_STATUS_LABELS[status],
            }))}
            value={filters.status}
            onChange={set('status')}
          />
          <Input label="Date" name="date" type="date" value={filters.date} onChange={set('date')} />
          <div className="sm:self-end">
            <Button variant="secondary" block onClick={() => setFilters(EMPTY)}>
              Clear filters
            </Button>
          </div>
        </div>
      </Card>

      <DataState
        loading={loading}
        error={error}
        onRetry={reload}
        isEmpty={visible.length === 0}
        loadingLabel="Loading bookings for this centre…"
        errorTitle="Could not load bookings"
        emptyIcon="🧾"
        emptyTitle="No bookings for this centre"
        emptyMessage="Bookings made by farmers at this centre will be listed here."
      >
        <BookingsTable bookings={visible} showCentre={false} />
      </DataState>
    </>
  );
}
