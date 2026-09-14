import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Alert from '../../components/ui/Alert.jsx';
import DataState from '../../components/common/DataState.jsx';
import useAsync from '../../hooks/useAsync.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { useToast } from '../../context/ToastContext.jsx';
import { createCentre, getCentre, updateCentre } from '../../services/centreService.js';
import { CENTRE_STATUS, INDIAN_STATES } from '../../utils/constants.js';
import { hasErrors, validateCentre } from '../../utils/validators.js';
import paths from '../../routes/paths.js';

const BLANK = {
  name: '',
  address: '',
  district: '',
  state: '',
  status: CENTRE_STATUS.ACTIVE,
  inchargeName: '',
  contactPhone: '',
};

const STATUS_OPTIONS = [
  { value: CENTRE_STATUS.ACTIVE, label: 'Active — visible to farmers, accepts bookings' },
  { value: CENTRE_STATUS.INACTIVE, label: 'Inactive — soft deactivated, no new bookings' },
];

export default function AdminCentreFormPage({ mode = 'create' }) {
  const isEdit = mode === 'edit';
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetcher = useCallback(() => (isEdit ? getCentre(id) : Promise.resolve(null)), [isEdit, id]);
  const { data: existing, loading, error, reload } = useAsync(fetcher, [id], {
    immediate: isEdit,
  });

  useDocumentTitle(isEdit ? 'Edit procurement centre' : 'Create procurement centre');

  useEffect(() => {
    if (existing) {
      setValues({
        name: existing.name ?? '',
        address: existing.address ?? '',
        district: existing.district ?? '',
        state: existing.state ?? '',
        status: existing.status ?? CENTRE_STATUS.ACTIVE,
        inchargeName: existing.inchargeName ?? '',
        contactPhone: existing.contactPhone ?? '',
      });
    }
  }, [existing]);

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    const validation = validateCentre(values);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSaving(true);
    try {
      if (isEdit) {
        await updateCentre(id, values);
        toast.success('Centre updated.');
      } else {
        await createCentre(values);
        toast.success('Centre created.');
      }
      navigate(paths.adminCentres);
    } catch (caught) {
      setFormError(caught.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title={isEdit ? 'Edit procurement centre' : 'Create procurement centre'}
        subtitle={
          isEdit
            ? 'Update the details of this centre.'
            : 'Add a new procurement centre to the directory.'
        }
        breadcrumbs={[
          { label: 'Dashboard', to: paths.adminDashboard },
          { label: 'Centres', to: paths.adminCentres },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />

      <DataState
        loading={isEdit && loading}
        error={isEdit ? error : null}
        onRetry={reload}
        loadingLabel="Loading centre…"
        errorTitle="Could not load this centre"
      >
        <div className="max-w-3xl">
          {formError && (
            <Alert tone="error" className="mb-4">
              {formError}
            </Alert>
          )}

          <form onSubmit={onSubmit} noValidate>
            <Card title="Centre details">
              <div className="space-y-4">
                <Input
                  label="Centre name"
                  name="name"
                  placeholder="e.g. Satara Taluka Procurement Centre"
                  value={values.name}
                  onChange={update('name')}
                  error={errors.name}
                  required
                />
                <Input
                  label="Address"
                  name="address"
                  placeholder="Street, landmark, town"
                  value={values.address}
                  onChange={update('address')}
                  error={errors.address}
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="District"
                    name="district"
                    placeholder="District"
                    value={values.district}
                    onChange={update('district')}
                    error={errors.district}
                    required
                  />
                  <Select
                    label="State"
                    name="state"
                    placeholder="Select state"
                    options={INDIAN_STATES}
                    value={values.state}
                    onChange={update('state')}
                    error={errors.state}
                    required
                  />
                </div>
                <Select
                  label="Status"
                  name="status"
                  options={STATUS_OPTIONS}
                  value={values.status}
                  onChange={update('status')}
                  error={errors.status}
                  hint="Deactivation is a soft change — the centre and its history are retained."
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Centre in-charge"
                    name="inchargeName"
                    placeholder="Officer name"
                    value={values.inchargeName}
                    onChange={update('inchargeName')}
                    optional
                  />
                  <Input
                    label="Contact number"
                    name="contactPhone"
                    placeholder="Landline or mobile"
                    value={values.contactPhone}
                    onChange={update('contactPhone')}
                    optional
                  />
                </div>
              </div>
            </Card>

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" to={paths.adminCentres}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {isEdit ? 'Save changes' : 'Create centre'}
              </Button>
            </div>
          </form>
        </div>
      </DataState>
    </>
  );
}
