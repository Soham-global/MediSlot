import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminPlaceholder({ icon: Icon, title, description }) {
  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <span className="eyebrow">Admin tools</span>
          <h1>{title}</h1>
        </div>
        <Link className="button button--ghost button--small" to="/admin">
          <ArrowLeft size={16} aria-hidden="true" />
          Dashboard
        </Link>
      </div>

      <section className="admin-placeholder">
        <div className="admin-placeholder__art" aria-hidden="true">
          <span className="admin-placeholder__ring" />
          {Icon && <Icon size={40} strokeWidth={1.7} />}
        </div>
        <span className="pill pill--accent">
          <Sparkles size={14} aria-hidden="true" />
          Coming soon
        </span>
        <h2>Admin tools are ready for a future build.</h2>
        <p>{description}</p>
        <div className="admin-placeholder__lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>
    </div>
  );
}
