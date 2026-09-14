import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Table from '../../components/ui/Table.jsx';
import Alert from '../../components/ui/Alert.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog.jsx';
import DataState from '../../components/common/DataState.jsx';
import FuturePhaseNotice from '../../components/common/FuturePhaseNotice.jsx';
import useAsync from '../../hooks/useAsync.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getCentre } from '../../services/centreService.js';
import { closeSlot, createSlot, listSlots, updateSlot } from '../../services/slotService.js';
import { SLOT_STATUS } from '../../utils/constants.js';
import { formatDate, formatTimeRange, todayISO } from '../../utils/format.js';
import { hasErrors, validateSlot } from '../../utils/validators.js';
import paths from '../../routes/paths.js';

const BLANK_SLOT = {
  date: todayISO(),
  startTime: '10:00',
  endTime: '11:00',
  maxBookings: '20',
  status: SLOT_STATUS.ACTIVE,
};

const STATUS_OPTIONS = [
  { value: SLOT_STATUS.ACTIVE, label: 'Active' },
  { value: SLOT_STATUS.FULL, label: 'Full' },
  { value: SLOT_STATUS.CLOSED, label: 'Closed' },
];

export default function AdminCentreSlotsPage() {
  const { id } = useParams();
  const toast = useToast();

  const [editing, setEditing] = useState(null); // null | 'new' | slot object
  const [values, setValues] = useState(BLANK_SLOT);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [closeTarget, setCloseTarget] = useState(null);
  const [closing, setClosing] = useState(false);
  const [dateFilter, setDateFilter] = useState('');

  const centreFetcher = useCallback(() => getCentre(id), [id]);
  const { data: centre } = useAsync(centreFetcher, [id]);

  const slotsFetcher = useCallback(() => listSlots(id), [id]);
  const { data, loading, error, reload } = useAsync(slotsFetcher, [id]);

  useDocumentTitle(centre ? `Slots · ${centre.name}` : 'Manage slots');

  const slots = useMemo(() => data ?? [], [data]);
  const dates = useMemo(() => [...new Set(slots.map((slot) => slot.date))].sort(), [slots]);
  const visible = useMemo(
    () => (dateFilter ? slots.filter((slot) => slot.date === dateFilter) : slots),
    [slots, dateFilter],
  );

  const openCreate = () => {
    setValues(BLANK_SLOT);
    setErrors({});
    setFormError(null);
    setEditing('new');
  };

  const openEdit = (slot) => {
    setValues({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxBookings: String(slot.maxBookings),
      status: slot.status,
    });
    setErrors({});
    setFormError(null);
    setEditing(slot);
  };

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    const payload = { ...values, maxBookings: Number(values.maxBookings) };
    const validation = validateSlot(payload);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSaving(true);
    try {
      if (editing === 'new') {
        await createSlot(id, payload);
        toast.success('Slot created.');
      } else {
        await updateSlot(editing.id, payload);
        toast.success('Slot updated.');
      }
      setEditing(null);
      reload();
    } catch (caught) {
      setFormError(caught.message);
    } finally {
      setSaving(false);
    }
  };

  const onClose = async () => {
    if (!closeTarget) return;
    setClosing(true);
    try {
      await closeSlot(closeTarget.id);
      toast.success('Slot closed.');
      setCloseTarget(null);
      reload();
    } catch (caught) {
      toast.error(caught.message);
    } finally {
      setClosing(false);
    }
  };

  const columns = [
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    {
      key: 'time',
      header: 'Time',
      render: (row) => formatTimeRange(row.startTime, row.endTime),
    },
    { key: 'maxBookings', header: 'Max bookings' },
    {
      key: 'availability',
      header: 'Availability',
      render: (row) => (
        <span className="whitespace-nowrap">
          {Math.max(0, row.maxBookings - row.bookedCount)} / {row.maxBookings} free
        </span>
      ),
    },
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
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setCloseTarget(row)}
            disabled={row.status === SLOT_STATUS.CLOSED}
          >
            Close
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Manage slots"
        subtitle={centre ? `${centre.name} · ${centre.district}, ${centre.state}` : 'Slot schedule'}
        breadcrumbs={[
          { label: 'Dashboard', to: paths.adminDashboard },
          { label: 'Centres', to: paths.adminCentres },
          { label: centre?.name ?? 'Centre' },
          { label: 'Slots' },
        ]}
        actions={
          <>
            <Button variant="secondary" to={paths.adminCentreBookings(id)}>
              Centre bookings
            </Button>
            <Button onClick={openCreate}>Create slot</Button>
          </>
        }
      />

      <Alert tone="info" className="mb-5">
        Capacity is <strong>not enforced</strong> in this build. Atomic seat reservation and
        concurrency protection are implemented on the server in Part 2.
      </Alert>

      <Card className="mb-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Select
            label="Filter by date"
            name="dateFilter"
            placeholder="All dates"
            options={dates.map((date) => ({ value: date, label: formatDate(date) }))}
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          />
          <div className="sm:col-span-2 sm:self-end">
            <p className="text-sm text-slate-600" aria-live="polite">
              {loading ? 'Loading…' : `${visible.length} ${visible.length === 1 ? 'slot' : 'slots'}`}
            </p>
          </div>
        </div>
      </Card>

      <DataState
        loading={loading}
        error={error}
        onRetry={reload}
        isEmpty={visible.length === 0}
        loadingLabel="Loading slots…"
        errorTitle="Could not load slots"
        emptyIcon="🗓️"
        emptyTitle="No slots for this selection"
        emptyMessage="Create a slot so farmers can book a procurement time at this centre."
        emptyAction={<Button onClick={openCreate}>Create slot</Button>}
      >
        <Table columns={columns} rows={visible} />
      </DataState>

      <FuturePhaseNotice
        className="mt-6"
        phase="Part 3"
        title="Slot-level operational tools (planned)"
        items={[
          'Counter allocation per slot',
          'Live utilisation and throughput',
          'Automatic slot closure on capacity',
          'Rescheduling farmers after an incident',
        ]}
      />

      {/* ----------------------------------------------------- slot editor */}
      <Modal
        open={Boolean(editing)}
        onClose={saving ? undefined : () => setEditing(null)}
        title={editing === 'new' ? 'Create slot' : 'Edit slot'}
        description={centre?.name}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={onSubmit} loading={saving}>
              {editing === 'new' ? 'Create slot' : 'Save changes'}
            </Button>
          </>
        }
      >
        {formError && (
          <Alert tone="error" className="mb-4">
            {formError}
          </Alert>
        )}
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Input
            label="Date"
            name="date"
            type="date"
            value={values.date}
            onChange={update('date')}
            error={errors.date}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Start time"
              name="startTime"
              type="time"
              value={values.startTime}
              onChange={update('startTime')}
              error={errors.startTime}
              required
            />
            <Input
              label="End time"
              name="endTime"
              type="time"
              value={values.endTime}
              onChange={update('endTime')}
              error={errors.endTime}
              required
            />
          </div>
          <Input
            label="Maximum bookings"
            name="maxBookings"
            type="number"
            min="1"
            max="500"
            value={values.maxBookings}
            onChange={update('maxBookings')}
            error={errors.maxBookings}
            hint="How many farmers this slot can accept."
            required
          />
          <Select
            label="Status"
            name="status"
            options={STATUS_OPTIONS}
            value={values.status}
            onChange={update('status')}
            error={errors.status}
            required
          />
        </form>
      </Modal>

      <ConfirmationDialog
        open={Boolean(closeTarget)}
        title="Close this slot?"
        message={
          closeTarget
            ? `${formatDate(closeTarget.date)} ${formatTimeRange(closeTarget.startTime, closeTarget.endTime)} will stop accepting new bookings. Existing bookings are not removed.`
            : ''
        }
        confirmLabel="Close slot"
        tone="danger"
        loading={closing}
        onConfirm={onClose}
        onCancel={() => setCloseTarget(null)}
      />
    </>
  );
}
