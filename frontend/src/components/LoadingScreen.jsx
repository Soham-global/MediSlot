import { Activity } from "lucide-react";

export default function LoadingScreen({ label = "Loading…" }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-screen__mark" aria-hidden="true">
        <Activity size={28} strokeWidth={2.4} />
      </div>
      <span>{label}</span>
    </div>
  );
}
