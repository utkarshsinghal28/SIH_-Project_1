import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Alert from '../../components/ui/Alert.jsx';
import DataState from '../../components/common/DataState.jsx';
import FuturePhaseNotice from '../../components/common/FuturePhaseNotice.jsx';
import useAsync from '../../hooks/useAsync.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { getCentre } from '../../services/centreService.js';
import { CENTRE_STATUS } from '../../utils/constants.js';
import paths from '../../routes/paths.js';

function DetailRow({ label, value }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0 sm:flex sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:w-44 sm:shrink-0">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-slate-800 sm:mt-0">{value || '—'}</dd>
    </div>
  );
}

export default function CentreDetailsPage() {
  const { id } = useParams();
  const fetcher = useCallback(() => getCentre(id), [id]);
  const { data: centre, loading, error, reload } = useAsync(fetcher, [id]);

  useDocumentTitle(centre?.name ?? 'Centre details');

  const isActive = centre?.status === CENTRE_STATUS.ACTIVE;

  return (
    <>
      <PageHeader
        title={centre?.name ?? 'Procurement centre'}
        subtitle="Centre information and slot availability"
        breadcrumbs={[
          { label: 'Dashboard', to: paths.farmerDashboard },
          { label: 'Centres', to: paths.farmerCentres },
          { label: centre?.name ?? 'Details' },
        ]}
        actions={
          centre && (
            <Button to={isActive ? paths.farmerCentreSlots(centre.id) : undefined} disabled={!isActive}>
              View slots
            </Button>
          )
        }
      />

      <DataState
        loading={loading}
        error={error}
        onRetry={reload}
        isEmpty={!loading && !error && !centre}
        loadingLabel="Loading centre details…"
        errorTitle="Could not load this centre"
        emptyTitle="Centre not found"
        emptyMessage="This procurement centre may have been removed from the directory."
      >
        {centre && (
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <Card
                title="Centre information"
                actions={<StatusBadge status={centre.status} />}
              >
                <dl>
                  <DetailRow label="Centre name" value={centre.name} />
                  <DetailRow label="Address" value={centre.address} />
                  <DetailRow label="District" value={centre.district} />
                  <DetailRow label="State" value={centre.state} />
                  <DetailRow
                    label="Operating status"
                    value={isActive ? 'Operating and accepting bookings' : 'Currently not operating'}
                  />
                  <DetailRow label="Centre in-charge" value={centre.inchargeName} />
                  <DetailRow label="Contact" value={centre.contactPhone} />
                  <DetailRow
                    label="Commodities"
                    value={centre.commodities?.length ? centre.commodities.join(', ') : '—'}
                  />
                </dl>
              </Card>

              {!isActive && (
                <Alert tone="warning" title="This centre is not operating at the moment">
                  Bookings cannot be made here right now. Please choose another centre in your
                  district.
                </Alert>
              )}
            </div>

            <div className="space-y-5">
              <Card title="Slot availability">
                <dl className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <dt className="text-sm text-slate-600">Slots published</dt>
                    <dd className="text-2xl font-bold text-slate-900">
                      {centre.slotSummary?.total ?? 0}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-sm text-slate-600">Open for booking</dt>
                    <dd className="text-2xl font-bold text-brand-800">
                      {centre.slotSummary?.open ?? 0}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-sm text-slate-600">Places available</dt>
                    <dd className="text-2xl font-bold text-slate-900">
                      {centre.slotSummary?.seatsAvailable ?? 0}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <Button
                    block
                    to={isActive ? paths.farmerCentreSlots(centre.id) : undefined}
                    disabled={!isActive}
                  >
                    View slots
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </DataState>

      <FuturePhaseNotice
        className="mt-6"
        phase="Part 3"
        title="Live centre operations panel (reserved space on this page)"
        items={[
          'Live queue at this centre',
          'Estimated waiting time',
          'Number of active counters',
          'Current capacity utilisation',
          'Operational alerts and incidents',
        ]}
      >
        This section is intentionally left as a placeholder. No live figures are shown because the
        real-time operational layer does not exist yet.
      </FuturePhaseNotice>
    </>
  );
}
