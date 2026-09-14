import { useCallback, useMemo, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import BookingsTable from '../../components/bookings/BookingsTable.jsx';
import DataState from '../../components/common/DataState.jsx';
import useAsync from '../../hooks/useAsync.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { listAllBookings } from '../../services/bookingService.js';
import { listCentres } from '../../services/centreService.js';
import { AVAILABLE_BOOKING_STATUSES, BOOKING_STATUS_LABELS } from '../../utils/constants.js';
import paths from '../../routes/paths.js';

const EMPTY = { search: '', centreId: '', status: '', date: '' };

export default function AdminBookingsPage() {
  useDocumentTitle('All bookings');

  const [filters, setFilters] = useState(EMPTY);

  const centresFetcher = useCallback(() => listCentres(), []);
  const { data: centres } = useAsync(centresFetcher, []);

  const fetcher = useCallback(() => listAllBookings(), []);
  const { data, loading, error, reload } = useAsync(fetcher, []);

  const bookings = useMemo(() => data ?? [], [data]);

  const visible = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return bookings.filter((booking) => {
      if (filters.centreId && booking.centreId !== filters.centreId) return false;
      if (filters.status && booking.status !== filters.status) return false;
      if (filters.date && booking.date !== filters.date) return false;
      if (!search) return true;
      return (
        booking.reference.toLowerCase().includes(search) ||
        booking.farmerName.toLowerCase().includes(search) ||
        booking.farmerPhone.includes(search)
      );
    });
  }, [bookings, filters]);

  const set = (key) => (event) =>
    setFilters((current) => ({ ...current, [key]: event.target.value }));

  return (
    <>
      <PageHeader
        title="All bookings"
        subtitle="Every booking recorded across all procurement centres."
        breadcrumbs={[{ label: 'Dashboard', to: paths.adminDashboard }, { label: 'Bookings' }]}
        actions={
          <Button variant="secondary" onClick={reload}>
            Refresh
          </Button>
        }
      />

      <Card className="mb-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Search"
            name="search"
            type="search"
            placeholder="Reference, farmer, phone"
            value={filters.search}
            onChange={set('search')}
          />
          <Select
            label="Centre"
            name="centreId"
            placeholder="All centres"
            options={(centres ?? []).map((centre) => ({ value: centre.id, label: centre.name }))}
            value={filters.centreId}
            onChange={set('centreId')}
          />
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
          <Input
            label="Date"
            name="date"
            type="date"
            value={filters.date}
            onChange={set('date')}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-600" aria-live="polite">
            {loading
              ? 'Loading…'
              : `${visible.length} ${visible.length === 1 ? 'booking' : 'bookings'} found`}
          </p>
          <Button size="sm" variant="secondary" onClick={() => setFilters(EMPTY)}>
            Clear filters
          </Button>
        </div>
      </Card>

      <DataState
        loading={loading}
        error={error}
        onRetry={reload}
        isEmpty={visible.length === 0}
        loadingLabel="Loading bookings…"
        errorTitle="Could not load bookings"
        emptyIcon="🧾"
        emptyTitle="No bookings match these filters"
        emptyMessage="Try clearing the filters or selecting a different date."
        emptyAction={
          <Button variant="secondary" onClick={() => setFilters(EMPTY)}>
            Clear filters
          </Button>
        }
      >
        <BookingsTable bookings={visible} />
      </DataState>
    </>
  );
}
