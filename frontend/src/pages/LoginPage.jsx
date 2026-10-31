import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { adminLogin, employeeLogin } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

function getEmployeeDestination(state) {
  const from = state?.from;

  if (
    from?.pathname === '/doctors' ||
    from?.pathname === '/my-appointments'
  ) {
    return `${from.pathname}${from.search || ''}${from.hash || ''}`;
  }

  return '/doctors';
}

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message;

  if (message) {
    return message;
  }

  if (error?.response?.status === 401) {
    return fallback;
  }

  return 'Could not sign in right now. Please try again.';
}

export default function LoginPage({ area }) {
  const isEmployee = area === 'employee';
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const identifierId = `${area}-identifier`;
  const passwordId = `${area}-password`;
  const titleId = `${area}-title`;
  const identifierLabel = isEmployee ? 'Employee code' : 'Email';

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      setError(
        isEmployee ? 'Enter your employee code.' : 'Enter your email.'
      );
      return;
    }

    if (!password) {
      setError('Enter your password.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      if (isEmployee) {
        const response = await employeeLogin({
          employeeCode: trimmedIdentifier,
          password,
        });

        login('EMPLOYEE', response);
        navigate(getEmployeeDestination(location.state), {
          replace: true,
        });
      } else {
        const response = await adminLogin({
          email: trimmedIdentifier,
          password,
        });

        login('HOSPITAL_ADMIN', response);
        navigate('/admin', { replace: true });
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          isEmployee
            ? 'Invalid employee code or password.'
            : 'Invalid email or password.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby={titleId}>
        <p className="auth-kicker">
          {isEmployee ? 'Employee access' : 'Hospital admin'}
        </p>
        <h1 id={titleId}>
          {isEmployee ? 'Welcome back' : 'Hospital sign in'}
        </h1>
        <p className="auth-sub">
          {isEmployee
            ? 'Sign in to find doctors and manage your appointments.'
            : 'Sign in to manage doctors, schedules and appointments.'}
        </p>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor={identifierId}>{identifierLabel}</label>
            <input
              id={identifierId}
              name={isEmployee ? 'employeeCode' : 'email'}
              type={isEmployee ? 'text' : 'email'}
              className="input"
              value={identifier}
              onChange={(event) => {
                setIdentifier(event.target.value);
                if (error) {
                  setError('');
                }
              }}
              autoComplete={isEmployee ? 'username' : 'email'}
              autoCapitalize={isEmployee ? 'characters' : 'none'}
              spellCheck={false}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-field">
            <label htmlFor={passwordId}>Password</label>
            <input
              id={passwordId}
              name="password"
              type="password"
              className="input"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) {
                  setError('');
                }
              }}
              autoComplete="current-password"
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-hint">
          {isEmployee
            ? 'EMP001 / password123'
            : 'admin.pune@medislot.com / password123'}
        </p>

        <p className="auth-alt">
          {isEmployee ? (
            <>
              Hospital staff?{' '}
              <Link to="/admin/login">Sign in here</Link>
            </>
          ) : (
            <>
              Employee? <Link to="/login">Sign in here</Link>
            </>
          )}
        </p>
      </section>
    </main>
  );
}
