export default function Field({ label, htmlFor, error, hint, children, optional = false }) {
  return (
    <div className={`field${error ? " field--error" : ""}`}>
      <label htmlFor={htmlFor}>
        {label}
        {optional && <span className="field__optional">Optional</span>}
      </label>
      {children}
      {hint && !error && <p className="field__hint">{hint}</p>}
      {error && (
        <p className="field__error" id={`${htmlFor}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
