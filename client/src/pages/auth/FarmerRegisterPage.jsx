import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthCard from '../../components/common/AuthCard.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import useAuth from '../../hooks/useAuth.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { useToast } from '../../context/ToastContext.jsx';
import { hasErrors, validateFarmerRegistration } from '../../utils/validators.js';
import { INDIAN_STATES } from '../../utils/constants.js';
import paths from '../../routes/paths.js';

const INITIAL = {
  name: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  village: '',
  district: '',
  state: '',
};

export default function FarmerRegisterPage() {
  useDocumentTitle('Farmer registration');
  const { registerFarmer, isAuthenticated, isFarmer, usingMockBackend } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={isFarmer ? paths.farmerDashboard : paths.adminDashboard} replace />;
  }

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    const validation = validateFarmerRegistration(values);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSubmitting(true);
    try {
      const user = await registerFarmer(values);
      toast.success(`Account created. Welcome, ${user.name}.`);
      navigate(paths.farmerDashboard, { replace: true });
    } catch (error) {
      setFormError(error.message);
      if (error.details) setErrors((current) => ({ ...current, ...error.details }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Farmer registration"
      subtitle="Only basic details are needed. You can book a slot immediately afterwards."
      footer={
        <>
          Already registered?{' '}
          <Link to={paths.farmerLogin} className="font-semibold text-brand-800 underline">
            Sign in
          </Link>
        </>
      }
    >
      {usingMockBackend && (
        <Alert tone="info" title="Development build" className="mb-5">
          Part 1 has no server. Your account is saved in this browser only and will be lost when
          site data is cleared. Real registration is added in Part 2.
        </Alert>
      )}

      {formError && (
        <Alert tone="error" className="mb-5">
          {formError}
        </Alert>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="As per your records"
          value={values.name}
          onChange={update('name')}
          error={errors.name}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Mobile number"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            placeholder="10-digit mobile number"
            value={values.phone}
            onChange={update('phone')}
            error={errors.phone}
            hint="Used to sign in and receive updates."
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={values.email}
            onChange={update('email')}
            error={errors.email}
            optional
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={values.password}
            onChange={update('password')}
            error={errors.password}
            required
          />
          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={values.confirmPassword}
            onChange={update('confirmPassword')}
            error={errors.confirmPassword}
            required
          />
        </div>

        <fieldset className="rounded-md border border-slate-200 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-800">Your location</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Village"
              name="village"
              placeholder="Village name"
              value={values.village}
              onChange={update('village')}
              error={errors.village}
              required
            />
            <Input
              label="District"
              name="district"
              placeholder="District name"
              value={values.district}
              onChange={update('district')}
              error={errors.district}
              required
            />
            <Select
              label="State"
              name="state"
              placeholder="Select your state"
              options={INDIAN_STATES}
              value={values.state}
              onChange={update('state')}
              error={errors.state}
              className="sm:col-span-2"
              required
            />
          </div>
        </fieldset>

        <Button type="submit" block size="lg" loading={submitting}>
          Create account
        </Button>

        <p className="text-center text-xs text-slate-500">
          We do not ask for Aadhaar, bank or land details in this application.
        </p>
      </form>
    </AuthCard>
  );
}
