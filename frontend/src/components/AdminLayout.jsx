import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Brand from './Brand';

const navClassName = ({ isActive }) =>
  isActive ? 'nav-link active' : 'nav-link';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="nav">
        <div className="nav-inner">
          <Brand to="/admin" />

          <nav className="nav-links" aria-label="Hospital admin area">
            <NavLink to="/admin" end className={navClassName}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/doctors" className={navClassName}>
              Doctors
            </NavLink>
            <NavLink to="/admin/appointments" className={navClassName}>
              Appointments
            </NavLink>
          </nav>

          <div className="nav-actions">
            <span className="nav-user">
              {user?.hospital?.name || 'Hospital'}
            </span>
            <button
              type="button"
              className="btn btn-link"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
