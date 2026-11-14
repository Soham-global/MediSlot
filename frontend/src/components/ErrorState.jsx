import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorState({
  title = "We couldn’t load this right now",
  message = "Please check your connection and try again.",
  onRetry,
  compact = false,
}) {
  return (
    <div className={`state-card state-card--error${compact ? " state-card--compact" : ""}`} role="alert">
      <span className="state-card__icon" aria-hidden="true">
        <AlertTriangle size={24} />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{message}</p>
        {onRetry && (
          <button className="button button--secondary button--small" type="button" onClick={onRetry}>
            <RotateCcw size={16} aria-hidden="true" />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
