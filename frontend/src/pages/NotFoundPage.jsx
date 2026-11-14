import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import Logo from "../components/Logo";
import { homePathForRole, useAuth } from "../context/AuthContext";

export default function NotFoundPage() {
  const { isAuthenticated, role } = useAuth();
  const homePath = isAuthenticated ? homePathForRole(role) : "/";

  return (
    <div className="not-found">
      <a className="skip-link" href="#not-found-main">
        Skip to content
      </a>
      <header className="not-found__top">
        <Logo />
        <Link className="button button--ghost button--small" to={homePath}>
          <ArrowLeft size={16} aria-hidden="true" />
          Go home
        </Link>
      </header>

      <main className="not-found__main" id="not-found-main">
        <span className="not-found__code">404</span>
        <span className="not-found__icon" aria-hidden="true">
          <Compass size={34} />
        </span>
        <h1>This path has moved off the map.</h1>
        <p>The page you’re looking for doesn’t exist, or the link may have changed.</p>
        <div className="inline">
          <Link className="button button--primary" to={homePath}>
            Return to familiar ground
          </Link>
          <Link className="button button--ghost" to="/">
            Visit the home page
          </Link>
        </div>
      </main>
    </div>
  );
}
