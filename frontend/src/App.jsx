import { useEffect, useRef } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, PublicOnlyRoute } from "./components/RouteGuards";
import PublicLayout from "./layouts/PublicLayout";
import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import DoctorsPage from "./pages/DoctorsPage";
import DoctorDetailPage from "./pages/DoctorDetailPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminDoctorsPage from "./pages/admin/AdminDoctorsPage";
import AdminDoctorSlotsPage from "./pages/admin/AdminDoctorSlotsPage";
import AdminAppointmentsPage from "./pages/admin/AdminAppointmentsPage";

function ScrollManager() {
  const location = useLocation();
  const navigate = useNavigate();
  const resetOnReload = useRef(
    performance.getEntriesByType("navigation")[0]?.type === "reload" &&
      Boolean(location.hash),
  );

  useEffect(() => {
    if (resetOnReload.current) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      if (location.hash) {
        navigate(`${location.pathname}${location.search}`, { replace: true });
      } else {
        resetOnReload.current = false;
      }
      return;
    }

    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.hash, navigate]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ScrollManager />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Route>

        <Route element={<ProtectedRoute role="EMPLOYEE" />}>
          <Route element={<AppLayout />}>
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/doctors/:id" element={<DoctorDetailPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="HOSPITAL_ADMIN" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
            <Route path="/admin/doctors/:id/slots" element={<AdminDoctorSlotsPage />} />
            <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
