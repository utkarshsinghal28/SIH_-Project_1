import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthCard from '../../components/common/AuthCard.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import useAuth from '../../hooks/useAuth.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { useToast } from '../../context/ToastContext.jsx';
import { hasErrors, validateAdminLogin } from '../../utils/validators.js';
import { ROLES } from '../../utils/constants.js';
import paths from '../../routes/paths.js';

export default function AdminLoginPage() {
  useDocumentTitle('Administration login');
  const { login, isAuthenticated, isAdmin, usingMockBackend } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? paths.adminDashboard : paths.farmerDashboard} replace />;
  }

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    const validation = validateAdminLogin(values);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSubmitting(true);
    try {
      const user = await login({
        identifier: values.email.trim(),
        password: values.password,
        role: ROLES.ADMIN,
      });
      toast.success(`Signed in as ${user.name}`);
      navigate(location.state?.from ?? paths.adminDashboard, { replace: true });
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      tone="admin"
      title="Administration portal"
      subtitle="For procurement centre and district staff only."
      footer={
        <>
          Are you a farmer?{' '}
          <Link to={paths.farmerLogin} className="font-semibold text-brand-800 underline">
            Use the farmer login
          </Link>
        </>
      }
    >
      <Alert tone="info" title="Demo account (development only)" className="mb-5">
        {usingMockBackend ? (
          <>
            Running in offline mock mode. Use <strong>admin@krishi.gov.in</strong> /{' '}
            <strong>admin123</strong>.
          </>
        ) : (
          <>
            If the database has been seeded, sign in with <strong>admin@krishi.gov.in</strong> /{' '}
            <strong>Admin@123</strong>. Administrator accounts are created by the seed script,
            not through self-registration.
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
          label="Official email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="name@krishi.gov.in"
          value={values.email}
          onChange={update('email')}
          error={errors.email}
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
          Sign in to administration
        </Button>
      </form>
    </AuthCard>
  );
}
