import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import AuthShell from "../components/AuthShell";
import Alert from "../components/Alert";
import Field from "../components/Field";
import { authApi } from "../api/authApi";
import { getApiMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setServerError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.email.trim()) next.email = "Enter your admin email.";
    if (!form.password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    setServerError("");
    try {
      const data = await authApi.loginAdmin({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      login(data.token, "HOSPITAL_ADMIN", data.admin);
      const destination = location.state?.from?.pathname || "/admin";
      navigate(destination, { replace: true });
    } catch (error) {
      setServerError(getApiMessage(error, "We couldn’t log you in. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      variant="admin"
      eyebrow="Hospital admin log in"
      title="Welcome back"
      subtitle="Log in to access the hospital operations workspace."
      belowCard={
        <p className="auth-main__alt">
          Employee? <Link to="/login">Log in here</Link>
        </p>
      }
    >
      <div className="admin-auth-note">
        <ShieldCheck size={18} aria-hidden="true" />
        <span>Restricted to authorised hospital administrators.</span>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Field label="Admin email" htmlFor="admin-email" error={errors.email}>
          <div className="input-with-icon">
            <Mail size={18} aria-hidden="true" />
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={form.email}
              onChange={update("email")}
              placeholder="admin@hospital.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "admin-email-error" : undefined}
            />
          </div>
        </Field>

        <Field label="Password" htmlFor="admin-password" error={errors.password}>
          <div className="input-with-icon input-with-icon--action">
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={update("password")}
              placeholder="Enter your password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "admin-password-error" : undefined}
            />
            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>

        <div className={`auth-form__alert${serverError ? " is-visible" : ""}`} aria-live="polite">
          <div>
            {serverError && <Alert tone="error">{serverError}</Alert>}
          </div>
        </div>

        <button
          className="button button--primary button--full button--large auth-submit"
          type="submit"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className="auth-submit__spinner" aria-hidden="true" />
              Logging in…
            </>
          ) : (
            <>
              Log in
              <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
