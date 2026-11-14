import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import AuthShell from "../components/AuthShell";
import Alert from "../components/Alert";
import Field from "../components/Field";
import { authApi } from "../api/authApi";
import { getApiMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ employeeCode: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setServerError("");
  };

  const validate = () => {
    const next = {};
    if (!form.employeeCode.trim()) next.employeeCode = "Enter your employee code.";
    if (!form.password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    try {
      const data = await authApi.loginEmployee({
        employeeCode: form.employeeCode.trim(),
        password: form.password,
      });
      login(data.token, "EMPLOYEE", data.employee);
      const destination = location.state?.from?.pathname || "/doctors";
      navigate(destination, { replace: true });
    } catch (error) {
      setServerError(getApiMessage(error, "We couldn’t log you in. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Employee log in"
      title="Welcome back"
      subtitle="Log in to manage appointments and find care."
      belowCard={
        <p className="auth-main__alt">
          Hospital admin? <Link to="/admin/login">Log in here</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Field label="Employee code" htmlFor="employee-code" error={errors.employeeCode}>
          <div className="input-with-icon">
            <UserRound size={18} aria-hidden="true" />
            <input
              id="employee-code"
              name="employeeCode"
              type="text"
              autoComplete="username"
              value={form.employeeCode}
              onChange={update("employeeCode")}
              placeholder="e.g. EMP1024"
              aria-invalid={Boolean(errors.employeeCode)}
              aria-describedby={errors.employeeCode ? "employee-code-error" : undefined}
            />
          </div>
        </Field>

        <Field label="Password" htmlFor="employee-password" error={errors.password}>
          <div className="input-with-icon input-with-icon--action">
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              id="employee-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={update("password")}
              placeholder="Enter your password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "employee-password-error" : undefined}
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

      <p className="auth-card__switch">
        New to MediSlot? <Link to="/signup">Sign up</Link>
      </p>
    </AuthShell>
  );
}
