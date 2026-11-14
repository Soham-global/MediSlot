import React from "react";
import { Activity } from "lucide-react";

export function Logo({ admin = false, dark = false, onHome }) {
  return (
    <button
      type="button"
      className={"logo" + (dark ? " on-dark" : "")}
      onClick={onHome}
      aria-label="MediSlot home"
    >
      <span className="logo-mark">
        <Activity strokeWidth={2.4} />
      </span>
      <span className="logo-word">
        Medi<b>Slot</b>
      </span>
      {admin && <small>Admin</small>}
    </button>
  );
}
export function Avatar({ doctor, size = "" }) {
  return (
    <div className={"avatar " + size}>
      {doctor?.image ? (
        <img className="avatar-img" src={doctor.image} alt={doctor.name || ""} />
      ) : (
        doctor?.initial || "MS"
      )}
    </div>
  );
}
export function Btn({ children, onClick, kind = "", className = "", ...props }) {
  return (
    <button onClick={onClick} className={"btn " + kind + " " + className} {...props}>
      {children}
    </button>
  );
}
