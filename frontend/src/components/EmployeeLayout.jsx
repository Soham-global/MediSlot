import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Brand from './Brand';

const navClassName = ({ isActive }) =>
  isActive ? 'nav-link active' : 'nav-link';

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="nav">
        <div className="nav-inner">
          <Brand to="/doctors" />

          <nav className="nav-links" aria-label="Employee area">
            <NavLink to="/doctors" className={navClassName}>
              Doctors
            </NavLink>
            <NavLink to="/my-appointments" className={navClassName}>
              My appointments
            </NavLink>
          </nav>

          <div className="nav-actions">
            <span className="nav-user">{user?.name || 'Employee'}</span>
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
