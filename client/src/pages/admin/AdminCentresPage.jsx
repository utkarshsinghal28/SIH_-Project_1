import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Table from '../../components/ui/Table.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Alert from '../../components/ui/Alert.jsx';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog.jsx';
import CentreFilters from '../../components/centres/CentreFilters.jsx';
import DataState from '../../components/common/DataState.jsx';
import useAsync from '../../hooks/useAsync.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { useToast } from '../../context/ToastContext.jsx';
import { listCentres, setCentreStatus } from '../../services/centreService.js';
import { CENTRE_STATUS } from '../../utils/constants.js';
import paths from '../../routes/paths.js';

const EMPTY_FILTERS = { search: '', district: '', state: '', status: '' };

export default function AdminCentresPage() {
  useDocumentTitle('Manage procurement centres');
  const toast = useToast();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [target, setTarget] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetcher = useCallback(() => listCentres(), []);
  const { data, loading, error, reload } = useAsync(fetcher, []);
  const centres = useMemo(() => data ?? [], [data]);

  const states = useMemo(() => [...new Set(centres.map((c) => c.state))].sort(), [centres]);
  const districts = useMemo(() => {
    const pool = filters.state ? centres.filter((c) => c.state === filters.state) : centres;
    return [...new Set(pool.map((c) => c.district))].sort();
  }, [centres, filters.state]);

  const visible = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return centres.filter((centre) => {
      if (filters.state && centre.state !== filters.state) return false;
      if (filters.district && centre.district !== filters.district) return false;
      if (filters.status && centre.status !== filters.status) return false;
      if (!search) return true;
      return (
        centre.name.toLowerCase().includes(search) ||
        centre.address.toLowerCase().includes(search) ||
        centre.district.toLowerCase().includes(search)
      );
    });
  }, [centres, filters]);

  const toggleStatus = async () => {
    if (!target) return;
    setUpdating(true);
    try {
      const nextStatus =
        target.status === CENTRE_STATUS.ACTIVE ? CENTRE_STATUS.INACTIVE : CENTRE_STATUS.ACTIVE;
      await setCentreStatus(target.id, nextStatus);
      toast.success(
        nextStatus === CENTRE_STATUS.ACTIVE
          ? `${target.name} is now active.`
          : `${target.name} has been deactivated.`,
      );
      setTarget(null);
      reload();
    } catch (caught) {
      toast.error(caught.message);
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Centre',
      render: (row) => (
        <span>
          <Link to={paths.adminCentreSlots(row.id)} className="font-semibold text-brand-800 hover:underline">
            {row.name}
          </Link>
          <span className="block text-xs text-slate-500">{row.address}</span>
        </span>
      ),
    },
    { key: 'district', header: 'District' },
    { key: 'state', header: 'State' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="secondary" to={paths.adminCentreEdit(row.id)}>
            Edit
          </Button>
          <Button size="sm" variant="secondary" to={paths.adminCentreSlots(row.id)}>
            Slots
          </Button>
          <Button size="sm" variant="secondary" to={paths.adminCentreBookings(row.id)}>
            Bookings
          </Button>
          <Button
            size="sm"
            variant={row.status === CENTRE_STATUS.ACTIVE ? 'danger' : 'primary'}
            onClick={() => setTarget(row)}
          >
            {row.status === CENTRE_STATUS.ACTIVE ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Procurement centres"
        subtitle="Create, update and activate or deactivate centres."
        breadcrumbs={[{ label: 'Dashboard', to: paths.adminDashboard }, { label: 'Centres' }]}
        actions={<Button to={paths.adminCentreNew}>Add new centre</Button>}
      />

      <Alert tone="info" className="mb-5">
        Centres are never permanently deleted. Deactivating a centre is a soft change: it stops new
        bookings while keeping every past booking record valid.
      </Alert>

      <CentreFilters
        values={filters}
        onChange={(next) =>
          setFilters(next.state !== filters.state ? { ...next, district: '' } : next)
        }
        onReset={() => setFilters(EMPTY_FILTERS)}
        districts={districts}
        states={states}
        statuses={[
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' },
        ]}
        resultCount={loading ? undefined : visible.length}
      />

      <div className="mt-5">
        <DataState
          loading={loading}
          error={error}
          onRetry={reload}
          isEmpty={visible.length === 0}
          loadingLabel="Loading centres…"
          errorTitle="Could not load centres"
          emptyIcon="🏢"
          emptyTitle="No centres match your filters"
          emptyMessage="Adjust the filters, or create a new procurement centre."
          emptyAction={<Button to={paths.adminCentreNew}>Add new centre</Button>}
        >
          <Table columns={columns} rows={visible} />
        </DataState>
      </div>

      <ConfirmationDialog
        open={Boolean(target)}
        title={
          target?.status === CENTRE_STATUS.ACTIVE ? 'Deactivate this centre?' : 'Activate this centre?'
        }
        message={
          target?.status === CENTRE_STATUS.ACTIVE
            ? `${target?.name} will stop accepting new bookings. Existing booking records are preserved and the centre can be reactivated at any time.`
            : `${target?.name} will start appearing to farmers and can accept bookings again.`
        }
        confirmLabel={target?.status === CENTRE_STATUS.ACTIVE ? 'Deactivate centre' : 'Activate centre'}
        tone={target?.status === CENTRE_STATUS.ACTIVE ? 'danger' : 'primary'}
        loading={updating}
        onConfirm={toggleStatus}
        onCancel={() => setTarget(null)}
      />
    </>
  );
}
