import { LayoutDashboard } from "lucide-react";
import AdminPlaceholder from "./AdminPlaceholder";

export default function AdminDashboardPage() {
  return (
    <AdminPlaceholder
      icon={LayoutDashboard}
      title="Admin dashboard"
      description="A future home for hospital metrics, today’s appointment flow, and doctor availability."
    />
  );
}
