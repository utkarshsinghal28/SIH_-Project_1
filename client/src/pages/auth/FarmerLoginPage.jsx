import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthCard from '../../components/common/AuthCard.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import useAuth from '../../hooks/useAuth.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { useToast } from '../../context/ToastContext.jsx';
import { hasErrors, validateFarmerLogin } from '../../utils/validators.js';
import { ROLES } from '../../utils/constants.js';
import paths from '../../routes/paths.js';

export default function FarmerLoginPage() {
  useDocumentTitle('Farmer login');
  const { login, isAuthenticated, isFarmer, usingMockBackend } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [values, setValues] = useState({ phone: '', password: '' });
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

    const validation = validateFarmerLogin(values);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSubmitting(true);
    try {
      const user = await login({
        identifier: values.phone.trim(),
        password: values.password,
        role: ROLES.FARMER,
      });
      toast.success(`Welcome back, ${user.name}`);
      navigate(location.state?.from ?? paths.farmerDashboard, { replace: true });
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Farmer sign in"
      subtitle="Use the mobile number you registered with."
      footer={
        <>
          Do not have an account?{' '}
          <Link to={paths.farmerRegister} className="font-semibold text-brand-800 underline">
            Register here
          </Link>
        </>
      }
    >
      <Alert tone="info" title="Demo account (development only)" className="mb-5">
        {usingMockBackend ? (
          <>
            Running in offline mock mode. Use <strong>9876543210</strong> /{' '}
            <strong>farmer123</strong>.
          </>
        ) : (
          <>
            If the database has been seeded, sign in with <strong>9876543210</strong> /{' '}
            <strong>Farmer@123</strong>, or register a new account.
          </>
        )}
      </Alert>

      {formError && (
        <Alert tone="error" className="mb-5">
          {formError}
        </Alert>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
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
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={values.password}
          onChange={update('password')}
          error={errors.password}
          required
        />
        <Button type="submit" block size="lg" loading={submitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-5 border-t border-slate-200 pt-4 text-center text-sm text-slate-600">
        Procurement centre staff?{' '}
        <Link to={paths.adminLogin} className="font-semibold text-slate-800 underline">
          Administration login
        </Link>
      </p>
    </AuthCard>
  );
}
