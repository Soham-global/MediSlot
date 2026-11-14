import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
  warning: Info,
};

export default function Alert({ tone = "info", children, title }) {
  const Icon = icons[tone] || Info;

  return (
    <div className={`alert alert--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <Icon size={19} aria-hidden="true" />
      <div>
        {title && <strong>{title}</strong>}
        <div>{children}</div>
      </div>
    </div>
  );
}
