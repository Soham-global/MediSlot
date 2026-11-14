import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Building2,
  Check,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { authApi } from "../api/authApi";
import { getApiMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
import ErrorState from "../components/ErrorState";
import Field from "../components/Field";
import { Skeleton } from "../components/Skeleton";
import { initials } from "../utils/format";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", plantLocation: "" });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");

  const hydrateForm = (profile) => {
    setForm({
      name: profile?.name || "",
      phone: profile?.phone || "",
      plantLocation: profile?.plantLocation || "",
    });
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");

    refreshProfile()
      .then((profile) => {
        if (!cancelled) hydrateForm(profile);
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(getApiMessage(error, "We couldn’t load your profile."));
          hydrateForm(user);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshProfile]);

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setSaveError("");
    setNotice("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (form.phone.trim() && form.phone.trim().length > 20) next.phone = "Use 20 characters or fewer.";
    if (form.plantLocation.trim().length > 100) next.plantLocation = "Use 100 characters or fewer.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setSaveError("");
    setNotice("");
    try {
      await authApi.updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        plantLocation: form.plantLocation.trim() || null,
      });
      const updated = await refreshProfile();
      hydrateForm(updated);
      setNotice("Your profile has been updated.");
    } catch (error) {
      setSaveError(getApiMessage(error, "We couldn’t save your profile changes."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <section className="employee-hero employee-hero--compact">
        <span className="employee-hero__orb" aria-hidden="true" />
        <div className="container employee-hero__inner">
          <div className="employee-hero__copy">
            <span className="eyebrow">Your account</span>
            <h1>A profile that keeps care personal.</h1>
            <p>Keep your contact details current so the hospital can reach you about appointments.</p>
          </div>
        </div>
      </section>

      <div className="container page__body">
        {loadError ? (
          <ErrorState
            title="Profile is out of view"
            message={loadError}
            onRetry={() => window.location.reload()}
          />
        ) : (
          <div className="profile-layout">
            <aside className="profile-card">
              {loading ? (
                <div className="stack" role="status" aria-label="Loading profile">
                  <Skeleton width="88px" height="88px" radius="28px" />
                  <Skeleton width="62%" height="1.2rem" />
                  <Skeleton width="42%" height="0.85rem" />
                  <Skeleton width="100%" height="0.85rem" />
                </div>
              ) : (
                <>
                  <div className="profile-card__avatar">{initials(form.name || user?.name)}</div>
                  <h2>{form.name || user?.name}</h2>
                  <p>{user?.employeeCode}</p>
                  <span className="pill pill--brand">
                    <BadgeCheck size={14} aria-hidden="true" />
                    Verified employee
                  </span>

                  <div className="profile-card__details">
                    <div>
                      <Mail size={16} aria-hidden="true" />
                      <span>
                        <small>Work email</small>
                        <strong>{user?.email}</strong>
                      </span>
                    </div>
                    <div>
                      <Phone size={16} aria-hidden="true" />
                      <span>
                        <small>Phone</small>
                        <strong>{form.phone || "Not added yet"}</strong>
                      </span>
                    </div>
                    <div>
                      <MapPin size={16} aria-hidden="true" />
                      <span>
                        <small>Plant location</small>
                        <strong>{form.plantLocation || "Not added yet"}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="profile-card__note">
                    <ShieldCheck size={17} aria-hidden="true" />
                    Your employee code and work email are managed by your hospital administrator.
                  </div>
                </>
              )}
            </aside>

            <section className="profile-form-card">
              <div className="profile-form-card__head">
                <div>
                  <span className="eyebrow">Personal details</span>
                  <h2>Keep your care contactable</h2>
                  <p>These details help the hospital reach you if an appointment changes.</p>
                </div>
                <span className="profile-form-card__icon" aria-hidden="true">
                  <UserRound size={23} />
                </span>
              </div>

              {loading ? (
                <div className="stack" role="status" aria-label="Loading profile form">
                  <Skeleton width="100%" height="3.6rem" radius="12px" />
                  <Skeleton width="100%" height="3.6rem" radius="12px" />
                  <Skeleton width="100%" height="3.6rem" radius="12px" />
                  <Skeleton width="150px" height="2.8rem" radius="12px" />
                </div>
              ) : (
                <form className="profile-form" onSubmit={handleSubmit} noValidate>
                  {saveError && <Alert tone="error">{saveError}</Alert>}
                  {notice && <Alert tone="success">{notice}</Alert>}

                  <Field label="Full name" htmlFor="profile-name" error={errors.name}>
                    <div className="input-with-icon">
                      <UserRound size={18} aria-hidden="true" />
                      <input
                        id="profile-name"
                        type="text"
                        autoComplete="name"
                        value={form.name}
                        onChange={update("name")}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? "profile-name-error" : undefined}
                      />
                    </div>
                  </Field>

                  <div className="profile-form__grid">
                    <Field
                      label="Phone"
                      htmlFor="profile-phone"
                      error={errors.phone}
                      hint="Optional"
                    >
                      <div className="input-with-icon">
                        <Phone size={18} aria-hidden="true" />
                        <input
                          id="profile-phone"
                          type="tel"
                          autoComplete="tel"
                          value={form.phone}
                          onChange={update("phone")}
                          placeholder="+91 98765 43210"
                          aria-invalid={Boolean(errors.phone)}
                          aria-describedby={errors.phone ? "profile-phone-error" : undefined}
                        />
                      </div>
                    </Field>

                    <Field
                      label="Plant location"
                      htmlFor="profile-plant"
                      error={errors.plantLocation}
                      hint="Optional"
                    >
                      <div className="input-with-icon">
                        <Building2 size={18} aria-hidden="true" />
                        <input
                          id="profile-plant"
                          type="text"
                          value={form.plantLocation}
                          onChange={update("plantLocation")}
                          placeholder="e.g. Chennai Plant 2"
                          aria-invalid={Boolean(errors.plantLocation)}
                          aria-describedby={errors.plantLocation ? "profile-plant-error" : undefined}
                        />
                      </div>
                    </Field>
                  </div>

                  <div className="profile-form__readonly">
                    <div>
                      <span>Employee code</span>
                      <strong>{user?.employeeCode}</strong>
                    </div>
                    <div>
                      <span>Work email</span>
                      <strong>{user?.email}</strong>
                    </div>
                  </div>

                  <button className="button button--primary" type="submit" disabled={saving}>
                    {saving ? (
                      "Saving changes…"
                    ) : (
                      <>
                        <Save size={17} aria-hidden="true" />
                        Save changes
                      </>
                    )}
                  </button>
                </form>
              )}
            </section>
          </div>
        )}

        <div className="profile-tip">
          <span>
            <Check size={16} aria-hidden="true" />
          </span>
          <p>
            <strong>Good to know:</strong> Appointment updates are shown in your care space. Keep your
            phone current so the hospital can reach you quickly if plans change.
          </p>
        </div>
      </div>
    </div>
  );
}
