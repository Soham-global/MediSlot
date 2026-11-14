import { CalendarClock } from "lucide-react";
import AdminPlaceholder from "./AdminPlaceholder";

export default function AdminDoctorSlotsPage() {
  return (
    <AdminPlaceholder
      icon={CalendarClock}
      title="Doctor slots"
      description="Weekly schedules, generated availability, blocked time, and slot overrides will be managed here."
    />
  );
}
