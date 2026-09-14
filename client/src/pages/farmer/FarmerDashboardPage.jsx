import { useCallback } from 'react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Alert from '../../components/ui/Alert.jsx';
import DataState from '../../components/common/DataState.jsx';
import FuturePhaseNotice from '../../components/common/FuturePhaseNotice.jsx';
import useAsync from '../../hooks/useAsync.js';
import useAuth from '../../hooks/useAuth.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { listMyBookings } from '../../services/bookingService.js';
import { BOOKING_STATUS } from '../../utils/constants.js';
import { formatDate, formatTimeRange, todayISO } from '../../utils/format.js';
import paths from '../../routes/paths.js';

const QUICK_ACTIONS = [
  {
    to: paths.farmerCentres,
    icon: '🏢',
    title: 'Find a centre',
    text: 'Search procurement centres by district and state.',
  },
  {
    to: paths.farmerCentres,
    icon: '📅',
    title: 'Book a slot',
    text: 'Pick a date and time that suits you.',
  },
  {
    to: paths.farmerBookings,
    icon: '🧾',
    title: 'My bookings',
    text: 'See every booking and its reference number.',
  },
];

export default function FarmerDashboardPage() {
  useDocumentTitle('Farmer dashboard');
  const { user } = useAuth();

  const fetcher = useCallback(() => listMyBookings(), []);
  const { data: bookings, loading, error, reload } = useAsync(fetcher, []);

  const list = bookings ?? [];
  const today = todayISO();
  const upcoming = list
    .filter((booking) => booking.status === BOOKING_STATUS.CONFIRMED && booking.date >= today)
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  const next = upcoming[0] ?? null;

  return (
    <>
      <PageHeader
        title={`Namaste, ${user?.name?.split(' ')[0] ?? 'Farmer'}`}
        subtitle={
          user?.village
            ? `${user.village}, ${user.district}, ${user.state}`
            : 'Your procurement bookings at a glance'
        }
        actions={<Button to={paths.farmerCentres}>Book a procurement slot</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Upcoming booking" description="Your next confirmed procurement appointment">
            <DataState
              loading={loading}
              error={error}
              isEmpty={!next}
              onRetry={reload}
              loadingLabel="Loading your bookings…"
              emptyIcon="📅"
              emptyTitle="No upcoming booking"
              emptyMessage="You have not booked a procurement slot yet. Find a nearby centre and choose a time that works for you."
              emptyAction={<Button to={paths.farmerCentres}>Find a procurement centre</Button>}
            >
              {next && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Booking reference
                      </p>
                      <p className="font-mono text-lg font-bold text-slate-900">
                        {next.reference}
                      </p>
                    </div>
                    <StatusBadge status={next.status} />
                  </div>

                  <dl className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Procurement centre
                      </dt>
                      <dd className="text-sm font-medium text-slate-900">{next.centreName}</dd>
                      <dd className="text-xs text-slate-600">
                        {next.centreDistrict}, {next.centreState}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </dt>
                      <dd className="text-sm font-medium text-slate-900">{formatDate(next.date)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Slot time
                      </dt>
                      <dd className="text-sm font-medium text-slate-900">
                        {formatTimeRange(next.startTime, next.endTime)}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    <Button to={paths.farmerBooking(next.id)} variant="secondary" size="sm">
                      View booking details
                    </Button>
                    <Button to={paths.farmerCentre(next.centreId)} variant="ghost" size="sm">
                      About this centre
                    </Button>
                  </div>

                  {upcoming.length > 1 && (
                    <Alert tone="info">
                      You have {upcoming.length - 1} more upcoming{' '}
                      {upcoming.length - 1 === 1 ? 'booking' : 'bookings'}.{' '}
                      <a href={paths.farmerBookings} className="font-semibold underline">
                        View all
                      </a>
                      .
                    </Alert>
                  )}
                </div>
              )}
            </DataState>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Quick actions">
            <ul className="space-y-2">
              {QUICK_ACTIONS.map((action) => (
                <li key={action.title}>
                  <Button
                    to={action.to}
                    variant="secondary"
                    block
                    className="justify-start text-left"
                  >
                    <span aria-hidden="true" className="text-lg">
                      {action.icon}
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold">{action.title}</span>
                      <span className="block text-xs font-normal text-slate-600">
                        {action.text}
                      </span>
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Booking summary">
            <dl className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-md border border-slate-200 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Confirmed
                </dt>
                <dd className="mt-1 text-2xl font-bold text-slate-900">
                  {loading
                    ? '—'
                    : list.filter((b) => b.status === BOOKING_STATUS.CONFIRMED).length}
                </dd>
              </div>
              <div className="rounded-md border border-slate-200 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cancelled
                </dt>
                <dd className="mt-1 text-2xl font-bold text-slate-900">
                  {loading
                    ? '—'
                    : list.filter((b) => b.status === BOOKING_STATUS.CANCELLED).length}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      <FuturePhaseNotice
        className="mt-6"
        phase="Part 3"
        title="Live queue features are not available in this build"
        items={[
          'Check-in when you reach the centre',
          'Your live position in the physical queue',
          'Estimated waiting time',
          'Recommended arrival time based on centre load',
          'Procurement progress updates',
          'Payment status tracking',
        ]}
      >
        Nothing on this dashboard simulates live queue data. These features require the operational
        layer built in Part 3.
      </FuturePhaseNotice>
    </>
  );
}
