import { Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import EmployeeLayout from './components/EmployeeLayout';
import PublicLayout from './components/PublicLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';
import AdminAppointmentsPage from './pages/AdminAppointmentsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminDoctorsPage from './pages/AdminDoctorsPage';
import DoctorsPage from './pages/DoctorsPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route
            path="login"
            element={<LoginPage area="employee" />}
          />
          <Route
            path="admin/login"
            element={<LoginPage area="admin" />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<ProtectedRoute role="EMPLOYEE" />}>
          <Route element={<EmployeeLayout />}>
            <Route path="doctors" element={<DoctorsPage />} />
            <Route
              path="my-appointments"
              element={<MyAppointmentsPage />}
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="HOSPITAL_ADMIN" />}>
          <Route element={<AdminLayout />}>
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/doctors" element={<AdminDoctorsPage />} />
            <Route
              path="admin/appointments"
              element={<AdminAppointmentsPage />}
            />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
