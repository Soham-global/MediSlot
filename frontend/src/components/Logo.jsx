import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

export default function Logo({ to = "/", compact = false, light = false }) {
  return (
    <Link className={`logo${light ? " logo--light" : ""}`} to={to} aria-label="MediSlot home">
      <span className="logo__mark" aria-hidden="true">
        <Activity size={20} strokeWidth={2.5} />
      </span>
      {!compact && (
        <span className="logo__text">
          Medi<span>Slot</span>
        </span>
      )}
    </Link>
  );
}
