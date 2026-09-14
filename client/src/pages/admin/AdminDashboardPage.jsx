import { useCallback } from 'react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Card, { StatCard } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import DataState from '../../components/common/DataState.jsx';
import FuturePhaseNotice from '../../components/common/FuturePhaseNotice.jsx';
import BookingsTable from '../../components/bookings/BookingsTable.jsx';
import useAsync from '../../hooks/useAsync.js';
import useAuth from '../../hooks/useAuth.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { fetchAdminStats, listAllBookings } from '../../services/bookingService.js';
import { formatDate, todayISO } from '../../utils/format.js';
import paths from '../../routes/paths.js';

export default function AdminDashboardPage() {
  useDocumentTitle('Administration dashboard');
  const { user, usingMockBackend } = useAuth();

  const statsFetcher = useCallback(() => fetchAdminStats(), []);
  const { data: stats, loading, error, reload } = useAsync(statsFetcher, []);

  const recentFetcher = useCallback(() => listAllBookings(), []);
  const {
    data: bookings,
    loading: bookingsLoading,
    error: bookingsError,
    reload: reloadBookings,
  } = useAsync(recentFetcher, []);

  const recent = (bookings ?? []).slice(0, 5);

  return (
    <>
      <PageHeader
        title="Operations dashboard"
        subtitle={`${user?.designation ?? 'Administrator'} · ${formatDate(todayISO())}`}
        actions={
          <>
            <Button variant="secondary" to={paths.adminCentres}>
              Manage centres
            </Button>
            <Button to={paths.adminCentreNew}>Add centre</Button>
          </>
        }
      />

      {usingMockBackend && (
        <Alert tone="warning" title="Development data" className="mb-5">
          These figures come from the Part 1 mock layer in the browser, not from a database. Real
          aggregates arrive with the Express API and MongoDB in Part 2.
        </Alert>
      )}

      <DataState
        loading={loading}
        error={error}
        onRetry={reload}
        loadingLabel="Loading operational summary…"
        errorTitle="Could not load the dashboard"
      >
        {stats && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard label="Total centres" value={stats.totalCentres} tone="neutral" />
              <StatCard label="Active centres" value={stats.activeCentres} tone="positive" />
              <StatCard label="Inactive centres" value={stats.inactiveCentres} tone="warning" />
              <StatCard
                label="Today's slots"
                value={stats.todaysSlots}
                hint="Slots published for today"
              />
              <StatCard
                label="Today's bookings"
                value={stats.todaysBookings}
                hint={`${stats.confirmedToday} confirmed · ${stats.cancelledToday} cancelled`}
              />
              <StatCard
                label="Registered farmers"
                value={stats.registeredFarmers}
                hint="Accounts in this development session"
              />
            </div>
          </>
        )}
      </DataState>

      <div className="mt-6">
        <Card
          title="Recent bookings"
          description="The five most recent booking records"
          actions={
            <Button variant="secondary" size="sm" to={paths.adminBookings}>
              View all bookings
            </Button>
          }
        >
          <DataState
            loading={bookingsLoading}
            error={bookingsError}
            onRetry={reloadBookings}
            isEmpty={recent.length === 0}
            loadingLabel="Loading bookings…"
            emptyIcon="🧾"
            emptyTitle="No bookings recorded"
            emptyMessage="Bookings made by farmers will appear here."
          >
            <BookingsTable bookings={recent} />
          </DataState>
        </Card>
      </div>

      <FuturePhaseNotice
        className="mt-6"
        phase="Part 3"
        title="Live operational controls (planned)"
        items={[
          'Live queue per centre and per counter',
          'Counter open/close controls',
          'Capacity and throughput monitoring',
          'Operational incident logging',
          'Dynamic arrival recommendations to farmers',
          'Procurement and payment progress',
        ]}
      />
    </>
  );
}
