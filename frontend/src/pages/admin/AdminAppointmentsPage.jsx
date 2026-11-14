import { CalendarDays } from "lucide-react";
import AdminPlaceholder from "./AdminPlaceholder";

export default function AdminAppointmentsPage() {
  return (
    <AdminPlaceholder
      icon={CalendarDays}
      title="Hospital appointments"
      description="Appointment review, confirmation, completion, and no-show workflows will be available here."
    />
  );
}
