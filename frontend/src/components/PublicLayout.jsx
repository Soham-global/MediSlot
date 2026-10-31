import { Link, Outlet } from 'react-router-dom';
import Brand from './Brand';

export default function PublicLayout() {
  return (
    <div className="app-shell">
      <header className="nav">
        <div className="nav-inner">
          <Brand />

          <nav className="nav-public-links" aria-label="Account">
            <Link to="/login">Employee login</Link>
            <Link to="/admin/login">Hospital login</Link>
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
