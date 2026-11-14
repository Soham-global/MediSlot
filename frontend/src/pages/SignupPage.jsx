import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import AuthShell from "../components/AuthShell";
import Alert from "../components/Alert";
import Field from "../components/Field";
import { authApi } from "../api/authApi";
import { getApiMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  employeeCode: "",
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

function passwordScore(password) {
  if (!password) return 0;
  let score = 1;
  if (password.length >= 8) score = 2;
  if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password)) score = 3;
  if (score >= 3 && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score = 4;
  return score;
}

const strengthLabels = ["", "Too short", "Fair", "Good", "Strong"];

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
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
    const email = form.email.trim().toLowerCase();

    if (!form.employeeCode.trim()) next.employeeCode = "Enter your employee code.";
    if (!form.name.trim()) next.name = "Enter your full name.";
    if (!email) {
      next.email = "Enter your work email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address.";
    } else if (!email.endsWith("@motherson.com")) {
      next.email = "Use your @motherson.com email address.";
    }
    if (form.phone.trim() && form.phone.trim().length > 20) {
      next.phone = "Phone must be 20 characters or fewer.";
    }
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    try {
      const data = await authApi.register({
        employeeCode: form.employeeCode.trim(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        password: form.password,
      });
      login(data.token, "EMPLOYEE", data.employee);
      navigate("/doctors", { replace: true });
    } catch (error) {
      setServerError(getApiMessage(error, "We couldn’t sign you up. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Employee sign up"
      title="Sign up"
      subtitle="Set up employee access in a few quick steps."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Field label="Employee code" htmlFor="signup-code" error={errors.employeeCode}>
          <div className="input-with-icon">
            <UserRound size={18} aria-hidden="true" />
            <input
              id="signup-code"
              type="text"
              autoComplete="username"
              value={form.employeeCode}
              onChange={update("employeeCode")}
              placeholder="e.g. EMP1024"
              aria-invalid={Boolean(errors.employeeCode)}
              aria-describedby={errors.employeeCode ? "signup-code-error" : undefined}
            />
          </div>
        </Field>

        <Field label="Full name" htmlFor="signup-name" error={errors.name}>
          <div className="input-with-icon">
            <UserRound size={18} aria-hidden="true" />
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={update("name")}
              placeholder="Your full name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "signup-name-error" : undefined}
            />
          </div>
        </Field>

        <Field
          label="Work email"
          htmlFor="signup-email"
          error={errors.email}
          hint="Must end with @motherson.com"
        >
          <div className="input-with-icon">
            <Mail size={18} aria-hidden="true" />
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={update("email")}
              placeholder="name@motherson.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "signup-email-error" : undefined}
            />
          </div>
        </Field>

        <Field label="Phone" htmlFor="signup-phone" error={errors.phone} optional>
          <div className="input-with-icon">
            <Phone size={18} aria-hidden="true" />
            <input
              id="signup-phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={update("phone")}
              placeholder="+91 98765 43210"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "signup-phone-error" : undefined}
            />
          </div>
        </Field>

        <Field
          label="Password"
          htmlFor="signup-password"
          error={errors.password}
          hint="At least 8 characters"
        >
          <div className="input-with-icon input-with-icon--action">
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={update("password")}
              placeholder="Create a password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "signup-password-error" : undefined}
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

        {form.password && (
          <div className="password-strength" data-score={passwordScore(form.password)} aria-live="polite">
            <div className="password-strength__bars" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="password-strength__meta">
              <span>Password strength</span>
              <strong>{strengthLabels[passwordScore(form.password)]}</strong>
            </div>
          </div>
        )}

        <Field label="Confirm password" htmlFor="signup-confirm" error={errors.confirmPassword}>
          <div className="input-with-icon">
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              id="signup-confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              placeholder="Repeat your password"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "signup-confirm-error" : undefined}
            />
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
              Signing up…
            </>
          ) : (
            <>
              Sign up
              <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="auth-card__switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthShell>
  );
}
